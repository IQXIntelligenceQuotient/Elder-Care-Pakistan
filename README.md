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

The contact form posts to `/contact.php` and needs PHP 8.1 or later with an enabled host mail transport. Confirm the hosting account can send as `info@eldercarepakistan.org` and that the receiving inbox is `eldercarepakistan@gmail.com`. The handler uses the visitor's address only for replies. No SMTP credentials are required in the source. PHP accepting the message means it was submitted for delivery. Confirm receipt in the inbox and spam folder after deployment.

Vite serves the website preview. To test the PHP form locally after building, run `php -S 127.0.0.1:8080 -t dist` with a local test mail transport configured. The international giving form still prepares an email draft.

After deployment, check the homepage and care hub with JavaScript disabled, verify the sitemap files on the production domain, and test the hosting edge with verified crawler requests.
