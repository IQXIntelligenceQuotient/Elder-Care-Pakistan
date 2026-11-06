# Elder Care Pakistan

The production build serves complete static HTML for every public route. Existing pages keep their URLs. The care support hub is prerendered with React DOM Server and works without JavaScript.

## Local development

Use Node.js 20.19 or newer on the Node 20 line, or Node.js 22.12 or newer.

```sh
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

The production build creates `dist/` and checks public HTML, canonicals, FAQs, structured data, local links, and discovery files. The `generate:sitemap`, `generate:image-sitemap`, and `generate:llms` scripts can regenerate individual outputs.

The build refreshes the generated `care-support.html` at the repository root for static previews. Edit `src/care-page.mjs` and rerun the build to change that page.

## Apache deployment

Deploy the contents of `dist/` to the site document root, including the hidden `.htaccess`. The included rules require Apache rewrite and header modules and appropriate override permissions. Confirm the legacy donation URL, `/index.html`, and the www hostname redirect as intended. Verify that a missing route returns HTTP 404 with the custom error page.

Remove old PHP files from any previous deployment and deploy the new `contact.php` from `dist/`. Rotate or revoke the previously committed SMTP credential in the provider account and review access logs.

The contact form requires PHP 8.1 or later with OpenSSL. It uses authenticated SMTP and sends to `eldercarepakistan@gmail.com`. The authenticated mailbox is the sender, and the visitor’s address is used for replies.

On the host, create `eldercare-contact-smtp.ini` **one directory above** the website document root. For example, if the site is deployed in `public_html`, put the file beside that directory. Use the mail provider’s settings and an authorized mailbox. For Hostinger Email:

```ini
host = smtp.hostinger.com
port = 465
username = info@eldercarepakistan.org
password = "REPLACE_WITH_MAILBOX_PASSWORD"
```

Restrict the file to the hosting account and keep it outside Git and the web root. Port 465 uses implicit TLS and port 587 uses STARTTLS. If SMTP is unconfigured or rejects the message, the form returns `503` and keeps the entered text in the browser. A `202` means the SMTP server accepted the message for delivery. Verify arrival in Gmail after deployment.

Vite serves the website preview. To exercise the PHP endpoint locally after building, use `php -S 127.0.0.1:8080 -t dist` with a local test SMTP service. The international giving form still prepares an email draft.

After deployment, check the homepage and care hub with JavaScript disabled, verify the sitemap files on the production domain, and test the hosting edge with verified crawler requests.
