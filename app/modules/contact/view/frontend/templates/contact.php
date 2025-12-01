<?php
declare(strict_types=1);
/**
 * Contact Template
 *
 * Pure HTML template for contact page
 * Meta and assets loaded in index.php
 */

use App\Helpers\{Session, Esc};
use App\Base\Helpers\ReCaptcha;
?>

<!-- Contact Hero -->
<section class="page-hero contact-hero">
    <div class="container">
        <h1 class="page-title contact-title">Contact Us</h1>
        <p class="page-subtitle contact-subtitle">
            We'd love to hear from you. Get in touch with us using the form below or through any of our contact methods.
        </p>
    </div>
</section>

<!-- Contact Section -->
<section class="page-section contact-section">
    <div class="container">
        <div class="contact-wrapper">
            <!-- Contact Info -->
            <div class="contact-info">
                <h2 class="info-section-title">Contact Information</h2>
                <div class="info-card-container">
                    
                <div class="info-card">
                    <svg class="info-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m2 7 10 6 10-6"/>
                    </svg>
                    <div class="info-content">
                        <h3 class="info-title">Email</h3>
                        <p class="info-text">contact@yourcompany.com</p>
                        <p class="info-subtitle">We'll reply promptly</p>
                    </div>
                </div>
                
                <div class="info-card">
                    <svg class="info-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <div class="info-content">
                        <h3 class="info-title">Phone</h3>
                        <p class="info-text">(555) 123-4567</p>
                        <p class="info-subtitle">Mon-Fri, 9am-5pm</p>
                    </div>
                </div>
                
                <div class="info-card">
                    <svg class="info-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div class="info-content">
                        <h3 class="info-title">Location</h3>
                        <p class="info-text">Your City, State</p>
                        <p class="info-subtitle">Your Address Here</p>
                    </div>
                </div>
                
                <div class="info-card">
                    <svg class="info-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <div class="info-content">
                        <h3 class="info-title">Business Hours</h3>
                        <p class="info-text">Mon-Fri: 9am-5pm</p>
                        <p class="info-subtitle">Weekends: Closed</p>
                    </div>
                </div>
            </div>
            </div>
            
            <!-- Contact Form -->
            <div class="contact-form-wrapper">
                <h2 class="form-title">Send a Message</h2>
                <p class="form-description">
                    Have a question or want to work together? Fill out the form below and we'll get back to you as soon as possible.
                </p>
                
                <form method="POST" action="/contact" class="contact-form" id="contactForm">
                    <input type="hidden" name="csrf_token" value="<?php echo Esc::html($csrf ?? Session::csrf()); ?>">
                    <input type="hidden" name="recaptcha_token" id="recaptchaToken" data-sitekey="<?php echo Esc::html(ReCaptcha::getSiteKey()); ?>">
                    
                    <div class="form-group">
                        <label for="name" class="form-label">Name *</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            class="form-input"
                            required
                            placeholder="Your name"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="email" class="form-label">Email *</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            class="form-input"
                            required
                            placeholder="your.email@example.com"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="phone" class="form-label">Phone *</label>
                        <input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            class="form-input"
                            required
                            placeholder="(555) 123-4567"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="message" class="form-label">Message *</label>
                        <textarea 
                            id="message" 
                            name="message" 
                            class="form-textarea"
                            required
                            placeholder="Tell me about your project..."
                            rows="6"
                        ></textarea>
                    </div>
                    
                    <!-- Company verification field -->
                    <div class="company-info" aria-hidden="true">
                        <input type="text" name="company_url" id="comp_url_verify" value="" tabindex="-1" autocomplete="new-password" aria-hidden="true">
                    </div>
                    
                    <!-- Privacy & Consent -->
                    <div class="form-group form-consent">
                        <label class="consent-wrapper">
                            <input 
                                type="checkbox" 
                                id="privacy_consent" 
                                name="privacy_consent" 
                                class="consent-checkbox"
                                required
                            >
                            <span class="consent-text">
                                * I agree to the <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a> and consent to Infinri collecting and storing my information for the purpose of responding to this inquiry.
                            </span>
                        </label>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-lg form-submit">
                        <span>Send Message</span>
                        <span class="btn-icon">→</span>
                    </button>
                    
                    <p class="form-note">
                        * Required fields
                    </p>
                </form>
            </div>
        </div>
    </div>
</section>

<!-- reCAPTCHA is lazy-loaded by contact-lazy.js on user interaction -->
