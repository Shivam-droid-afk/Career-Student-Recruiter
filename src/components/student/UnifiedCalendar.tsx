import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, GraduationCap, Code, Clock, User, Trash2 } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: 'exam' | 'hackathon' | 'deadline' | 'personal' | 'mentor_meeting';
  start_date: string;
  end_date?: string;
  color?: string;
}

const eventTypes = [
  { id: 'exam', label: 'University Exam', icon: GraduationCap, color: 'bg-red-500', lightColor: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'hackathon', label: 'Hackathon', icon: Code, color: 'bg-purple-500', lightColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'deadline', label: 'Course Deadline', icon: Clock, color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'personal', label: 'Personal Task', icon: User, color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'mentor_meeting', label: 'Mentor Meeting', icon: CalendarIcon, color: 'bg-green-500', lightColor: 'bg-green-50 text-green-700 border-green-200' }
];

const UnifiedCalendar: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'personal' as CalendarEvent['event_type'],
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, currentDate]);

  const fetchEvents = async () => {
    if (!user) return;

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('student_id', user.id)
      .gte('start_date', startOfMonth.toISOString())
      .lte('start_date', endOfMonth.toISOString())
      .order('start_date');

    if (data) {
      setEvents(data);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        student_id: user.id,
        title: newEvent.title,
        description: newEvent.description,
        event_type: newEvent.event_type,
        start_date: new Date(newEvent.start_date).toISOString(),
        end_date: newEvent.end_date ? new Date(newEvent.end_date).toISOString() : null
      })
      .select()
      .single();

    if (data) {
      setEvents([...events, data]);
      setShowAddModal(false);
      setNewEvent({ title: '', description: '', event_type: 'personal', start_date: '', end_date: '' });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    await supabase.from('calendar_events').delete().eq('id', eventId);
    setEvents(events.filter(e => e.id !== eventId));
    setSelectedEvent(null);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEventsForDay = (day: number) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      const matches = eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear();
      
      if (filterTypes.length > 0) {
        return matches && filterTypes.includes(event.event_type);
      }
      return matches;
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const toggleFilter = (type: string) => {
    setFilterTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Unified Calendar</h2>
          <p className="text-slate-500">Track exams, hackathons, and deadlines</p>
        </div>
        <button
          onClick={() => {
            setNewEvent({ ...newEvent, start_date: new Date().toISOString().split('T')[0] });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      {/* Event Type Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {eventTypes.map(type => {
          const Icon = type.icon;
          const isActive = filterTypes.length === 0 || filterTypes.includes(type.id);
          return (
            <button
              key={type.id}
              onClick={() => toggleFilter(type.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                isActive ? type.lightColor : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${type.color}`} />
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h3 className="text-xl font-bold text-slate-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((day, index) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (day) {
                      const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
                      setNewEvent({ ...newEvent, start_date: dateStr });
                      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                    }
                  }}
                  className={`min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer ${
                    day
                      ? isToday(day)
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-white border-slate-100 hover:border-purple-200 hover:bg-purple-50/50'
                      : 'bg-slate-50 border-transparent'
                  }`}
                >
                  {day && (
                    <>
                      <span className={`text-sm font-medium ${isToday(day) ? 'text-purple-600' : 'text-slate-700'}`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 3).map(event => {
                          const eventType = eventTypes.find(t => t.id === event.event_type);
                          return (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              className={`text-xs px-1.5 py-0.5 rounded truncate ${eventType?.color} text-white cursor-pointer hover:opacity-80`}
                            >
                              {event.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-slate-500 pl-1">+{dayEvents.length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events
              .filter(e => new Date(e.start_date) >= new Date())
              .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
              .slice(0, 8)
              .map(event => {
                const eventType = eventTypes.find(t => t.id === event.event_type);
                const Icon = eventType?.icon || CalendarIcon;
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg ${eventType?.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{event.title}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            {events.length === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add Event</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Data Structures Exam"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {eventTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNewEvent({ ...newEvent, event_type: type.id as CalendarEvent['event_type'] })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          newEvent.event_type === type.id
                            ? type.lightColor
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${type.color}`} />
                        <span className="text-sm">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Add details..."
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all"
              >
                Add Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const eventType = eventTypes.find(t => t.id === selectedEvent.event_type);
                  const Icon = eventType?.icon || CalendarIcon;
                  return (
                    <div className={`w-12 h-12 rounded-xl ${eventType?.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedEvent.title}</h3>
                  <p className="text-sm text-slate-500">
                    {eventTypes.find(t => t.id === selectedEvent.event_type)?.label}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-600">
                <CalendarIcon className="w-5 h-5" />
                <span>{new Date(selectedEvent.start_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              {selectedEvent.description && (
                <p className="text-slate-600">{selectedEvent.description}</p>
              )}

              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedCalendar;
