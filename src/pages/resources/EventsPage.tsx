import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, parseISO, startOfDay } from 'date-fns';
import { Calendar, MapPin, Clock, DollarSign, Users, Building2, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Event } from '../../types/events';

const EventsPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { session } = useAuth();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_tags (*),
          event_types (*)
        `)
        
        .order('date', { ascending: true });

      if (error) throw error;

      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = startOfDay(parseISO(event.date));
      return isSameDay(eventDate, date);
    });
  };

  const upcomingEvents = events
    .filter(event => startOfDay(parseISO(event.date)) >= startOfDay(new Date()))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const handleRegister = async (event: Event) => {
    if (!session) {
      alert('Please log in to register for events');
      return;
    }

    setSelectedEvent(event);
    setRegistering(true);

    try {
      if (event.max_participants) {
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('count')
          .eq('event_id', event.id)
          .single();

        if (registrations && registrations.count >= event.max_participants) {
          throw new Error('Event is full');
        }
      }

      const { error } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: event.id,
          user_id: session.user.id,
          status: event.price > 0 ? 'awaiting_payment' : 'confirmed'
        }]);

      if (error) throw error;

      alert('Registration successful!');
      await fetchEvents();
    } catch (error) {
      alert(error.message || 'Failed to register');
    } finally {
      setRegistering(false);
      setSelectedEvent(null);
    }
  };

  const getButtonText = (event: Event, isRegistering: boolean) => {
    if (isRegistering && selectedEvent?.id === event.id) {
      return 'Processing...';
    }
    return 'Register Now';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0085c2]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Upcoming Events</h1>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Featured Events</h2>
          <div className="grid gap-6">
            {upcomingEvents.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-grow">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {event.event_tags && (
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: event.event_tags.color }}
                        >
                          {event.event_tags.name}
                        </span>
                      )}
                      {event.price === 0 && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          FREE
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.format === 'in-person' ? 'bg-purple-100 text-purple-800' :
                        event.format === 'online' ? 'bg-blue-100 text-blue-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {event.format === 'in-person' ? (
                          <Building2 className="w-4 h-4 inline-block mr-1" />
                        ) : event.format === 'online' ? (
                          <Globe className="w-4 h-4 inline-block mr-1" />
                        ) : (
                          <>
                            <Building2 className="w-4 h-4 inline-block mr-1" />
                            <Globe className="w-4 h-4 inline-block mr-1" />
                          </>
                        )}
                        {event.format.charAt(0).toUpperCase() + event.format.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{format(parseISO(event.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>{event.price === 0 ? 'Free' : `$${event.price}`}</span>
                      </div>
                      {event.max_participants && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>
                            {event.max_participants} spots available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-auto flex justify-end mt-4 lg:mt-0">
                    <button
                      onClick={() => handleRegister(event)}
                      disabled={registering && selectedEvent?.id === event.id}
                      className={`w-full lg:w-[120px] h-10 flex items-center justify-center px-6 rounded-md font-medium text-white transition-colors whitespace-nowrap ${
                        registering && selectedEvent?.id === event.id
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-[#0085c2] hover:bg-[#FFB546]'
                      }`}
                    >
                      {getButtonText(event, registering)}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Events Calendar</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ←
              </button>
              <h3 className="text-lg font-medium">
                {format(currentDate, 'MMMM yyyy')}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium py-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              
              return (
                <div
                  key={day.toString()}
                  className={`
                    min-h-[80px] p-2 border rounded-md relative
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                    ${isSelected ? 'border-[#0085c2]' : 'border-gray-200'}
                    ${isToday(day) ? 'bg-blue-50' : ''}
                    cursor-pointer hover:border-[#0085c2]
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <span className={`
                    text-sm
                    ${!isCurrentMonth && 'text-gray-400'}
                    ${isToday(day) && 'font-bold text-blue-600'}
                  `}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 mt-1 rounded text-white truncate"
                      style={{ backgroundColor: event.event_tags?.color || '#0085c2' }}
                      title={event.title}
                    >
                      {event.title}
                      {event.price === 0 && ' (Free)'}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium mb-2">
                Events for {format(selectedDate, 'MMMM d, yyyy')}
              </h4>
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-lg mb-1">{event.title}</div>
                          <div className="text-sm text-gray-600">{event.time}</div>
                          <div className="text-sm text-gray-600 mt-1">{event.location}</div>
                          <div className="flex gap-2 mt-2">
                            {event.event_tags && (
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: event.event_tags.color }}
                              >
                                {event.event_tags.name}
                              </span>
                            )}
                            {event.price === 0 && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                FREE
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRegister(event)}
                          disabled={registering && selectedEvent?.id === event.id}
                          className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                            registering && selectedEvent?.id === event.id
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-[#0085c2] hover:bg-[#FFB546]'
                          }`}
                        >
                          {getButtonText(event, registering)}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No events scheduled for this date.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;