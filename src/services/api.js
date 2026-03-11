import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token
      localStorage.removeItem("auth_token");
      // Only redirect if we're not already on the home page and it's not an auth check
      const isAuthCheck = error.config?.url?.includes("/api/auth/me");
      if (!isAuthCheck && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// Authentication methods
export const authAPI = {
  // Initiate Google login
  login: () => {
    // Direct redirect to backend OAuth endpoint
    const loginUrl = `${API_BASE_URL}/api/auth/google`;
    console.log("Redirecting to:", loginUrl);
    window.location.href = loginUrl;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post("/api/auth/logout");
    localStorage.removeItem("auth_token");
    return response.data;
  },
};

// User methods
export const userAPI = {
  // Get trial status
  getTrialStatus: async () => {
    const response = await api.get("/api/user/trial-status");
    return response.data;
  },
  // Get compression history
  getCompressionHistory: async () => {
    const response = await api.get("/api/user/compression-history");
    return response.data;
  },
  // Get subscription details
  getSubscriptionDetails: async () => {
    const response = await api.get("/api/user/subscription-details");
    return response.data;
  },
  // Cancel subscription
  cancelSubscription: async () => {
    const response = await api.post("/api/user/cancel-subscription");
    return response.data;
  },
};

// Payment methods
export const paymentAPI = {
  // Create checkout session
  createCheckout: async () => {
    const response = await api.post("/api/payments/create-checkout");
    return response.data;
  },
};

// Compression method
export const compressAPI = {
  // Compress image (works with or without authentication)
  compress: async (file, targetReduction) => {
    const formData = new FormData();
    formData.append("file", file);
    if (targetReduction !== undefined) {
      formData.append("targetReduction", targetReduction.toString());
    }

    try {
      // Create a request without requiring auth (no token needed)
      const token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
        withCredentials: true, // For cookie-based auth if available
      };

      // Add token if available, but don't require it
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const response = await api.post("/api/compress", formData, config);

      // Check if response is actually an error (JSON error in blob)
      if (response.data.type === "application/json") {
        const text = await response.data.text();
        const error = JSON.parse(text);
        throw new Error(error.error || "Compression failed");
      }

      return response.data;
    } catch (error) {
      // If it's a blob error response, try to parse it
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Compression failed");
        } catch (parseError) {
          throw error;
        }
      }
      throw error;
    }
  },

  // Compress multiple images in batch
  compressBatch: async (files, targetReduction) => {
    const formData = new FormData();
    
    // Append all files
    files.forEach((file) => {
      formData.append("files", file);
    });
    
    if (targetReduction !== undefined) {
      formData.append("targetReduction", targetReduction.toString());
    }

    try {
      const token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
        withCredentials: true,
      };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const response = await api.post("/api/compress/batch", formData, config);

      // Check if response is actually an error (JSON error in blob)
      if (response.data.type === "application/json") {
        const text = await response.data.text();
        const error = JSON.parse(text);
        throw new Error(error.error || "Batch compression failed");
      }

      return response.data;
    } catch (error) {
      // If it's a blob error response, try to parse it
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Batch compression failed");
        } catch (parseError) {
          throw error;
        }
      }
      throw error;
    }
  },
};

// Developer API methods
export const developerAPI = {
  // List all API keys
  listKeys: async () => {
    const response = await api.get("/api/dev/keys");
    return response.data;
  },

  // Create a new API key
  createKey: async (name) => {
    const response = await api.post("/api/dev/keys", { name });
    return response.data;
  },

  // Revoke an API key
  revokeKey: async (keyId) => {
    const response = await api.delete(`/api/dev/keys/${keyId}`);
    return response.data;
  },

  // Get API key statistics
  getStats: async (keyId) => {
    const response = await api.get(`/api/dev/stats?id=${keyId}`);
    return response.data;
  },

  // Get API usage logs
  getUsage: async (keyId) => {
    const response = await api.get(`/api/dev/usage?id=${keyId}`);
    return response.data;
  },
};

export default api;
