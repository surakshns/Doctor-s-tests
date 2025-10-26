import React, { useState } from "react";

const FindriscCalculator = () => {
  const [form, setForm] = useState({
    age: "0",
    bmi: "0",
    waist: "0",
    activity: "0",
    diet: "0",
    bp: "0",
    glucose: "0",
    family: "0",
  });

  const [result, setResult] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const calculateRisk = () => {
    const fields = Object.keys(form);
    const score = fields.reduce((sum, key) => sum + parseInt(form[key]), 0);
    let message = "";

    if (score <= 6) message = "Low Risk (~1%)";
    else if (score <= 11) message = "Slightly Elevated (~4%)";
    else if (score <= 14) message = "Moderate Risk (~16%)";
    else if (score <= 20) message = "High Risk (~33%)";
    else message = "Very High Risk (~50%)";

    setResult(`Your total FINDRISC score is ${score} — ${message}`);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>🩺 Diabetes Risk Calculator (FINDRISC)</h2>

      <form style={styles.form}>
        <LabelSelect
          label="Age:"
          id="age"
          value={form.age}
          options={[
            { value: "0", label: "Under 45" },
            { value: "2", label: "45–54" },
            { value: "3", label: "55–64" },
            { value: "4", label: "Over 64" },
          ]}
          onChange={handleChange}
        />

        <LabelSelect
          label="BMI:"
          id="bmi"
          value={form.bmi}
          options={[
            { value: "0", label: "Less than 25" },
            { value: "1", label: "25–30" },
            { value: "3", label: "Over 30" },
          ]}
          onChange={handleChange}
        />

        <LabelSelect
          label="Waist circumference:"
          id="waist"
          value={form.waist}
          options={[
            { value: "0", label: "Low" },
            { value: "3", label: "Moderate" },
            { value: "4", label: "High" },
          ]}
          onChange={handleChange}
        />

        <LabelSelect
          label="Physical activity ≥30 min daily:"
          id="activity"
          value={form.activity}
          options={[
            { value: "0", label: "Yes" },
            { value: "2", label: "No" },
          ]}
          onChange={handleChange}
        />

        <LabelSelect
          label="Fruit/vegetable intake daily:"
          id="diet"
          value={form.diet}
          options={[
            { value: "0", label: "Yes" },
            { value: "1", label: "No" },
          ]}
          onChange={handleChange}
        />

        <LabelSelect
          label="Taking blood pressure medication:"
          id="bp"
          value={form.bp}
          options={[
            { value: "0", label: "No" },
            { value: "2", label: "Yes" },
          ]}
          onChange={handleChange}
        />

        <LabelSelect
          label="History of high blood glucose:"
          id="glucose"
          value={form.glucose}
          options={[
            { value: "0", label: "No" },
            { value: "5", label: "Yes" },
          ]}
          onChange={handleChange}
        />

        <LabelSelect
          label="Family history of diabetes:"
          id="family"
          value={form.family}
          options={[
            { value: "0", label: "None" },
            { value: "3", label: "2nd-degree relative" },
            { value: "5", label: "1st-degree relative" },
          ]}
          onChange={handleChange}
        />

        <button type="button" style={styles.button} onClick={calculateRisk}>
          Calculate Risk
        </button>
      </form>

      {result && <div style={styles.result}>{result}</div>}
    </div>
  );
};

// 🔹 Reusable component for label + select
const LabelSelect = ({ label, id, value, options, onChange }) => (
  <div style={{ marginTop: "10px" }}>
    <label htmlFor={id} style={styles.label}>
      {label}
    </label>
    <select id={id} value={value} onChange={onChange} style={styles.select}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    margin: "30px auto",
    maxWidth: "700px",
  },
  header: {
    color: "#0070C0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    display: "block",
    marginTop: "10px",
  },
  select: {
    width: "100%",
    padding: "5px",
    marginTop: "5px",
  },
  button: {
    marginTop: "20px",
    padding: "10px",
    background: "#0070C0",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  result: {
    marginTop: "20px",
    fontWeight: "bold",
    fontSize: "1.2em",
  },
};

export default FindriscCalculator;
