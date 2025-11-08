// Admin pages: calendar with manual availability and patients list

const DUMMY_PATIENTS = [
  { id: 'p1', name: 'Alice Johnson', email: 'alice@example.com', photo: null },
  { id: 'p2', name: 'Brian Chen', email: 'brian.chen@example.com', photo: null },
  { id: 'p3', name: 'Carla Gomez', email: 'carla.gomez@example.com', photo: null },
  { id: 'p4', name: 'Devon Patel', email: 'devon.patel@example.com', photo: null },
  { id: 'p5', name: 'Eli Nguyen', email: 'eli.nguyen@example.com', photo: null },
  { id: 'p6', name: 'Fatima Khan', email: 'fatima.khan@example.com', photo: null },
];

function initialsFromName(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const a = parts[0][0] || '';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase();
}

function AdminCalendar() {
  const [current, setCurrent] = React.useState(new Date());
  const [store, setStore] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('vm_admin_avail')) || {}; } catch (e) { return {}; }
  });

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const monthStr = `${year}-${String(month+1).padStart(2,'0')}`;
  const keyFor = (d) => `${monthStr}-${String(d).padStart(2,'0')}`;

  const isAvailable = (d) => !!store[keyFor(d)];
  const toggleDay = (d) => {
    const k = keyFor(d);
    const next = { ...store };
    if (next[k]) delete next[k]; else next[k] = true;
    setStore(next);
    try { localStorage.setItem('vm_admin_avail', JSON.stringify(next)); } catch {}
  };

  // Build grid
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
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

      <div className="calendar-grid" role="grid">
        <div className="calendar-row" role="row">
          {dayNames.map((n) => (
            <div key={n} className="day-name" role="columnheader">{n}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="calendar-row" role="row">
            {week.map((d, di) => {
              if (d === null) return <div key={'b'+wi+'-'+di} className="cell blank" role="gridcell" aria-hidden="true" />;
              const available = isAvailable(d);
              const cls = 'cell clickable ' + (available ? 'available' : 'unavailable');
              const label = `${monthName} ${d} - ${available ? 'Available' : 'Unavailable'}`;
              return (
                <div key={d} className={cls} role="gridcell" aria-label={label} onClick={() => toggleDay(d)}>{d}</div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientsList() {
  const [q, setQ] = React.useState('');
  const patients = React.useMemo(() => DUMMY_PATIENTS, []);
  const filtered = patients.filter(p => {
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return p.name.toLowerCase().includes(t) || p.email.toLowerCase().includes(t);
  });

  return (
    <div className="patients">
      <div className="search">
        <input className="input" placeholder="Search patients by name or email" value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>
      {filtered.map(p => (
        <div key={p.id} className="patient-row">
          <div className="patient-left">
            {p.photo ? (
              <img className="avatar" src={p.photo} alt={`${p.name} avatar`} />
            ) : (
              <div className="avatar" aria-hidden="true">{initialsFromName(p.name)}</div>
            )}
            <div className="meta">
              <div className="name">{p.name}</div>
              <div className="muted small">{p.email}</div>
            </div>
          </div>
          <div className="actions">
            <a className="btn" href={`#admin/patient/${encodeURIComponent(p.id)}`}>Open</a>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="muted small">No patients match your search.</div>
      )}
    </div>
  );
}

function AdminProfilePage() {
  return (
    <>
      <section className="card">
        <h2>Admin Calendar</h2>
        <p className="muted small">Click days to toggle availability. Saved locally for testing.</p>
        <AdminCalendar />
      </section>

      <section className="card">
        <h2>Patients</h2>
        <PatientsList />
      </section>
    </>
  );
}

function PatientAdminPage() {
  const [hash, setHash] = React.useState(() => window.location.hash || '');
  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash || '');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const id = (hash.split('/')[2] || '').trim();
  const patient = React.useMemo(() => DUMMY_PATIENTS.find(p => p.id === id), [id]);

  if (!patient) {
    return (
      <section className="card">
        <h2>Patient Not Found</h2>
        <p className="muted">No patient for id: <code>{id || '(empty)'}</code></p>
        <a className="btn" href="#admin">Back to Admin</a>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="patient-header" style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
        {patient.photo ? (
          <img className="avatar" src={patient.photo} alt={`${patient.name} avatar`} />
        ) : (
          <div className="avatar" aria-hidden="true">{initialsFromName(patient.name)}</div>
        )}
        <div>
          <h2 style={{margin:'0 0 4px'}}>Admin: {patient.name}</h2>
          <div className="muted small">{patient.email}</div>
        </div>
      </div>

      <div className="grid">
        <div className="tile">
          <strong>Notes</strong>
          <p className="muted small">Placeholder for patient-specific actions and data.</p>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <a className="btn" href="#admin">Back to Patients</a>
      </div>
    </section>
  );
}

// Expose globally for App.jsx
window.AdminProfilePage = AdminProfilePage;
window.PatientAdminPage = PatientAdminPage;

