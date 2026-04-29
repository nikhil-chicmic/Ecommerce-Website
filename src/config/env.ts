export const ENV = {
  NODE_ENV: import.meta.env.MODE || "development",
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://dummyjson.com",
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || "mock_razorpay_key",
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || "",
  IS_DEV: import.meta.env.MODE === "development",
  IS_PROD: import.meta.env.MODE === "production",
};
