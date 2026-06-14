import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function EventCard({ event, onRegister }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(event.is_registered);
  const [count, setCount] = useState(event.registration_count);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!user) { window.location.href = '/login'; return; }
    setLoading(true);
    try {
      await eventsAPI.register(event.id);
      setIsRegistered(true);
      setCount((c) => c + 1);
      onRegister?.();
    } catch (err) {
      alert(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="event-card">
        <div className="event-card-header">
          <h3 className="event-title">{event.title}</h3>
          <div className="event-meta">
            <span className="event-meta-item">📅 {formatDate(event.date)}</span>
            <span className="event-meta-item">📍 {event.location}</span>
          </div>
        </div>
        <div className="event-card-body">
          <p className="event-description">{event.description}</p>
        </div>
        <div className="event-card-footer">
          <span className="badge badge-primary">👥 {count} registered</span>
          {isRegistered ? (
            <span className="badge badge-success">✓ Registered</span>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? 'Registering…' : 'Register'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await eventsAPI.list(params);
      setEvents(data.results ?? data);
      if (data.count !== undefined) {
        setTotalPages(Math.ceil(data.count / 10));
      }
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Upcoming Events</h1>
          <p className="page-subtitle">Discover workshops, conferences, and meetups near you</p>
          <div className="search-bar" style={{ marginTop: '1.25rem' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search events by name, location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔎</div>
            <div className="empty-title">No events found</div>
            <div className="empty-body">
              {search ? `No results for "${search}". Try a different search.` : 'Check back soon for upcoming events.'}
            </div>
          </div>
        ) : (
          <>
            <div className="events-grid">
              {events.map((event) => (
                <EventCard key={event.id} event={event} onRegister={fetchEvents} />
              ))}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0 2rem' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >← Prev</button>
                <span style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
