import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import "./App.css";

const BulkPrediction = ({ data, model, normalizationData, featureKeys }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data.length) return;
    if (!model || !normalizationData) return;

    const predictions = data.map((row) => {
      const arr = featureKeys.map((k) => {
        const mean = normalizationData.mean[k];
        const std = normalizationData.std[k];
        if (mean === undefined || std === undefined) return 0;

        return (parseFloat(row[k]) - mean) / std;
      });

      const val = model.pred(arr);

      return {
        name: row.faculty_name,
        pred: isNaN(val) ? 0 : Math.round(val),
      };
    });

    const ctx = chartRef.current.getContext("2d");
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: predictions.map((p) =>
          p.name.length > 15 ? p.name.slice(0, 12) + "..." : p.name
        ),
        datasets: [
          {
            label: "Predicted Workload (hrs/week)",
            data: predictions.map((p) => p.pred),
            backgroundColor: "rgba(178,148,243,0.8)",
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        scales: { x: { beginAtZero: true } },
      },
    });
  }, [data, model, normalizationData, featureKeys]);

  return <canvas ref={chartRef}></canvas>;
};

export default BulkPrediction;
