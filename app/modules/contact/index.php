<?php
declare(strict_types=1);
/**
 * Contact Module Controller
 *
 * Displays contact information (no form submission in Basic template)
 */

use App\Base\Helpers\{Meta, Assets};
use App\Helpers\Env;

// Set page-specific meta tags
Meta::setMultiple([
    'title' => 'Contact Us | Get in Touch',
    'description' => 'Get in touch with us. Find our contact information including email, phone, location, and business hours.',
    'og:title' => 'Contact Us | Get in Touch',
    'og:description' => 'Get in touch with us. Find our contact information including email, phone, location, and business hours.',
    'twitter:title' => 'Contact Us | Get in Touch'
]);

// Load contact-specific assets (development only - production uses bundles)
if (Env::get('APP_ENV', 'development') !== 'production') {
    $modulePath = __DIR__;
    $assetBase = '/assets/modules/contact/view/frontend';

    if (file_exists("{$modulePath}/view/frontend/css/contact.css")) {
        Assets::addCss("{$assetBase}/css/contact.css");
    }
}

// Load template
require __DIR__ . '/view/frontend/templates/contact.php';
