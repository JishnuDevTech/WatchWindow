import api from './apiService';
import { getProductFamilies, getProductFamilyMembers } from '../data/productData.js';

class FamilyService {
  constructor() {
    this.families = [];
    this.currentFamily = null;
    this.familyMembers = [];
    this.listeners = [];
  }

  onFamilyChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback({
      families: this.families,
      currentFamily: this.currentFamily,
      members: this.familyMembers
    }));
  }

  // Get all families for current user
  async getUserFamilies() {
    try {
      const response = await api.get('/users/families');
      this.families = response.data.families || response.data;
      if (this.families.length > 0 && !this.currentFamily) {
        this.setCurrentFamily(this.families[0]);
      }
      this.notifyListeners();
      return this.families;
    } catch (error) {
      console.warn('Using local family data:', error.message);
      this.families = getProductFamilies();
      if (this.families.length > 0 && !this.currentFamily) {
        this.setCurrentFamily(this.families[0]);
      }
      this.notifyListeners();
      return this.families;
    }
  }

  // Create a new family
  async createFamily(name, description = '') {
    try {
      const response = await api.post('/families', {
        name,
        description
      });
      const newFamily = response.data;
      this.families.push(newFamily);
      this.setCurrentFamily(newFamily);
      return newFamily;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create family');
    }
  }

  // Join a family with invite code
  async joinFamily(inviteCode) {
    try {
      const response = await api.post('/families/join', {
        invite_code: inviteCode
      });
      const family = response.data.family;
      this.families.push(family);
      this.setCurrentFamily(family);
      return family;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to join family');
    }
  }

  // Get family members
  async getFamilyMembers(familyId) {
    try {
      const response = await api.get(`/families/${familyId}/members`);
      this.familyMembers = response.data.members || response.data;
      this.notifyListeners();
      return this.familyMembers;
    } catch (error) {
      console.warn('Using local family member data:', error.message);
      this.familyMembers = getProductFamilyMembers();
      this.notifyListeners();
      return this.familyMembers;
    }
  }

  // Invite a member to family
  async inviteMember(familyId, email) {
    try {
      const response = await api.post(`/families/${familyId}/invite`, {
        email
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to invite member');
    }
  }

  // Get invite code for family
  async getInviteCode(familyId) {
    try {
      const response = await api.get(`/families/${familyId}/invite-code`);
      return response.data.invite_code;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get invite code');
    }
  }

  // Set current family
  setCurrentFamily(family) {
    this.currentFamily = family;
    localStorage.setItem('watchwindow_current_family', JSON.stringify(family));
    this.notifyListeners();
  }

  // Get current family
  getCurrentFamily() {
    if (!this.currentFamily) {
      const stored = localStorage.getItem('watchwindow_current_family');
      if (stored) {
        this.currentFamily = JSON.parse(stored);
      }
    }
    return this.currentFamily;
  }

  // Get current family members
  getFamilyMembers() {
    return this.familyMembers;
  }
}

export default new FamilyService();