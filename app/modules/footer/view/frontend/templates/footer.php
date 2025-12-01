<?php
declare(strict_types=1);
/**
 * Footer Template
 *
 * Professional footer with brand, contact CTA, and social links.
 * Copyright and legal links centered at bottom.
 * 
 * Assets loaded in index.php
 */
?>
<footer class="main-footer">
    <div class="container">
        <div class="footer-content">
            <div class="footer-section footer-info">
                <h2>Your Company Name</h2>
                <p>A brief description of your business goes here. Replace this placeholder text with your company's mission or tagline.</p>
            </div>
            
            <div class="footer-section footer-links">
                <h3>Quick Links</h3>
                <ul class="footer-nav">
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </div>
            
            <div class="footer-section footer-contact">
                <h3>Contact</h3>
                <p>Email: your.email@example.com</p>
                <p>Phone: (555) 123-4567</p>
            </div>
        </div>
        
        <div class="footer-bottom">
            <div class="footer-bottom-content">
                <p class="footer-copyright">&copy; <?php echo date('Y'); ?> Your Company Name. All Rights Reserved.</p>
                <nav class="footer-legal-links">
                    <a href="/privacy">Privacy Policy</a>
                    <span class="separator">·</span>
                    <a href="/terms">Terms & Conditions</a>
                </nav>
            </div>
            <p class="footer-credit">Powered by <a href="https://infinri.com" target="_blank" rel="noopener">Infinri</a></p>
        </div>
    </div>
</footer>
