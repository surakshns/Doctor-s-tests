
import React, { useState } from "react";

// Web-interactable Cancer Risk Calculator
// Single-file React component. TailwindCSS utility classes used for styling.
// Default export is the component so it can be previewed or copied into a React app.

export default function CancerRiskCalculator() {
  const [age, setAge] = useState(40);
  const [sex, setSex] = useState("male");
  const [familyHistory, setFamilyHistory] = useState(false);

  const [tobacco, setTobacco] = useState("never");
  const [alcohol, setAlcohol] = useState("none");
  const [physicalActivity, setPhysicalActivity] = useState("active");
  const [diet, setDiet] = useState("rare");
  const [bmi, setBmi] = useState(24);

  const [environmental, setEnvironmental] = useState(false);
  const [inflammatory, setInflammatory] = useState(false);
  const [diabetes, setDiabetes] = useState(false);

  const [femaleReproNulliparity, setFemaleReproNulliparity] = useState(false);
  const [femaleReproHormone, setFemaleReproHormone] = useState(false);

  const [result, setResult] = useState(null);

  function pointsForAge(a) {
    if (a < 40) return 0;
    if (a <= 59) return 2;
    return 4;
  }

  function pointsForSex(s) {
    return s === "male" ? 1 : 0;
  }

  function pointsForFamily(f) {
    return f ? 3 : 0;
  }

  function pointsForTobacco(t) {
    if (t === "current") return 4;
    if (t === "former") return 2;
    return 0;
  }

  function pointsForAlcohol(a) {
    if (a === "daily") return 2;
    if (a === "occasional") return 1;
    return 0;
  }

  function pointsForPhysical(p) {
    if (p === "sedentary") return 2;
    if (p === "moderate") return 1;
    return 0;
  }

  function pointsForDiet(d) {
    if (d === "frequent") return 2;
    if (d === "occasional") return 1;
    return 0;
  }

  function pointsForBmi(b) {
    if (b < 18.5 || b > 30) return 2;
    return 0;
  }

  function calculateScore() {
    let score = 0;
    score += pointsForAge(Number(age));
    score += pointsForSex(sex);
    score += pointsForFamily(familyHistory);
    score += pointsForTobacco(tobacco);
    score += pointsForAlcohol(alcohol);
    score += pointsForPhysical(physicalActivity);
    score += pointsForDiet(diet);
    score += pointsForBmi(Number(bmi));
    score += environmental ? 2 : 0;
    score += inflammatory ? 2 : 0;
    score += diabetes ? 1 : 0;

    // female-specific
    if (sex === "female") {
      score += femaleReproNulliparity ? 2 : 0;
      score += femaleReproHormone ? 1 : 0;
    }

    const category = interpretScore(score);
    setResult({ score, category });
  }

  function interpretScore(score) {
    if (score <= 5) return { label: "Low risk", advice: "Routine screening per guidelines" };
    if (score <= 10) return { label: "Moderate risk", advice: "Lifestyle modification and annual check-up" };
    return { label: "High risk", advice: "Physician consultation; consider targeted cancer screening" };
  }

  function resetForm() {
    setAge(40);
    setSex("male");
    setFamilyHistory(false);
    setTobacco("never");
    setAlcohol("none");
    setPhysicalActivity("active");
    setDiet("rare");
    setBmi(24);
    setEnvironmental(false);
    setInflammatory(false);
    setDiabetes(false);
    setFemaleReproNulliparity(false);
    setFemaleReproHormone(false);
    setResult(null);
  }

  function downloadStandaloneHTML() {
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Cancer Risk Calculator</title>
    <style>
      /* Minimal styles so standalone file works without Tailwind */
      body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial;margin:16px;padding:0}
      .card{border-radius:12px;padding:18px;box-shadow:0 6px 18px rgba(0,0,0,0.08);max-width:900px;margin:12px auto}
      label{display:block;margin-top:10px;font-weight:600}
      input,select{width:100%;padding:8px;margin-top:6px;border-radius:6px;border:1px solid #ddd}
      .row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
      .btn{display:inline-block;padding:10px 16px;border-radius:8px;border:none;background:#111;color:#fff;margin-top:12px;cursor:pointer}
      .result{margin-top:14px;padding:12px;border-radius:8px;background:#f7f7f9}
    </style>
  </head>
  <body>
    <div class="card">
      <h2>Cancer Risk Calculator (Standalone)</h2>
      <p>Paste values and press Calculate.</p>
      <div id="app"></div>
    </div>

    <script>
      // Very small JS version of the scoring routine to run in the standalone file
      (function(){
        function pointsForAge(a){ if(a<40)return 0; if(a<=59)return 2; return 4 }
        function pointsForSex(s){ return s==='male'?1:0 }
        function pointsForFamily(f){ return f?3:0 }
        function pointsForTobacco(t){ if(t==='current')return 4; if(t==='former')return 2; return 0 }
        function pointsForAlcohol(a){ if(a==='daily')return 2; if(a==='occasional')return 1; return 0 }
        function pointsForPhysical(p){ if(p==='sedentary')return 2; if(p==='moderate')return 1; return 0 }
        function pointsForDiet(d){ if(d==='frequent')return 2; if(d==='occasional')return 1; return 0 }
        function pointsForBmi(b){ return (b<18.5||b>30)?2:0 }
        function interpretScore(score){ if(score<=5) return ['Low risk','Routine screening per guidelines']; if(score<=10) return ['Moderate risk','Lifestyle modification and annual check-up']; return ['High risk','Physician consultation; consider targeted cancer screening'] }

        var container = document.getElementById('app');
        container.innerHTML = '
          <div class="row">
            <div>
              <label>Age</label><input id="age" type="number" value="40" />
              <label>Sex</label>
              <select id="sex"><option value="male">Male</option><option value="female">Female</option></select>
              <label>Family history (1st degree)</label>
              <select id="family"><option value="false">No</option><option value="true">Yes</option></select>
            </div>
            <div>
              <label>Tobacco</label>
              <select id="tobacco"><option value="never">Never</option><option value="former">Former</option><option value="current">Current</option></select>
              <label>Alcohol</label>
              <select id="alcohol"><option value="none">None</option><option value="occasional">Occasional</option><option value="daily">Daily</option></select>
              <label>Physical activity</label>
              <select id="phys"><option value="active">Active</option><option value="moderate">Moderate</option><option value="sedentary">Sedentary</option></select>
            </div>
            <div>
              <label>Diet (processed/fried)</label>
              <select id="diet"><option value="rare">Rare</option><option value="occasional">Occasional</option><option value="frequent">Frequent</option></select>
              <label>BMI</label>
              <input id="bmi" type="number" value="24" step="0.1" />
              <label>Environmental exposure</label>
              <select id="env"><option value="false">No</option><option value="true">Yes</option></select>
            </div>
          </div>
          <button class="btn" id="calc">Calculate</button>
          <div id="res" class="result"></div>
        ';

        document.getElementById('calc').addEventListener('click', function(){
          var score=0;
          var a = Number(document.getElementById('age').value);
          var s = document.getElementById('sex').value;
          var f = document.getElementById('family').value==='true';
          var t = document.getElementById('tobacco').value;
          var al = document.getElementById('alcohol').value;
          var p = document.getElementById('phys').value;
          var d = document.getElementById('diet').value;
          var b = Number(document.getElementById('bmi').value);
          var env = document.getElementById('env').value==='true';

          score += pointsForAge(a);
          score += pointsForSex(s);
          score += pointsForFamily(f);
          score += pointsForTobacco(t);
          score += pointsForAlcohol(al);
          score += pointsForPhysical(p);
          score += pointsForDiet(d);
          score += pointsForBmi(b);
          score += env?2:0;

          var out = interpretScore(score);
          document.getElementById('res').innerHTML = '<strong>Score: '+score+'</strong><br/>'+out[0]+'<br/>'+out[1];
        });
      })();
    </script>
  </body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cancer-risk-calculator.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2">Simple Composite Cancer Risk Calculator</h1>
        <p className="text-sm text-gray-600 mb-4">Fill the fields and press <strong>Calculate</strong></p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Age</label>
            <input className="mt-1 p-2 border rounded" type="number" value={age} onChange={(e) => setAge(e.target.value)} />

            <label className="block text-sm font-medium mt-3">Sex</label>
            <select className="mt-1 p-2 border rounded w-full" value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <label className="flex items-center gap-2 mt-3">
              <input type="checkbox" checked={familyHistory} onChange={(e) => setFamilyHistory(e.target.checked)} />
              <span className="text-sm">Family history (1st degree)</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium">Tobacco</label>
            <select className="mt-1 p-2 border rounded w-full" value={tobacco} onChange={(e) => setTobacco(e.target.value)}>
              <option value="never">Never</option>
              <option value="former">Former</option>
              <option value="current">Current</option>
            </select>

            <label className="block text-sm font-medium mt-3">Alcohol</label>
            <select className="mt-1 p-2 border rounded w-full" value={alcohol} onChange={(e) => setAlcohol(e.target.value)}>
              <option value="none">None</option>
              <option value="occasional">Occasional</option>
              <option value="daily">Daily</option>
            </select>

            <label className="block text-sm font-medium mt-3">Physical activity</label>
            <select className="mt-1 p-2 border rounded w-full" value={physicalActivity} onChange={(e) => setPhysicalActivity(e.target.value)}>
              <option value="active">Active</option>
              <option value="moderate">Moderate</option>
              <option value="sedentary">Sedentary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Diet (processed/fried)</label>
            <select className="mt-1 p-2 border rounded w-full" value={diet} onChange={(e) => setDiet(e.target.value)}>
              <option value="rare">Rare</option>
              <option value="occasional">Occasional</option>
              <option value="frequent">Frequent</option>
            </select>

            <label className="block text-sm font-medium mt-3">BMI</label>
            <input className="mt-1 p-2 border rounded" type="number" step="0.1" value={bmi} onChange={(e) => setBmi(e.target.value)} />

            <label className="flex items-center gap-2 mt-3">
              <input type="checkbox" checked={environmental} onChange={(e) => setEnvironmental(e.target.checked)} />
              <span className="text-sm">Regular environmental/occupational exposure</span>
            </label>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 mt-1">
              <input type="checkbox" checked={inflammatory} onChange={(e) => setInflammatory(e.target.checked)} />
              <span className="text-sm">Chronic inflammatory disease (IBD, hepatitis, etc.)</span>
            </label>

            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={diabetes} onChange={(e) => setDiabetes(e.target.checked)} />
              <span className="text-sm">Diabetes</span>
            </label>
          </div>

          <div>
            {sex === "female" && (
              <div>
                <label className="flex items-center gap-2 mt-1">
                  <input type="checkbox" checked={femaleReproNulliparity} onChange={(e) => setFemaleReproNulliparity(e.target.checked)} />
                  <span className="text-sm">Nulliparity or first childbirth after 30</span>
                </label>

                <label className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={femaleReproHormone} onChange={(e) => setFemaleReproHormone(e.target.checked)} />
                  <span className="text-sm">Hormonal therapy &gt;5 years</span>
                </label>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end gap-2">
            <div className="flex gap-2">
              <button onClick={calculateScore} className="px-4 py-2 rounded bg-slate-800 text-white">Calculate</button>
              <button onClick={resetForm} className="px-4 py-2 rounded border">Reset</button>
              <button onClick={downloadStandaloneHTML} className="px-4 py-2 rounded border">Download HTML</button>
            </div>

            {result && (
              <div className="mt-3 p-3 rounded-lg border">
                <div className="text-sm font-semibold">Score: {result.score}</div>
                <div className="text-lg font-bold mt-1">{result.category.label}</div>
                <div className="text-sm text-gray-600 mt-1">{result.category.advice}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <strong>Note:</strong> This is a simple composite risk score intended for screening and awareness. It is not a diagnostic tool. For personalised medical advice, consult a physician.
        </div>
      </div>
    </div>
  );
}

/* --------------------- EMBEDDABLE PLUG-AND-PLAY WIDGET --------------------- */

/*
  Below are two ways to embed the calculator into any website:

  1) Hosted Widget (recommended for easy updates)
     - Host the JS file (cancer-risk-widget.js) on your CDN or web server.
     - Website owner pastes a single <script> tag and a <div> where the widget will render.

  2) Iframe Embed (quick, self-contained)
     - Host the standalone HTML file (cancer-risk-calculator.html) and embed it in an <iframe>.

  The snippets below are fully copy-paste ready. You can customise CSS variables or data-* attributes
  to change the default theme or behaviour.
*/

/* --------------------- 1) Hosted Widget (single script include) --------------------- */

/*
  HTML to paste into your site where you want the calculator to appear:

  <div id="cancer-risk-widget" data-theme="light" data-title="Cancer Risk Calculator"></div>
  <script src="/static/cancer-risk-widget.js" async></script>

  - Place the <div> where the widget should render.
  - Serve the JS file at the path used in the script src (replace with your CDN path).
  - The widget will auto-initialize when the script loads.
*/

/* cancer-risk-widget.js (host this file on your CDN/server) */
(function(){
  if (window.__CancerRiskWidgetLoaded) return; window.__CancerRiskWidgetLoaded = true;

  function createStyles(){
    var css = `
      :root{--crw-bg:#ffffff;--crw-foreground:#111827;--crw-accent:#0f172a;--crw-border:#e6e9ef}
      .crw-card{font-family:Inter,ui-sans-serif,system-ui,Roboto,Arial;padding:14px;border-radius:12px;background:var(--crw-bg);color:var(--crw-foreground);border:1px solid var(--crw-border);max-width:720px}
      .crw-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}
      .crw-input, .crw-select{width:100%;padding:8px;border-radius:8px;border:1px solid var(--crw-border)}
      .crw-btn{display:inline-block;padding:8px 12px;border-radius:8px;border:none;background:var(--crw-accent);color:#fff;cursor:pointer}
      .crw-result{margin-top:12px;padding:10px;border-radius:8px;border:1px solid var(--crw-border);background:#fbfdff}
      .crw-small{font-size:13px;color: #6b7280}
    `;
    var s = document.createElement('style'); s.setAttribute('data-crw','1'); s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
  }

  function pointsForAge(a){ if(a<40) return 0; if(a<=59) return 2; return 4 }
  function pointsForSex(s){ return s==='male'?1:0 }
  function pointsForFamily(f){ return f?3:0 }
  function pointsForTobacco(t){ if(t==='current')return 4; if(t==='former')return 2; return 0 }
  function pointsForAlcohol(a){ if(a==='daily')return 2; if(a==='occasional')return 1; return 0 }
  function pointsForPhysical(p){ if(p==='sedentary')return 2; if(p==='moderate')return 1; return 0 }
  function pointsForDiet(d){ if(d==='frequent')return 2; if(d==='occasional')return 1; return 0 }
  function pointsForBmi(b){ return (b<18.5||b>30)?2:0 }
  function interpretScore(score){ if(score<=5) return {label:'Low risk',advice:'Routine screening per guidelines'}; if(score<=10) return {label:'Moderate risk',advice:'Lifestyle modification and annual check-up'}; return {label:'High risk',advice:'Physician consultation; consider targeted cancer screening'} }

  function renderWidget(container){
    createStyles();
    var title = container.getAttribute('data-title') || 'Cancer Risk Calculator';
    var html = `
      <div class="crw-card">
        <h3 style="margin:0 0 8px 0">${title}</h3>
        <div class="crw-row">
          <div>
            <label class="crw-small">Age</label>
            <input class="crw-input" type="number" step="1" id="crw-age" value="40" />
            <label class="crw-small" style="margin-top:8px;display:block">Sex</label>
            <select id="crw-sex" class="crw-select"><option value="male">Male</option><option value="female">Female</option></select>
            <label class="crw-small" style="margin-top:8px;display:block"><input id="crw-family" type="checkbox"/> Family history (1st degree)</label>
          </div>

          <div>
            <label class="crw-small">Tobacco</label>
            <select id="crw-tobacco" class="crw-select"><option value="never">Never</option><option value="former">Former</option><option value="current">Current</option></select>
            <label class="crw-small" style="margin-top:8px;display:block">Alcohol</label>
            <select id="crw-alcohol" class="crw-select"><option value="none">None</option><option value="occasional">Occasional</option><option value="daily">Daily</option></select>
            <label class="crw-small" style="margin-top:8px;display:block">Physical activity</label>
            <select id="crw-phys" class="crw-select"><option value="active">Active</option><option value="moderate">Moderate</option><option value="sedentary">Sedentary</option></select>
          </div>

          <div>
            <label class="crw-small">Diet (processed/fried)</label>
            <select id="crw-diet" class="crw-select"><option value="rare">Rare</option><option value="occasional">Occasional</option><option value="frequent">Frequent</option></select>
            <label class="crw-small" style="margin-top:8px;display:block">BMI</label>
            <input class="crw-input" type="number" id="crw-bmi" step="0.1" value="24" />
            <label class="crw-small" style="margin-top:8px;display:block"><input id="crw-env" type="checkbox"/> Environmental/occupational exposure</label>
          </div>
        </div>

        <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
          <button id="crw-calc" class="crw-btn">Calculate</button>
          <button id="crw-reset" class="crw-btn" style="background:#6b7280">Reset</button>
          <div id="crw-result" style="flex:1"></div>
        </div>
        <div class="crw-small" style="margin-top:10px">Note: Simple screening tool only. Not diagnostic.</div>
      </div>
    `;

    container.innerHTML = html;

    var get = function(id){ return container.querySelector('#'+id); };
    var calc = get('crw-calc'), reset = get('crw-reset'), res = container.querySelector('#crw-result');

    function compute(){
      var score=0;
      var age = Number(get('crw-age').value||0);
      var sex = get('crw-sex').value;
      var family = get('crw-family').checked;
      var tobacco = get('crw-tobacco').value;
      var alcohol = get('crw-alcohol').value;
      var phys = get('crw-phys').value;
      var diet = get('crw-diet').value;
      var bmi = Number(get('crw-bmi').value||0);
      var env = get('crw-env').checked;

      score += pointsForAge(age);
      score += pointsForSex(sex);
      score += pointsForFamily(family);
      score += pointsForTobacco(tobacco);
      score += pointsForAlcohol(alcohol);
      score += pointsForPhysical(phys);
      score += pointsForDiet(diet);
      score += pointsForBmi(bmi);
      score += env?2:0;

      var out = interpretScore(score);
      res.innerHTML = `<div class="crw-result"><strong>Score: ${score}</strong><div style="font-weight:600;margin-top:6px">${out.label}</div><div class="crw-small" style="margin-top:6px">${out.advice}</div></div>`;

      // expose event for host page to capture the result
      var event = new CustomEvent('crw:result', { detail: { score: score, label: out.label } });
      container.dispatchEvent(event);
    }

    function doReset(){
      get('crw-age').value = 40; get('crw-sex').value='male'; get('crw-family').checked=false; get('crw-tobacco').value='never'; get('crw-alcohol').value='none'; get('crw-phys').value='active'; get('crw-diet').value='rare'; get('crw-bmi').value='24'; get('crw-env').checked=false; res.innerHTML='';
    }

    calc.addEventListener('click', compute);
    reset.addEventListener('click', doReset);
  }

  // auto-init: find all placeholders
  function initAll(){
    var nodes = document.querySelectorAll('[id^="cancer-risk-widget"], [data-crw]');
    if (nodes.length===0) nodes = document.querySelectorAll('#cancer-risk-widget');
    nodes.forEach(function(node){
      // allow single div or multiple widgets with same class
      renderWidget(node);
    });
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', initAll); else initAll();
})();

/* --------------------- 2) IFRAME EMBED (self-contained) --------------------- */

/*
  Alternative (quick): host the standalone HTML file (cancer-risk-calculator.html) and embed:

  <iframe src="/static/cancer-risk-calculator.html" width="100%" height="600" style="border:0;border-radius:8px;"></iframe>

  - Replace /static/... with the hosted path.
  - Use height/width adjustments depending on placement.
*/

/* --------------------- Integration notes --------------------- */
/*
  - Event handling: the hosted widget dispatches a DOM CustomEvent 'crw:result' on the widget container when a score is computed. Example:

      var widget = document.getElementById('cancer-risk-widget');
      widget.addEventListener('crw:result', function(e){ console.log('Score computed', e.detail); });

  - The hosted JS is intentionally dependency-free and safe to drop into any modern website.
  - For branding or theming, set CSS variables on the widget container before script load, e.g.:

      <div id="cancer-risk-widget" style="--crw-accent:#0b76ff;--crw-bg:#fff"></div>

  - Accessibility: inputs have labels; you may further enhance aria-* attributes if required.
  - Analytics: you can listen to the 'crw:result' event to record anonymous usage or funnel completions.
*/

/* --------------------- End of embeddable widget section --------------------- */


