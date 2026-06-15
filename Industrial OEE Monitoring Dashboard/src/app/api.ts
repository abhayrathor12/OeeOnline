import axios from "axios";

const API_BASE_URL =
   "http://192.168.1.60:8257";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;