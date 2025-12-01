# Professional Website Template

**Standard Website Template with Enterprise-Grade Features**

A professional, production-ready website template built with clean architecture principles. Includes features typically found in $100+ templates:

- **Professional Email Delivery** - Brevo API integration (no broken PHP mail)
- **Anti-Spam Protection** - reCAPTCHA v3 + rate limiting + honeypot
- **Performance Optimized** - Caching, asset optimization, minimal footprint
- **Production Security** - CSRF protection, secure sessions, CSP headers
- **Enterprise Logging** - Debug customer issues easily

**Note:** All content (Infinri text/images) serves as placeholder examples. Replace with your business information.

## Architecture

**Core Design**
- Modular monolith pattern with clear separation of concerns
- MVC-inspired structure with controller-view pattern
- DRY principles with centralized shared components
- SOLID design patterns applied throughout

**Code Organization**
- Feature-based module structure
- Standardized coding style (PSR-12)
- Type-safe with PHP 8.4 strict types
- Comprehensive docblock documentation

## Security

**Contact Form Protection**
- CSRF token verification on all submissions
- Rate limiting (5 attempts per 5 minutes per IP)
- Honeypot anti-spam field
- Input validation and sanitization
- XSS prevention with output encoding

**Application Security**
- Secure session management
- Environment-based configuration
- Error handling without information leakage
- HTTPS enforcement in production

## Email System

**Brevo API Integration**
- Professional email delivery via Brevo API (no SMTP port issues)
- Automatic contact creation in Brevo CRM
- Configured via environment variables
- Form data sent directly to your email
- Reply-to header for direct customer responses
- Works on all hosting environments (even when port 587 is blocked)

## Performance

**Optimization**
- Caddy web server with HTTP/2 support
- Optimized for low memory usage
- Asset minification and bundling
- Browser caching headers
- Lazy loading for non-critical resources
- Minimal dependency footprint

## User Interface

**Design**
- Dark theme with purple accent color
- Responsive across all device sizes
- WCAG 2.1 AA accessibility standards
- Professional Lucide icon system
- Smooth animations and transitions
- Clean URL structure

## Quick Start

```bash
git clone https://github.com/infinri/Portfolio.git
cd Portfolio
composer install
cp .env.example .env
# Edit .env with your Brevo credentials
php bin/console s:up  # Setup and deploy assets
caddy run
```

Visit `http://localhost:8080`

**Commands:**
- `setup:minify` - Build production assets (local only, needs Node.js)
- `setup:update` (s:up) - Publish assets and setup project

For detailed setup instructions, environment configuration, and production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Development

**After Changing CSS/JS**
```bash
php bin/console setup:minify  # Build production bundles
git add pub/assets/dist/
git commit -m "Update assets"
```

**Test Email Integration**
```bash
php tests/manual-email-test.php  # Test Brevo API integration with real email
```
This will verify your email configuration and send a test email via Brevo API. See `tests/README.md` for details.

## Project Structure

```
app/
├── base/           Core framework and shared components
│   ├── console/    CLI commands
│   ├── helpers/    Utility classes (Mail, RateLimiter, etc.)
│   └── view/       Base assets (CSS, JS)
├── modules/        Feature modules
│   ├── head/       Navigation and header
│   ├── footer/     Site footer
│   ├── home/       Landing page (placeholder content)
│   ├── about/      About section (placeholder content)
│   ├── contact/    Contact form with Brevo email integration
│   ├── legal/      Privacy Policy & Terms pages
│   └── error/      Error pages (400, 404, 500, maintenance)
bin/                Console entry point
pub/                Web root
├── assets/         Published assets
└── index.php       Application entry point
tests/              Test suite
var/                Runtime data (logs, cache, sessions)
```

## Technology Stack

**Backend**
- PHP 8.4 with strict types
- Brevo API for email delivery (HTTPS, no SMTP port 587)
- Composer for dependency management

**Frontend**
- Vanilla JavaScript (ES6+)
- Modern CSS3 with custom properties
- Lucide icon system
- No framework dependencies

**Web Server**
- Caddy 2.x with HTTP/2 support
- Optimized for low memory usage
- Automatic HTTPS in production

**Development Tools**
- npm for asset bundling and minification
- Console commands for asset management

**Infrastructure**
- File-based caching for rate limiting
- Session-based CSRF protection
- Environment-based configuration

## Configuration

**Environment Setup**

Copy `.env.example` to `.env` and configure:
- Brevo API credentials for email delivery
- Application environment (development/production)
- Security settings (CSRF, HTTPS)

**Customization**

1. Replace placeholder content in Home, About, Header, Footer with your business info
2. Update `.env` with your Brevo API credentials
3. Customize colors in `app/base/view/base/css/variables.css`
4. Add your logo and images

**Standard Website Includes:**
- Up to 5 content pages (Home, About, Contact + 2 custom pages)
- 2 legal pages (Privacy Policy, Terms & Conditions)
- Professional contact form with email delivery
- Mobile-responsive design
- SEO-optimized structure

## Contact

- **GitHub:** [github.com/infinri](https://github.com/infinri)
- **Repository:** [github.com/infinri/Portfolio](https://github.com/infinri/Portfolio)
- **Website:** [infinri.com](https://infinri.com)
