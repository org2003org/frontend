import axios from 'axios';

const api = axios.create({
  baseURL: 'https://zabatet-backend.onrender.com/api',
  withCredentials: true,
});

export default api;
