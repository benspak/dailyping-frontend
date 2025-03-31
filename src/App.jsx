import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Verify from './pages/Verify';
import Respond from './pages/Respond';
import Dashboard from './pages/Dashboard';
import ProSettings from './pages/ProSettings';
import Feedback from './pages/Feedback';
import Navbar from './components/Navbar';
import RequirePro from './components/RequirePro';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/verify" element={<Verify />} />
        <Route path="/respond" element={<Respond />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pro-settings" element={<RequirePro><ProSettings /></RequirePro>} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
