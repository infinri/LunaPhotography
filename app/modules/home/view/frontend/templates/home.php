<?php
declare(strict_types=1);
/**
 * Luna Photography & Video - Homepage
 *
 * Hero section with intro and call-to-action
 * Family-owned DFW photography & videography business
 */
?>

<section class="section hero-section">
    <div class="container">
        <div class="hero-content">
            <h1 class="hero-title">Welcome to Luna Photography,</h1>
            
            <p class="hero-intro">
                <strong>For over 24 years, we've captured life's most cherished celebrations</strong>—from <strong>weddings and quinceañeras to milestone events</strong>—always with a <strong>personal, family-owned touch</strong>. Our professional photography and videography services cater to anyone seeking <strong>high-quality</strong> results with decades of expertise.
            </p>
            
            <ul class="hero-features">
                <li><span class="feature-icon">📸</span> <strong>Professional photography</strong> for portraits, weddings, and events</li>
                <li><span class="feature-icon">🎬</span> <strong>Cinematic videography</strong> capturing your special moments</li>
                <li><span class="feature-icon">💫</span> <strong>Personal, family-owned service</strong> with attention to every detail</li>
            </ul>
            
            <p class="hero-cta-text">
                <strong>Let us capture your story</strong>—contact us today for a consultation.
            </p>
            <p class="hablamos-spanish">¡Hablamos español!</p>
            
            <div class="hero-buttons">
                <a href="/gallery" class="btn btn-primary">View Our Work</a>
                <a href="/contact" class="btn btn-outline">Get a Quote</a>
            </div>
        </div>
    </div>
</section>

<section class="section services-section">
    <div class="container">
        <h2 class="section-title">Our Services</h2>
        <p class="section-subtitle">Weddings, birthdays, graduations, or business events — it doesn’t matter.
            Our pricing is based entirely on your package, not your event type.
            Photos, videos, hours, materials, and formats are what determine cost.
            <br><br>Fair pricing. No “wedding tax.”
        </p>
        
        <div class="services-grid">
            <a href="/contact" class="service-card">
                <div class="service-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                </div>
                <h3>Photography Only</h3>
                <p>Need just photos? Custom photo-only packages available upon request. Contact us to discuss your specific needs.</p>
            </a>
            
            <a href="/contact" class="service-card service-card-featured">
                <span class="service-badge">Most Popular</span>
                <div class="service-icon">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <path d="M3 9h18"/>
                        <path d="M9 21V9"/>
                    </svg>
                </div>
                <h3>Bundle Packages</h3>
                <p>Photo + video coverage with prints, albums, and USB delivery. Multiple tiers available based on print sizes, quantities, and coverage time. <strong>Contact us for package details!</strong></p>
            </a>
            
            <a href="/contact" class="service-card">
                <div class="service-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                </div>
                <h3>Videography Only</h3>
                <p>Need just video? Custom video-only packages available upon request. Contact us to discuss your specific needs.</p>
            </a>
            
        </div>
        
        <p class="services-note">Every event is unique—<a href="/contact">contact us</a> for a personalized quote based on your specific needs.</p>
    </div>
</section>

<section class="section section--separated capture-section">
    <div class="container">
        <div class="capture-header">
            <h2 class="section-title">Capture Life's Moments</h2>
            <p class="section-subtitle">At Luna Photography, we don't just take photos—we capture emotions, smiles, and those unique moments that tell your story.</p>
        </div>
        
        <div class="slider-container">
            <button class="slider-btn slider-btn--prev" aria-label="Previous">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            
            <div class="slider-track">
                <a href="/gallery#weddings" class="event-slide">
                    <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop" alt="Wedding Photography" class="event-slide-image">
                    <div class="event-slide-overlay">
                        <h3 class="event-slide-title">Weddings</h3>
                    </div>
                </a>
                
                <a href="/gallery#quinceaneras" class="event-slide">
                    <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop" alt="Quinceañera Photography" class="event-slide-image">
                    <div class="event-slide-overlay">
                        <h3 class="event-slide-title">Quinceañeras</h3>
                    </div>
                </a>
                
                <a href="/gallery#graduations" class="event-slide">
                    <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop" alt="Graduation Photography" class="event-slide-image">
                    <div class="event-slide-overlay">
                        <h3 class="event-slide-title">Graduations</h3>
                    </div>
                </a>
                
                <a href="/gallery#birthdays" class="event-slide">
                    <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop" alt="Birthday Photography" class="event-slide-image">
                    <div class="event-slide-overlay">
                        <h3 class="event-slide-title">Birthdays</h3>
                    </div>
                </a>
                
                <a href="/gallery#corporate" class="event-slide">
                    <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop" alt="Corporate Event Photography" class="event-slide-image">
                    <div class="event-slide-overlay">
                        <h3 class="event-slide-title">Corporate Events</h3>
                    </div>
                </a>
            </div>
            
            <button class="slider-btn slider-btn--next" aria-label="Next">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
        
        <div class="capture-footer">
            <p class="capture-text">Because every important moment deserves to be remembered in the best way possible—trust us to make your moments unforgettable!</p>
            <a href="/gallery" class="btn btn-primary">View All Our Work</a>
        </div>
    </div>
</section>

<section class="section section--separated cta-section">
    <div class="container">
        <div class="cta-content">
            <h2>Ready to Capture Your Story?</h2>
            <p>Contact us today for a free consultation. Services available throughout the DFW metroplex.</p>
            <div class="cta-buttons">
                <a href="/contact" class="btn btn-primary btn-lg">Get Started</a>
                <a href="tel:+12147141642" class="btn btn-outline">Call (214) 714-1642</a>
            </div>
        </div>
    </div>
</section>
