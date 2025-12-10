import React from "react";
import { Link } from "react-router-dom";
import "./App.css";

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-content">
        <h1>Faculty Workload Optimizer</h1>
        <p>
          This web application predicts and optimizes the weekly teaching workload of faculty members
          based on their experience, previous teaching, research, administrative duties, course difficulty, and more.
        </p>
        <p>
          Get intelligent suggestions, visualize workloads for all faculty, and make informed decisions to
          maintain balance and prevent burnout.
        </p>

        <div className="about-buttons">
          <Link to="/dashboard" className="btn primary">Get Started</Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
