import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Event } from '../../../types/events';
import { PlusCircle, Edit, Trash2, Save, X, DollarSign, Users, MapPin, Building2, Globe, Tag as TagIcon } from 'lucide-react';

interface EventTag {
  id: string;
  name: string;
  color: string;
}

interface EventType {
  id: string;
  name: string;
}

interface TimeSelection {
  hour: string;
  period: 'AM' | 'PM';
}

const EventsAdmin: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [tags, setTags] = useState<EventTag[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState<EventTag | null>(null);
  const [newTag, setNewTag] = useState({ name: '', color: '#0085c2' });
  const [error, setError] = useState<string | null>(null);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [showTagsPanel, setShowTagsPanel] = useState(false);
  const [startTime, setStartTime] = useState<TimeSelection>({ hour: '9', period: 'AM' });
  const [endTime, setEndTime] = useState<TimeSelection>({ hour: '10', period: 'AM' });

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  useEffect(() => {
    fetchEvents();
    fetchTags();
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setEventTypes(data || []);
    } catch (error) {
      console.error('Error fetching event types:', error);
      setError('Failed to fetch event types');
    }
  };

  const fetchEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_tags (*),
          event_types (*)
        `)
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;

      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select('event_id');

      if (regError) throw regError;

      const counts = registrations?.reduce((acc, reg) => {
        acc[reg.event_id] = (acc[reg.event_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setEvents(eventsData || []);
      setRegistrationCounts(counts || {});
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('event_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Failed to fetch tags');
    }
  };

  const handleCreateEvent = () => {
    const defaultEventType = eventTypes[0]?.id;
    
    if (!defaultEventType) {
      setError('No event types available. Please create an event type first.');
      return;
    }

    setEditingEvent({
      id: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '9:00 AM - 10:00 AM',
      location: '',
      price: 0,
      max_participants: null,
      zoom_webinar_id: null,
      format: 'in-person',
      cancellation_policy: '',
      tag_id: null,
      event_type_id: defaultEventType,
      type: 'workshop',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    setStartTime({ hour: '9', period: 'AM' });
    setEndTime({ hour: '10', period: 'AM' });
  };

  const handleEditEvent = (event: Event) => {
    const timeMatch = event.time.match(/(\d+):00\s*(AM|PM)\s*-\s*(\d+):00\s*(AM|PM)/i);
    if (timeMatch) {
      setStartTime({ hour: timeMatch[1], period: timeMatch[2] as 'AM' | 'PM' });
      setEndTime({ hour: timeMatch[3], period: timeMatch[4] as 'AM' | 'PM' });
    }

    setEditingEvent({
      ...event,
      date: event.date.split('T')[0]
    });
  };

  const handleSaveEvent = async () => {
    try {
      if (!editingEvent) return;

      if (!editingEvent.title?.trim()) throw new Error('Title is required');
      if (!editingEvent.description?.trim()) throw new Error('Description is required');
      if (!editingEvent.date) throw new Error('Date is required');
      if (!editingEvent.location?.trim()) throw new Error('Location is required');
      if (!editingEvent.event_type_id) throw new Error('Event type is required');

      const formattedTime = `${startTime.hour}:00 ${startTime.period} - ${endTime.hour}:00 ${endTime.period}`;

      // Create a Date object at noon UTC to avoid timezone issues
      const dateWithoutTime = new Date(editingEvent.date);
      const utcDate = new Date(Date.UTC(
        dateWithoutTime.getUTCFullYear(),
        dateWithoutTime.getUTCMonth(),
        dateWithoutTime.getUTCDate(),
        12, // noon UTC
        0,
        0
      ));

      const eventData = {
        title: editingEvent.title.trim(),
        description: editingEvent.description.trim(),
        date: utcDate.toISOString(),
        time: formattedTime,
        location: editingEvent.location.trim(),
        price: editingEvent.price,
        max_participants: editingEvent.max_participants,
        zoom_webinar_id: editingEvent.zoom_webinar_id,
        format: editingEvent.format,
        cancellation_policy: editingEvent.cancellation_policy?.trim(),
        tag_id: editingEvent.tag_id,
        event_type_id: editingEvent.event_type_id,
        updated_at: new Date().toISOString()
      };

      const isNewEvent = !editingEvent.id;

      const { data, error } = isNewEvent
        ? await supabase
            .from('events')
            .insert([eventData])
            .select()
            .single()
        : await supabase
            .from('events')
            .update(eventData)
            .eq('id', editingEvent.id)
            .select()
            .single();

      if (error) throw error;

      await fetchEvents();
      setEditingEvent(null);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchEvents();
      setError(null);
    } catch (error) {
      setError('Failed to delete event');
      console.error('Error:', error);
    }
  };

  const handleSaveTag = async () => {
    try {
      if (!newTag.name.trim()) {
        throw new Error('Tag name is required');
      }

      const { error } = await supabase
        .from('event_tags')
        .insert([{
          name: newTag.name.trim(),
          color: newTag.color
        }]);

      if (error) throw error;

      await fetchTags();
      setShowTagModal(false);
      setNewTag({ name: '', color: '#0085c2' });
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  const handleUpdateTag = async (tag: EventTag, color: string) => {
    try {
      const { error } = await supabase
        .from('event_tags')
        .update({ color })
        .eq('id', tag.id);

      if (error) throw error;

      await fetchTags();
      setEditingTag(null);
      setError(null);
    } catch (error) {
      setError('Failed to update tag');
      console.error('Error:', error);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('tag_id', id);

      if (eventsError) throw eventsError;

      if (events && events.length > 0) {
        throw new Error('Cannot delete tag that is used in events');
      }

      const { error } = await supabase
        .from('event_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTags();
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold">Manage Events</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowTagsPanel(!showTagsPanel)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              showTagsPanel
                ? 'bg-gray-200 text-gray-700'
                : 'bg-[#0085c2] text-white hover:bg-[#FFB546]'
            }`}
          >
            <TagIcon className="w-5 h-5 mr-2" />
            Manage Tags
          </button>
          <button
            onClick={handleCreateEvent}
            className="flex items-center px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            New Event
          </button>
        </div>
      </div>

      {showTagsPanel && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Event Tags</h3>
            <button
              onClick={() => setShowTagModal(true)}
              className="flex items-center px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
            >
              <TagIcon className="w-5 h-5 mr-2" />
              New Tag
            </button>
          </div>
          <div className="grid gap-4">
            {tags.map(tag => (
              <div key={tag.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="font-medium">{tag.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={tag.color}
                    onChange={(e) => handleUpdateTag(tag, e.target.value)}
                    className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                  />
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">New Event Tag</h2>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Parent Workshop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                  className="w-full h-10 p-1 rounded-md cursor-pointer"
                />
              </div>
              <button
                onClick={handleSaveTag}
                className="w-full px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
              >
                Create Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingEvent.id ? 'Edit Event' : 'New Event'}
              </h2>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <select
                          value={startTime.hour}
                          onChange={(e) => setStartTime({ ...startTime, hour: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          {hours.map(hour => (
                            <option key={`start-${hour}`} value={hour}>{hour}</option>
                          ))}
                        </select>
                        <select
                          value={startTime.period}
                          onChange={(e) => setStartTime({ ...startTime, period: e.target.value as 'AM' | 'PM' })}
                          className="w-20 px-3 py-2 border rounded-md"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    <span className="flex items-center">-</span>
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <select
                          value={endTime.hour}
                          onChange={(e) => setEndTime({ ...endTime, hour: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          {hours.map(hour => (
                            <option key={`end-${hour}`} value={hour}>{hour}</option>
                          ))}
                        </select>
                        <select
                          value={endTime.period}
                          onChange={(e) => setEndTime({ ...endTime, period: e.target.value as 'AM' | 'PM' })}
                          className="w-20 px-3 py-2 border rounded-md"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={editingEvent.event_type_id}
                  onChange={(e) => setEditingEvent({ ...editingEvent, event_type_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {eventTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={editingEvent.format}
                  onChange={(e) => setEditingEvent({ ...editingEvent, format: e.target.value as Event['format'] })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="in-person">In Person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editingEvent.location}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder={editingEvent.format === 'online' ? 'Zoom Link' : 'Physical Address'}
                />
              </div>

              {editingEvent.format !== 'in-person' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom Webinar ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingEvent.zoom_webinar_id || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, zoom_webinar_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingEvent.price}
                    onChange={(e) => setEditingEvent({ ...editingEvent, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingEvent.max_participants || ''}
                    onChange={(e) => setEditingEvent({ 
                      ...editingEvent, 
                      max_participants: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag
                </label>
                <select
                  value={editingEvent.tag_id || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, tag_id: e.target.value || null })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">No Tag</option>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cancellation Policy
                </label>
                <textarea
                  value={editingEvent.cancellation_policy || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, cancellation_policy: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="e.g., Full refund if cancelled 48 hours before the event"
                />
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveEvent}
                  className="flex items-center px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                  {event.tag_id && (
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: event.event_tags?.color }}
                    >
                      {event.event_tags?.name}
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
                        {registrationCounts[event.id] || 0}/{event.max_participants} spots filled
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditEvent(event)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsAdmin;