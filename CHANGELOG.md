# Change Log

## 2026-06-22

- Updated public page titles, meta descriptions, canonical tags, Open Graph metadata, and JSON-LD structured data while preserving the existing visual design and templates.
- Converted template page-banner headings to real H1 elements using the existing `page-title` class.
- Reworked homepage hero copy to use dignity-led, donor-facing language for older people and families.
- Added donor-trust and fraud-prevention guidance to key donation, contact, and homepage areas.
- Removed publicly exposed IBAN, account number, and SWIFT code values from templates and replaced them with verified-instruction wording.
- Replaced WhatsApp-as-confirmation wording with bank-reconciliation language.
- Added an international SWIFT donation request section to `Donate-Now1.html` with a local reference-generation aid and clear non-receipt wording.
- Added medical-service limitation and health-disclaimer blocks to healthcare pages.
- Added prior-approval guidance for land, vehicles, equipment, and other gifts in kind.
- Replaced unsupported About-page counters and template claims with verification-led language.
- Replaced unverified testimonial-style story names with consent, privacy, and reporting guidance.
- Removed visible wording that described the content as being written for ranking tools rather than human donors.
- Cleaned up donor/privacy wording that had become awkward during copy normalisation.
- Added `.htaccess`, `robots.txt`, `sitemap.xml`, and `redirect-map.csv` support files aligned to the current root `.html` page structure.
- Added QR payment blocks using `assets/img/logos/receipt-1782140943666 (1).png` to donation and payment guidance areas, with reconciliation wording beside each QR placement.
- Added the same QR payment guidance to `donate-assistive-devices.html`, which uses a standalone contact/donation guidance layout instead of the shared payment popup.
- Added compact QR thumbnails to sponsor-item cards on `Donate-Now.html`, `Donate-Now - Copy.html`, and the dynamic pledge cards in `Donate-Now1.html`.
- Added click/tap-to-enlarge QR lightbox behavior to QR images and sponsor QR cards across the donation pages.
- Added a site-wide sticky QR donation shortcut with a `Donate Now` button and click-to-enlarge QR behavior.
- Updated the main contact form to open a prepared email to `eldercarepakistan@gmail.com` using the visitor's email client and sender email details.
- Updated the international SWIFT donation request form to open a prepared email to `eldercarepakistan@gmail.com` with the generated donation reference and sender email details.
- Prevented the sponsor pledge donor-details form from accidentally reloading the donation page.
- Updated legacy newsletter forms that used `action="#"` so they now open a prepared subscription request email to `eldercarepakistan@gmail.com`.
- Audited and cleaned visible mojibake/encoding artifacts across public HTML pages, including broken quote, dash, icon, copyright, and close-button text.
- Standardised topbar phone links from inconsistent `callto:` links to `tel:+923214277856` with the visible donor-help number.
- Rewrote stale doctor, nurse, and physiotherapy service copy to remove old-brand wording and add donation-focused, responsible elder-care language.
- Added page-specific donor-answer sections to 23 content pages with visible FAQ-style AEO copy, internal Donate Now/WhatsApp CTAs, and donation encouragement matched to each page topic.
- Added machine-readable `FAQPage`, `BreadcrumbList`, enhanced `NGO` area-served/knows-about data, and `DonateAction` schema coverage for the 23 content pages.
- Fixed breadcrumb navigation across the site by filling empty legacy page-banner breadcrumbs, adding accessible breadcrumbs to standalone donation/support pages, aligning visible trails with `BreadcrumbList` schema, and preserving existing header layouts.
- Standardised every page to the homepage header structure, expanded the shared navigation with services and giving dropdowns, added active menu states, aligned mobile menu ARIA behavior, and replaced mixed breadcrumb treatments with one consistent breadcrumb strip and matching schema.
- Standardised every page to the homepage `footer-pro` footer, replacing legacy footers, adding the missing footer to standalone donation/support pages, preserving the homepage footer as the source of truth, and ensuring footer QR styling and enlarge behavior is available site-wide.
- Revalidated 24 HTML pages for local links/assets/actions, inline JavaScript parsing, JSON-LD parsing, title/meta/H1 consistency, schema coverage, and remaining mojibake.
