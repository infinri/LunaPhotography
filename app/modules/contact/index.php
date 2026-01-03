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
    'title' => 'Contact | Luna Photography & Video | DFW',
    'description' => 'Contact Luna Photography & Video for photography and videography services in Dallas-Fort Worth. Email: luciosaldivar15a@gmail.com. Phone: (214) 714-1642.',
    'og:title' => 'Contact | Luna Photography & Video',
    'og:description' => 'Contact us for photography and videography in DFW. ¡Hablamos español!',
    'twitter:title' => 'Contact | Luna Photography & Video'
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
