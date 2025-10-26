import React, { useState } from "react";
import "./App.css";
import MenstrualCycleCalculator from "./ms";
import DietPrescriptionGenerator from "./dp";
import FindriscCalculator from "./DRS";
import CancerRiskCalculator from "./CRA";
import ASCVDCalculator from "./ASCVD";
import WellnessAdvancedROIDashboard from "./EW";

function App() {
  const [activeTab, setActiveTab] = useState("ms");

  const renderComponent = () => {
    switch (activeTab) {
      case "ms":
        return <MenstrualCycleCalculator />;
      case "dp":
        return <DietPrescriptionGenerator />;
      case "drs":
        return <FindriscCalculator />;
      case "cra":
        return <CancerRiskCalculator />;
      case "ascvd":
        return <ASCVDCalculator />;
      case "ew":
        return <WellnessAdvancedROIDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <nav className="tabs">
        <button
          className={activeTab === "ms" ? "tab active" : "tab"}
          onClick={() => setActiveTab("ms")}
        >
          Menstrual Cycle
        </button>
        <button
          className={activeTab === "dp" ? "tab active" : "tab"}
          onClick={() => setActiveTab("dp")}
        >
          Diet Prescription
        </button>
        <button
          className={activeTab === "drs" ? "tab active" : "tab"}
          onClick={() => setActiveTab("drs")}
        >
          FINDRISC
        </button>
        <button
          className={activeTab === "cra" ? "tab active" : "tab"}
          onClick={() => setActiveTab("cra")}
        >
          Cancer Risk
        </button>
        <button
          className={activeTab === "ascvd" ? "tab active" : "tab"}
          onClick={() => setActiveTab("ascvd")}
        >
          ASCVD
        </button>
        <button
          className={activeTab === "ew" ? "tab active" : "tab"}
          onClick={() => setActiveTab("ew")}
        >
          Employee Wellness ROI
        </button>
      </nav>

      <div className="component-container">{renderComponent()}</div>
    </div>
  );
}

export default App;
