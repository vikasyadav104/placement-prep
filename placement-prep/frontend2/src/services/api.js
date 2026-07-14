import axios from 'axios';

// 1. We create our custom mail carrier and give him a default map
const api = axios.create({
  baseURL: 'https://placement-prep-3-pefu.onrender.com/api' 
});
// 2. We put a security guard at the door before the mail carrier leaves
api.interceptors.request.use((config) => {
  // Reach into the browser's secret backpack
  const token = localStorage.getItem('token');
  
  // If we find a VIP pass, staple it to the envelope!
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;