import axios from "axios";

const api = axios.create({
  baseURL: "https://incomprehensive-nedra-subthoracic.ngrok-free.dev",
  //baseURL: "http://100.100.34.104",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcyODEyNzYyLCJpYXQiOjE3NzI4MTI0NjIsImp0aSI6ImQ3NzdkYjgyNTM5YTQ2NTE5ODU5MmU3MGMxZmEwYTc0IiwidXNlcl9pZCI6NCwiZW1wcmVzYV9pZCI6NSwicmF6b25fc29jaWFsIjoiTXVuaWNpcGFsaWRhZCBkZSBUcmVucXVlIExhdXF1ZW4iLCJpc19zdXBlcnVzZXIiOnRydWV9.qVYCnI8WE9-Lw0ViFQBE4Jqca4MHyxLyBbuV2g3sAEM";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
