/**
 * Gallery Lightbox Module
 * Fullscreen image viewer with zoom, pan, and touch support
 */

(function() {
    'use strict';

    // ========== CONFIG & STATE ==========
    const CONFIG = {
        MIN_ZOOM: 1, MAX_ZOOM: 5, DEFAULT_ZOOM: 2.5,
        PAN_SPEED: 1.5, SWIPE_THRESHOLD: 50,
        THROTTLE_MS: 16 // ~60fps
    };

    const state = {
        currentCategory: null, currentIndex: 0, categoryImages: [],
        zoom: 1, panX: 0, panY: 0,
        isDragging: false, isPinching: false,
        dragStart: {}, pinchStart: {}, touchStart: {},
        loadId: 0, isNavigating: false,
        preloadCache: new Map(),
        // Cached dimensions for smooth panning (avoid layout thrashing)
        imageBounds: null,
        containerBounds: null
    };

    // ========== DOM ==========
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const dom = {
        lightbox,
        image: lightbox.querySelector('.lightbox-image'),
        loader: lightbox.querySelector('.lightbox-loader'),
        thumbs: lightbox.querySelector('.lightbox-thumbs'),
        viewAll: lightbox.querySelector('.lightbox-view-all'),
        close: lightbox.querySelector('.lightbox-close'),
        prev: lightbox.querySelector('.lightbox-nav--prev'),
        next: lightbox.querySelector('.lightbox-nav--next'),
        overlay: lightbox.querySelector('.lightbox-overlay'),
        main: lightbox.querySelector('.lightbox-main')
    };

    // ========== UTILITIES ==========
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const throttle = (fn, ms) => {
        let last = 0;
        return (...args) => {
            const now = Date.now();
            if (now - last >= ms) { last = now; fn(...args); }
        };
    };
    const scheduleRAF = (() => {
        let pending = false, callback = null;
        return (fn) => {
            callback = fn;
            if (!pending) {
                pending = true;
                requestAnimationFrame(() => { pending = false; if (callback) callback(); });
            }
        };
    })();

    // ========== ZOOM & TRANSFORM ==========
    
    // Cache bounds once when zoom starts to avoid layout thrashing during pan
    function cacheBounds() {
        state.imageBounds = dom.image.getBoundingClientRect();
        state.containerBounds = dom.main.getBoundingClientRect();
    }

    function updateTransform(skipClamp = false) {
        // Constrain pan
        if (state.zoom <= 1) {
            state.panX = state.panY = 0;
        } else if (!skipClamp && state.imageBounds && state.containerBounds) {
            // Use cached bounds for performance
            const overflowX = state.imageBounds.width - state.containerBounds.width;
            const overflowY = state.imageBounds.height - state.containerBounds.height;

            const maxPanX = Math.max(0, overflowX / (2 * state.zoom));
            const maxPanY = Math.max(0, overflowY / (2 * state.zoom));

            state.panX = clamp(state.panX, -maxPanX, maxPanX);
            state.panY = clamp(state.panY, -maxPanY, maxPanY);
        }

        // Apply transform using GPU-accelerated property
        dom.image.style.transform = state.zoom <= 1
            ? ''
            : `scale(${state.zoom}) translate3d(${state.panX}px, ${state.panY}px, 0)`;

        // Update UI classes only when zoom state changes
        const isZoomed = state.zoom > 1;
        if (dom.image.classList.contains('zoomed') !== isZoomed) {
            dom.image.classList.toggle('zoomed', isZoomed);
            dom.main.classList.toggle('zoomed', isZoomed);
            dom.image.style.cursor = isZoomed ? 'grab' : 'zoom-in';
        }
    }

    function setZoom(level, resetPan = false) {
        state.zoom = clamp(level, CONFIG.MIN_ZOOM, CONFIG.MAX_ZOOM);
        if (resetPan) state.panX = state.panY = 0;
        updateTransform();
    }

    function toggleZoom() {
        const newZoom = state.zoom > 1 ? 1 : CONFIG.DEFAULT_ZOOM;
        state.zoom = newZoom;

        if (newZoom === 1) {
            // When zooming out, immediately reset everything
            state.panX = 0;
            state.panY = 0;
            state.imageBounds = null;
            state.containerBounds = null;
            dom.image.style.transform = '';
            dom.image.classList.remove('zoomed');
            dom.main.classList.remove('zoomed');
            dom.image.style.cursor = 'zoom-in';
        } else {
            // When zooming in, cache bounds and apply transform
            state.panX = 0;
            state.panY = 0;
            updateTransform(true); // Skip clamp on initial zoom
            // Cache bounds after transform is applied
            requestAnimationFrame(cacheBounds);
        }
    }

    function zoomAtPoint(scaleFactor, originX, originY) {
        const rect = dom.image.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const offsetX = (originX - centerX) / state.zoom;
        const offsetY = (originY - centerY) / state.zoom;
        const newZoom = clamp(state.zoom * scaleFactor, CONFIG.MIN_ZOOM, CONFIG.MAX_ZOOM);

        if (newZoom !== state.zoom) {
            const ratio = newZoom / state.zoom;
            if (newZoom > 1) {
                state.panX -= offsetX * (ratio - 1) / ratio;
                state.panY -= offsetY * (ratio - 1) / ratio;
            }
            state.zoom = newZoom;
            updateTransform();
        }
    }

    // ========== IMAGE LOADING ==========
    function preloadImage(src) {
        if (state.preloadCache.has(src)) return state.preloadCache.get(src);

        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
            img.onload = () => {
                clearTimeout(timeout);
                // Use decode() for smoother rendering if available
                if (img.decode) {
                    img.decode().then(() => resolve(img)).catch(() => resolve(img));
                } else {
                    resolve(img);
                }
            };
            img.onerror = () => { clearTimeout(timeout); reject(new Error('failed')); };
            img.src = src;
        });

        state.preloadCache.set(src, promise);
        return promise;
    }

    function showImage(index) {
        if (index < 0 || index >= state.categoryImages.length) return;
        
        // Allow rapid navigation - don't block on isNavigating for cached images
        const thumb = state.categoryImages[index];
        const fullSrc = thumb.dataset.full;
        const isCached = state.preloadCache.has(fullSrc);
        
        if (state.isNavigating && !isCached) return;

        state.isNavigating = true;
        const thisLoad = ++state.loadId;
        const img = thumb.querySelector('img');
        const fallbackSrc = img?.src || '';
        const alt = img?.alt || '';

        // Reset zoom immediately for faster perceived response
        if (state.zoom > 1) {
            state.zoom = 1;
            state.panX = state.panY = 0;
            state.imageBounds = state.containerBounds = null;
            dom.image.style.transform = '';
            dom.image.classList.remove('zoomed');
            dom.main.classList.remove('zoomed');
        }

        // For cached images, swap instantly without loader
        if (isCached) {
            dom.image.classList.add('instant');
            dom.loader.style.display = 'none';
        } else {
            dom.loader.style.display = 'block';
            dom.image.style.opacity = '0.3';
        }

        // Load image
        preloadImage(fullSrc)
            .then(loadedImg => {
                if (thisLoad !== state.loadId) return;
                dom.image.src = loadedImg.src;
                dom.image.alt = alt;
            })
            .catch(() => {
                if (thisLoad !== state.loadId) return;
                dom.image.src = fallbackSrc;
                dom.image.alt = alt;
            })
            .finally(() => {
                if (thisLoad !== state.loadId) return;

                dom.loader.style.display = 'none';
                dom.image.style.opacity = '1';
                dom.image.classList.remove('instant');
                state.isNavigating = false;
                state.isDragging = state.isPinching = false;

                // Update nav buttons
                dom.prev.style.visibility = index === 0 ? 'hidden' : 'visible';
                dom.next.style.visibility = index === state.categoryImages.length - 1 ? 'hidden' : 'visible';

                // Preload adjacent images (3 ahead for faster navigation)
                [index - 1, index + 1, index + 2, index + 3]
                    .filter(i => i >= 0 && i < state.categoryImages.length)
                    .forEach(i => {
                        const src = state.categoryImages[i].dataset.full;
                        if (src) preloadImage(src).catch(() => {});
                    });
            });
    }

    // ========== THUMBNAILS ==========
    function initThumbnails() {
        document.querySelectorAll('.gallery-thumb').forEach(thumb => {
            thumb.style.cursor = 'pointer';
            thumb.addEventListener('click', () => {
                const category = thumb.closest('.gallery-category');
                if (!category) return;

                state.currentCategory = category;
                state.categoryImages = Array.from(category.querySelectorAll('.gallery-thumb'));
                state.currentIndex = state.categoryImages.indexOf(thumb);

                const viewAllLink = category.querySelector('.view-all-slide');
                if (viewAllLink && dom.viewAll) dom.viewAll.href = viewAllLink.href;

                buildThumbnailStrip();
                openLightbox();
            });
        });
    }

    function buildThumbnailStrip() {
        if (!dom.thumbs) return;

        const fragment = document.createDocumentFragment();
        state.categoryImages.forEach((thumb, i) => {
            const img = thumb.querySelector('img');
            if (!img) return;

            const el = document.createElement('div');
            el.className = 'lightbox-thumb' + (i === state.currentIndex ? ' active' : '');
            el.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
            el.addEventListener('click', () => {
                if (state.isNavigating) return;
                state.currentIndex = i;
                showImage(i);
                updateActiveThumbnail();
            });
            fragment.appendChild(el);
        });

        dom.thumbs.innerHTML = '';
        dom.thumbs.appendChild(fragment);
        scrollActiveThumbnail();
    }

    function updateActiveThumbnail() {
        dom.thumbs.querySelectorAll('.lightbox-thumb').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === state.currentIndex);
        });
        scrollActiveThumbnail();
    }

    function scrollActiveThumbnail() {
        dom.thumbs?.querySelector('.lightbox-thumb.active')
            ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    // ========== NAVIGATION ==========
    function navigate(direction) {
        // Force unlock if somehow stuck
        if (state.isNavigating) {
            state.isNavigating = false;
        }

        const newIndex = state.currentIndex + direction;
        if (newIndex >= 0 && newIndex < state.categoryImages.length) {
            state.currentIndex = newIndex;
            showImage(newIndex);
            updateActiveThumbnail();
        }
    }

    function openLightbox() {
        dom.lightbox.classList.add('active');
        dom.lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        showImage(state.currentIndex);
    }

    function closeLightbox() {
        if (document.activeElement?.closest('#lightbox')) document.activeElement.blur();
        dom.lightbox.classList.remove('active');
        dom.lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        dom.image.src = '';
        state.isNavigating = false;
        state.preloadCache.clear();
        setZoom(1, true);
    }

    // ========== INTERACTIONS ==========
    function initInteractions() {
        const isActive = () => dom.lightbox.classList.contains('active');

        // Real-time pan update (no throttle for smooth dragging)
        const updatePan = (dx, dy) => {
            state.panX = state.dragStart.panX + dx / state.zoom;
            state.panY = state.dragStart.panY + dy / state.zoom;
            updateTransform();
        };

        // Close / Nav
        dom.close.addEventListener('click', closeLightbox);
        dom.overlay.addEventListener('click', closeLightbox);

        // Prevent mousedown on nav buttons from interfering with zoom
        dom.prev.addEventListener('mousedown', (e) => { e.stopPropagation(); });
        dom.next.addEventListener('mousedown', (e) => { e.stopPropagation(); });

        dom.prev.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(-1);
        });
        dom.next.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(1);
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (!isActive()) return;
            const actions = { 'Escape': closeLightbox, 'ArrowLeft': () => navigate(-1), 'ArrowRight': () => navigate(1) };
            actions[e.key]?.();
        });

        // Mouse drag
        dom.image.addEventListener('mousedown', (e) => {
            if (state.zoom <= 1) return;
            e.preventDefault();
            state.isDragging = true;
            state.dragStart = { x: e.clientX, y: e.clientY, panX: state.panX, panY: state.panY };
            dom.image.classList.add('grabbing');
            // Cache bounds at drag start for smooth panning
            cacheBounds();
        });

        document.addEventListener('mousemove', (e) => {
            if (!state.isDragging) return;
            updatePan((e.clientX - state.dragStart.x) * CONFIG.PAN_SPEED, (e.clientY - state.dragStart.y) * CONFIG.PAN_SPEED);
        });

        document.addEventListener('mouseup', () => {
            state.isDragging = false;
            dom.image.classList.remove('grabbing');
        });

        // Double-click zoom
        dom.image.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent event from bubbling
            if (state.isNavigating) return;
            toggleZoom();
        });

        // Wheel zoom/pan
        dom.lightbox.addEventListener('wheel', (e) => {
            if (!isActive()) return;
            e.preventDefault();

            const mult = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 800 : 1;
            const deltaY = e.deltaY * mult;
            const deltaX = e.deltaX * mult;

            if (e.ctrlKey || e.metaKey) {
                zoomAtPoint(1 - deltaY * 0.01, e.clientX, e.clientY);
            } else if (state.zoom > 1) {
                state.panX -= deltaX / state.zoom;
                state.panY -= deltaY / state.zoom;
                updateTransform();
            }
        }, { passive: false });

        // Safari gestures
        if ('GestureEvent' in window) {
            let gestureStartZoom = 1;
            dom.lightbox.addEventListener('gesturestart', (e) => { if (isActive()) { e.preventDefault(); gestureStartZoom = state.zoom; } }, { passive: false });
            dom.lightbox.addEventListener('gesturechange', (e) => { if (isActive()) { e.preventDefault(); setZoom(gestureStartZoom * e.scale); } }, { passive: false });
            dom.lightbox.addEventListener('gestureend', (e) => { if (isActive()) e.preventDefault(); }, { passive: false });
        }

        // Touch
        const getTouchDist = (t1, t2) => Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
        const getTouchCenter = (t1, t2) => ({ x: (t1.pageX + t2.pageX) / 2, y: (t1.pageY + t2.pageY) / 2 });

        window.addEventListener('touchstart', (e) => {
            if (!isActive() || e.target !== dom.image) return;

            if (e.touches.length === 2) {
                e.preventDefault();
                state.isPinching = true;
                const [t0, t1] = e.touches;
                state.pinchStart = { ...getTouchCenter(t0, t1), dist: getTouchDist(t0, t1), zoom: state.zoom };
            } else {
                const t = e.touches[0];
                state.touchStart = { x: t.pageX, y: t.pageY, time: Date.now() };
                if (state.zoom > 1) {
                    state.isDragging = true;
                    state.dragStart = { x: t.pageX, y: t.pageY, panX: state.panX, panY: state.panY };
                    // Cache bounds at drag start for smooth panning
                    cacheBounds();
                }
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (!isActive() || e.target !== dom.image) return;

            if (e.touches.length === 2 && state.isPinching) {
                e.preventDefault();
                const [t0, t1] = e.touches;
                const scale = getTouchDist(t0, t1) / state.pinchStart.dist;
                const center = getTouchCenter(t0, t1);
                state.zoom = clamp(state.pinchStart.zoom * scale, CONFIG.MIN_ZOOM, CONFIG.MAX_ZOOM);
                state.panX = (center.x - state.pinchStart.x) * 2 / state.zoom;
                state.panY = (center.y - state.pinchStart.y) * 2 / state.zoom;
                updateTransform();
            } else if (e.touches.length === 1 && state.isDragging && state.zoom > 1) {
                e.preventDefault();
                updatePan((e.touches[0].pageX - state.dragStart.x) * CONFIG.PAN_SPEED, (e.touches[0].pageY - state.dragStart.y) * CONFIG.PAN_SPEED);
            }
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            if (!isActive()) return;

            if (state.isPinching) { state.isPinching = false; return; }

            // Only process swipe if we have valid touchStart data from a recent touch on the image
            if (!state.touchStart?.time || Date.now() - state.touchStart.time > 1000) {
                state.isDragging = false;
                return;
            }

            const touch = e.changedTouches[0];
            const dx = touch.pageX - state.touchStart.x;
            const dy = touch.pageY - state.touchStart.y;

            state.isDragging = false;
            state.touchStart = {}; // Clear to prevent stale data from triggering future swipes

            // Swipe nav
            if (state.zoom <= 1 && Math.abs(dx) > CONFIG.SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
                navigate(dx < 0 ? 1 : -1);
            }
        });

        // Double-tap zoom (touch)
        let lastTap = 0;
        dom.image.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTap < 300 && e.changedTouches.length === 1) {
                e.preventDefault();
                e.stopPropagation(); // Prevent event from bubbling
                if (state.isNavigating) return;
                toggleZoom();
            }
            lastTap = now;
        }, { passive: false });

        // Prevent browser zoom
        document.addEventListener('wheel', (e) => { if (isActive() && e.ctrlKey) e.preventDefault(); }, { passive: false });
    }

    // ========== INIT ==========
    function init() {
        initThumbnails();
        initInteractions();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();