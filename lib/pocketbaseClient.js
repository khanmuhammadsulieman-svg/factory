import PocketBase from 'pocketbase';

// For GitHub Pages, set VITE_POCKETBASE_URL to the public URL of your
// PocketBase server. If omitted, the original Hostinger endpoint is used.
const POCKETBASE_API_URL =
  import.meta.env.VITE_POCKETBASE_URL || '/hcgi/platform';

const pocketbaseClient = new PocketBase(POCKETBASE_API_URL);

export default pocketbaseClient;
export { pocketbaseClient };
