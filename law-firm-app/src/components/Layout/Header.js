import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import claimsService from '../../services/claimsService';

const Header = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentUser) {
        try {
          const userNotifications = await claimsService.getNotificationsByUserId(currentUser.uid);
          setNotifications(userNotifications);
          setUnreadCount(userNotifications.filter(n => !n.read).length);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };

    fetchNotifications();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await claimsService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="dashboard-header">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Page Title */}
        <div>
          <h1 className="header-title">Dashboard</h1>
        </div>
      </div>

      {/* Right Side - Notifications and Profile */}
      <div className="header-controls">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="notification-bell"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="notifications-dropdown slide-down">
              <div className="notifications-header">
                <h3 className="text-lg font-semibold text-gray-900 m-0">Notifications</h3>
              </div>
              
              <div className="notifications-list custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="notification-title">
                            {notification.title}
                          </p>
                          <p className="notification-message">
                            {notification.message}
                          </p>
                          <p className="notification-time">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="notification-dot"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="user-menu">
          <button
            onClick={toggleProfileMenu}
            className="user-menu-trigger"
          >
            <div className="user-avatar">
              <User className="w-4 h-4" />
            </div>
            <div className="user-info">
              <p className="user-name">
                {currentUser?.displayName || 'User'}
              </p>
              <p className="user-role">
                {isAdmin() ? 'Administrator' : 'Client'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="dropdown-menu slide-down">
              <div className="dropdown-header">
                <p className="text-sm font-medium text-gray-900 m-0">
                  {currentUser?.displayName || 'User'}
                </p>
                <p className="text-sm text-gray-500 m-0">
                  {currentUser?.email}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  isAdmin() 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {isAdmin() ? 'Administrator' : 'Client'}
                </span>
              </div>

              <div className="dropdown-section">
                <button className="dropdown-item">
                  <User className="w-4 h-4" />
                  <span>Profile Settings</span>
                </button>
                
                <button className="dropdown-item">
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </button>
              </div>

              <div className="dropdown-divider"></div>

              <div className="dropdown-section">
                <button
                  onClick={handleLogout}
                  className="dropdown-item danger"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="sidebar-overlay" onClick={toggleMobileMenu}>
          <div className="fixed inset-y-0 left-0 w-64 bg-slate-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Mobile menu content would go here */}
            <div className="p-4">
              <h2 className="text-white text-lg font-semibold">Menu</h2>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showProfileMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;