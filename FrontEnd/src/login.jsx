function LoginPage({ onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Enter email and password.'); return; }
    setError('');
    onLogin(email.trim());
  };

  return (
    <section className="card">
      <h2>Login</h2>
      <form className="form" onSubmit={submit}>
        <label className="label">Email
          <input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </label>
        <label className="label">Password
          <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </label>
        {error && <div className="error" role="alert">{error}</div>}
        <button className="btn primary" type="submit">Log in</button>
      </form>
    </section>
  );
}

function LoginRequired() {
  return (
    <section className="card">
      <h2>Login Required</h2>
      <p className="muted">Please <a href="#login">log in</a> to view your profile.</p>
    </section>
  );
}

// Expose globally for App.jsx to use
window.LoginPage = LoginPage;
window.LoginRequired = LoginRequired;

