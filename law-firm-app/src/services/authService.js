import { db } from './localStorage';
import toast from 'react-hot-toast';

class AuthService {
  constructor() {
    this.usersCollection = 'users';
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const users = db.getAll(this.usersCollection);
      // Remove password hashes from response
      return users.map(user => {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const user = db.getById(this.usersCollection, userId);
      if (user) {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Update user status (activate/deactivate)
  async updateUserStatus(userId, active) {
    try {
      const updatedUser = db.update(this.usersCollection, userId, { active });
      
      if (updatedUser) {
        toast.success(`User ${active ? 'activated' : 'deactivated'} successfully`);
        return true;
      }
      throw new Error('User not found');
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
      throw error;
    }
  }

  // Update user role
  async updateUserRole(userId, role) {
    try {
      const updatedUser = db.update(this.usersCollection, userId, { role });
      
      if (updatedUser) {
        toast.success('User role updated successfully');
        return true;
      }
      throw new Error('User not found');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      throw error;
    }
  }

  // Delete user (admin only)
  async deleteUser(userId) {
    try {
      const success = db.delete(this.usersCollection, userId);
      if (success) {
        toast.success('User deleted successfully');
        return true;
      }
      throw new Error('Failed to delete user');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role) {
    try {
      const users = db.where(this.usersCollection, 'role', '==', role);
      return users.map(user => {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  // Search users by name or email
  async searchUsers(searchTerm) {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const users = await this.getAllUsers();
      
      const stats = {
        total: users.length,
        active: users.filter(user => user.active).length,
        inactive: users.filter(user => !user.active).length,
        admins: users.filter(user => user.role === 'admin').length,
        clients: users.filter(user => user.role === 'user').length
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Change user password (for demo purposes)
  async changePassword(userId, newPassword) {
    try {
      const passwordHash = db.hashPassword(newPassword);
      const updatedUser = db.update(this.usersCollection, userId, { passwordHash });
      
      if (updatedUser) {
        toast.success('Password updated successfully');
        return true;
      }
      throw new Error('User not found');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
      throw error;
    }
  }
}

export default new AuthService();