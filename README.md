# Factory Outlet Shoes

GitHub-ready React/Vite version of the Factory Outlet Shoes website exported from Hostinger Horizons.

## Included

- Storefront, shop, product pages, cart and checkout
- Customer login/order pages
- Admin login/dashboard/products/orders/settings
- Existing PocketBase data model/hooks/migrations are preserved separately in the original export
- Google AdSense and Google Ads snippets from the original site are preserved
- Safepay checkout SDK reference is preserved

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## GitHub Pages

1. Create a GitHub repository and upload this project.
2. Push the `main` branch.
3. In **Settings → Pages**, choose **GitHub Actions** as the source.
4. The included workflow builds and deploys automatically.

The workflow automatically sets the Vite base path to the repository name, so project-page URLs work correctly.

## Important: database/backend

GitHub Pages is static hosting; it cannot run PocketBase, admin APIs, order storage, authentication, or payment-server logic.

Set a GitHub repository variable named `VITE_POCKETBASE_URL` to your publicly reachable PocketBase server URL:

**Settings → Secrets and variables → Actions → Variables → New repository variable**

Name: `VITE_POCKETBASE_URL`

Value: your PocketBase public URL.

The frontend will use that server for products, users, orders and settings.

> Never put private payment/API secrets in `VITE_*` variables. Anything prefixed with `VITE_` is exposed to the browser.

## Repository structure

The application is intentionally flattened for GitHub:

- `src/` — React application
- `public/` — static assets
- `index.html` — entry page
- `404.html` — GitHub Pages SPA fallback
- `.github/workflows/deploy.yml` — automatic Pages deployment
- `package.json` — install/build configuration
- `backend/pocketbase/` — PocketBase migrations/hooks/type definitions from the original system (runtime binary and live `pb_data` are intentionally excluded)

## Notes

The original Hostinger-specific development plugins and `/hcgi/platform` endpoint are not required for the GitHub production build. Production now uses a configurable PocketBase URL while retaining the original endpoint as a fallback.
