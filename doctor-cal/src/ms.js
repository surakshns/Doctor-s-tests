import React, { useState } from "react";

export default function MenstrualCycleCalculator() {
  const today = new Date().toISOString().slice(0, 10);

  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [lutealPhase, setLutealPhase] = useState(14);
  const [predictCount, setPredictCount] = useState(6);
  const [results, setResults] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + Number(days));
    return d;
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const iso = (date) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 10);
  };

  const calculate = (e) => {
    e && e.preventDefault();
    if (!lastPeriod) {
      setNote("Please enter the first day of your last period.");
      return;
    }
    const start = new Date(lastPeriod);
    if (isNaN(start)) {
      setNote("Invalid date.");
      return;
    }

    const cycles = [];
    let currentStart = new Date(start);

    for (let i = 0; i < predictCount; i++) {
      const ovulation = addDays(currentStart, cycleLength - lutealPhase);
      const fertileStart = addDays(ovulation, -5);
      const fertileEnd = addDays(ovulation, 1);
      const nextPeriod = addDays(currentStart, cycleLength);

      cycles.push({
        cycleNumber: i + 1,
        periodStart: iso(currentStart),
        periodStartPretty: formatDate(currentStart),
        ovulation: iso(ovulation),
        ovulationPretty: formatDate(ovulation),
        fertileWindow: `${iso(fertileStart)} to ${iso(fertileEnd)}`,
        fertileWindowPretty: `${formatDate(fertileStart)} — ${formatDate(fertileEnd)}`,
      });

      currentStart = nextPeriod;
    }

    const nextPeriod = cycles[0] ? cycles[0].periodStart : iso(start);
    setResults({ cycles, nextPeriod });
    setNote("");
  };

  const printRecord = () => {
    if (!results) return;
    const html = `
      <html>
        <head>
          <title>Menstrual Cycle Patient Record</title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <style>body{font-family: Arial, Helvetica, sans-serif; padding:20px}</style>
        </head>
        <body>
          <h2>Menstrual Cycle Patient Record</h2>
          <p><strong>Last period (1st day):</strong> ${formatDate(lastPeriod)}</p>
          <p><strong>Average cycle length:</strong> ${cycleLength} days</p>
          <p><strong>Luteal phase:</strong> ${lutealPhase} days</p>
          <hr />
          ${results.cycles
            .map(
              (c) => `
            <h3>Cycle ${c.cycleNumber}</h3>
            <ul>
              <li><strong>Period start:</strong> ${c.periodStartPretty}</li>
              <li><strong>Predicted ovulation:</strong> ${c.ovulationPretty}</li>
              <li><strong>Fertile window:</strong> ${c.fertileWindowPretty}</li>
            </ul>
          `
            )
            .join("")}
          <hr />
          <p>Generated on ${formatDate(new Date())}</p>
        </body>
      </html>
    `;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const saveToClinic = async () => {
    if (!results) {
      setNote("Compute results before saving.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        patientId: null,
        lastPeriod: results.cycles[0].periodStart,
        cycleLength,
        lutealPhase,
        predictions: results.cycles,
        note,
      };

      await new Promise((res) => setTimeout(res, 700));
      setNote('Saved to clinic (mock). Replace saveToClinic with your API call.');
    } catch (err) {
      setNote('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <style>{`
        .container { max-width: 800px; margin: auto; padding: 20px; font-family: Arial, Helvetica, sans-serif; }
        .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 20px; }
        h1, h2 { margin-bottom: 12px; }
        h1 { font-size: 1.5rem; }
        p { margin-bottom: 8px; }
        form { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 768px) { form { grid-template-columns: repeat(2, 1fr); } }
        label { display: flex; flex-direction: column; font-size: 0.9rem; }
        input, textarea { padding: 8px; border: 1px solid #ccc; border-radius: 6px; margin-top: 4px; font-size: 0.9rem; }
        input:focus, textarea:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79,70,229,0.2); }
        .button { padding: 8px 16px; border-radius: 8px; cursor: pointer; border: none; font-size: 0.9rem; }
        .button-primary { background: #4f46e5; color: #fff; }
        .button-secondary { background: #f3f4f6; border: 1px solid #ccc; color: #111; }
        .button-success { background: #16a34a; color: #fff; }
        .button:disabled { opacity: 0.6; cursor: not-allowed; }
        .flex { display: flex; gap: 8px; margin-top: 8px; }
        .predictions { margin-top: 20px; }
        .card-small { padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(odd) { background: #f9fafb; }
        .note { margin-top: 8px; color: #b91c1c; font-size: 0.85rem; }
      `}</style>

      <div className="card">
        <h1 style={{color: '#004c91', marginBottom: '10px'}}>Menstrual Cycle Calculator</h1>
        <p>Enter the first day of the last menstrual period and typical cycle details. This tool predicts ovulation, fertile window and upcoming period starts.</p>

        <form onSubmit={calculate}>
          <label>
            Last period (1st day)
            <input type="date" value={lastPeriod} max={today} onChange={(e) => setLastPeriod(e.target.value)} />
          </label>
          <label>
            Average cycle length (days)
            <input type="number" min={21} max={45} value={cycleLength} onChange={(e) => setCycleLength(Number(e.target.value))} />
          </label>
          <label>
            Luteal phase length (days)
            <input type="number" min={10} max={18} value={lutealPhase} onChange={(e) => setLutealPhase(Number(e.target.value))} />
          </label>
          <label>
            Number of cycles to predict
            <input type="number" min={1} max={12} value={predictCount} onChange={(e) => setPredictCount(Number(e.target.value))} />
          </label>

          <div className="flex">
            <button type="submit" className="button button-primary">Calculate</button>
            <button type="button" onClick={() => { setLastPeriod(''); setResults(null); setNote(''); }} className="button button-secondary">Reset</button>
            <button type="button" onClick={() => { setLastPeriod(iso(new Date())); }} className="button button-secondary">Use Today</button>
          </div>
        </form>

        {note && <p className="note">{note}</p>}

        {results && (
          <div className="predictions">
            <div className="flex" style={{ justifyContent: "space-between" }}>
              <h2>Predictions</h2>
              <div className="flex">
                <button onClick={printRecord} className="button button-secondary">Print</button>
                <button onClick={saveToClinic} className="button button-success" disabled={saving}>{saving ? 'Saving...' : 'Save to clinic'}</button>
              </div>
            </div>

            <div className="flex" style={{ marginTop: '16px' }}>
              <div className="card-small">
                <p><strong>Next period (predicted):</strong> {formatDate(results.cycles[0].periodStart)}</p>
                <p><strong>Predicted ovulation (cycle 1):</strong> {results.cycles[0].ovulationPretty}</p>
                <p><strong>Fertile window (cycle 1):</strong> {results.cycles[0].fertileWindowPretty}</p>
              </div>

              <div className="card-small">
                <p style={{ fontSize: '0.85rem', color: '#555' }}>Notes / clinical observations</p>
                <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add patient notes here (optional)" />
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>Period start</th>
                  <th>Ovulation</th>
                  <th>Fertile window</th>
                </tr>
              </thead>
              <tbody>
                {results.cycles.map((c) => (
                  <tr key={c.cycleNumber}>
                    <td>{c.cycleNumber}</td>
                    <td>{c.periodStartPretty}</td>
                    <td>{c.ovulationPretty}</td>
                    <td>{c.fertileWindowPretty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#555' }}>
          <p><strong>Notes:</strong> This calculator uses a simple prediction model: <code>Ovulation = last period + (cycle length - luteal phase)</code>. Individual cycles vary; this is not a diagnostic tool. For irregular cycles or medical concerns, refer to clinical evaluation.</p>
        </div>
      </div>
    </div>
  );
}
