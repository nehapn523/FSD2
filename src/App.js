import React from "react";
import { Routes, Route } from "react-router-dom";
import AboutPage from "./AboutPage";
import Dashboard from "./Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AboutPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
