import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      <section style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)',
        padding: '5rem 0',
        textAlign: 'center',
      }}>
        <div className="container">
          <div style={{ display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '99px', padding: '0.3rem 1rem', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1.5rem' }}>
            ⚡ Discover what's happening near you
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, letterSpacing: '-1px', color: 'var(--gray-900)', marginBottom: '1rem', lineHeight: 1.15 }}>
            Your next learning experience<br />starts here
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--gray-500)', maxWidth: 520, margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Browse workshops, conferences, and meetups. Register in one click and keep track of your events.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events" className="btn btn-primary btn-lg">Browse events →</Link>
            {!user && <Link to="/register" className="btn btn-outline btn-lg">Create free account</Link>}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#fff' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.5rem', marginBottom: '2.5rem', color: 'var(--gray-900)' }}>
            Everything you need to manage events
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '🔍', title: 'Discover events', desc: 'Search and filter upcoming tech events by name, topic, or location.' },
              { icon: '✅', title: 'Register instantly', desc: 'One-click registration — no forms, no hassle.' },
              { icon: '🎟️', title: 'Track your tickets', desc: 'All your registrations in one place, with quick cancel if plans change.' },
              { icon: '🔒', title: 'Secure accounts', desc: 'JWT authentication and bcrypt-hashed passwords keep your data safe.' },
            ].map((f) => (
              <div key={f.title} style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '1rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '3rem 0', background: 'var(--primary-light)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
            Ready to get started?
          </h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Join hundreds of developers attending events every week.</p>
          <Link to={user ? '/events' : '/register'} className="btn btn-primary btn-lg">
            {user ? 'Browse events →' : 'Sign up free →'}
          </Link>
        </div>
      </section>
    </div>
  );
}
