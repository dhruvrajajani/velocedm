// API base URL:
// - Set VITE_API_URL in Vercel env vars to your Render backend URL (e.g. https://veloce.onrender.com)
// - Leave VITE_API_URL empty if frontend and backend are on the same server (e.g. Render full-stack)
// - Falls back to localhost:5000 for local development
const API_BASE =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : import.meta.env.MODE === 'production'
    ? ''
    : 'http://localhost:5000';

export default API_BASE;
