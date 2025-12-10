import React, { useState, useEffect } from "react";
import ModelTrainer from "./ModelTrainer";
import PredictForm from "./PredictForm";
import BulkPrediction from "./BulkPrediction";
import logo from "./assets/logo.png";
import "./App.css";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [model, setModel] = useState(null);
  const [normalizationData, setNormalizationData] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // ---------------------------
  // AUTO-LOAD CSV FROM PUBLIC FOLDER
  // ---------------------------
  useEffect(() => {
    fetch("/data/faculty_workload.csv")
      .then((res) => res.text())
      .then((text) => {
        console.log("Auto-loading CSV...");
        handleCSVUpload(text);
      })
      .catch((err) => console.error("CSV auto-load error:", err));
  }, []);

  // ---------------------------
  // CSV UPLOAD HANDLER (AUTO + MANUAL)
  // ---------------------------
  const handleCSVUpload = (text) => {
    const lines = text.trim().split("\n");

    const delimiter = lines[0].includes(",") ? "," : /\s+/;
    const headers = lines[0].split(delimiter).map((h) => h.trim());

    const parsed = lines.slice(1).map((line) => {
      const parts = line.split(delimiter);
      const obj = {};

      headers.forEach((h, i) => {
        const header = h.trim();
        const rawValue = (parts[i] || "").trim();

        if (header === "faculty_name") {
          obj[header] = rawValue;
        } else {
          const val = parseFloat(rawValue);
          obj[header] = isNaN(val) ? 0 : val;
        }
      });

      return obj;
    });

    console.log("Parsed CSV Data:", parsed);
    setData(parsed);
  };

  // ---------------------------
  // HANDLE SINGLE PREDICTION
  // ---------------------------
  const handlePrediction = (predObj) => {
    const { pred } = predObj;
    let tip = "";

    if (pred > 20) {
      tip = "⚠️ High workload. Consider redistributing tasks.";
    } else if (pred < 10) {
      tip = "✅ Light workload. You can take more responsibilities.";
    } else {
      tip = "👍 Balanced workload.";
    }

    setPrediction({ ...predObj, suggestion: tip });
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <img src={logo} alt="Logo" />
          <h1>Faculty Workload Optimizer</h1>
        </div>

        {/* BACK TO HOME BUTTON */}
        <button className="logout-btn">
          <a href="/" style={{ textDecoration: "none", color: "white" }}>Back to Home</a>
        </button>
      </header>

      <main>
        {/* CSV Upload Section */}
        <section className="upload-section card">
          <h2>Upload Faculty Data (Optional)</h2>
          <p>Default dataset is already loaded. You may upload a new CSV if needed.</p>

          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const reader = new FileReader();
              reader.onload = (evt) => handleCSVUpload(evt.target.result);
              reader.readAsText(e.target.files[0]);
            }}
          />
        </section>

        {/* Train Model Section */}
        <section className="train-section card">
          <h2>Train Model</h2>
          <ModelTrainer
            data={data}
            setModel={setModel}
            setNormalizationData={setNormalizationData}
          />
        </section>

        {/* Single Prediction Section */}
        <section className="predict-section card">
          <h2>Predict Workload for a Faculty Member</h2>

          <PredictForm
            model={model}
            normalizationData={normalizationData}
            onPredict={handlePrediction}
          />

          {prediction && (
            <div className="prediction-result card">
              <h3>
                Suggested workload for <strong>{prediction.name}</strong>:{" "}
                {prediction.pred} hrs/week
              </h3>
              <p><strong>Recommendation:</strong> {prediction.suggestion}</p>
            </div>
          )}
        </section>

        {/* Bulk Chart Section */}
        <section className="chart-section card">
          <h2>All Faculty Predicted Workloads</h2>

          <BulkPrediction
            data={data}
            model={model}
            normalizationData={normalizationData}
            featureKeys={[
              "faculty_experience_years",
              "faculty_rank",
              "teaching_load_previous_sem",
              "research_load",
              "admin_load",
              "course_difficulty",
              "course_credit_hours",
              "num_students",
              "course_level",
            ]}
          />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
