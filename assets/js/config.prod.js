window.RaizesAmazonia = window.RaizesAmazonia || {};

window.RaizesAmazonia.Config = {
  API_BASE_URL:
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://seu-backend-railway.railway.app",

  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_TIMEOUT: 5 * 60 * 1000,

  MESSAGE_DURATION: 6000,
  ANIMATION_DURATION: 300,

  ADMIN_PASSWORD: "admin123",
  MAX_LOGIN_ATTEMPTS: 3,
  LOCKOUT_TIME: 5 * 60 * 1000,

  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],

  ITEMS_PER_PAGE: 6,
  DEBUG: window.location.hostname === "localhost",
};
