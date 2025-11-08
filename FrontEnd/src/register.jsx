const DEV_CODE = '5125';

function RegisterPage() {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [role, setRole] = React.useState('patient');
  const [devCode, setDevCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const loadUsers = () => {
    try { return JSON.parse(localStorage.getItem('vm_users')) || {}; } catch { return {}; }
  };
  const saveUsers = (users) => {
    try { localStorage.setItem('vm_users', JSON.stringify(users)); } catch {}
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim().toLowerCase();
    const pw = password;
    const cf = confirm;
    if (!fn || !ln || !em || !pw || !cf) { setError('Please complete all fields.'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setError('Enter a valid email address.'); return; }
    if (pw.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (pw !== cf) { setError('Passwords do not match.'); return; }
    if (role === 'admin') {
      const dc = (devCode || '').trim();
      if (!dc) { setError('Developer code is required for admin registration.'); return; }
      if (dc !== DEV_CODE) { setError('Invalid developer code.'); return; }
    }

    const users = loadUsers();
    if (users[em]) { setError('An account with this email already exists.'); return; }

    users[em] = { firstName: fn, lastName: ln, email: em, password: pw, role };
    saveUsers(users);

    // Redirect to login after successful registration
    window.location.hash = '#login';
    return;
  };

  return (
    <section className="card">
      <h2>Register</h2>
      <form className="form" onSubmit={submit}>
        <label className="label">First Name
          <input className="input" value={firstName} onChange={(e)=>setFirstName(e.target.value)} required />
        </label>
        <label className="label">Last Name
          <input className="input" value={lastName} onChange={(e)=>setLastName(e.target.value)} required />
        </label>
        <label className="label">Email
          <input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </label>
        <label className="label">Password
          <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </label>
        <label className="label">Verify Password
          <input className="input" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required />
        </label>
        <label className="label">Register as
          <select className="input" value={role} onChange={(e)=>setRole(e.target.value)}>
            <option value="patient">Patient</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {role === 'admin' && (
          <label className="label">Developer Code
            <input className="input" type="password" inputMode="numeric" pattern="[0-9]*" value={devCode} onChange={(e)=>setDevCode(e.target.value)} placeholder="Enter developer code" required />
            <span className="small muted">Admin registration requires a developer-provided code.</span>
          </label>
        )}
        {error && <div className="error" role="alert">{error}</div>}
        {success && <div className="small" style={{color:'#53d769'}} role="status">{success}</div>}
        <button className="btn primary" type="submit" disabled={role === 'admin' && !(devCode && devCode.trim())} title={role === 'admin' ? 'Developer code required for admin registration' : undefined}>Create account</button>
      </form>

      <p className="muted small" style={{marginTop:8}}>Already have an account? <a href="#login">Log in</a></p>
    </section>
  );
}

// Expose globally
window.RegisterPage = RegisterPage;
