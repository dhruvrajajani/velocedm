// Auto-detects the correct API base URL depending on environment.
// In production (Render), the frontend is served by the same Express server,
// so we use a relative URL. In local dev (Vite on :5173), we point to localhost:5000.
const API_BASE =
  import.meta.env.MODE === 'production'
    ? ''
    : 'http://localhost:5000';

export default API_BASE;
