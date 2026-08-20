import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Views
import Login from './views/Login.jsx';
import Dashboard from './views/Dashboard.jsx';
import ArchiveViewer from './views/ArchiveViewer.jsx';
import BatchSetup from './views/BatchSetup.jsx';
import SyllabusManager from './views/SyllabusManager.jsx';
import ScheduleManager from './views/ScheduleManager.jsx';
import StudentMaster from './views/StudentMaster.jsx';
import AttendanceModule from './views/AttendanceModule.jsx';
import AssessmentModule from './views/AssessmentModule.jsx';
import StudentAssessmentPortal from './views/StudentAssessmentPortal.jsx';
import ResultAnalysis from './views/ResultAnalysis.jsx';
import SipReportGenerator from './views/SipReportGenerator.jsx';
import PhotoGallery from './views/PhotoGallery.jsx';
import DocumentTemplateManager from './views/DocumentTemplateManager.jsx';

// Components
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [batches, setBatches] = useState([]);
  const [activeBatch, setActiveBatch] = useState(null);

  // Configure Axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchAllBatches();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const defaultFallbackBatch = {
    _id: 'default_batch_2026',
    academicYear: '2025-2026',
    departmentName: 'Computer Science & Digital Applications',
    deeksharambhVersion: '7.0',
    startDate: '2026-08-01',
    endDate: '2026-08-15',
    targetGroup: 'I Year B.Sc CS / BCA / IT Students',
    orientationObjectives: 'Bridging fundamental computing concepts, programming basics, ethics, and campus culture.'
  };

  const fetchAllBatches = async () => {
    try {
      const res = await axios.get('/api/batches');
      if (res.data && res.data.length > 0) {
        setBatches(res.data);
        const storedBatchId = localStorage.getItem('activeBatchId');
        const found = res.data.find(b => b._id === storedBatchId);
        setActiveBatch(found || res.data[0]);
      } else {
        setBatches([defaultFallbackBatch]);
        setActiveBatch(defaultFallbackBatch);
      }
    } catch (err) {
      console.warn('Using default batch fallback:', err.message);
      setBatches([defaultFallbackBatch]);
      setActiveBatch(defaultFallbackBatch);
    }
  };

  const handleSelectBatch = (batch) => {
    setActiveBatch(batch);
    if (batch) {
      localStorage.setItem('activeBatchId', batch._id);
    } else {
      localStorage.removeItem('activeBatchId');
    }
  };

  const handleLoginSuccess = (newToken, newRole, newName) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    localStorage.setItem('userName', newName);
    setToken(newToken);
    setRole(newRole);
    setUserName(newName);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('activeBatchId');
    setToken('');
    setRole('');
    setUserName('');
    setActiveBatch(null);
    setBatches([]);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={token ? (role === 'student' ? <Navigate to="/assessment" /> : <Navigate to="/dashboard" />) : <Login onLoginSuccess={handleLoginSuccess} />} 
        />
        
        {/* Protected Routes Layout */}
        <Route 
          path="/*" 
          element={
            !token ? (
              <Navigate to="/login" />
            ) : (
              <div className="min-h-screen bg-slate-50 text-slate-900">
                <Sidebar role={role} onLogout={handleLogout} />
                <Header userName={userName} role={role} activeBatch={activeBatch} batches={batches} onSelectBatch={handleSelectBatch} />
                
                {/* Content main area, matching sidebar spacing */}
                <main className="pl-64 pt-20 p-8 min-h-screen">
                  <Routes>
                    <Route 
                      path="/dashboard" 
                      element={role === 'student' ? <Navigate to="/assessment" /> : <Dashboard activeBatch={activeBatch} setActiveBatch={handleSelectBatch} />} 
                    />
                    <Route 
                      path="/archive" 
                      element={<ArchiveViewer activeBatch={activeBatch} />} 
                    />
                    <Route 
                      path="/setup" 
                      element={
                        role === 'admin' || role === 'faculty' ? (
                          <BatchSetup activeBatch={activeBatch} setActiveBatch={handleSelectBatch} />
                        ) : (
                          <Navigate to="/dashboard" />
                        )
                      } 
                    />
                    <Route 
                      path="/templates" 
                      element={<DocumentTemplateManager activeBatch={activeBatch} />} 
                    />
                    <Route 
                      path="/syllabus" 
                      element={<SyllabusManager activeBatch={activeBatch} role={role} />} 
                    />
                    <Route 
                      path="/schedule" 
                      element={<ScheduleManager activeBatch={activeBatch} role={role} />} 
                    />
                    <Route 
                      path="/students" 
                      element={<StudentMaster activeBatch={activeBatch} role={role} />} 
                    />
                    <Route 
                      path="/attendance" 
                      element={
                        role !== 'viewer' && role !== 'student' ? (
                          <AttendanceModule activeBatch={activeBatch} role={role} />
                        ) : (
                          <Navigate to="/dashboard" />
                        )
                      } 
                    />
                    <Route 
                      path="/assessment" 
                      element={role === 'student' ? <StudentAssessmentPortal activeBatch={activeBatch} currentRole={role} /> : <AssessmentModule activeBatch={activeBatch} role={role} />} 
                    />
                    <Route 
                      path="/results" 
                      element={<ResultAnalysis activeBatch={activeBatch} role={role} />} 
                    />
                    <Route 
                      path="/sip-report" 
                      element={<SipReportGenerator activeBatch={activeBatch} role={role} />} 
                    />
                    <Route 
                      path="/photos" 
                      element={
                        role !== 'viewer' && role !== 'student' ? (
                          <PhotoGallery activeBatch={activeBatch} role={role} />
                        ) : (
                          <Navigate to="/dashboard" />
                        )
                      } 
                    />
                    {/* Default redirect */}
                    <Route path="*" element={role === 'student' ? <Navigate to="/assessment" /> : <Navigate to="/dashboard" />} />
                  </Routes>
                </main>
              </div>
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
