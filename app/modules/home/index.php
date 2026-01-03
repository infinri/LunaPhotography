<?php
declare(strict_types=1);
/**
 * Home Module Controller
 *
 * Luna Photography portfolio homepage
 */

use App\Base\Helpers\{Meta, Assets};
use App\Helpers\Env;

// Set page-specific meta tags
Meta::setMultiple([
    'title' => 'Luna Photography & Video | DFW Photography & Videography Services',
    'description' => 'A family-owned Texas business offering high-quality photography and videography services in the Dallas-Fort Worth Metroplex. On-site services in DFW, editing services nationwide. ¡Hablamos español!',
    'og:title' => 'Luna Photography & Video | DFW Photography & Videography',
    'og:description' => 'Family-owned photography and videography in Dallas-Fort Worth. On-site services in DFW, editing nationwide.',
    'twitter:title' => 'Luna Photography & Video | DFW'
]);

// Load home-specific assets (development only - production uses bundles)
if (Env::get('APP_ENV', 'development') !== 'production') {
    $modulePath = __DIR__;
    $assetBase = '/assets/modules/home/view/frontend';

    if (file_exists("{$modulePath}/view/frontend/css/home.css")) {
        Assets::addCss("{$assetBase}/css/home.css");
    }

    if (file_exists("{$modulePath}/view/frontend/js/home.js")) {
        Assets::addJs("{$assetBase}/js/home.js");
    }
}

// Load template
require __DIR__ . '/view/frontend/templates/home.php';
