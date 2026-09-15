import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Mock Firebase auth for demo purposes
class AuthService {
  constructor() {
    this.currentUser = this.getUserFromStorage();
    this.listeners = [];
  }

  // Subscribe to auth changes
  onAuthChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  // Get stored user
  getUserFromStorage() {
    const stored = localStorage.getItem('watchwindow_user');
    return stored ? JSON.parse(stored) : null;
  }

  // Save user
  setUserInStorage(user) {
    if (user) {
      localStorage.setItem('watchwindow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('watchwindow_user');
    }
    this.currentUser = user;
    this.notifyListeners();
  }

  // Mock sign up
  async signUp(email, password, name) {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        name
      });

      const user = {
        uid: response.data.uid,
        email: response.data.email,
        name: response.data.name,
        token: response.data.token
      };

      this.setUserInStorage(user);
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Sign up failed');
    }
  }

  // Mock sign in
  async signIn(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/signin`, {
        email,
        password
      });

      const user = {
        uid: response.data.uid,
        email: response.data.email,
        name: response.data.name,
        token: response.data.token
      };

      this.setUserInStorage(user);
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Sign in failed');
    }
  }

  // Sign out
  signOut() {
    this.setUserInStorage(null);
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Get auth token
  getToken() {
    return this.currentUser?.token || null;
  }
}

export default new AuthService();