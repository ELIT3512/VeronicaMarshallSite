function initialsFromEmail(email) {
  const n = (email || '').split('@')[0];
  if (!n) return '?';
  return n.slice(0, 2).toUpperCase();
}

function PatientCalendarSelect({ value, onChange }) {
  const [current, setCurrent] = React.useState(() => value?.date ? new Date(value.date) : new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const selectedDay = value?.date ? new Date(value.date) : null;
  const isSelected = (d) => selectedDay && selectedDay.getFullYear() === year && selectedDay.getMonth() === month && selectedDay.getDate() === d;

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

  const pickDay = (d) => {
    const dateStr = new Date(year, month, d).toISOString();
    onChange({ date: dateStr, time: value?.time || '' });
  };

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
              const cls = 'cell clickable ' + (isSelected(d) ? 'selected available' : 'available');
              return (
                <div key={d} className={cls} role="gridcell" aria-label={`${monthName} ${d}`} onClick={() => pickDay(d)}>{d}</div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({ user }) {
  const storageKey = React.useMemo(() => 'vm_profile_' + (user?.email || '').toLowerCase(), [user]);
  const [profile, setProfile] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { return {}; }
  });
  const [savedMsg, setSavedMsg] = React.useState('');

  React.useEffect(() => {
    try { const p = JSON.parse(localStorage.getItem(storageKey)) || {}; setProfile(p); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const saveProfile = (next) => {
    const merged = { ...profile, ...next };
    setProfile(merged);
    try { localStorage.setItem(storageKey, JSON.stringify(merged)); } catch {}
    setSavedMsg('Saved');
    setTimeout(() => setSavedMsg(''), 1200);
  };

  const onPhotoChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => saveProfile({ photo: reader.result });
    reader.readAsDataURL(file);
  };

  const timeOptions = ['09:00','10:00','11:00','13:00','14:00','15:00'];
  const appointment = profile.appointment || { date: '', time: '' };

  const amountOwed = typeof profile.amountOwed === 'number' ? profile.amountOwed : 0;

  return (
    <>
      <section className="card">
        <h2>Your Profile</h2>
        <p className="muted">Welcome, <strong>{user.email}</strong>.</p>

        <div style={{display:'flex',alignItems:'center',gap:16,marginTop:8}}>
          {profile.photo ? (
            <img className="avatar large" src={profile.photo} alt="Profile" />
          ) : (
            <div className="avatar large" aria-hidden="true">{initialsFromEmail(user.email)}</div>
          )}
          <div className="form" style={{flex:1}}>
            <label className="label">Age
              <input className="input" type="number" min="0" value={profile.age || ''} onChange={(e)=>saveProfile({ age: Number(e.target.value) || '' })} />
            </label>
            <label className="label">Profile Picture
              <input className="input" type="file" accept="image/*" onChange={(e)=>onPhotoChange(e.target.files?.[0])} />
            </label>
          </div>
        </div>

        <label className="label" style={{marginTop:12}}>About your autism traits
          <textarea className="input" rows="4" placeholder="Describe strengths, supports, and traits"
            value={profile.traits || ''} onChange={(e)=>saveProfile({ traits: e.target.value })} />
        </label>
      </section>

      <section className="card">
        <h2>Appointments</h2>
        <p className="muted small">Pick a day, then a time, and save.</p>
        <PatientCalendarSelect value={appointment} onChange={(v)=>saveProfile({ appointment: { ...appointment, ...v } })} />
        <div className="form" style={{marginTop:12, maxWidth: 320}}>
          <label className="label">Time
            <select className="input" value={appointment.time || ''} onChange={(e)=>saveProfile({ appointment: { ...appointment, time: e.target.value } })}>
              <option value="">Select a time</option>
              {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <div style={{marginTop:8}}>
          <button className="btn" onClick={()=>setSavedMsg('Appointment saved')}>Save Appointment</button>
          {appointment.date && appointment.time && (
            <div className="small" style={{marginTop:6,opacity:.85}}>
              Selected: {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
            </div>
          )}
          {savedMsg && <div className="small" style={{marginTop:6,color:'#53d769'}}>{savedMsg}</div>}
        </div>
      </section>

      <section className="card">
        <h2>Billing</h2>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <div>
            <div className="muted small">Amount Due</div>
            <div style={{fontSize:20,fontWeight:600}}>${amountOwed.toFixed(2)}</div>
          </div>
          <div>
            <button className="btn primary" disabled={amountOwed <= 0}
              onClick={() => saveProfile({ amountOwed: 0 })}>Pay</button>
          </div>
        </div>
      </section>
    </>
  );
}

window.ProfilePage = ProfilePage;
