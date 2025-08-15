// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/auth";
import Mint from "./pages/Mint";
import Dashboard from "./pages/dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/mint" element={<Mint />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;