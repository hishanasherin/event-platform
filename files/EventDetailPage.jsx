import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });
}

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    eventsAPI.detail(id)
      .then(({ data }) => setEvent(data))
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleRegister = async () => {
    if (!user) { navigate('/login', { state: { from: `/events/${id}` } }); return; }
    setRegLoading(true);
    setMessage(null);
    try {
      await eventsAPI.register(id);
      setEvent((e) => ({ ...e, is_registered: true, registration_count: e.registration_count + 1 }));
      setMessage({ type: 'success', text: 'You\'re registered! See you there.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Registration failed.' });
    } finally {
      setRegLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm('Cancel your registration for this event?')) return;
    setRegLoading(true);
    setMessage(null);
    try {
      await eventsAPI.unregister(id);
      setEvent((e) => ({ ...e, is_registered: false, registration_count: Math.max(0, e.registration_count - 1) }));
      setMessage({ type: 'success', text: 'Registration cancelled.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Could not cancel.' });
    } finally {
      setRegLoading(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;
  if (!event) return null;

  return (
    <div>
      <div className="event-detail-hero">
        <div className="container">
          <Link to="/events" style={{ fontSize: '0.875rem', color: 'var(--gray-500)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
            ← Back to events
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '0.75rem' }}>
            {event.title}
          </h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span className="event-meta-item">📅 {formatDate(event.date)}</span>
            <span className="event-meta-item">🕐 {formatTime(event.date)}</span>
            <span className="event-meta-item">📍 {event.location}</span>
            <span className="badge badge-primary">👥 {event.registration_count} registered</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="event-detail-body">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>About this event</h2>
            <p style={{ color: 'var(--gray-700)', lineHeight: 1.8, fontSize: '0.95rem' }}>{event.description}</p>
          </div>

          <div>
            <div className="event-info-card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Event details</h3>

              <div className="info-row">
                <span className="info-icon">📅</span>
                <div>
                  <div className="info-label">Date</div>
                  <div className="info-value">{formatDate(event.date)}</div>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon">🕐</span>
                <div>
                  <div className="info-label">Time</div>
                  <div className="info-value">{formatTime(event.date)}</div>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon">📍</span>
                <div>
                  <div className="info-label">Location</div>
                  <div className="info-value">{event.location}</div>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon">👥</span>
                <div>
                  <div className="info-label">Registrations</div>
                  <div className="info-value">{event.registration_count} people registered</div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                {message && (
                  <div className={`alert alert-${message.type}`} style={{ marginBottom: '0.75rem' }}>
                    {message.text}
                  </div>
                )}
                {event.is_registered ? (
                  <>
                    <div className="badge badge-success" style={{ marginBottom: '0.75rem', display: 'block', textAlign: 'center', padding: '0.5rem' }}>
                      ✓ You're registered
                    </div>
                    <button
                      className="btn btn-ghost btn-full"
                      onClick={handleUnregister}
                      disabled={regLoading}
                    >
                      {regLoading ? 'Cancelling…' : 'Cancel registration'}
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary btn-full btn-lg"
                    onClick={handleRegister}
                    disabled={regLoading}
                  >
                    {regLoading ? 'Registering…' : user ? 'Register for event' : 'Sign in to register'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
