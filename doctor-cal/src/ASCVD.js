import React, { useState } from 'react';

// Single-file React component implementing the 2013 ACC/AHA Pooled Cohort Equations
// Inputs: age (years), sex, race (White or African American), total cholesterol (mg/dL), HDL (mg/dL),
// systolicBP (mm Hg), onTreatment (boolean - treated for hypertension), diabetes (boolean), smoker (boolean)
// Output: estimated 10-year ASCVD risk (%) using the formula: 1 - S0^(exp(sum - mean))

export default function ASCVDCalculator() {
  const [age, setAge] = useState(55);
  const [sex, setSex] = useState('female');
  const [race, setRace] = useState('white');
  const [totalChol, setTotalChol] = useState(213);
  const [hdl, setHdl] = useState(50);
  const [sbp, setSbp] = useState(120);
  const [treated, setTreated] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [smoker, setSmoker] = useState(false);
  const [risk, setRisk] = useState(null);

  // Coefficients from 2013 ACC/AHA Pooled Cohort Equations (Table A)
  const coeffs = {
    'female': {
      'white': {
        coeff: {
          lnAge: -29.799,
          lnAge2: 4.884,
          lnTotChol: 13.540,
          lnAge_lnTotChol: -3.114,
          lnHdl: -13.578,
          lnAge_lnHdl: 3.149,
          logTreatedSBP: 2.019,
          logUntreatedSBP: 1.957,
          currentSmoker: 7.574,
          logAge_currentSmoker: -1.665,
          diabetes: 0.661,
        },
        mean: -29.18,
        baselineSurvival: 0.9665,
      },
      'black': {
        coeff: {
          lnAge: 17.114,
          lnTotChol: 0.94,
          lnHdl: -18.92,
          lnAge_lnHdl: 4.475,
          logTreatedSBP: 29.291,
          logAge_logTreatedSBP: -6.432,
          logUntreatedSBP: 27.82,
          logAge_logUntreatedSBP: -6.087,
          currentSmoker: 0.691,
          diabetes: 0.874,
        },
        mean: 86.61,
        baselineSurvival: 0.9533,
      }
    },
    'male': {
      'white': {
        coeff: {
          lnAge: 12.344,
          lnTotChol: 11.853,
          lnAge_lnTotChol: -2.664,
          lnHdl: -7.990,
          lnAge_lnHdl: 1.769,
          logTreatedSBP: 1.797,
          logUntreatedSBP: 1.764,
          currentSmoker: 7.837,
          logAge_currentSmoker: -1.795,
          diabetes: 0.658,
        },
        mean: 61.18,
        baselineSurvival: 0.9144,
      },
      'black': {
        coeff: {
          lnAge: 2.469,
          lnTotChol: 0.302,
          lnHdl: -0.307,
          logTreatedSBP: 1.916,
          logUntreatedSBP: 1.809,
          currentSmoker: 0.549,
          diabetes: 0.645,
        },
        mean: 19.54,
        baselineSurvival: 0.8954,
      }
    }
  };

  function computeRisk() {
    // Validate age range: PCE intended for 40-79 years
    if (age < 40 || age > 79) {
      alert('Pooled Cohort Equations are validated for ages 40–79. Results outside this range are unreliable.');
    }

    const sexKey = sex === 'female' ? 'female' : 'male';
    const raceKey = race === 'white' ? 'white' : 'black';
    const model = coeffs[sexKey][raceKey];
    const c = model.coeff;

    // compute natural logs
    const lnAge = Math.log(age);
    const lnTotChol = Math.log(totalChol);
    const lnHdl = Math.log(hdl);
    const logSbp = Math.log(sbp);

    // Build the sum: coefficient * variable (follow model-specific terms)
    let sum = 0;

    if (sexKey === 'female' && raceKey === 'white') {
      sum += c.lnAge * lnAge;
      sum += c.lnAge2 * (lnAge * lnAge);
      sum += c.lnTotChol * lnTotChol;
      sum += c.lnAge_lnTotChol * (lnAge * lnTotChol);
      sum += c.lnHdl * lnHdl;
      sum += c.lnAge_lnHdl * (lnAge * lnHdl);
      if (treated) {
        sum += c.logTreatedSBP * Math.log(sbp);
      } else {
        sum += c.logUntreatedSBP * Math.log(sbp);
      }
      sum += c.currentSmoker * (smoker ? 1 : 0);
      sum += c.logAge_currentSmoker * (lnAge * (smoker ? 1 : 0));
      sum += c.diabetes * (diabetes ? 1 : 0);
    } else if (sexKey === 'female' && raceKey === 'black') {
      sum += c.lnAge * lnAge;
      sum += c.lnTotChol * lnTotChol;
      sum += c.lnHdl * lnHdl;
      sum += c.lnAge_lnHdl * (lnAge * lnHdl);
      if (treated) {
        sum += c.logTreatedSBP * Math.log(sbp);
        sum += c.logAge_logTreatedSBP * (lnAge * Math.log(sbp));
      } else {
        sum += c.logUntreatedSBP * Math.log(sbp);
        sum += c.logAge_logUntreatedSBP * (lnAge * Math.log(sbp));
      }
      sum += c.currentSmoker * (smoker ? 1 : 0);
      sum += c.diabetes * (diabetes ? 1 : 0);
    } else if (sexKey === 'male' && raceKey === 'white') {
      sum += c.lnAge * lnAge;
      sum += c.lnTotChol * lnTotChol;
      sum += c.lnAge_lnTotChol * (lnAge * lnTotChol);
      sum += c.lnHdl * lnHdl;
      sum += c.lnAge_lnHdl * (lnAge * lnHdl);
      if (treated) {
        sum += c.logTreatedSBP * Math.log(sbp);
      } else {
        sum += c.logUntreatedSBP * Math.log(sbp);
      }
      sum += c.currentSmoker * (smoker ? 1 : 0);
      sum += c.logAge_currentSmoker * (lnAge * (smoker ? 1 : 0));
      sum += c.diabetes * (diabetes ? 1 : 0);
    } else { // male black
      sum += c.lnAge * lnAge;
      sum += c.lnTotChol * lnTotChol;
      sum += c.lnHdl * lnHdl;
      if (treated) {
        sum += c.logTreatedSBP * Math.log(sbp);
      } else {
        sum += c.logUntreatedSBP * Math.log(sbp);
      }
      sum += c.currentSmoker * (smoker ? 1 : 0);
      sum += c.diabetes * (diabetes ? 1 : 0);
    }

    // final 10-year risk
    const mean = model.mean;
    const s0 = model.baselineSurvival;
    const exponent = Math.exp(sum - mean);
    const riskDecimal = 1 - Math.pow(s0, exponent);
    const riskPercent = Math.max(0, Math.min(100, riskDecimal * 100)); // clamp 0-100

    setRisk(riskPercent.toFixed(1));
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">ASCVD 10‑Year Risk Estimator (Pooled Cohort Equations)</h2>
      <p className="mb-4 text-sm text-gray-600">Based on the 2013 ACC/AHA Pooled Cohort Equations. Use for ages 40–79, without clinical ASCVD. This is a calculator for estimation and does not replace clinical judgement.</p>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col">
          Age (years)
          <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          Sex
          <select value={sex} onChange={e => setSex(e.target.value)} className="p-2 border rounded">
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </label>

        <label className="flex flex-col">
          Race
          <select value={race} onChange={e => setRace(e.target.value)} className="p-2 border rounded">
            <option value="white">White (non‑Hispanic)</option>
            <option value="black">African‑American</option>
          </select>
        </label>

        <label className="flex flex-col">
          Total cholesterol (mg/dL)
          <input type="number" value={totalChol} onChange={e => setTotalChol(Number(e.target.value))} className="p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          HDL (mg/dL)
          <input type="number" value={hdl} onChange={e => setHdl(Number(e.target.value))} className="p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          Systolic BP (mm Hg)
          <input type="number" value={sbp} onChange={e => setSbp(Number(e.target.value))} className="p-2 border rounded" />
        </label>

        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={treated} onChange={e => setTreated(e.target.checked)} />
          <span>Treated for hypertension</span>
        </label>

        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={smoker} onChange={e => setSmoker(e.target.checked)} />
          <span>Current smoker</span>
        </label>

        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={diabetes} onChange={e => setDiabetes(e.target.checked)} />
          <span>Diabetes</span>
        </label>
      </div>

      <div className="mt-4 flex space-x-2">
        <button onClick={computeRisk} className="px-4 py-2 rounded bg-blue-600 text-white">Calculate</button>
        <button onClick={() => { setAge(55); setSex('female'); setRace('white'); setTotalChol(213); setHdl(50); setSbp(120); setTreated(false); setDiabetes(false); setSmoker(false); setRisk(null); }} className="px-4 py-2 rounded border">Reset</button>
      </div>

      {risk !== null && (
        <div className="mt-4 p-4 rounded bg-gray-50">
          <h3 className="text-lg font-semibold">Estimated 10‑year ASCVD risk</h3>
          <p className="text-2xl font-bold mt-2">{risk}%</p>
          <p className="text-sm text-gray-600 mt-2">Interpretation guidance (general):
            <ul className="list-disc ml-6">
              <li>Low: &lt;5%</li>
              <li>Borderline: 5–7.4%</li>
              <li>Elevated: ≥7.5% (consider risk‑lowering therapy discussion)</li>
            </ul>
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500">Reference: 2013 ACC/AHA Guideline - Pooled Cohort Equations (Table A). Use clinically and with shared decision making.</p>
    </div>
  );
}
