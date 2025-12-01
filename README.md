# Basic Website Template

**Simple 3-Page Starter Template with Professional Features**

A clean, production-ready website template built with modern architecture principles. Perfect for small businesses that need a fast, reliable web presence:

- **3 Pages** - Home, About, Contact (+ Privacy Policy)
- **Performance Optimized** - Caching, asset optimization, minimal footprint
- **Production Security** - CSRF protection, secure sessions, CSP headers, rate limiting
- **Developer-Friendly** - Console commands, logging, debugging tools
- **Mobile-Responsive** - Works perfectly on all devices

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

**Application Security**
- CSRF token verification
- Rate limiting (prevents abuse)
- Secure session management
- Environment-based configuration
- Error handling without information leakage
- HTTPS enforcement in production
- XSS prevention with output encoding

**Note:** Contact page displays contact information only (no form submission in Basic template)

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
│   ├── contact/    Contact information display (no form)
│   ├── legal/      Privacy Policy page
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
- Composer for dependency management
- No external API dependencies

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
- Application environment (development/production)
- Site name and URL
- Security settings (CSRF, HTTPS)

**Customization**

1. Replace placeholder content in Home, About, Contact, Header, Footer with your business info
2. Update `.env` with your site name and URL
3. Customize colors in `app/base/view/base/css/variables.css`
4. Add your logo and images
5. Update contact information (email, phone, address) in Contact page

**Basic Template Includes:**
- 3 content pages (Home, About, Contact)
- 1 legal page (Privacy Policy)
- Contact information display
- Mobile-responsive design
- SEO-optimized structure
- Performance optimization (caching, rate limiting)

## Contact

- **GitHub:** [github.com/infinri](https://github.com/infinri)
- **Repository:** [github.com/infinri/Portfolio](https://github.com/infinri/Portfolio)
- **Website:** [infinri.com](https://infinri.com)
