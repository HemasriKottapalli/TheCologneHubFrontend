// src/api/index.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:7001';

const API = axios.create({
  baseURL
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    config.headers = config.headers || {};
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
