<?php
declare(strict_types=1);
/**
 * Header Template
 *
 * Luna Photography & Video - Navigation bar
 * Assets loaded in index.php
 */
?>
<header class="header">
    <nav class="nav">
        <a href="/" class="logo">
            <img src="/assets/base/images/logo.png" alt="Luna Photography & Video" class="logo-image">
        </a>
        
        <button class="menu-toggle" aria-expanded="false" aria-label="Toggle menu">
            <span class="hamburger"></span>
        </button>
        
        <div class="nav-menu">
            <button class="menu-close" aria-label="Close menu">&times;</button>
            <ul class="nav-links">
                <li><a href="/" class="nav-link">Home</a></li>
                <li><a href="/about" class="nav-link">About</a></li>
                <li><a href="/gallery" class="nav-link">Gallery</a></li>
                <li><a href="/contact" class="nav-link">Contact</a></li>
            </ul>
        </div>
    </nav>
</header>
