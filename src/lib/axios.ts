import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.101.240/",
});

export default api;
