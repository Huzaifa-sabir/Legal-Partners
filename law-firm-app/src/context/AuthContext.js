import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../services/localStorage';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register new user
  const signup = async (email, password, displayName, role = 'user') => {
    try {
      // Check if user already exists
      const existingUsers = db.where('users', 'email', '==', email);
      if (existingUsers.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const userData = {
        uid: db.generateId(),
        email: email,
        displayName: displayName,
        role: role,
        active: true,
        passwordHash: db.hashPassword(password)
      };

      const user = db.create('users', userData);
      
      // Set current user (remove password hash from user object)
      const { passwordHash, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      setUserRole(role);
      db.setCurrentUser(userWithoutPassword);

      toast.success('Account created successfully!');
      return userWithoutPassword;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      // Find user by email
      const users = db.where('users', 'email', '==', email);
      if (users.length === 0) {
        throw new Error('No user found with this email');
      }

      const user = users[0];
      
      // Verify password
      if (!db.verifyPassword(password, user.passwordHash)) {
        throw new Error('Invalid password');
      }

      // Check if user is active
      if (!user.active) {
        throw new Error('Your account has been disabled. Please contact support.');
      }

      // Set current user (remove password hash)
      const { passwordHash, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      setUserRole(user.role);
      db.setCurrentUser(userWithoutPassword);
      
      toast.success('Welcome back!');
      return userWithoutPassword;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setCurrentUser(null);
      setUserRole(null);
      db.clearCurrentUser();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return userRole === 'admin';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Update user profile
  const updateUserProfile = async (data) => {
    try {
      if (currentUser) {
        const updatedUser = db.update('users', currentUser.id, data);
        
        if (updatedUser) {
          const { passwordHash, ...userWithoutPassword } = updatedUser;
          setCurrentUser(userWithoutPassword);
          db.setCurrentUser(userWithoutPassword);
          toast.success('Profile updated successfully');
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  // Get user role
  const getUserRole = (uid) => {
    const user = db.getById('users', uid);
    return user ? user.role : 'user';
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const savedUser = db.getCurrentUser();
      if (savedUser) {
        // Verify user still exists and is active
        const user = db.getById('users', savedUser.id);
        if (user && user.active) {
          setCurrentUser(savedUser);
          setUserRole(savedUser.role);
        } else {
          // User no longer exists or is inactive
          db.clearCurrentUser();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    logout,
    isAdmin,
    isAuthenticated,
    updateUserProfile,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};