import axios from "axios";
import getClientSettings from "../../Client/clientSettingsFactory";
import axiosRetry from "axios-retry";

// Set global axios timeout (increased for better reliability on slow networks)
axios.defaults.timeout = 30000;

// Detect if the app is running in a web browser
// const isWeb = typeof window !== "undefined";

// Get the dynamic base URL from client settings
const client = process.env.CLIENT;
if (!client) {
  throw new Error("CLIENT environment variable is not set.");
}

const { RootUrl } = getClientSettings(client);

// Use proxy for web mode, otherwise use the actual API URL
// const baseURL = isWeb ? "/api" : RootUrl;
const baseURL = RootUrl;
const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    // callContext: JSON.stringify(callContext),
  },
});

axiosRetry(apiClient, {
  retries: 3, // Retry up to 3 times
  retryDelay: (retryCount) => retryCount * 2000, // 2s, 4s, 6s delay
  retryCondition: (error) => {
    // Retry on network errors or 5xx responses
    return error.code === "ECONNABORTED" || error.response?.status >= 500;
  },
});

// Add a request interceptor (e.g., for adding auth tokens)
apiClient.interceptors.request.use(
  (config) => {
    const token = "YOUR_AUTH_TOKEN"; // Replace with token management logic
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor (e.g., error handling)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
