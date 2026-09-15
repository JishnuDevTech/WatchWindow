import api from './apiService';

class ReservationService {
  constructor() {
    this.reservations = [];
    this.listeners = [];
  }

  onReservationChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.reservations));
  }

  // Get all reservations for a family
  async getFamilyReservations(familyId) {
    try {
      const response = await api.get(`/families/${familyId}/reservations`);
      this.reservations = response.data.reservations || response.data;
      this.notifyListeners();
      return this.reservations;
    } catch (error) {
      console.warn('Could not fetch reservations:', error.message);
      return [];
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

  // Get user's reservations
  async getUserReservations(userId) {
    try {
      const response = await api.get(`/users/${userId}/reservations`);
      return response.data.reservations || response.data;
    } catch (error) {
      console.warn('Could not fetch user reservations:', error.message);
      return [];
    }
  }

  // Create a reservation
  async createReservation(reservation) {
    try {
      const response = await api.post('/reservations', reservation);
      const newReservation = response.data;
      this.reservations.push(newReservation);
      this.notifyListeners();
      return newReservation;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create reservation');
    }
  }

  // Update a reservation
  async updateReservation(reservationId, updates) {
    try {
      const response = await api.patch(`/reservations/${reservationId}`, updates);
      const index = this.reservations.findIndex(r => r.id === reservationId);
      if (index !== -1) {
        this.reservations[index] = response.data;
      }
      this.notifyListeners();
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update reservation');
    }
  }

  // Cancel a reservation
  async cancelReservation(reservationId) {
    try {
      await api.delete(`/reservations/${reservationId}`);
      this.reservations = this.reservations.filter(r => r.id !== reservationId);
      this.notifyListeners();
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to cancel reservation');
    }
  }

  // Get available slots (placeholder for scheduling engine)
  async getAvailableSlots(familyId, date) {
    try {
      const response = await api.get(`/families/${familyId}/available-slots`, {
        params: { date }
      });
      return response.data.slots || [];
    } catch (error) {
      console.warn('Could not fetch available slots:', error.message);
      return [];
    }
  }
}

export default new ReservationService();