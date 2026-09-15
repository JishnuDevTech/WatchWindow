import api from './apiService';
import { getDemoSchedule } from '../data/Demodata.js';

class ScheduleService {
  constructor() {
    this.schedules = [];
    this.listeners = [];
  }

  onScheduleChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.schedules));
  }

  // Fetch all schedules for a family
  async getFamilySchedule(familyId, date = null) {
    try {
      const params = {};
      if (date) params.date = date;

      const response = await api.get(`/families/${familyId}/schedule`, { params });
      this.schedules = response.data.schedules || response.data;
      this.notifyListeners();
      return this.schedules;
    } catch (error) {
      console.warn('Using demo schedule:', error.message);
      // Fallback to demo data
      this.schedules = getDemoSchedule();
      this.notifyListeners();
      return this.schedules;
    }
  }

  async getAvailableSlots(familyId, date, preferences = {}) {
    const response = await api.get(`/families/${familyId}/available-slots`, {
      params: {
        date,
        duration_minutes: preferences.durationMinutes || 60,
        earliest_time: preferences.earliestTime || '06:00',
        latest_time: preferences.latestTime || '23:00'
      }
    });
    return response.data.slots || [];
  }

  // Add a viewing event
  async addEvent(familyId, event) {
    try {
      const response = await api.post(`/families/${familyId}/schedule`, event);
      const newEvent = response.data;
      this.schedules.push(newEvent);
      this.notifyListeners();
      return newEvent;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to add event');
    }
  }

  // Get a specific event
  async getEvent(familyId, eventId) {
    try {
      const response = await api.get(`/families/${familyId}/schedule/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch event');
    }
  }

  // Update an event
  async updateEvent(familyId, eventId, updates) {
    try {
      const response = await api.patch(`/families/${familyId}/schedule/${eventId}`, updates);
      const index = this.schedules.findIndex(e => e.id === eventId);
      if (index !== -1) {
        this.schedules[index] = response.data;
      }
      this.notifyListeners();
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update event');
    }
  }

  // Delete an event
  async deleteEvent(familyId, eventId) {
    try {
      await api.delete(`/families/${familyId}/schedule/${eventId}`);
      this.schedules = this.schedules.filter(e => e.id !== eventId);
      this.notifyListeners();
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete event');
    }
  }

  // Get local schedules (for offline mode)
  getLocalSchedules() {
    return this.schedules;
  }
}

export default new ScheduleService();