import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CompressionPage from "./Compression";
import AboutPage from "./About";
import "./App.css"

function App() {
  return (
    <Router>
      <div className="container mt-4">
        <nav className="mb-4">
          <Link to="/" className="btn btn-outline-primary me-2">🏠 Home</Link>
          <Link to="/about" className="btn btn-outline-secondary">ℹ️  About</Link>
        </nav>

        <Routes>
          <Route path="/" element={<CompressionPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
