
import React, { useState, useMemo } from "react";

/**
 * Diet Prescription Generator
 * Single-file React component (Tailwind CSS)
 * Default export a React component ready to embed in your clinic site.
 *
 * Features included:
 * - Patient input form (name, age, sex, height, weight, activity)
 * - Mifflin-St Jeor BMR + activity to compute calorie needs
 * - Macro split suggestions (disease-aware)
 * - South / North Indian regional menus with a searchable food list
 * - Printable patient record (window.print) and a stub to save to clinic DB
 * - Export JSON for quick integration
 *
 * Integration notes:
 * - To enable PDF export using jsPDF/html2canvas, install those libraries and
 *   use the `exportToPdf` function stub as a starting point.
 * - To save records to your clinic DB, implement POST /api/prescriptions to accept JSON.
 */

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const DEFAULT_FOODS = {
  south: [
    { name: "Idli (2)", kcal: 160, carbs: 30, protein: 6, fat: 2.5, fibre: 2 },
    { name: "Ragi Dosa (2)", kcal: 220, carbs: 40, protein: 6, fat: 4.5, fibre: 4 },
    { name: "Sambar (1 cup)", kcal: 120, carbs: 16, protein: 6, fat: 3, fibre: 5 },
    { name: "Brown Rice (1 cup)", kcal: 216, carbs: 45, protein: 5, fat: 1.8, fibre: 3.5 },
    { name: "Curd (1 cup)", kcal: 100, carbs: 8, protein: 6, fat: 4, fibre: 0 },
    { name: "Sprouts (1/2 cup)", kcal: 70, carbs: 10, protein: 6, fat: 1, fibre: 4 },
  ],
  north: [
    { name: "Phulka (1)", kcal: 70, carbs: 12, protein: 3, fat: 1, fibre: 1.5 },
    { name: "Poha (1 cup)", kcal: 250, carbs: 45, protein: 6, fat: 5, fibre: 3 },
    { name: "Paratha (1)", kcal: 250, carbs: 30, protein: 5, fat: 10, fibre: 2 },
    { name: "Dal (1 cup)", kcal: 180, carbs: 20, protein: 10, fat: 6, fibre: 6 },
    { name: "Raita (1/2 cup)", kcal: 60, carbs: 4, protein: 3, fat: 3, fibre: 0.5 },
    { name: "Chole (1 cup)", kcal: 240, carbs: 35, protein: 12, fat: 6, fibre: 8 },
  ],
};

const DISEASE_MACRO_PRESETS = {
  none: { carbsPct: 50, proteinPct: 20, fatPct: 30, fiberGoal: 25, calorieAdj: 0 },
  diabetes: { carbsPct: 45, proteinPct: 25, fatPct: 30, fiberGoal: 30, calorieAdj: 0 },
  hypertension: { carbsPct: 50, proteinPct: 20, fatPct: 30, fiberGoal: 28, calorieAdj: 0 },
  obesity: { carbsPct: 40, proteinPct: 30, fatPct: 30, fiberGoal: 30, calorieAdj: -0.2 },
  ckd: { carbsPct: 50, proteinPct: 15, fatPct: 35, fiberGoal: 20, calorieAdj: 0 },
  heart_failure: { carbsPct: 50, proteinPct: 20, fatPct: 30, fiberGoal: 25, calorieAdj: 0 },
  weight_loss: { carbsPct: 40, proteinPct: 30, fatPct: 30, fiberGoal: 30, calorieAdj: -0.2 },
  weight_gain: { carbsPct: 55, proteinPct: 20, fatPct: 25, fiberGoal: 20, calorieAdj: 0.15 },
};

function round(n, d = 0) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}

export default function DietPrescriptionGenerator() {
  const [patient, setPatient] = useState({
    name: "",
    age: 45,
    sex: "male",
    height: 170,
    weight: 70,
    activity: "moderate",
    disease: "none",
    region: "south",
    vegetarian: true,
  });

  const [search, setSearch] = useState("");
  const [customFoods, setCustomFoods] = useState([]);

  const foods = useMemo(() => {
    return [...DEFAULT_FOODS[patient.region], ...customFoods];
  }, [patient.region, customFoods]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setPatient((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  function mifflinBMR({ weight, height, age, sex }) {
    // Mifflin-St Jeor
    const s = sex === "male" ? 5 : -161;
    return 10 * weight + 6.25 * height - 5 * age + s;
  }

  const bmr = useMemo(() => mifflinBMR(patient), [patient]);
  const tdee = useMemo(() => round(bmr * ACTIVITY_FACTORS[patient.activity]), [bmr, patient.activity]);

  const macros = useMemo(() => {
    const preset = DISEASE_MACRO_PRESETS[patient.disease] || DISEASE_MACRO_PRESETS.none;
    // apply calorie adjustment (for weight loss/gain or obesity)
    const adjustedCalories = round(tdee * (1 + (preset.calorieAdj || 0)));

    const proteinKcal = (preset.proteinPct / 100) * adjustedCalories;
    const fatKcal = (preset.fatPct / 100) * adjustedCalories;
    const carbKcal = (preset.carbsPct / 100) * adjustedCalories;
    // 1g protein=4 kcal, carb=4 kcal, fat=9 kcal
    return {
      calories: adjustedCalories,
      protein_g: round(proteinKcal / 4, 1),
      fat_g: round(fatKcal / 9, 1),
      carbs_g: round(carbKcal / 4, 1),
      fiber_g: preset.fiberGoal,
      preset,
    };
  }, [tdee, patient.disease]);

  // Generate a simple 3-meal + 2 snack plan using region foods
  const plan = useMemo(() => {
    // naive approach: pick items that fit roughly into calories
    const target = macros.calories;
    const breakfast = foods[0] || null;
    const lunch = foods[1] || null;
    const dinner = foods[2] || null;
    const snack1 = foods[3] || null;
    const snack2 = foods[4] || null;

    return {
      breakfast,
      snack1,
      lunch,
      snack2,
      dinner,
      notes: `Adjust portions to meet ${macros.calories} kcal/day. Prioritise whole grains, legumes, vegetables, and fruits. For ${patient.disease.replace("_", " ")}.`,
    };
  }, [foods, macros.calories, patient.disease]);

  function addCustomFood() {
    const name = prompt("Food name (e.g., 'Mixed veg sabzi (1 cup)')");
    if (!name) return;
    const kcal = parseFloat(prompt("Approx kcal for one serving (number)"));
    if (Number.isNaN(kcal)) return alert("Invalid kcal");
    const food = { name, kcal, carbs: 0, protein: 0, fat: 0, fibre: 0 };
    setCustomFoods((c) => [food, ...c]);
  }

  async function saveToClinicDB() {
    const payload = {
      patient,
      computed: { bmr, tdee, macros, plan, createdAt: new Date().toISOString() },
    };

    try {
      // Replace with your real API endpoint. The example sends a POST to /api/prescriptions
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save: " + res.status);
      alert("Saved to clinic database");
    } catch (err) {
      console.warn(err);
      alert("Could not save to clinic DB - see console for details. You can implement the POST endpoint on your server.");
    }
  }

  function exportJson() {
    const obj = { patient, bmr, tdee, macros, plan };
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${patient.name || "patient"}-diet-prescription.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportToPdf() {
    // Stub: for production, install html2canvas + jsPDF (or html2pdf) and then capture
    // an element by id and generate a PDF. Example libraries:
    // npm i html2canvas jspdf
    alert("PDF export: install html2canvas + jspdf and implement exportToPdf using them.\n\nSee comments in code.");
  }

  function printRecord() {
    window.print();
  }

  const filteredFoods = foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-semibold mb-4">Diet Prescription Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 p-4 border rounded-lg">
          <h2 className="font-medium mb-2">Patient Details</h2>
          <label className="block text-sm">Name</label>
          <input name="name" value={patient.name} onChange={handleChange} className="w-full border p-2 rounded mt-1 mb-2" />

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm">Age</label>
              <input type="number" name="age" value={patient.age} onChange={handleChange} className="w-full border p-2 rounded mt-1 mb-2" />
            </div>
            <div className="flex-1">
              <label className="block text-sm">Sex</label>
              <select name="sex" value={patient.sex} onChange={handleChange} className="w-full border p-2 rounded mt-1 mb-2">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm">Height (cm)</label>
              <input type="number" name="height" value={patient.height} onChange={handleChange} className="w-full border p-2 rounded mt-1 mb-2" />
            </div>
            <div className="flex-1">
              <label className="block text-sm">Weight (kg)</label>
              <input type="number" name="weight" value={patient.weight} onChange={handleChange} className="w-full border p-2 rounded mt-1 mb-2" />
            </div>
          </div>

          <label className="block text-sm">Activity level</label>
          <select name="activity" value={patient.activity} onChange={handleChange} className="w-full border p-2 rounded mt-1 mb-2">
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very Active</option>
          </select>

          <label className="block text-sm">Disease / Condition</label>
          <select name="disease" value={patient.disease} onChange={handleChange} className="w-full border p-2 rounded mt-1 mb-2">
            <option value="none">None</option>
            <option value="diabetes">Diabetes</option>
            <option value="hypertension">Hypertension</option>
            <option value="obesity">Obesity</option>
            <option value="ckd">Chronic Kidney Disease (CKD)</option>
            <option value="heart_failure">Heart Failure</option>
            <option value="weight_loss">Weight Loss (Calorie deficit)</option>
            <option value="weight_gain">Weight Gain (Calorie surplus)</option>
          </select>

          <label className="block text-sm">Region</label>
          <select name="region" value={patient.region} onChange={handleChange} className="w-full border p-2 rounded mt-1 mb-2">
            <option value="south">South Indian</option>
            <option value="north">North Indian</option>
          </select>

          <label className="inline-flex items-center mt-2">
            <input type="checkbox" name="vegetarian" checked={patient.vegetarian} onChange={handleChange} className="form-checkbox" />
            <span className="ml-2">Vegetarian</span>
          </label>

          <div className="mt-4 flex gap-2">
            <button onClick={saveToClinicDB} className="px-3 py-2 bg-blue-600 text-white rounded">Save to Clinic DB</button>
            <button onClick={exportJson} className="px-3 py-2 bg-gray-200 rounded">Export JSON</button>
            <button onClick={printRecord} className="px-3 py-2 bg-green-600 text-white rounded">Print</button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Tip: After saving, you can attach this prescription to the patient file in your EMR.
          </div>
        </div>

        <div className="col-span-2 p-4 border rounded-lg">
          <h2 className="font-medium mb-2">Computed Requirements</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">BMR</div>
              <div className="text-xl font-semibold">{round(bmr)} kcal/day</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">TDEE (est)</div>
              <div className="text-xl font-semibold">{macros.calories} kcal/day</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Protein</div>
              <div className="text-lg font-semibold">{macros.protein_g} g/day</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Carbs</div>
              <div className="text-lg font-semibold">{macros.carbs_g} g/day</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Fat</div>
              <div className="text-lg font-semibold">{macros.fat_g} g/day</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Fiber goal</div>
              <div className="text-lg font-semibold">{macros.fiber_g} g/day</div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium">Suggested Meal Plan ({patient.region === "south" ? "South Indian" : "North Indian"})</h3>
            <div className="mt-3 grid md:grid-cols-2 gap-4">
              <div className="p-3 border rounded">
                <div className="font-semibold">Breakfast</div>
                <div className="text-sm">{plan.breakfast ? `${plan.breakfast.name} — ${plan.breakfast.kcal} kcal` : "—"}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-semibold">Mid-morning</div>
                <div className="text-sm">{plan.snack1 ? `${plan.snack1.name} — ${plan.snack1.kcal} kcal` : "Fruit / Buttermilk"}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-semibold">Lunch</div>
                <div className="text-sm">{plan.lunch ? `${plan.lunch.name} — ${plan.lunch.kcal} kcal` : "—"}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-semibold">Evening Snack</div>
                <div className="text-sm">{plan.snack2 ? `${plan.snack2.name} — ${plan.snack2.kcal} kcal` : "Tea + Roasted chana"}</div>
              </div>
              <div className="p-3 border rounded col-span-2">
                <div className="font-semibold">Dinner</div>
                <div className="text-sm">{plan.dinner ? `${plan.dinner.name} — ${plan.dinner.kcal} kcal` : "—"}</div>
                <div className="mt-2 text-xs text-gray-600">{plan.notes}</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={addCustomFood} className="px-3 py-2 bg-indigo-600 text-white rounded">Add Custom Food</button>
              <button onClick={exportToPdf} className="px-3 py-2 bg-orange-500 text-white rounded">Export PDF</button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium">Search Foods ({patient.region === "south" ? "South" : "North"})</h3>
            <div className="flex gap-2 mt-2 mb-3">
              <input placeholder="Search food or dish" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 border p-2 rounded" />
              <div className="text-sm text-gray-500 p-2">{filteredFoods.length} results</div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {filteredFoods.map((f, idx) => (
                <div key={idx} className="p-3 border rounded">
                  <div className="font-semibold">{f.name}</div>
                  <div className="text-sm">{f.kcal} kcal</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        Note: This tool provides estimates. For renal failure or complex patients (post-transplant, pregnant,
        advanced CKD), please tailor nutrient targets and consult renal/dietetic specialist.
      </div>
    </div>
  );
}
