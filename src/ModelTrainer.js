import React from "react";
import { ridgeRegression, computeNorms, predictRidge } from "./mathHelper";

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

const targetKey = "actual_hours_assigned";

const ModelTrainer = ({ data, setModel, setNormalizationData }) => {
  const handleTrain = () => {
    if (!data.length) return alert("Load CSV first!");

    const normData = computeNorms(data, featureKeys);

    const X = data.map((row) =>
      featureKeys.map((k) =>
        (parseFloat(row[k]) - normData.mean[k]) / normData.std[k]
      )
    );

    const y = data.map((row) => parseFloat(row[targetKey]) || 0);

    const trained = ridgeRegression(X, y);

    console.log("===== TRAINING DEBUG =====");
    console.log("X[0]:", X[0]);
    console.log("Y[0]:", y[0]);
    console.log("Weights:", trained.w);
    console.log("Bias:", trained.b);
    console.log("Normalization Data:", normData);

    setModel({
      w: trained.w,
      b: trained.b,
      pred: (xi) => predictRidge(trained, xi),
    });

    setNormalizationData(normData);

    alert("Model trained successfully!");
  };

  return <button onClick={handleTrain}>Train Model</button>;
};

export default ModelTrainer;
