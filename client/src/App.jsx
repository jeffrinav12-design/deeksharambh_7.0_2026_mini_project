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
import GoogleAiStudioView from './views/GoogleAiStudioView.jsx';
import GmailAppView from './views/GmailAppView.jsx';

// Components
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import ScrollObserver from './components/ScrollObserver.jsx';

const defaultFallbackBatches = [
  {
    _id: 'batch_7.0_2026',
    batchYearRange: '2026-2029',
    academicYear: '2026-2027',
    deeksharambhVersion: '7.0',
    departmentName: 'Computer Science & Digital Applications',
    startDate: '2026-08-01',
    endDate: '2026-08-15',
    hodName: 'Dr. R. Sasikala',
    principalName: 'Dr. V. Radhika',
    className: 'I B.Sc. CSDA',
    totalStudents: 50
  },
  {
    _id: 'batch_6.0_2025',
    batchYearRange: '2025-2028',
    academicYear: '2025-2026',
    deeksharambhVersion: '6.0',
    departmentName: 'Computer Science & Digital Applications',
    startDate: '2025-06-26',
    endDate: '2025-07-03',
    hodName: 'Dr. R. Sasikala',
    principalName: 'Dr. V. Radhika',
    className: 'I B.Sc. CSDA',
    totalStudents: 43
  },
  {
    _id: 'batch_5.0_2024',
    batchYearRange: '2024-2027',
    academicYear: '2024-2025',
    deeksharambhVersion: '5.0',
    departmentName: 'Computer Science & Digital Applications',
    startDate: '2024-07-02',
    endDate: '2024-07-09',
    hodName: 'Dr. M. Lingaraj',
    principalName: 'Dr. V. Radhika',
    className: 'I B.Sc. CSDA',
    totalStudents: 47
  }
];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [batches, setBatches] = useState(defaultFallbackBatches);
  const [activeBatch, setActiveBatch] = useState(defaultFallbackBatches[0]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Configure Axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchAllBatches();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchAllBatches = async () => {
    try {
      const res = await axios.get('/api/batches');
      if (res.data && res.data.length > 0) {
        setBatches(res.data);
        const storedBatchId = localStorage.getItem('activeBatchId');
        const found = res.data.find(b => b._id === storedBatchId);
        setActiveBatch(found || res.data[0]);
      }
    } catch (err) {
      console.warn('Using default batch fallback:', err.message);
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

  const handleLoginSuccess = (newToken, newRole, newName, newEmail, newRegisterNo, newDepartment) => {
    const emailToSave = newEmail || 'jeffrinavcsda2024@sankara.ac.in';
    const regToSave = newRegisterNo || '24101';
    const deptToSave = newDepartment || 'Computer Science & Digital Applications';

    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    localStorage.setItem('userName', newName);
    localStorage.setItem('userEmail', emailToSave);
    localStorage.setItem('registerNo', regToSave);
    localStorage.setItem('department', deptToSave);

    const profile = {
      name: newName,
      email: emailToSave,
      registerNo: regToSave,
      department: deptToSave,
      role: newRole
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));

    setToken(newToken);
    setRole(newRole);
    setUserName(newName);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('registerNo');
    localStorage.removeItem('department');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('activeBatchId');
    setToken('');
    setRole('');
    setUserName('');
    setActiveBatch(defaultFallbackBatches[0]);
    setBatches(defaultFallbackBatches);
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
              <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden relative">
                <ScrollObserver activeBatch={activeBatch} batches={batches} onSelectBatch={handleSelectBatch} />
                <Sidebar 
                  role={role} 
                  onLogout={handleLogout} 
                  isOpen={mobileSidebarOpen} 
                  onClose={() => setMobileSidebarOpen(false)} 
                />
                <Header 
                  userName={userName} 
                  role={role} 
                  activeBatch={activeBatch} 
                  batches={batches} 
                  onSelectBatch={handleSelectBatch} 
                  onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
                />
                
                {/* Responsive Content main area */}
                <main className="pl-0 lg:pl-64 pt-20 p-3 sm:p-6 lg:p-8 min-h-screen bg-white max-w-full overflow-x-hidden">
                  <Routes>
                    <Route 
                      path="/dashboard" 
                      element={role === 'student' ? <Navigate to="/assessment" /> : <Dashboard activeBatch={activeBatch} setActiveBatch={handleSelectBatch} />} 
                    />
                    <Route 
                      path="/gmail" 
                      element={<GmailAppView role={role} />} 
                    />
                    <Route 
                      path="/ai-studio" 
                      element={role === 'student' ? <Navigate to="/assessment" /> : <GoogleAiStudioView activeBatch={activeBatch} role={role} />} 
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
                      element={role === 'student' ? <StudentAssessmentPortal activeBatch={activeBatch} batches={batches} onSelectBatch={handleSelectBatch} currentRole={role} /> : <AssessmentModule activeBatch={activeBatch} role={role} />} 
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

