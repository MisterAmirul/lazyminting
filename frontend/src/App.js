// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Mint from "./pages/Mint";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Mint />} />
      </Routes>
    </Router>
  );
}
