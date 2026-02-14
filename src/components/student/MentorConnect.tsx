import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Calendar, Clock, Building2, GraduationCap, X, CheckCircle, AlertCircle, Video, MessageSquare } from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  title: string;
  company?: string;
  university?: string;
  expertise: string[];
  avatar_url?: string;
  bio?: string;
  available_slots?: any;
}

interface Booking {
  id: string;
  mentor_id: string;
  booking_date: string;
  agenda: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meeting_link?: string;
  mentor?: Mentor;
}

const MentorConnect: React.FC = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
  const [agenda, setAgenda] = useState('');
  const [agendaError, setAgendaError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'mentors' | 'bookings'>('mentors');

  useEffect(() => {
    fetchMentors();
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchMentors = async () => {
    const { data } = await supabase
      .from('mentors')
      .select('*')
      .order('name');
    if (data) {
      setMentors(data);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('mentor_bookings')
      .select('*, mentor:mentors(*)')
      .eq('student_id', user.id)
      .order('booking_date', { ascending: false });
    if (data) {
      setBookings(data.map(b => ({ ...b, mentor: b.mentor as Mentor })));
    }
  };

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.expertise?.some(e => e.toLowerCase().includes(searchQuery.toLowerCase())) ||
    mentor.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.university?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowBookingModal(true);
    setSelectedSlot(null);
    setAgenda('');
    setAgendaError('');
  };

  const handleSubmitBooking = async () => {
    if (!user || !selectedMentor || !selectedSlot) return;

    // Validate agenda (minimum 200 characters)
    if (agenda.length < 200) {
      setAgendaError(`Meeting agenda must be at least 200 characters. Current: ${agenda.length}/200`);
      return;
    }

    setIsSubmitting(true);
    setAgendaError('');

    // Calculate booking date
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDayIndex = dayNames.indexOf(selectedSlot.day.toLowerCase());
    const currentDayIndex = today.getDay();
    let daysUntilTarget = targetDayIndex - currentDayIndex;
    if (daysUntilTarget <= 0) daysUntilTarget += 7;
    
    const bookingDate = new Date(today);
    bookingDate.setDate(today.getDate() + daysUntilTarget);
    const [hours, minutes] = selectedSlot.time.split(':');
    bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const { data, error } = await supabase
      .from('mentor_bookings')
      .insert({
        student_id: user.id,
        mentor_id: selectedMentor.id,
        booking_date: bookingDate.toISOString(),
        agenda,
        status: 'pending'
      })
      .select('*, mentor:mentors(*)')
      .single();

    if (data) {
      setBookings([{ ...data, mentor: data.mentor as Mentor }, ...bookings]);
      setShowBookingModal(false);
      setSelectedMentor(null);
      setActiveTab('bookings');
    }

    setIsSubmitting(false);
  };

  const getAvailableSlots = (mentor: Mentor) => {
    if (!mentor.available_slots) return [];
    const slots: { day: string; time: string }[] = [];
    Object.entries(mentor.available_slots).forEach(([day, times]) => {
      (times as string[]).forEach(time => {
        slots.push({ day, time });
      });
    });
    return slots;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mentor Connect</h2>
          <p className="text-slate-500">Book sessions with industry and university mentors</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('mentors')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'mentors'
              ? 'bg-purple-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Find Mentors
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'bookings'
              ? 'bg-purple-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          My Bookings ({bookings.length})
        </button>
      </div>

      {activeTab === 'mentors' && (
        <>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search mentors by name, expertise, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map(mentor => (
              <div
                key={mentor.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={mentor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=8b5cf6&color=fff`}
                    alt={mentor.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800">{mentor.name}</h3>
                    <p className="text-sm text-slate-500 truncate">{mentor.title}</p>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                      {mentor.company ? (
                        <>
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="truncate">{mentor.company}</span>
                        </>
                      ) : mentor.university ? (
                        <>
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span className="truncate">{mentor.university}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {mentor.bio && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{mentor.bio}</p>
                )}

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {mentor.expertise?.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Available Slots Preview */}
                {mentor.available_slots && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{getAvailableSlots(mentor).length} slots available this week</span>
                  </div>
                )}

                <button
                  onClick={() => handleBookMentor(mentor)}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all"
                >
                  Book Session
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No bookings yet</p>
              <button
                onClick={() => setActiveTab('mentors')}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                Find a Mentor
              </button>
            </div>
          ) : (
            bookings.map(booking => (
              <div
                key={booking.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-slate-100"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={booking.mentor?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.mentor?.name || 'M')}&background=8b5cf6&color=fff`}
                    alt={booking.mentor?.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">{booking.mentor?.name}</h4>
                        <p className="text-sm text-slate-500">{booking.mentor?.title}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(booking.booking_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Meeting Agenda</p>
                      <p className="text-sm text-slate-700 line-clamp-2">{booking.agenda}</p>
                    </div>

                    {booking.status === 'confirmed' && booking.meeting_link && (
                      <a
                        href={booking.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Book Session</h3>
              <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Mentor Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-6">
              <img
                src={selectedMentor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMentor.name)}&background=8b5cf6&color=fff`}
                alt={selectedMentor.name}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-semibold text-slate-800">{selectedMentor.name}</h4>
                <p className="text-sm text-slate-500">{selectedMentor.title}</p>
              </div>
            </div>

            {/* Available Slots */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Select a Time Slot</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {getAvailableSlots(selectedMentor).map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedSlot?.day === slot.day && selectedSlot?.time === slot.time
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-200 hover:bg-purple-50/50'
                    }`}
                  >
                    <p className="font-medium text-slate-800 capitalize">{slot.day}</p>
                    <p className="text-sm text-slate-500">{slot.time}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Agenda */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Meeting Agenda <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Minimum 200 characters required. Explain what you want to discuss.
              </p>
              <textarea
                value={agenda}
                onChange={(e) => {
                  setAgenda(e.target.value);
                  if (e.target.value.length >= 200) setAgendaError('');
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                  agendaError ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="Describe what you'd like to discuss in this session. Be specific about your goals, questions, and what you hope to learn..."
                rows={5}
              />
              <div className="flex items-center justify-between mt-1">
                <p className={`text-xs ${agenda.length >= 200 ? 'text-green-600' : 'text-slate-400'}`}>
                  {agenda.length}/200 characters {agenda.length >= 200 && <CheckCircle className="w-3 h-3 inline" />}
                </p>
                {agendaError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {agendaError}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmitBooking}
              disabled={!selectedSlot || agenda.length < 200 || isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Request Booking'
              )}
            </button>

            <p className="text-xs text-slate-500 text-center mt-3">
              Your booking will be confirmed once the mentor approves your agenda.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorConnect;
