<?php
declare(strict_types=1);
/**
 * Brevo Contacts Helper
 *
 * Manages contact creation and updates in Brevo contact database
 * Uses Brevo Contacts API to sync form submissions with Brevo lists
 *
 * @package App\Base\Helpers
 */

namespace App\Base\Helpers;

use App\Helpers\Env;
use Brevo\Client\Configuration;
use Brevo\Client\Api\ContactsApi;
use Brevo\Client\ApiException;
use Brevo\Client\Model\CreateContact;
use Brevo\Client\Model\UpdateContact;
use GuzzleHttp\Client;

class BrevoContacts
{
    /**
     * Add or update a contact in Brevo
     *
     * @param array $contactData Contact information ['email', 'name', 'phone', 'service_interest', etc.]
     * @return bool True if successful, false otherwise
     */
    public static function addContact(array $contactData): bool
    {
        // Check if Brevo contacts integration is enabled
        if (!self::isEnabled()) {
            Logger::info('Brevo contacts integration is disabled, skipping contact creation');
            return true; // Not an error, just disabled
        }

        $apiKey = Env::get('BREVO_API_KEY');
        $listId = self::getListId();

        if (!$apiKey) {
            Logger::error('Brevo API key not configured');
            return false;
        }

        if (!$listId) {
            Logger::error('Brevo list ID not configured');
            return false;
        }

        try {
            Logger::info('Creating/updating Brevo contact', [
                'email' => $contactData['email'] ?? 'N/A',
                'list_id' => $listId
            ]);

            // Configure Brevo API client
            $config = Configuration::getDefaultConfiguration()->setApiKey('api-key', $apiKey);
            $apiInstance = new ContactsApi(new Client(), $config);

            // Prepare contact attributes
            $attributes = self::prepareAttributes($contactData);

            // Create contact model with new_lead tag
            $contact = new CreateContact([
                'email' => $contactData['email'],
                'attributes' => $attributes,
                'listIds' => [(int)$listId],
                'updateEnabled' => true
            ]);

            // Create or update contact
            $result = $apiInstance->createContact($contact);

            Logger::info('Brevo contact created/updated successfully', [
                'email' => $contactData['email'],
                'contact_id' => $result->getId() ?? 'updated'
            ]);

            return true;

        } catch (ApiException $e) {
            // Check if error is because contact already exists
            $responseBody = $e->getResponseBody();
            $errorData = json_decode($responseBody, true);

            if ($e->getCode() === 400 && isset($errorData['code']) && $errorData['code'] === 'duplicate_parameter') {
                // Contact exists, try to update instead
                Logger::info('Contact already exists, updating instead', [
                    'email' => $contactData['email']
                ]);

                return self::updateContact($contactData);
            }

            Logger::error('Brevo Contacts API Exception', [
                'code' => $e->getCode(),
                'message' => $e->getMessage(),
                'response' => $responseBody
            ]);

            return false;

        } catch (\Exception $e) {
            Logger::error('Brevo contact creation failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return false;
        }
    }

    /**
     * Update an existing contact in Brevo
     *
     * @param array $contactData Contact information
     * @return bool True if successful, false otherwise
     */
    private static function updateContact(array $contactData): bool
    {
        $apiKey = Env::get('BREVO_API_KEY');
        $listId = self::getListId();

        try {
            // Configure Brevo API client
            $config = Configuration::getDefaultConfiguration()->setApiKey('api-key', $apiKey);
            $apiInstance = new ContactsApi(new Client(), $config);

            // Prepare contact attributes
            $attributes = self::prepareAttributes($contactData);

            // Update contact model
            $contact = new UpdateContact([
                'attributes' => $attributes,
                'listIds' => [(int)$listId]
            ]);

            // Update contact
            $apiInstance->updateContact($contactData['email'], $contact);

            Logger::info('Brevo contact updated successfully', [
                'email' => $contactData['email']
            ]);

            return true;

        } catch (\Exception $e) {
            Logger::error('Brevo contact update failed', [
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Prepare contact attributes from form data
     *
     * @param array $data Form data
     * @return array Formatted attributes for Brevo
     */
    private static function prepareAttributes(array $data): array
    {
        $attributes = [];

        // FIRSTNAME (split from name)
        if (!empty($data['name'])) {
            $nameParts = explode(' ', trim($data['name']), 2);
            $attributes['FIRSTNAME'] = $nameParts[0];
            if (isset($nameParts[1])) {
                $attributes['LASTNAME'] = $nameParts[1];
            }
        }

        // SMS (phone)
        if (!empty($data['phone'])) {
            $attributes['SMS'] = $data['phone'];
        }

        // SERVICE_INTEREST
        if (!empty($data['service_interest'])) {
            $attributes['SERVICE_INTEREST'] = $data['service_interest'];
        }

        // LEAD_NOTES (combined subject + message)
        $leadNotes = [];
        if (!empty($data['subject'])) {
            $leadNotes[] = 'Subject: ' . $data['subject'];
        }
        if (!empty($data['message'])) {
            $leadNotes[] = 'Message: ' . $data['message'];
        }
        if (!empty($leadNotes)) {
            // Limit to 1000 chars for Brevo attribute storage
            $attributes['LEAD_NOTES'] = substr(implode("\n\n", $leadNotes), 0, 1000);
        }

        // LEAD_SOURCE (detect from referrer/UTM or use default)
        $attributes['LEAD_SOURCE'] = self::detectLeadSource();

        // URGENCY (use form value or default to "normal")
        $attributes['URGENCY'] = !empty($data['urgency']) ? $data['urgency'] : 'normal';

        // Optional fields
        if (!empty($data['website_url'])) {
            $attributes['WEBSITE_URL'] = $data['website_url'];
        }

        if (!empty($data['business_name'])) {
            $attributes['BUSINESS_NAME'] = $data['business_name'];
        }

        // Add submission timestamp
        $attributes['LAST_CONTACT_DATE'] = date('Y-m-d H:i:s');

        return $attributes;
    }

    /**
     * Detect lead source from referrer, UTM parameters, or session data
     *
     * @return string Lead source identifier
     */
    private static function detectLeadSource(): string
    {
        // 1. Check UTM source parameter (highest priority)
        $utmSource = $_GET['utm_source'] ?? $_SESSION['utm_source'] ?? null;
        if (!empty($utmSource)) {
            return self::normalizeSource($utmSource);
        }

        // 2. Check HTTP referrer
        $referrer = $_SERVER['HTTP_REFERER'] ?? null;
        if (!empty($referrer)) {
            $source = self::parseReferrerSource($referrer);
            if ($source) {
                return $source;
            }
        }

        // 3. Default fallback
        return 'website_direct';
    }

    /**
     * Parse referrer URL to determine lead source
     *
     * @param string $referrer Full referrer URL
     * @return string|null Source name or null if same-site/unknown
     */
    private static function parseReferrerSource(string $referrer): ?string
    {
        $host = parse_url($referrer, PHP_URL_HOST);
        if (!$host) {
            return null;
        }

        $host = strtolower($host);

        // Ignore same-site referrers
        $ownDomain = $_SERVER['HTTP_HOST'] ?? '';
        if (str_contains($host, $ownDomain) || str_contains($ownDomain, $host)) {
            return null;
        }

        // Map known referrer domains to sources
        $sourceMap = [
            // Search engines
            'google' => 'google_organic',
            'bing' => 'bing_organic',
            'duckduckgo' => 'duckduckgo_organic',
            'yahoo' => 'yahoo_organic',
            // Social media
            'facebook' => 'facebook',
            'instagram' => 'instagram',
            'linkedin' => 'linkedin',
            'twitter' => 'twitter',
            'x.com' => 'twitter',
            'tiktok' => 'tiktok',
            'youtube' => 'youtube',
            'reddit' => 'reddit',
            // Business directories
            'yelp' => 'yelp',
            'nextdoor' => 'nextdoor',
            'thumbtack' => 'thumbtack',
            'upwork' => 'upwork',
            'fiverr' => 'fiverr',
        ];

        foreach ($sourceMap as $domain => $source) {
            if (str_contains($host, $domain)) {
                return $source;
            }
        }

        // Unknown external referrer
        return 'referral_' . preg_replace('/[^a-z0-9]/', '_', $host);
    }

    /**
     * Normalize UTM source value
     *
     * @param string $source Raw UTM source
     * @return string Normalized source name
     */
    private static function normalizeSource(string $source): string
    {
        return strtolower(preg_replace('/[^a-zA-Z0-9_]/', '_', trim($source)));
    }

    /**
     * Check if Brevo contacts integration is enabled
     *
     * @return bool
     */
    public static function isEnabled(): bool
    {
        return Env::get('BREVO_CONTACTS_ENABLED', 'true') === 'true';
    }

    /**
     * Get Brevo list ID from configuration
     *
     * @return int|null
     */
    public static function getListId(): ?int
    {
        $listId = Env::get('BREVO_LIST_ID', '');
        return $listId !== '' ? (int)$listId : null;
    }
}
