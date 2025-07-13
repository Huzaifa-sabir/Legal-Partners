import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import HomePage from './components/Home/HomePage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PoliciesList from './components/Policies/PoliciesList';
import ClaimForm from './components/Claims/ClaimForm';
import ClaimsList from './components/Claims/ClaimsList';
import UserManagement from './components/Admin/UserManagement';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';

// Styles
import './styles/App.css';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Dashboard Layout Component
const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <Header />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Public Layout Component
const PublicLayout = ({ children }) => {
  return (
    <div className="app">
      {children}
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = () => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <h1>Welcome back, {currentUser?.displayName || 'User'}!</h1>
        <p className="text-gray-600">
          {isAdmin() ? 'Admin Dashboard' : 'Client Dashboard'}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">24</div>
          <div className="stat-label">Total Policies</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">12</div>
          <div className="stat-label">Active Claims</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">8</div>
          <div className="stat-label">Pending Reviews</div>
        </div>
        
        {isAdmin() && (
          <div className="stat-card">
            <div className="stat-value">156</div>
            <div className="stat-label">Total Users</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div className="card-body">
            <p>No recent activity to display.</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-3">
              <Link to="/policies" className="btn btn-primary">
                View Policies
              </Link>
              <Link to="/claims/new" className="btn btn-secondary">
                File New Claim
              </Link>
              {isAdmin() && (
                <Link to="/admin/users" className="btn btn-secondary">
                  Manage Users
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          } 
        />
        
        <Route 
          path="/login" 
          element={
            !isAuthenticated() ? (
              <PublicLayout>
                <Login />
              </PublicLayout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        
        <Route 
          path="/register" 
          element={
            !isAuthenticated() ? (
              <PublicLayout>
                <Register />
              </PublicLayout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        {/* Protected Routes - Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardHome />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Policies Routes */}
        <Route 
          path="/policies" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PoliciesList />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Claims Routes */}
        <Route 
          path="/claims" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ClaimsList />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/claims/new" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ClaimForm />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute adminOnly={true}>
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Catch all route */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </div>
  );
}

export default App;