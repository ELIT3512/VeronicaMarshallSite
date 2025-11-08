function App() {
  const [route, setRoute] = React.useState(window.location.hash || '#home');
  const [user, setUser] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('vm_user')) || null; } catch (e) { return null; }
  });

  React.useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#home');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (hash) => { window.location.hash = hash; };
  const logout = () => { localStorage.removeItem('vm_user'); setUser(null); go('#home'); };

  const onLogin = (email, isAdmin = false) => {
    const u = { email, role: isAdmin ? 'admin' : 'user' };
    localStorage.setItem('vm_user', JSON.stringify(u));
    setUser(u);
    go(isAdmin ? '#admin' : '#profile');
  };

  const showHome = route === '' || route === '#home';

  return (
    <main className="container">
      <header className="header">
        <div className="brand">Veronica Marshell Autism Consulting</div>
        <nav className="nav">
          {showHome ? (
            user ? (
              <>
                {(!user.role || user.role !== 'admin') && (
                  <a href="#profile" className="navlink">Profile</a>
                )}
                {user.role === 'admin' && <a href="#admin" className="navlink">Admin</a>}
                <a href="#home" className="navlink" onClick={(e)=>{e.preventDefault(); logout();}}>Logout</a>
              </>
            ) : (
              <>
                <a href="#login" className="navlink">Login</a>
                <a href="#register" className="navlink">Register</a>
              </>
            )
          ) : (
            <>
              {!(user && user.role === 'admin') && (
                <a href="#home" className="navlink">Home</a>
              )}
              {user ? (
                <>
                  {(!user.role || user.role !== 'admin') && (
                    <a href="#profile" className="navlink">Profile</a>
                  )}
                  {user.role === 'admin' && <a href="#admin" className="navlink">Admin</a>}
                  <a href="#home" className="navlink" onClick={(e)=>{e.preventDefault(); logout();}}>Logout</a>
                </>
              ) : (
                <>
                  <a href="#login" className="navlink">Login</a>
                  <a href="#register" className="navlink">Register</a>
                </>
              )}
            </>
          )}
        </nav>
      </header>

      {showHome && <Home />}
      {route === '#login' && <LoginPage onLogin={onLogin} />}
      {route === '#register' && <RegisterPage />}
      {route === '#profile' && (user ? <ProfilePage user={user} /> : <LoginRequired />)}
      {route === '#admin' && (user && user.role === 'admin' ? <AdminProfilePage /> : <LoginRequired />)}
      {route.startsWith('#admin/patient/') && (user && user.role === 'admin' ? <PatientAdminPage /> : <LoginRequired />)}

      <footer className="footer">
        {'\u00A9'} {new Date().getFullYear()} Veronica Marshell Autism Consulting
      </footer>
    </main>
  );
}

window.App = App;

function Home() {
  return (
    <>
      <section className="hero card">
        <h1>Hello, World</h1>
        <p className="lead">
          mission statement.
        </p>
      </section>

      <section className="card resume">
        <h2>Resume</h2>
        <p className="muted">A brief overview of Veronica's qualifications and experience.</p>
        <ul className="list">
          <li><strong>Certification:</strong> Board Certified Behavior Analyst (BCBA) - lorem ipsum placeholder.</li>
          <li><strong>Experience:</strong> 10+ years supporting children and families - lorem ipsum placeholder.</li>
          <li><strong>Education:</strong> M.S. in Applied Behavior Analysis - lorem ipsum placeholder.</li>
          <li><strong>Specialties:</strong> Assessment, individualized plans, caregiver training - lorem ipsum placeholder.</li>
          <li><strong>Approach:</strong> Compassionate, evidence-based, collaborative - lorem ipsum placeholder.</li>
        </ul>
      </section>

      <section className="card availability">
        <h2>Availability</h2>
        <Calendar />
        <p className="muted small">Green days are generally available; gray indicates limited or no availability. Placeholder only.</p>
      </section>
    </>
  );
}


// Simple monthly calendar with basic availability indicator
function Calendar() {
  const [current, setCurrent] = React.useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth(); // 0-11

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Build flat list of cells for the month
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Group into weeks (rows of 7)
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    const slice = cells.slice(i, i + 7);
    while (slice.length < 7) slice.push(null);
    weeks.push(slice);
  }

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const monthName = current.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="calendar">
      <div className="calendar-controls">
        <button className="btn" onClick={prevMonth} aria-label="Previous month">{'\u2039'}</button>
        <div className="month-name" aria-live="polite">{monthName}</div>
        <button className="btn" onClick={nextMonth} aria-label="Next month">{'\u203A'}</button>
      </div>

      <div className="calendar-grid" role="grid" aria-readonly="true">
        <div className="calendar-row" role="row">
          {dayNames.map((n) => (
            <div key={n} className="day-name" role="columnheader">{n}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="calendar-row" role="row">
            {week.map((d, di) => {
              if (d === null) return <div key={'b'+wi+'-'+di} className="cell blank" role="gridcell" aria-hidden="true" />;
              const dateObj = new Date(year, month, d);
              const dow = dateObj.getDay();
              const available = dow !== 0 && dow !== 6; // Weekdays as placeholder
              const cls = 'cell ' + (available ? 'available' : 'unavailable');
              return (
                <div key={d} className={cls} role="gridcell" aria-label={`${monthName} ${d}`}>{d}</div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

