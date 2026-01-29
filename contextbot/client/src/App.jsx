import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CreateProject from './pages/CreateProject';
import ProjectsList from './pages/ProjectsList';
import EditProject from './pages/EditProject';
import WidgetConfig from './pages/WidgetConfig';

// Placeholder Pages
const Activity = () => <div className="p-8"><h2 className="text-2xl font-bold">Activity Log</h2><p className="text-gray-500">Real-time chat monitoring coming soon.</p></div>;

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main Layout with Sidebar
const MainLayout = ({ children }) => (
  <div className="flex bg-gray-100 min-h-screen font-sans">
    <Sidebar />
    <main className="flex-1 overflow-auto">
      {children}
    </main>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/create-project" element={
        <ProtectedRoute>
          <MainLayout>
            <CreateProject />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/projects" element={
        <ProtectedRoute>
          <MainLayout>
            <ProjectsList />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/edit-project/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <EditProject />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/leads" element={
        <ProtectedRoute>
          <MainLayout>
            <Leads />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/activity" element={
        <ProtectedRoute>
          <MainLayout>
            <Activity />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/configure-widget/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <WidgetConfig />
          </MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
