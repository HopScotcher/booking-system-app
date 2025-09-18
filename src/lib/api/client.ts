// import axios from "axios";

// // Create axios instance with base configuration
// export const apiClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Request interceptor for adding auth tokens, etc.
// apiClient.interceptors.request.use(
//   (config) => {
//     // Add auth token if available
//     // const token = localStorage.getItem('authToken');
//     // if (token) {
//     //   config.headers.Authorization = `Bearer ${token}`;
//     // }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for handling common errors
// apiClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Handle common error cases
//     if (error.response?.status === 401) {
//       // Handle unauthorized
//       console.error("Unauthorized access");
//     } else if (error.response?.status === 403) {
//       // Handle forbidden
//       console.error("Access forbidden");
//     } else if (error.response?.status >= 500) {
//       // Handle server errors
//       console.error("Server error occurred");
//     }

//     return Promise.reject(error);
//   }
// );

// export default apiClient;
