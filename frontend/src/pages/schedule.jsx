import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Clock, X, Tv, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import scheduleService from '../services/scheduleService';
import reservationService from '../services/reservationService';
import familyService from '../services/familyService';

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [family, setFamily] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '14:00',
    endTime: '16:00',
    description: '',
    durationMinutes: 60,
    earliestTime: '18:00',
    latestTime: '22:00'
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const families = await familyService.getUserFamilies();
        if (families.length === 0) {
          navigate('/onboarding');
          return;
        }

        const currentFamily = familyService.getCurrentFamily() || families[0];
        setFamily(currentFamily);

        const [events, familyReservations] = await Promise.all([
          scheduleService.getFamilySchedule(
            currentFamily.id,
            format(selectedDate, 'yyyy-MM-dd')
          ),
          reservationService.getFamilyReservations(currentFamily.id)
        ]);
        setSchedule(events || []);
        setReservations(familyReservations || []);
        const slots = await reservationService.getAvailableSlots(
          currentFamily.id,
          format(selectedDate, 'yyyy-MM-dd'),
          {
            durationMinutes: formData.durationMinutes,
            earliestTime: formData.earliestTime,
            latestTime: formData.latestTime
          }
        );
        setAvailableSlots(slots);
      } catch (err) {
        setError('Failed to load schedule');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate, navigate]);

  const loadAvailableSlots = async () => {
    if (!family) return;
    setLoadingSlots(true);
    setError('');
    try {
      const slots = await reservationService.getAvailableSlots(
        family.id,
        format(selectedDate, 'yyyy-MM-dd'),
        {
          durationMinutes: Number(formData.durationMinutes),
          earliestTime: formData.earliestTime,
          latestTime: formData.latestTime
        }
      );
      setAvailableSlots(slots);
      setSelectedSlot(slots[0] || null);
    } catch (err) {
      setAvailableSlots([]);
      setSelectedSlot(null);
      setError(err.response?.data?.detail || err.message || 'Failed to find available windows');
    } finally {
      setLoadingSlots(false);
    }
  };

  const openReservationModal = () => {
    setError('');
    setShowAddModal(true);
    loadAvailableSlots();
  };

  const handleReserveViewing = async (e) => {
    e.preventDefault();
    setError('');

    if (!family) return;

    if (!selectedSlot) {
      setError('Choose an available window before reserving');
      return;
    }

    try {
      await reservationService.createReservation({
        family_id: family.id,
        title: formData.title,
        description: formData.description,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime
      });

      setFormData({ title: '', startTime: '14:00', endTime: '16:00', description: '', durationMinutes: 60, earliestTime: '18:00', latestTime: '22:00' });
      setSelectedSlot(null);
      setShowAddModal(false);

      const [events, familyReservations] = await Promise.all([
        scheduleService.getFamilySchedule(
          family.id,
          format(selectedDate, 'yyyy-MM-dd')
        ),
        reservationService.getFamilyReservations(family.id)
      ]);
      setSchedule(events || []);
      setReservations(familyReservations || []);
      const slots = await reservationService.getAvailableSlots(
        family.id,
        format(selectedDate, 'yyyy-MM-dd'),
        {
          durationMinutes: formData.durationMinutes,
          earliestTime: formData.earliestTime,
          latestTime: formData.latestTime
        }
      );
      setAvailableSlots(slots);
    } catch (err) {
      setError(err.message || 'Failed to add event');
    }
  };

  const reservationEvents = reservations.map((reservation) => ({
    ...reservation,
    id: `reservation-${reservation.id}`,
    date: reservation.startTime.slice(0, 10),
    memberName: reservation.memberName || 'Family member',
    status: reservation.status === 'confirmed' ? 'reserved' : reservation.status
  }));

  const dayEvents = [...schedule, ...reservationEvents]
    .filter((e) => e.date === format(selectedDate, 'yyyy-MM-dd'))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  const getEventPosition = (event) => {
    const startDate = new Date(event.startTime);
    const hour = startDate.getHours() + startDate.getMinutes() / 60;
    const duration =
      (new Date(event.endTime) - new Date(event.startTime)) / (1000 * 60 * 60);

    return {
      top: (hour - 6) * 60 + 'px',
      height: duration * 60 + 'px'
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-slate-200 text-slate-700';
      case 'ongoing':
        return 'bg-green-300 text-green-900';
      case 'scheduled':
        return 'bg-blue-300 text-blue-900';
      case 'reserved':
        return 'bg-emerald-300 text-emerald-900';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="container-safe py-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="ww-eyebrow mb-2">Shared TV time</p>
              <h1 className="text-2xl font-bold text-slate-900">TV Schedule</h1>
            </div>
            <button
              onClick={openReservationModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Find a window
            </button>
          </div>

          <div className="ww-status-legend mb-5">
            <span><i className="current" /> Now</span>
            <span><i className="reserved" /> Reserved</span>
            <span><i className="planned" /> Planned</span>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>

            <div className="flex-1 text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
            </div>

            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Next day"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Quick date shortcuts */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {[-1, 0, 1, 2, 3].map((offset) => {
              const date = addDays(new Date(), offset);
              const isSelected =
                format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

              return (
                <button
                  key={offset}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {format(date, 'MMM d')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="container-safe py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {dayEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Tv className="text-slate-300 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No viewing scheduled
            </h3>
            <p className="text-slate-600 mb-6">
              Plan the day's TV time for your family
            </p>
            <button
              onClick={openReservationModal}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Add First Viewing
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Hour grid */}
            <div className="flex gap-4">
              <div className="w-20">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-20 text-right pr-4 text-sm text-slate-500 font-medium"
                  >
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              <div className="flex-1 relative">
                {/* Hour lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-20 border-t border-slate-200 relative"
                  >
                    <div className="h-1/2 border-b border-slate-100"></div>
                  </div>
                ))}

                {/* Events */}
                <div className="absolute inset-0">
                  {dayEvents.map((event) => {
                    const position = getEventPosition(event);
                    return (
                      <div
                        key={event.id}
                        className={`absolute left-0 right-0 mx-2 rounded-lg p-2 text-white text-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${getStatusColor(
                          event.status
                        )}`}
                        style={position}
                        onClick={() => {
                          // Event detail can be expanded later
                        }}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="text-xs opacity-75 truncate">
                          {event.memberName}
                        </div>
                        <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
                          <Clock size={12} />
                          {format(new Date(event.startTime), 'h:mm a')} -{' '}
                          {format(new Date(event.endTime), 'h:mm a')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reservation modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="dialog-content w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Find a viewing window</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleReserveViewing} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What do you want to watch?
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Movie Night, Sports Game"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Add notes..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Duration
                  </label>
                  <select
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(new Date(`${e.target.value}T12:00:00`))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Earliest time
                  </label>
                  <input
                    type="time"
                    value={formData.earliestTime}
                    onChange={(e) => setFormData({ ...formData, earliestTime: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Latest time
                  </label>
                  <input
                    type="time"
                    value={formData.latestTime}
                    onChange={(e) => setFormData({ ...formData, latestTime: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Available windows
                  </label>
                  <button type="button" onClick={loadAvailableSlots} className="text-sm text-blue-600 hover:text-blue-700">
                    {loadingSlots ? 'Finding...' : 'Find windows'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot.startTime}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2 rounded-lg border text-sm text-left ${selectedSlot?.startTime === slot.startTime ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'}`}
                    >
                      {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                    </button>
                  ))}
                </div>
                {!loadingSlots && availableSlots.length === 0 && (
                  <p className="text-sm text-slate-500">No windows match those preferences.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Selected Start
                  </label>
                  <input
                    type="time"
                    value={selectedSlot ? format(new Date(selectedSlot.startTime), 'HH:mm') : ''}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Selected End
                  </label>
                  <input
                    type="time"
                    value={selectedSlot ? format(new Date(selectedSlot.endTime), 'HH:mm') : ''}
                    readOnly
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Reserve Window
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}