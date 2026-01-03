import React, { useState, useEffect, useMemo } from "react";

export default function WellnessAdvancedROIDashboard() {
  // -------------------- State with persistencess --------------------
  const [employees, setEmployees] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ew_employees")) || []; } catch { return []; }
  });
  const [metrics, setMetrics] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ew_metrics")) || []; } catch { return []; }
  });
  const [roles, setRoles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ew_roles")) || [
        { id: 1, name: "Clinical", avgLossPerDay: 3000 },
        { id: 2, name: "Administrative", avgLossPerDay: 1500 },
      ];
    } catch { return []; }
  });
  const [claims, setClaims] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ew_claims")) || []; } catch { return []; }
  });

  const [empForm, setEmpForm] = useState({ name: "", dept: "", roleId: roles[0]?.id || 1, bmi: "", hbA1c: "" });
  const [metricForm, setMetricForm] = useState({ date: "", absenteeismDays: 0 });
  const [roleForm, setRoleForm] = useState({ name: "", avgLossPerDay: 0 });
  const [claimForm, setClaimForm] = useState({ date: "", totalClaimsCost: 0 });

  // -------------------- Persistence --------------------
  useEffect(() => { localStorage.setItem("ew_employees", JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem("ew_metrics", JSON.stringify(metrics)); }, [metrics]);
  useEffect(() => { localStorage.setItem("ew_roles", JSON.stringify(roles)); }, [roles]);
  useEffect(() => { localStorage.setItem("ew_claims", JSON.stringify(claims)); }, [claims]);

  // -------------------- Handlers --------------------
  const addEmployee = (e) => {
    e.preventDefault();
    setEmployees((s) => [{ id: Date.now(), ...empForm }, ...s]);
    setEmpForm({ name: "", dept: "", roleId: roles[0]?.id || 1, bmi: "", hbA1c: "" });
  };
  const addMetric = (e) => {
    e.preventDefault();
    setMetrics((s) => [{ id: Date.now(), ...metricForm }, ...s]);
    setMetricForm({ date: "", absenteeismDays: 0 });
  };
  const addRole = (e) => {
    e.preventDefault();
    setRoles((s) => [{ id: Date.now(), ...roleForm }, ...s]);
    setRoleForm({ name: "", avgLossPerDay: 0 });
  };
  const addClaim = (e) => {
    e.preventDefault();
    setClaims((s) => [{ id: Date.now(), ...claimForm }, ...s]);
    setClaimForm({ date: "", totalClaimsCost: 0 });
  };
  const clearAll = () => {
    if (!window.confirm("Clear all saved data?")) return;
    setEmployees([]); setMetrics([]); setRoles([]); setClaims([]); localStorage.clear();
  };

  // -------------------- Calculations --------------------
  const totalEmployees = employees.length;
  const avgLossPerDayPerEmployee = useMemo(() => {
    if (employees.length === 0) {
      return roles.length ? roles.reduce((a, r) => a + Number(r.avgLossPerDay), 0) / roles.length : 0;
    }
    const counts = {}; employees.forEach(e => counts[e.roleId] = (counts[e.roleId] || 0) + 1);
    let totalLoss = 0, totalCount = 0;
    roles.forEach(r => { const c = counts[r.id] || 0; totalLoss += c * r.avgLossPerDay; totalCount += c; });
    return totalCount ? totalLoss / totalCount : 0;
  }, [employees, roles]);

  const sortedMetrics = metrics.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const sortedClaims = claims.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

  const absBaseline = Number(sortedMetrics[0]?.absenteeismDays || 0);
  const absLatest = Number(sortedMetrics[sortedMetrics.length - 1]?.absenteeismDays || 0);
  const absChange = absBaseline - absLatest;
  const absTrend = absChange > 0 ? "📉 Decrease" : absChange < 0 ? "📈 Increase" : "— No Change";

  const baselineClaims = Number(sortedClaims[0]?.totalClaimsCost || 0);
  const latestClaims = Number(sortedClaims[sortedClaims.length - 1]?.totalClaimsCost || 0);
  const claimsChange = baselineClaims - latestClaims;
  const claimsTrend = claimsChange > 0 ? "📉 Decrease" : claimsChange < 0 ? "📈 Increase" : "— No Change";

  const savingsFromProductivity = Math.max(0, Math.round(absChange * avgLossPerDayPerEmployee));
  const savingsFromClaims = Math.max(0, Math.round(claimsChange));
  const totalEstimatedSavings = savingsFromProductivity + savingsFromClaims;

  // -------------------- Export --------------------
  const exportCSV = () => {
    const rows = [
      ["Employees"], ["id","name","dept","roleId","bmi","hbA1c"],
      ...employees.map(e=>[e.id,e.name,e.dept,e.roleId,e.bmi,e.hbA1c]),
      [],
      ["Roles"], ["id","name","avgLossPerDay"], ...roles.map(r=>[r.id,r.name,r.avgLossPerDay]),
      [],
      ["Metrics"], ["id","date","absenteeismDays"], ...metrics.map(m=>[m.id,m.date,m.absenteeismDays]),
      [],
      ["Claims"], ["id","date","totalClaimsCost"], ...claims.map(c=>[c.id,c.date,c.totalClaimsCost]),
    ];
    const csv = rows.map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "wellness_data.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // -------------------- Render --------------------
  return (
    <div className="dashboard">
      <style>{`
        .dashboard { font-family: Arial, sans-serif; padding: 30px; max-width: 1100px; margin: auto; background: #f8f9fb; color: #222; }
        h1 { color: #004c91; margin-bottom: 10px; }
        h3 { margin-top: 0; color: #004c91; }
        .grid { display: grid; gap: 20px; }
        .two { grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); }
        .three { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
        .card { background: #fff; border-radius: 8px; padding: 15px 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
        label { display: block; margin-top: 8px; font-weight: 600; font-size: 0.9em; }
        input, select { width: 100%; padding: 6px 8px; margin-top: 4px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9em; }
        button { background: #004c91; color: white; border: none; padding: 8px 14px; border-radius: 4px; margin-top: 10px; cursor: pointer; }
        button:hover { background: #003b72; }
        .kpi { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9em; }
        .trend { font-weight: bold; }
        .actions button { margin-right: 6px; }
        footer { margin-top: 25px; font-size: 0.8em; color: #666; text-align: center; }
      `}</style>

      <h1>🩺 Employee Wellness — ROI Dashboard</h1>
      <p style={{ color: "#555", marginBottom: 25 }}>
        Track absenteeism, claims, and productivity without external libraries.
      </p>

      {/* KPI Overview */}
      <div className="grid two">
        <div className="card">
          <h3>Overview</h3>
          <div className="kpi"><span>Total Employees:</span><strong>{totalEmployees}</strong></div>
          <div className="kpi"><span>Avg Loss/Day:</span><strong>₹{Math.round(avgLossPerDayPerEmployee)}</strong></div>
          <div className="kpi"><span>Absenteeism Trend:</span><span className="trend">{absTrend}</span></div>
          <div className="kpi"><span>Claims Trend:</span><span className="trend">{claimsTrend}</span></div>
          <div className="kpi"><span>Productivity Savings:</span><strong>₹{savingsFromProductivity}</strong></div>
          <div className="kpi"><span>Claims Savings:</span><strong>₹{savingsFromClaims}</strong></div>
          <div className="kpi"><span>Total Estimated Savings:</span><strong>₹{totalEstimatedSavings}</strong></div>
        </div>

        <div className="card">
          <h3>Actions</h3>
          <div className="actions">
            <button onClick={exportCSV}>Export CSV</button>
            <button style={{ background: "#0a9928" }} onClick={() => window.print()}>Print</button>
            <button style={{ background: "#d93025" }} onClick={clearAll}>Clear All</button>
          </div>
        </div>
      </div>

      {/* Forms */}
      <div className="grid three" style={{ marginTop: 25 }}>
        <div className="card">
          <h3>Add Role</h3>
          <form onSubmit={addRole}>
            <label>Role Name</label>
            <input value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} required />
            <label>Avg Loss per Day (₹)</label>
            <input type="number" value={roleForm.avgLossPerDay} onChange={e => setRoleForm({ ...roleForm, avgLossPerDay: Number(e.target.value) })} required />
            <button>Add Role</button>
          </form>
        </div>

        <div className="card">
          <h3>Add Employee</h3>
          <form onSubmit={addEmployee}>
            <label>Name</label>
            <input value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} required />
            <label>Department</label>
            <input value={empForm.dept} onChange={e => setEmpForm({ ...empForm, dept: e.target.value })} />
            <label>Role</label>
            <select value={empForm.roleId} onChange={e => setEmpForm({ ...empForm, roleId: Number(e.target.value) })}>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <label>BMI</label>
            <input value={empForm.bmi} onChange={e => setEmpForm({ ...empForm, bmi: e.target.value })} />
            <label>HbA1c</label>
            <input value={empForm.hbA1c} onChange={e => setEmpForm({ ...empForm, hbA1c: e.target.value })} />
            <button>Add Employee</button>
          </form>
        </div>

        <div className="card">
          <h3>Add Absenteeism Metric</h3>
          <form onSubmit={addMetric}>
            <label>Date</label>
            <input type="date" value={metricForm.date} onChange={e => setMetricForm({ ...metricForm, date: e.target.value })} required />
            <label>Total Absenteeism Days</label>
            <input type="number" value={metricForm.absenteeismDays} onChange={e => setMetricForm({ ...metricForm, absenteeismDays: Number(e.target.value) })} required />
            <button>Add Metric</button>
          </form>
        </div>
      </div>

      <div className="grid two" style={{ marginTop: 25 }}>
        <div className="card">
          <h3>Add Medical Claim Entry</h3>
          <form onSubmit={addClaim}>
            <label>Date</label>
            <input type="date" value={claimForm.date} onChange={e => setClaimForm({ ...claimForm, date: e.target.value })} required />
            <label>Total Claims Cost (₹)</label>
            <input type="number" value={claimForm.totalClaimsCost} onChange={e => setClaimForm({ ...claimForm, totalClaimsCost: Number(e.target.value) })} required />
            <button>Add Claim</button>
          </form>
        </div>

        <div className="card">
          <h3>Existing Roles</h3>
          {roles.length === 0 ? <p>No roles yet.</p> :
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {roles.map(r => <li key={r.id}>{r.name} — ₹{r.avgLossPerDay}/day</li>)}
            </ul>}
        </div>
      </div>

      <footer>
        All data is saved locally. Export CSV for backup.
      </footer>
    </div>
  );
}
