import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth, googleProvider } from './firebase';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.ready = false;
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
    onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      this.currentUser = firebaseUser ? await this.toUser(firebaseUser) : null;
      this.ready = true;
      this.resolveReady(this.currentUser);
      this.notifyListeners();
    });
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

  async signUp(email, password, name) {
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(credential.user, { displayName: name });
      this.currentUser = await this.toUser(credential.user);
      this.notifyListeners();
      return this.currentUser;
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async signIn(email, password) {
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      this.currentUser = await this.toUser(credential.user);
      this.notifyListeners();
      return this.currentUser;
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async signInWithGoogle() {
    try {
      const credential = await signInWithPopup(firebaseAuth, googleProvider);
      this.currentUser = await this.toUser(credential.user);
      this.notifyListeners();
      return this.currentUser;
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async signOut() {
    await firebaseSignOut(firebaseAuth);
    this.currentUser = null;
    this.notifyListeners();
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  async waitUntilReady() {
    return this.ready ? this.currentUser : this.readyPromise;
  }

  // Get auth token
  getToken() {
    return this.currentUser?.token || null;
  }

  async refreshToken() {
    if (!firebaseAuth.currentUser) return null;
    this.currentUser = await this.toUser(firebaseAuth.currentUser, true);
    return this.currentUser.token;
  }

  async toUser(firebaseUser, forceRefresh = false) {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
      token: await firebaseUser.getIdToken(forceRefresh),
    };
  }

  getErrorMessage(error) {
    const messages = {
      'auth/email-already-in-use': 'An account already exists for this email.',
      'auth/invalid-credential': 'The email or password is incorrect.',
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/weak-password': 'Use a stronger password with at least 6 characters.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
      'auth/too-many-requests': 'Too many attempts. Try again later.',
    };
    return messages[error.code] || 'Authentication failed. Please try again.';
  }
}

export default new AuthService();