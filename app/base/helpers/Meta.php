<?php
declare(strict_types=1);
/**
 * Meta Helper
 *
 * Centralized meta tag management with SEO support
 *
 * @package App\Base\Helpers
 */

namespace App\Base\Helpers;

use App\Helpers\{Esc, Env};

final class Meta
{
    private static array $tags = [
        // Defaults (DRY - set once, use everywhere)
        'title' => 'Infinri | Affordable Web Development for Small Businesses',
        'description' => 'Website development, hosting, and maintenance starting at $10. From quick templates to monthly support plans, transparent pricing, fast delivery, no surprises.',
        'author' => 'Lucio Saldivar',
        'viewport' => 'width=device-width, initial-scale=1.0',
        'charset' => 'UTF-8',
        'robots' => 'index, follow',  // Default: allow indexing

        // Open Graph
        'og:title' => 'Infinri | Affordable Web Development for Small Businesses',
        'og:description' => 'Website development, hosting, and maintenance starting at $10. Transparent pricing, fast delivery.',
        'og:image' => '/assets/base/images/og-image.jpg',
        'og:type' => 'website',
        'og:url' => '',  // Auto-generated from canonical

        // Twitter
        'twitter:card' => 'summary_large_image',
        'twitter:title' => 'Infinri | Affordable Web Development',
        'twitter:description' => 'Websites starting at $10. Monthly support plans from $10/mo. Transparent pricing, no surprises.',
        'twitter:image' => '/assets/base/images/og-image.jpg',
    ];

    /** @var array JSON-LD structured data schemas */
    private static array $schemas = [];

    /**
     * Set a single meta tag
     *
     * @param string $key Tag key
     * @param string $value Tag value
     * @return void
     */
    public static function set(string $key, string $value): void
    {
        self::$tags[$key] = $value;
    }

    /**
     * Set multiple meta tags at once
     *
     * @param array $data Associative array of meta tags
     * @return void
     */
    public static function setMultiple(array $data): void
    {
        foreach ($data as $key => $value) {
            self::$tags[$key] = $value;
        }
    }

    /**
     * Get a meta tag value
     *
     * @param string $key Tag key
     * @return string
     */
    public static function get(string $key): string
    {
        return self::$tags[$key] ?? '';
    }

    /**
     * Render all meta tags
     *
     * @return string
     */
    public static function render(): string
    {
        $output = '';

        // Charset
        $output .= '<meta charset="' . Esc::html(self::$tags['charset']) . '">' . PHP_EOL;

        // Viewport
        $output .= '<meta name="viewport" content="' . Esc::html(self::$tags['viewport']) . '">' . PHP_EOL;

        // Title
        $output .= '<title>' . Esc::html(self::$tags['title']) . '</title>' . PHP_EOL;

        // Standard meta tags
        foreach (['description', 'author', 'robots'] as $name) {
            if (self::$tags[$name] !== '' && self::$tags[$name] !== null) {
                $output .= '<meta name="' . $name . '" content="' . Esc::html(self::$tags[$name]) . '">' . PHP_EOL;
            }
        }

        // Open Graph
        foreach (self::$tags as $key => $value) {
            if (strpos($key, 'og:') === 0 && $value !== '' && $value !== null) {
                $output .= '<meta property="' . $key . '" content="' . Esc::html($value) . '">' . PHP_EOL;
            }
        }

        // Twitter
        foreach (self::$tags as $key => $value) {
            if (strpos($key, 'twitter:') === 0 && $value !== '' && $value !== null) {
                $output .= '<meta name="' . $key . '" content="' . Esc::html($value) . '">' . PHP_EOL;
            }
        }

        // Canonical URL (prevents duplicate content issues)
        $canonical = self::getCanonicalUrl();
        if ($canonical !== '') {
            $output .= '<link rel="canonical" href="' . Esc::html($canonical) . '">' . PHP_EOL;
            
            // Set og:url to match canonical if not explicitly set
            if (empty(self::$tags['og:url'])) {
                $output .= '<meta property="og:url" content="' . Esc::html($canonical) . '">' . PHP_EOL;
            }
        }

        // Favicon
        $output .= '<link rel="icon" type="image/png" href="/assets/base/images/favicon.png">' . PHP_EOL;
        $output .= '<link rel="apple-touch-icon" href="/assets/base/images/favicon.png">' . PHP_EOL;

        return $output;
    }

    /**
     * Add a JSON-LD structured data schema
     *
     * @param array $schema Schema data array
     * @return void
     */
    public static function addSchema(array $schema): void
    {
        self::$schemas[] = $schema;
    }

    /**
     * Set/replace all schemas (clears existing)
     *
     * @param array $schemas Array of schema arrays
     * @return void
     */
    public static function setSchemas(array $schemas): void
    {
        self::$schemas = $schemas;
    }

    /**
     * Render JSON-LD structured data
     * 
     * Outputs Organization schema by default if no schemas set.
     * Call this in the <head> or before </body>
     *
     * @return string JSON-LD script tags
     */
    public static function renderJsonLd(): string
    {
        $schemas = self::$schemas;

        // If no custom schemas, use default Organization schema
        if (empty($schemas)) {
            $schemas = [self::getDefaultOrganizationSchema()];
        }

        $output = '';
        foreach ($schemas as $schema) {
            if (!empty($schema)) {
                $json = json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                $output .= '<script type="application/ld+json">' . PHP_EOL;
                $output .= $json . PHP_EOL;
                $output .= '</script>' . PHP_EOL;
            }
        }

        return $output;
    }

    /**
     * Get default Organization schema
     * 
     * Uses SITE_URL and SITE_NAME from environment
     *
     * @return array Organization schema
     */
    public static function getDefaultOrganizationSchema(): array
    {
        $siteUrl = rtrim(Env::get('SITE_URL', ''), '/');
        $siteName = Env::get('SITE_NAME', 'Your Business Name');

        // Return empty if no SITE_URL configured
        if ($siteUrl === '') {
            return [];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $siteName,
            'url' => $siteUrl,
            'logo' => $siteUrl . '/assets/base/images/logo.png',
            'description' => self::$tags['description'] ?? '',
            'founder' => [
                '@type' => 'Person',
                'name' => self::$tags['author'] ?? 'Owner Name'
            ]
        ];
    }

    /**
     * Get the canonical URL for the current page
     * 
     * Auto-generates from SITE_URL + normalized request path
     * Can be overridden by setting 'canonical' tag directly
     *
     * @return string Full canonical URL
     */
    public static function getCanonicalUrl(): string
    {
        // Allow manual override
        if (!empty(self::$tags['canonical'])) {
            return self::$tags['canonical'];
        }

        // Get base URL from environment
        $siteUrl = Env::get('SITE_URL', '');
        if ($siteUrl === '') {
            return '';
        }

        // Remove trailing slash from base URL
        $siteUrl = rtrim($siteUrl, '/');

        // Get current path and normalize it
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
        
        // Normalize: remove trailing slashes (except for root), lowercase
        $path = $path === '/' ? '/' : rtrim($path, '/');
        
        return $siteUrl . $path;
    }

    /**
     * Clear all meta tags (useful for testing)
     *
     * @return void
     */
    public static function clear(): void
    {
        self::$schemas = [];
        self::$tags = [
            'title' => 'Infinri | Affordable Web Development for Small Businesses',
            'description' => 'Website development, hosting, and maintenance starting at $10. From quick templates to monthly support plans transparent pricing, fast delivery, no surprises.',
            'author' => 'Lucio Saldivar',
            'viewport' => 'width=device-width, initial-scale=1.0',
            'charset' => 'UTF-8',
            'og:title' => '',
            'og:description' => '',
            'og:image' => '/images/default-og.jpg',
            'og:type' => 'website',
            'twitter:card' => 'summary_large_image',
            'twitter:title' => '',
            'twitter:description' => '',
            'twitter:image' => '',
        ];
    }
}
