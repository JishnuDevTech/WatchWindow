import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Plus, Tv, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import scheduleService from '../services/scheduleService';
import reservationService from '../services/reservationService';
import familyService from '../services/familyService';
import authService from '../services/authService';

export default function Dashboard() {
  const [schedule, setSchedule] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [family, setFamily] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    const loadData = async () => {
      try {
        const families = await familyService.getUserFamilies();
        if (families.length === 0) {
          navigate('/onboarding');
          return;
        }

        const currentFamily = familyService.getCurrentFamily() || families[0];
        setFamily(currentFamily);

        const [events, familyReservations, slots] = await Promise.all([
          scheduleService.getFamilySchedule(currentFamily.id),
          reservationService.getFamilyReservations(currentFamily.id),
          reservationService.getAvailableSlots(currentFamily.id, format(new Date(), 'yyyy-MM-dd'), {
            durationMinutes: 60,
            earliestTime: '06:00',
            latestTime: '23:00'
          })
        ]);
        setSchedule(events || []);
        setReservations(familyReservations || []);
        setAvailableSlots(slots || []);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-slate-100 text-slate-700';
      case 'ongoing':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'ongoing':
        return 'Now Playing';
      case 'scheduled':
        return 'Scheduled';
      case 'confirmed':
        return 'Reserved';
      default:
        return 'Scheduled';
    }
  };

  const reservationEvents = reservations.map((reservation) => ({
    ...reservation,
    id: `reservation-${reservation.id}`,
    date: reservation.startTime.slice(0, 10),
    memberName: reservation.memberName || 'Family member'
  }));

  const allEvents = [...schedule, ...reservationEvents];

  const todayEvents = allEvents
    .filter((e) => e.date === format(new Date(), 'yyyy-MM-dd'))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const upcomingEvents = allEvents
    .filter((e) => e.date !== format(new Date(), 'yyyy-MM-dd'))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
          <p className="text-slate-600">No family found</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Set up family
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container-safe py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{family.name}</h1>
              <p className="text-blue-100 flex items-center gap-2">
                <Tv size={18} />
                {family.tvName || 'Living Room TV'}
              </p>
            </div>
            <button
              onClick={() => navigate('/schedule')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Find a window
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-safe py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  Today's Schedule
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {format(new Date(), 'EEEE, MMMM d')}
                </p>
              </div>

              {todayEvents.length === 0 ? (
                <div className="p-12 text-center">
                  <Tv size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">
                    No viewing scheduled for today
                  </p>
                  <button
                    onClick={() => navigate('/schedule')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Schedule your viewing →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {todayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate('/schedule')}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">
                              {event.title}
                            </h3>
                            <span
                              className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(
                                event.status
                              )}`}
                            >
                              {getStatusLabel(event.status)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {event.memberName || 'Family member'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock size={16} />
                              {format(new Date(event.startTime), 'h:mm a')} -{' '}
                              {format(new Date(event.endTime), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming & Quick Actions */}
          <div className="space-y-6">
            {/* Upcoming */}
            {upcomingEvents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Upcoming</h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => navigate('/schedule')}
                    >
                      <p className="font-medium text-slate-900 text-sm">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {format(new Date(event.startTime), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-2">Available TV time</h3>
              <p className="text-sm text-slate-500 mb-4">One-hour windows today</p>
              {availableSlots.length === 0 ? (
                <p className="text-sm text-slate-500">No matching windows today.</p>
              ) : (
                <div className="space-y-2">
                  {availableSlots.slice(0, 3).map((slot) => (
                    <button
                      key={slot.startTime}
                      onClick={() => navigate('/schedule')}
                      className="w-full text-left px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm hover:bg-emerald-100"
                    >
                      {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/schedule')}
                  className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
                >
                  View Full Schedule
                </button>
                <button
                  onClick={() => navigate('/family')}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-medium text-sm transition-colors"
                >
                  Family Members
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-medium text-sm transition-colors"
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
              <p className="text-blue-900">
                <strong>Tip:</strong> Click any event to see details or make changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}