// api.js - Axios instance for frontend API requests
// This module exports a configured Axios instance that can be used throughout the frontend to make API requests to the Express backend. It sets the base URL and default headers for JSON content.
import axios from "axios";

// Use deployed backend in production, local proxy in development.
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;