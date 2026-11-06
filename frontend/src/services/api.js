import axios from 'axios';

// Base API URL with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cloudcart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't loop redirect if already on login/register or checking auth
      const currentPath = window.location.pathname;
      const isAuthPath = currentPath === '/login' || currentPath === '/register';
      const isAuthApi = error.config && (error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register'));

      if (!isAuthPath && !isAuthApi) {
        localStorage.removeItem('cloudcart_token');
        localStorage.removeItem('cloudcart_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/* ==========================================================
   Auth API Services
   ========================================================== */

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/auth/profile', userData);
  return response.data;
};

/* ==========================================================
   Products API Services
   ========================================================== */

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getFeaturedProducts = async () => {
  const response = await api.get('/products/featured');
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

/* ==========================================================
   Cart API Services
   ========================================================== */

export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCartAPI = async (productId, quantity = 1) => {
  const response = await api.post('/cart', { productId, quantity });
  return response.data;
};

export const updateCartItemAPI = async (itemId, quantity) => {
  const response = await api.put(`/cart/${itemId}`, { quantity });
  return response.data;
};

export const removeFromCartAPI = async (itemId) => {
  const response = await api.delete(`/cart/${itemId}`);
  return response.data;
};

export const clearCartAPI = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

/* ==========================================================
   Orders API Services
   ========================================================== */

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/myorders');
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getAllOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { orderStatus: status });
  return response.data;
};

export const getOrderStats = async () => {
  const response = await api.get('/orders/stats');
  return response.data;
};

/* ==========================================================
   Users API Services (Admin)
   ========================================================== */

export const getAllUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.put(`/users/${id}/role`, { role });
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get('/users/stats');
  return response.data;
};

export default api;
