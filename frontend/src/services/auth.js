import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to add the JWT token to requests
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized responses
authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout if 401 response returned from api
      logout();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// For demo purposes, we'll simulate authentication with local storage
// In a real-world application, this would call the backend API
const fakeUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    firstName: 'Administrator',
    lastName: 'Systemu',
    role: 'Admin'
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    firstName: 'Zwykły',
    lastName: 'Użytkownik',
    role: 'User'
  }
];

export const authService = {
  login: async (username, password) => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check credentials against fake users
      const user = fakeUsers.find(
        u => u.username === username && u.password === password
      );
      
      if (!user) {
        throw new Error('Username or password is incorrect');
      }
      
      // Create a fake JWT token (for demonstration purposes only)
      const token = btoa(JSON.stringify({
        id: user.id,
        username: user.username,
        role: user.role,
        exp: new Date().getTime() + (60 * 60 * 1000) // 1 hour expiry
      }));
      
      // Store user details and JWT token in local storage to keep user logged in between page refreshes
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }));
      localStorage.setItem('token', token);
      
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: () => {
    // Remove user from local storage to log user out
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
  
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },
  
  isAuthenticated: () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      return false;
    }
    
    try {
      // Check if token is expired
      const tokenData = JSON.parse(atob(token));
      const now = new Date().getTime();
      
      if (tokenData.exp < now) {
        // Token expired, remove from storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return false;
      }
      
      return true;
    } catch (e) {
      // Invalid token format
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return false;
    }
  },
  
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.role === role;
  }
};

// Convenience method for logout
export const logout = () => {
  authService.logout();
};

export default authApi;