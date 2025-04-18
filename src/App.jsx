import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Verify from './pages/Verify';
import GoalForm from './pages/GoalForm';
import Goals from './pages/Goals';
import Dashboard from './pages/Dashboard'
import Feedback from './pages/Feedback';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import CalendarPage from './pages/CalendarPage';
import Changelog from './pages/Changelog';
import SetUsername from './pages/SetUsername';
import PublicGoal from './pages/PublicGoal';
import PublicProfile from './pages/PublicProfile';
import Projects from './pages/Projects'
import ProjectForm from './pages/ProjectForm'
import ProjectView from './pages/ProjectView'
import Backlog from './pages/Backlog'
import FAQ from './pages/FAQ'
import PrivacyPolicy from './pages/PrivacyPolicy';

function PrivateRoute({ children, proOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
      <>
        <Navbar />
        <Routes>
          <Route path="/projects/" element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          } />
          <Route path="/projects/new" element={
            <PrivateRoute>
              <ProjectForm />
            </PrivateRoute>
            } />
          <Route path="/projects/:projectId/edit" element={
            <PrivateRoute>
              <ProjectForm />
            </PrivateRoute>
            } />
          <Route path="/goals/form" element={
            <PrivateRoute>
              <GoalForm />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/goals" element={
            <PrivateRoute>
              <Goals />
            </PrivateRoute>
          } />
          <Route path="/feedback" element={
            <PrivateRoute>
              <Feedback />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />
          <Route path="/calendar" element={
            <PrivateRoute>
              <CalendarPage />
            </PrivateRoute>
          } />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/setup-username" element={
            <PrivateRoute>
              <SetUsername />
            </PrivateRoute>
          } />
          <Route path="/projects/:projectId" element={
          <PrivateRoute>
            <ProjectView />
          </PrivateRoute>
          } />
          <Route path="/backlog" element={
          <PrivateRoute>
            <Backlog />
          </PrivateRoute>
          } />

          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/verify" element={<Verify />} />
          <Route path="/user/:username/:date" element={<PublicGoal />} />
          <Route path="/user/:username" element={<PublicProfile />} />

          {/* Catch All */}
        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </>
  );
}

export default App;
