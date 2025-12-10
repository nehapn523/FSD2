import React, { useState } from "react";
import { Link } from "react-router-dom";
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

  // CSV UPLOAD HANDLER
  const handleCSVUpload = (text) => {
    const lines = text.trim().split("\n");

    const detectDelimiter = (line) => {
      if (line.includes(",")) return ",";
      if (line.includes("\t")) return "\t";
      if (line.includes(";")) return ";";
      return /\s+/;
    };

    const delimiter = detectDelimiter(lines[0]);
    const rawHeaders = lines[0].split(delimiter);
    const headers = rawHeaders.map((h) => h.trim());

    const parsed = lines.slice(1).map((line) => {
      const parts = line.split(delimiter);
      const obj = {};

      headers.forEach((h, i) => {
        const header = h.trim();
        const raw = parts[i] ? parts[i].trim() : "0";

        if (header === "faculty_name") obj[header] = raw;
        else obj[header] = isNaN(parseFloat(raw)) ? 0 : parseFloat(raw);
      });

      return obj;
    });

    setData(parsed);
    alert("CSV loaded successfully!");
  };

  // PREDICTION HANDLER
  const handlePrediction = (predObj) => {
    const { pred } = predObj;

    let tip = "";
    if (pred > 20) tip = "⚠️ High workload. Consider redistributing tasks.";
    else if (pred < 10) tip = "✅ Light workload. Can handle more duties.";
    else tip = "👍 Balanced workload. Maintain this schedule.";

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
        <Link to="/" className="logout-btn">
          Back to Home
        </Link>
      </header>

      <main>
        {/* CSV Upload */}
        <section className="upload-section card">
          <h2>Upload Faculty Data</h2>
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

        {/* Training */}
        <section className="train-section card">
          <h2>Train Model</h2>
          <ModelTrainer
            data={data}
            setModel={setModel}
            setNormalizationData={setNormalizationData}
          />
        </section>

        {/* Predict */}
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
              <p>
                <strong>Recommendation:</strong> {prediction.suggestion}
              </p>
            </div>
          )}
        </section>

        {/* Bulk Prediction */}
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
