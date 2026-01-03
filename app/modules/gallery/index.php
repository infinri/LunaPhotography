<?php
declare(strict_types=1);
/**
 * Gallery Module Controller
 *
 * Luna Photography & Video gallery/portfolio page
 */

use App\Base\Helpers\{Meta, Assets};
use App\Helpers\Env;

// Set page-specific meta tags
Meta::setMultiple([
    'title' => 'Gallery | Luna Photography & Video | Our Work',
    'description' => 'View our portfolio of photography and videography work. Weddings, quinceañeras, family portraits, events, and more from Luna Photography & Video in Dallas-Fort Worth.',
    'og:title' => 'Gallery | Luna Photography & Video',
    'og:description' => 'Browse our photography and videography portfolio. Weddings, events, portraits, and more.',
    'twitter:title' => 'Gallery | Luna Photography & Video'
]);

// Load gallery-specific assets (development only - production uses bundles)
if (Env::get('APP_ENV', 'development') !== 'production') {
    $modulePath = __DIR__;
    $assetBase = '/assets/modules/gallery/view/frontend';

    if (file_exists("{$modulePath}/view/frontend/css/gallery.css")) {
        Assets::addCss("{$assetBase}/css/gallery.css");
    }

    if (file_exists("{$modulePath}/view/frontend/js/gallery.js")) {
        Assets::addJs("{$assetBase}/js/gallery.js");
    }
}

// Load template
require __DIR__ . '/view/frontend/templates/gallery.php';
