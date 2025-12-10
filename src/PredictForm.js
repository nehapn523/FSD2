import React, { useState } from "react";
import "./App.css";

// These are the EXACT feature keys used to train the model.
// DO NOT include faculty_name here.
const featureKeys = [
  "faculty_experience_years",
  "faculty_rank",
  "teaching_load_previous_sem",
  "research_load",
  "admin_load",
  "course_difficulty",
  "course_credit_hours",
  "num_students",
  "course_level",
];

const PredictForm = ({ model, normalizationData, onPredict }) => {
  const [form, setForm] = useState({
    faculty_name: "",
    faculty_experience_years: "",
    faculty_rank: 0,
    teaching_load_previous_sem: "",
    research_load: "",
    admin_load: "",
    course_difficulty: "",
    course_credit_hours: "",
    num_students: "",
    course_level: 0,
  });

  // Handle field updates
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "faculty_name"
          ? value
          : value === "" // empty numeric field → keep empty, not 0
          ? ""
          : parseFloat(value),
    }));
  };

  // Predict workload
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!model || !normalizationData)
      return alert("Train the model first!");

    // Validate empty numeric fields
    for (let key of featureKeys) {
      if (form[key] === "" || form[key] === null) {
        alert(`Please fill: ${key.replace(/_/g, " ")}`);
        return;
      }
    }

    try {
      // Normalize inputs exactly like training
      const normalizedInput = featureKeys.map((k) => {
        const mean = normalizationData.mean[k];
        const std = normalizationData.std[k];
        return (form[k] - mean) / std;
      });

      console.log("Normalized Input:", normalizedInput);

      // Prediction
      const predHours = model.pred(normalizedInput);
      const final = Math.round(predHours);

      // Suggestion message
      let tip = "";
      if (final > 12) {
        tip =
          "⚠️ High workload detected. Consider redistributing tasks or taking rest.";
      } else if (final < 8) {
        tip =
          "✅ Light workload. You may take on more responsibilities if needed.";
      } else {
        tip = "👍 Balanced workload. You are within a healthy working range.";
      }

      // Pass results to parent
      onPredict({
        pred: final,
        name: form.faculty_name,
        tip: tip,
      });

    } catch (err) {
      console.error("Prediction failed:", err);

      onPredict({
        pred: 0,
        name: form.faculty_name,
        tip: "Prediction failed due to an internal error.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="predict-form">

      {/* Faculty Name */}
      <div className="field">
        <label>Faculty Name</label>
        <input
          type="text"
          name="faculty_name"
          value={form.faculty_name}
          onChange={handleChange}
          required
          placeholder="Enter faculty name"
        />
      </div>

      {/* Numeric + Dropdown Inputs */}
      {featureKeys.map((key) => (
        <div key={key} className="field">
          <label>{key.replace(/_/g, " ")}</label>

          {/* Dropdown fields */}
          {key === "faculty_rank" ? (
            <select name={key} value={form[key]} onChange={handleChange}>
              <option value={0}>Junior</option>
              <option value={1}>Associate</option>
              <option value={2}>Full Professor</option>
            </select>
          ) : key === "course_level" ? (
            <select name={key} value={form[key]} onChange={handleChange}>
              <option value={0}>Undergraduate</option>
              <option value={1}>Graduate</option>
            </select>
          ) : (
            <input
              type="number"
              name={key}
              value={form[key]}
              onChange={handleChange}
              placeholder={`Enter ${key.replace(/_/g, " ")}`}
              required
            />
          )}
        </div>
      ))}

      <button type="submit" className="btn-primary">
        Predict Workload
      </button>
    </form>
  );
};

export default PredictForm;
