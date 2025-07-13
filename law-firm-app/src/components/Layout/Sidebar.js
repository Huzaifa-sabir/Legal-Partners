import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Scale,
  Home,
  FileText,
  ClipboardList,
  Users,
  Settings,
  PlusCircle,
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Home className="sidebar-menu-icon" />,
      path: '/dashboard',
      roles: ['user', 'admin']
    },
    {
      title: 'Policies',
      icon: <FileText className="sidebar-menu-icon" />,
      path: '/policies',
      roles: ['user', 'admin']
    },
    {
      title: 'My Claims',
      icon: <ClipboardList className="sidebar-menu-icon" />,
      path: '/claims',
      roles: ['user', 'admin']
    },
    {
      title: 'File New Claim',
      icon: <PlusCircle className="sidebar-menu-icon" />,
      path: '/claims/new',
      roles: ['user', 'admin']
    }
  ];

  const adminMenuItems = [
    {
      title: 'User Management',
      icon: <Users className="sidebar-menu-icon" />,
      path: '/admin/users',
      roles: ['admin']
    },
    {
      title: 'Analytics',
      icon: <BarChart3 className="sidebar-menu-icon" />,
      path: '/admin/analytics',
      roles: ['admin']
    },
    {
      title: 'Settings',
      icon: <Settings className="sidebar-menu-icon" />,
      path: '/admin/settings',
      roles: ['admin']
    }
  ];

  const renderMenuItem = (item) => {
    const active = isActive(item.path);
    
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`sidebar-menu-item ${active ? 'active' : ''}`}
      >
        {item.icon}
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <div className="dashboard-sidebar custom-scrollbar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <Link to="/dashboard" className="flex items-center gap-3 text-white text-decoration-none">
          <Scale className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-white m-0">Legal Partners</h1>
            <p className="text-sm text-slate-300 m-0">Management Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Main Menu</h3>
          <div className="sidebar-menu">
            {menuItems.map(renderMenuItem)}
          </div>
        </div>

        {/* Admin Menu Items */}
        {isAdmin() && (
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Administration</h3>
            <div className="sidebar-menu">
              {adminMenuItems.map(renderMenuItem)}
            </div>
          </div>
        )}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-slate-600">
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Quick Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Active Policies</span>
              <span className="text-white font-medium">24</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Pending Claims</span>
              <span className="text-yellow-400 font-medium">8</span>
            </div>
            {isAdmin() && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Users</span>
                <span className="text-blue-400 font-medium">156</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="p-4 border-t border-slate-600">
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-2">Need Help?</p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition-colors">
            Contact Support
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-600">
        <div className="text-center text-xs text-slate-400">
          <p>&copy; 2025 Legal Partners</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;