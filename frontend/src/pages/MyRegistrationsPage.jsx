import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationsAPI, eventsAPI } from '../api/client';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatRegisteredAt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchRegs = () => {
    registrationsAPI.mine()
      .then(({ data }) => setRegistrations(data.results ?? data))
      .catch(() => setRegistrations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRegs(); }, []);

  const handleCancel = async (eventId, regId) => {
    if (!window.confirm('Cancel this registration?')) return;
    setCancelling(regId);
    try {
      await eventsAPI.unregister(eventId);
      setRegistrations((prev) => prev.filter((r) => r.id !== regId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not cancel registration.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">My Registrations</h1>
          <p className="page-subtitle">Events you've signed up for</p>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : registrations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎟️</div>
            <div className="empty-title">No registrations yet</div>
            <div className="empty-body" style={{ marginBottom: '1.25rem' }}>
              You haven't registered for any events. Browse what's on.
            </div>
            <Link to="/events" className="btn btn-primary">Browse events</Link>
          </div>
        ) : (
          <div className="registrations-list">
            {registrations.map((reg) => {
              const isPast = new Date(reg.event.date) < new Date();
              return (
                <div key={reg.id} className="reg-card">
                  <div className="reg-card-info">
                    <Link to={`/events/${reg.event.id}`} className="reg-event-title" style={{ display: 'block' }}>
                      {reg.event.title}
                    </Link>
                    <div className="reg-meta">
                      <span>📅 {formatDate(reg.event.date)}</span>
                      <span>📍 {reg.event.location}</span>
                      <span style={{ color: 'var(--gray-400)' }}>Registered {formatRegisteredAt(reg.registered_at)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {isPast ? (
                      <span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>Past</span>
                    ) : (
                      <span className="badge badge-success">Upcoming</span>
                    )}
                    {!isPast && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleCancel(reg.event.id, reg.id)}
                        disabled={cancelling === reg.id}
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      >
                        {cancelling === reg.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
