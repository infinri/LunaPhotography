/**
 * Gallery Module - Slider & Lightbox
 * Modern gallery with horizontal sliders and fullscreen lightbox
 */

(function() {
    'use strict';

    // State
    let currentCategory = null;
    let currentIndex = 0;
    let categoryImages = [];
    
    // Zoom state
    let zoomLevel = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let startPanX = 0;
    let startPanY = 0;
    const MIN_ZOOM = 1;
    const MAX_ZOOM = 5;
    const DEFAULT_ZOOM = 2.5;
    const PAN_SPEED = 1.5;

    // DOM Elements
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxLoader = lightbox.querySelector('.lightbox-loader');
    const lightboxThumbs = lightbox.querySelector('.lightbox-thumbs');
    const lightboxViewAll = lightbox.querySelector('.lightbox-view-all');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-nav--prev');
    const lightboxNext = lightbox.querySelector('.lightbox-nav--next');
    const lightboxOverlay = lightbox.querySelector('.lightbox-overlay');
    const lightboxMain = lightbox.querySelector('.lightbox-main');
    const lightboxZoomBtn = lightbox.querySelector('.lightbox-zoom');

    // Initialize sliders
    function initSliders() {
        const sliders = document.querySelectorAll('.slider-container');
        
        sliders.forEach(slider => {
            const track = slider.querySelector('.slider-track');
            const prevBtn = slider.querySelector('.slider-btn--prev');
            const nextBtn = slider.querySelector('.slider-btn--next');
            
            if (!track || !prevBtn || !nextBtn) return;

            let scrollAmount = 0;
            const thumbWidth = 292; // thumb width (280) + gap (12)

            // Update button visibility
            function updateButtons() {
                const maxScroll = track.scrollWidth - track.clientWidth;
                prevBtn.style.opacity = scrollAmount <= 0 ? '0.3' : '1';
                prevBtn.style.pointerEvents = scrollAmount <= 0 ? 'none' : 'auto';
                nextBtn.style.opacity = scrollAmount >= maxScroll - 10 ? '0.3' : '1';
                nextBtn.style.pointerEvents = scrollAmount >= maxScroll - 10 ? 'none' : 'auto';
            }

            // Scroll handlers
            prevBtn.addEventListener('click', () => {
                scrollAmount = Math.max(0, scrollAmount - thumbWidth * 3);
                track.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                setTimeout(updateButtons, 350);
            });

            nextBtn.addEventListener('click', () => {
                const maxScroll = track.scrollWidth - track.clientWidth;
                scrollAmount = Math.min(maxScroll, scrollAmount + thumbWidth * 3);
                track.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                setTimeout(updateButtons, 350);
            });

            // Sync scroll position
            track.addEventListener('scroll', () => {
                scrollAmount = track.scrollLeft;
                updateButtons();
            });

            // Initial state
            updateButtons();
        });
    }

    // Initialize thumbnail clicks
    function initThumbnails() {
        const thumbs = document.querySelectorAll('.gallery-thumb');
        
        thumbs.forEach((thumb, globalIndex) => {
            thumb.addEventListener('click', () => {
                const category = thumb.closest('.gallery-category');
                if (!category) return;

                currentCategory = category;
                const categoryName = category.dataset.category;
                const viewAllLink = category.querySelector('.view-all-slide');
                
                // Get all images in this category
                categoryImages = Array.from(category.querySelectorAll('.gallery-thumb'));
                currentIndex = categoryImages.indexOf(thumb);

                // Update view all link
                if (viewAllLink && lightboxViewAll) {
                    lightboxViewAll.href = viewAllLink.href;
                }

                // Build thumbnail strip
                buildThumbnailStrip();

                // Open lightbox
                openLightbox();
            });

            // Add cursor pointer
            thumb.style.cursor = 'pointer';
        });
    }

    // Build thumbnail strip for lightbox
    function buildThumbnailStrip() {
        if (!lightboxThumbs) return;
        
        lightboxThumbs.innerHTML = '';
        
        categoryImages.forEach((thumb, index) => {
            const img = thumb.querySelector('img');
            if (!img) return;

            const thumbEl = document.createElement('div');
            thumbEl.className = 'lightbox-thumb' + (index === currentIndex ? ' active' : '');
            thumbEl.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
            
            thumbEl.addEventListener('click', () => {
                currentIndex = index;
                showImage(currentIndex);
                updateActiveThumbnail();
            });

            lightboxThumbs.appendChild(thumbEl);
        });

        // Scroll active thumbnail into view
        scrollThumbIntoView();
    }

    // Update active thumbnail
    function updateActiveThumbnail() {
        const thumbs = lightboxThumbs.querySelectorAll('.lightbox-thumb');
        thumbs.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === currentIndex);
        });
        scrollThumbIntoView();
    }

    // Scroll thumbnail strip to show active
    function scrollThumbIntoView() {
        const activeThumb = lightboxThumbs.querySelector('.lightbox-thumb.active');
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }

    // Show image at index
    function showImage(index) {
        if (index < 0 || index >= categoryImages.length) return;

        const thumb = categoryImages[index];
        const fullSrc = thumb.dataset.full;
        const img = thumb.querySelector('img');
        const alt = img ? img.alt : '';

        // Show loader
        lightboxLoader.style.display = 'block';
        lightboxImage.style.opacity = '0';

        // Preload image
        const preloader = new Image();
        preloader.onload = () => {
            lightboxImage.src = fullSrc;
            lightboxImage.alt = alt;
            lightboxLoader.style.display = 'none';
            lightboxImage.style.opacity = '1';
        };
        preloader.onerror = () => {
            // Fallback to thumbnail
            lightboxImage.src = img ? img.src : '';
            lightboxImage.alt = alt;
            lightboxLoader.style.display = 'none';
            lightboxImage.style.opacity = '1';
        };
        preloader.src = fullSrc;

        // Update navigation visibility
        lightboxPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
        lightboxNext.style.visibility = index === categoryImages.length - 1 ? 'hidden' : 'visible';

        // Reset zoom when changing images
        resetZoom();
    }

    // Zoom functionality with variable levels
    function setZoom(level) {
        zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));
        constrainPan();
        applyTransform();
        updateZoomUI();
    }

    function constrainPan() {
        if (zoomLevel <= 1) {
            panX = 0;
            panY = 0;
        } else {
            // Get the current image dimensions (already scaled)
            const rect = lightboxImage.getBoundingClientRect();
            // Calculate the original (unscaled) dimensions
            const imgWidth = rect.width / zoomLevel;
            const imgHeight = rect.height / zoomLevel;
            
            // The scaled image size
            const scaledWidth = imgWidth * zoomLevel;
            const scaledHeight = imgHeight * zoomLevel;
            
            // How much extra space exists beyond the original size
            const extraWidth = scaledWidth - imgWidth;
            const extraHeight = scaledHeight - imgHeight;
            
            // Max pan is half the extra space (since pan is from center)
            // Divide by zoomLevel because translate happens before scale in transform
            const maxPanX = extraWidth / (2 * zoomLevel);
            const maxPanY = extraHeight / (2 * zoomLevel);
            
            // Clamp pan values to keep image edges within view
            panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
            panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
        }
    }

    function applyTransform() {
        if (zoomLevel <= 1) {
            lightboxImage.style.transform = '';
        } else {
            lightboxImage.style.transform = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
        }
    }

    function updateZoomUI() {
        const isZoomed = zoomLevel > 1;
        lightboxImage.classList.toggle('zoomed', isZoomed);
        lightboxMain.classList.toggle('zoomed', isZoomed);
        if (lightboxZoomBtn) lightboxZoomBtn.classList.toggle('active', isZoomed);
        
        // Update cursor
        lightboxImage.style.cursor = isZoomed ? 'grab' : 'zoom-in';

        // Show/hide zoom hint
        const hint = lightbox.querySelector('.zoom-hint');
        if (hint) {
            hint.style.opacity = isZoomed ? '0' : '1';
        }
    }

    function toggleZoom() {
        if (zoomLevel > 1) {
            setZoom(1);
        } else {
            setZoom(DEFAULT_ZOOM);
        }
        panX = 0;
        panY = 0;
        applyTransform();
    }

    function resetZoom() {
        zoomLevel = 1;
        panX = 0;
        panY = 0;
        isDragging = false;
        applyTransform();
        updateZoomUI();
    }

    function initZoom() {
        // Click to toggle zoom (with drag detection)
        let mouseDownTime = 0;
        let mouseDownX = 0;
        let mouseDownY = 0;

        lightboxImage.addEventListener('mousedown', (e) => {
            e.preventDefault();
            mouseDownTime = Date.now();
            mouseDownX = e.clientX;
            mouseDownY = e.clientY;
            
            if (zoomLevel > 1) {
                isDragging = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                startPanX = panX;
                startPanY = panY;
                lightboxImage.classList.add('grabbing');
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || zoomLevel <= 1) return;
            
            const deltaX = (e.clientX - dragStartX) * PAN_SPEED;
            const deltaY = (e.clientY - dragStartY) * PAN_SPEED;
            
            panX = startPanX + deltaX / zoomLevel;
            panY = startPanY + deltaY / zoomLevel;
            constrainPan();
            applyTransform();
        });

        document.addEventListener('mouseup', (e) => {
            const timeDiff = Date.now() - mouseDownTime;
            const moveDist = Math.hypot(e.clientX - mouseDownX, e.clientY - mouseDownY);
            
            isDragging = false;
            lightboxImage.classList.remove('grabbing');
            
            if (zoomLevel > 1) {
                lightboxImage.style.cursor = 'grab';
            }
            
            // Only toggle zoom if it was a quick click without much movement
            if (timeDiff < 200 && moveDist < 5) {
                toggleZoom();
            }
        });

        // Zoom button
        if (lightboxZoomBtn) {
            lightboxZoomBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleZoom();
            });
        }

        // Normalize wheel delta across browsers (pixel, line, page modes)
        function normalizeWheelDelta(e) {
            let deltaX = e.deltaX;
            let deltaY = e.deltaY;
            
            // Convert line/page deltas to pixels
            if (e.deltaMode === 1) { // DOM_DELTA_LINE
                deltaX *= 40;
                deltaY *= 40;
            } else if (e.deltaMode === 2) { // DOM_DELTA_PAGE
                deltaX *= 800;
                deltaY *= 800;
            }
            
            return { deltaX, deltaY };
        }

        // Apply zoom with origin point
        function applyZoomAtPoint(scaleFactor, originX, originY) {
            const rect = lightboxImage.getBoundingClientRect();
            const imgCenterX = rect.left + rect.width / 2;
            const imgCenterY = rect.top + rect.height / 2;
            
            const cursorOffsetX = (originX - imgCenterX) / zoomLevel;
            const cursorOffsetY = (originY - imgCenterY) / zoomLevel;
            
            const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel * scaleFactor));
            
            if (newZoom !== zoomLevel) {
                const zoomRatio = newZoom / zoomLevel;
                
                if (newZoom > 1) {
                    panX = panX - cursorOffsetX * (zoomRatio - 1) / zoomRatio;
                    panY = panY - cursorOffsetY * (zoomRatio - 1) / zoomRatio;
                }
                
                zoomLevel = newZoom;
                constrainPan();
                applyTransform();
                updateZoomUI();
            }
        }

        // Wheel event handler for trackpad/mouse gestures
        function handleWheel(e) {
            if (!lightbox.classList.contains('active')) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const { deltaX, deltaY } = normalizeWheelDelta(e);
            
            // Ctrl+scroll or pinch gesture (ctrlKey/metaKey) = zoom
            const isZoomGesture = e.ctrlKey || e.metaKey;
            
            if (isZoomGesture) {
                // Zoom in/out based on scroll direction
                const zoomSensitivity = 0.01;
                const scaleFactor = 1 - deltaY * zoomSensitivity;
                applyZoomAtPoint(scaleFactor, e.clientX, e.clientY);
            }
            // When zoomed: scroll pans the image
            else if (zoomLevel > 1) {
                const panSensitivity = 1;
                panX -= deltaX * panSensitivity / zoomLevel;
                panY -= deltaY * panSensitivity / zoomLevel;
                constrainPan();
                applyTransform();
            }
            // When not zoomed: do nothing (scroll passes through)
        }
        
        // Attach wheel handler to lightbox content area
        lightbox.addEventListener('wheel', handleWheel, { passive: false });

        // Safari GestureEvent support (proprietary but necessary for Safari)
        let gestureStartZoom = 1;
        
        function handleGestureStart(e) {
            if (!lightbox.classList.contains('active')) return;
            e.preventDefault();
            gestureStartZoom = zoomLevel;
        }
        
        function handleGestureChange(e) {
            if (!lightbox.classList.contains('active')) return;
            e.preventDefault();
            
            const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, gestureStartZoom * e.scale));
            if (newZoom !== zoomLevel) {
                zoomLevel = newZoom;
                constrainPan();
                applyTransform();
                updateZoomUI();
            }
        }
        
        function handleGestureEnd(e) {
            if (!lightbox.classList.contains('active')) return;
            e.preventDefault();
        }
        
        // Add Safari gesture events if supported
        if ('GestureEvent' in window) {
            lightbox.addEventListener('gesturestart', handleGestureStart, { passive: false });
            lightbox.addEventListener('gesturechange', handleGestureChange, { passive: false });
            lightbox.addEventListener('gestureend', handleGestureEnd, { passive: false });
        }

        // Instagram-style pinch zoom on IMG elements
        let pinchStart = {};
        let isPinchZooming = false;

        // Calculate distance between two fingers
        const pinchDistance = (event) => {
            return Math.hypot(
                event.touches[0].pageX - event.touches[1].pageX,
                event.touches[0].pageY - event.touches[1].pageY
            );
        };

        window.addEventListener('touchstart', (event) => {
            // Only handle lightbox image
            if (!lightbox.classList.contains('active')) return;
            if (event.target !== lightboxImage) return;

            if (event.touches.length === 2) {
                event.preventDefault();
                isPinchZooming = true;

                // Calculate where the fingers have started on the X and Y axis
                pinchStart.x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                pinchStart.y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                pinchStart.distance = pinchDistance(event);
                pinchStart.scale = zoomLevel;
            }
        }, { passive: false });

        window.addEventListener('touchmove', (event) => {
            // Only handle lightbox image
            if (!lightbox.classList.contains('active')) return;
            if (event.target !== lightboxImage) return;

            if (event.touches.length === 2 && isPinchZooming) {
                event.preventDefault();

                // Calculate scale - Safari provides event.scale, others need manual calc
                let scale;
                if (event.scale) {
                    scale = event.scale;
                } else {
                    const deltaDistance = pinchDistance(event);
                    scale = deltaDistance / pinchStart.distance;
                }

                // Apply scale limits
                const newScale = Math.min(Math.max(MIN_ZOOM, pinchStart.scale * scale), MAX_ZOOM);
                zoomLevel = newScale;

                // Calculate finger movement for panning
                const currentCenterX = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                const currentCenterY = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                const deltaX = (currentCenterX - pinchStart.x) * 2;
                const deltaY = (currentCenterY - pinchStart.y) * 2;

                // Apply transform
                panX = deltaX / zoomLevel;
                panY = deltaY / zoomLevel;
                constrainPan();
                applyTransform();
                updateZoomUI();
            }
        }, { passive: false });

        window.addEventListener('touchend', (event) => {
            if (!lightbox.classList.contains('active')) return;

            if (isPinchZooming) {
                isPinchZooming = false;
                // Keep the zoom level, reset pan start point
                pinchStart = {};
            }
        }, { passive: false });

        // Single touch for tap and swipe (separate from pinch)
        let singleTouchStart = { x: 0, y: 0, time: 0 };
        
        lightboxImage.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                singleTouchStart.x = e.touches[0].pageX;
                singleTouchStart.y = e.touches[0].pageY;
                singleTouchStart.time = Date.now();
                
                if (zoomLevel > 1) {
                    isDragging = true;
                    dragStartX = e.touches[0].pageX;
                    dragStartY = e.touches[0].pageY;
                    startPanX = panX;
                    startPanY = panY;
                }
            }
        }, { passive: true });

        lightboxImage.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && isDragging && zoomLevel > 1 && !isPinchZooming) {
                e.preventDefault();
                const deltaX = (e.touches[0].pageX - dragStartX) * PAN_SPEED;
                const deltaY = (e.touches[0].pageY - dragStartY) * PAN_SPEED;
                panX = startPanX + deltaX / zoomLevel;
                panY = startPanY + deltaY / zoomLevel;
                constrainPan();
                applyTransform();
            }
        }, { passive: false });

        lightboxImage.addEventListener('touchend', (e) => {
            if (isPinchZooming) return;
            
            const timeDiff = Date.now() - singleTouchStart.time;
            const touch = e.changedTouches[0];
            const moveDistX = touch.pageX - singleTouchStart.x;
            const moveDistY = touch.pageY - singleTouchStart.y;
            const moveDist = Math.hypot(moveDistX, moveDistY);

            isDragging = false;

            // Tap to toggle zoom
            if (timeDiff < 200 && moveDist < 10) {
                toggleZoom();
            }
            // Swipe navigation when not zoomed
            else if (zoomLevel <= 1 && Math.abs(moveDistX) > 50 && Math.abs(moveDistX) > Math.abs(moveDistY)) {
                if (moveDistX < 0) {
                    navigate(1);
                } else {
                    navigate(-1);
                }
            }
        }, { passive: true });
    }

    // Open lightbox
    function openLightbox() {
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        showImage(currentIndex);
    }

    // Close lightbox
    function closeLightbox() {
        // Remove focus from any element inside lightbox before hiding
        if (document.activeElement && lightbox.contains(document.activeElement)) {
            document.activeElement.blur();
        }
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lightboxImage.src = '';
        resetZoom();
    }

    // Navigate images
    function navigate(direction) {
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < categoryImages.length) {
            currentIndex = newIndex;
            showImage(currentIndex);
            updateActiveThumbnail();
        }
    }

    // Event listeners
    function initEventListeners() {
        // Close button
        lightboxClose.addEventListener('click', closeLightbox);
        
        // Overlay click
        lightboxOverlay.addEventListener('click', closeLightbox);

        // Navigation
        lightboxPrev.addEventListener('click', () => navigate(-1));
        lightboxNext.addEventListener('click', () => navigate(1));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;

            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    navigate(-1);
                    break;
                case 'ArrowRight':
                    navigate(1);
                    break;
            }
        });

        // Prevent browser zoom when lightbox is active (document level)
        document.addEventListener('wheel', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.ctrlKey) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Initialize
    function init() {
        initSliders();
        initThumbnails();
        initEventListeners();
        initZoom();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
