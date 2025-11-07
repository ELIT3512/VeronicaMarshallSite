function ProfilePage({ user }) {
  return (
    <section className="card">
      <h2>Your Profile</h2>
      <p className="muted">Welcome, <strong>{user.email}</strong>.</p>
      <div className="grid">
        <div className="tile">
          <strong>Upcoming Appointments</strong>
          <p className="muted small">None scheduled. Booking will be available here later.</p>
        </div>
        <div className="tile">
          <strong>Account</strong>
          <p className="muted small">Update details and preferences (placeholder).</p>
        </div>
      </div>
    </section>
  );
}

// Expose globally for App.jsx to use
window.ProfilePage = ProfilePage;

