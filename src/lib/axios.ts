import axios from "axios";

const api = axios.create({
  baseURL: "http://100.100.34.73",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// api.interceptors.request.use(
//   (config) => {
//     const token =
//       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYyNDU0Mzk0LCJpYXQiOjE3NjI0NDg5OTQsImp0aSI6IjJkMWUxZWJiODc5NjRmMWE4NWZhNDllNDEyMWZlODRiIiwidXNlcl9pZCI6IjEiLCJpZCI6MSwibm9tYnJlIjoiYWRtaW4iLCJhcGVsbGlkbyI6IiIsImlzX3N1cGVydXNlciI6dHJ1ZX0.vXs-jTaVxyy1JmSj3AMFizJf7X9fwnNoyfSiiObYGi4";

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default api;
