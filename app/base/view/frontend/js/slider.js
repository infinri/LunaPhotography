/**
 * Global Slider Module
 * Reusable horizontal slider with optional navigation buttons
 * 
 * Supports two patterns:
 * 1. .slider-container with .slider-track and .slider-btn--prev/.slider-btn--next
 * 2. Auto-init on any element with [data-slider] attribute
 */

(function() {
    'use strict';

    // ========== UTILITIES ==========
    
    const throttle = (fn, wait) => {
        let last = 0;
        return (...args) => {
            const now = Date.now();
            if (now - last >= wait) {
                last = now;
                fn(...args);
            }
        };
    };

    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

    // ========== SLIDER CLASS ==========
    
    class Slider {
        constructor(container, options = {}) {
            this.container = container;
            this.options = {
                trackSelector: options.trackSelector || '.slider-track',
                prevSelector: options.prevSelector || '.slider-btn--prev',
                nextSelector: options.nextSelector || '.slider-btn--next',
                itemWidth: options.itemWidth || 292, // Default: 280px + 12px gap
                scrollMultiplier: options.scrollMultiplier || 3,
                ...options
            };

            this.track = container.querySelector(this.options.trackSelector);
            this.prevBtn = container.querySelector(this.options.prevSelector);
            this.nextBtn = container.querySelector(this.options.nextSelector);

            if (!this.track) return;

            this.init();
        }

        init() {
            this.bindEvents();
            this.updateButtons();
        }

        bindEvents() {
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.scroll(-1));
            }
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.scroll(1));
            }

            // Update buttons on scroll (no throttle - smooth scroll doesn't fire often)
            this.track.addEventListener('scroll', () => this.updateButtons(), { passive: true });

            // Update buttons on resize
            window.addEventListener('resize', throttle(() => this.updateButtons(), 200), { passive: true });
        }

        scroll(direction) {
            const { itemWidth, scrollMultiplier } = this.options;
            const maxScroll = this.track.scrollWidth - this.track.clientWidth;
            const scrollAmount = direction * itemWidth * scrollMultiplier;
            const target = clamp(this.track.scrollLeft + scrollAmount, 0, maxScroll);
            
            this.track.scrollTo({ left: target, behavior: 'smooth' });
            
            // Update buttons after scroll animation completes
            setTimeout(() => this.updateButtons(), 350);
        }

        updateButtons() {
            if (!this.prevBtn || !this.nextBtn) return;

            const maxScroll = this.track.scrollWidth - this.track.clientWidth;
            const scrollPos = Math.round(this.track.scrollLeft);
            
            // No scrolling needed - hide both buttons
            if (maxScroll <= 0) {
                this.prevBtn.style.visibility = 'hidden';
                this.prevBtn.style.opacity = '0';
                this.nextBtn.style.visibility = 'hidden';
                this.nextBtn.style.opacity = '0';
                return;
            }

            const atStart = scrollPos <= 1;
            const atEnd = scrollPos >= maxScroll - 1;

            // Show/hide buttons based on position (use visibility to preserve layout)
            this.prevBtn.style.visibility = atStart ? 'hidden' : 'visible';
            this.prevBtn.style.opacity = atStart ? '0' : '1';
            this.nextBtn.style.visibility = atEnd ? 'hidden' : 'visible';
            this.nextBtn.style.opacity = atEnd ? '0' : '1';
        }

        // Scroll to a specific item by index
        scrollToItem(index) {
            const items = this.track.children;
            if (index >= 0 && index < items.length) {
                items[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }

    // ========== AUTO-INIT ==========
    
    function initSliders() {
        // Pattern 1: .slider-container elements
        document.querySelectorAll('.slider-container').forEach(container => {
            if (!container._slider) {
                container._slider = new Slider(container);
            }
        });

        // Pattern 2: [data-slider] attribute
        document.querySelectorAll('[data-slider]').forEach(container => {
            if (!container._slider) {
                const options = {};
                
                // Parse data attributes for options
                if (container.dataset.sliderTrack) options.trackSelector = container.dataset.sliderTrack;
                if (container.dataset.sliderItemWidth) options.itemWidth = parseInt(container.dataset.sliderItemWidth, 10);
                if (container.dataset.sliderMultiplier) options.scrollMultiplier = parseInt(container.dataset.sliderMultiplier, 10);
                
                container._slider = new Slider(container, options);
            }
        });
    }

    // ========== EXPORTS ==========
    
    // Expose Slider class globally for manual initialization
    window.Slider = Slider;
    
    // Auto-init function for external calls
    window.initSliders = initSliders;

    // ========== INIT ==========
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSliders);
    } else {
        initSliders();
    }
})();
