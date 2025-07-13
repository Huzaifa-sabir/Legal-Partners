import { db } from './localStorage';
import toast from 'react-hot-toast';

class ClaimsService {
  constructor() {
    this.claimsCollection = 'claims';
    this.notificationsCollection = 'notifications';
  }

  // Create new claim
  async createClaim(claimData, files = []) {
    try {
      // Upload files if any
      const uploadedFiles = [];
      if (files.length > 0) {
        for (const file of files) {
          try {
            const uploadedFile = await db.uploadFile(file);
            uploadedFiles.push(uploadedFile);
          } catch (fileError) {
            console.warn('Error uploading file:', fileError);
            toast.error(`Failed to upload ${file.name}`);
          }
        }
      }

      const newClaim = {
        ...claimData,
        status: 'pending',
        documents: uploadedFiles
      };

      const claim = db.create(this.claimsCollection, newClaim);
      
      // Create notification for admin
      await this.createNotification({
        userId: 'admin',
        type: 'new_claim',
        title: 'New Claim Submitted',
        message: `New claim submitted by ${claimData.clientName}`,
        claimId: claim.id,
        read: false
      });

      toast.success('Claim submitted successfully');
      
      return claim;
    } catch (error) {
      console.error('Error creating claim:', error);
      toast.error('Failed to submit claim');
      throw error;
    }
  }

  // Get all claims (admin only)
  async getAllClaims() {
    try {
      const claims = db.getAll(this.claimsCollection);
      return claims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to fetch claims');
      throw error;
    }
  }

  // Get claims by user ID
  async getClaimsByUserId(userId) {
    try {
      const claims = db.where(this.claimsCollection, 'userId', '==', userId);
      return claims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching user claims:', error);
      throw error;
    }
  }

  // Get claim by ID
  async getClaimById(claimId) {
    try {
      const claim = db.getById(this.claimsCollection, claimId);
      return claim;
    } catch (error) {
      console.error('Error fetching claim:', error);
      throw error;
    }
  }

  // Update claim status (admin only)
  async updateClaimStatus(claimId, status, adminNotes = '') {
    try {
      const claim = await this.getClaimById(claimId);
      if (!claim) {
        throw new Error('Claim not found');
      }

      const updatedClaim = db.update(this.claimsCollection, claimId, {
        status: status,
        adminNotes: adminNotes,
        reviewedAt: new Date().toISOString()
      });

      if (updatedClaim) {
        // Create notification for user
        await this.createNotification({
          userId: claim.userId,
          type: 'claim_status_update',
          title: 'Claim Status Updated',
          message: `Your claim has been ${status}`,
          claimId: claimId,
          read: false
        });

        toast.success(`Claim ${status} successfully`);
        return true;
      }
      throw new Error('Failed to update claim');
    } catch (error) {
      console.error('Error updating claim status:', error);
      toast.error('Failed to update claim status');
      throw error;
    }
  }

  // Update claim
  async updateClaim(claimId, updateData, newFiles = []) {
    try {
      const claim = await this.getClaimById(claimId);
      if (!claim) {
        throw new Error('Claim not found');
      }

      // Upload new files if any
      const uploadedFiles = [...(claim.documents || [])];
      if (newFiles.length > 0) {
        for (const file of newFiles) {
          try {
            const uploadedFile = await db.uploadFile(file);
            uploadedFiles.push(uploadedFile);
          } catch (fileError) {
            console.warn('Error uploading file:', fileError);
            toast.error(`Failed to upload ${file.name}`);
          }
        }
      }

      const updatedData = {
        ...updateData,
        documents: uploadedFiles
      };

      const updatedClaim = db.update(this.claimsCollection, claimId, updatedData);
      
      if (updatedClaim) {
        toast.success('Claim updated successfully');
        return true;
      }
      throw new Error('Failed to update claim');
    } catch (error) {
      console.error('Error updating claim:', error);
      toast.error('Failed to update claim');
      throw error;
    }
  }

  // Delete claim
  async deleteClaim(claimId) {
    try {
      const claim = await this.getClaimById(claimId);
      if (!claim) {
        throw new Error('Claim not found');
      }

      // In a real implementation, you would delete files from storage here
      // For localStorage demo, we'll just remove the claim

      const success = db.delete(this.claimsCollection, claimId);
      if (success) {
        toast.success('Claim deleted successfully');
        return true;
      }
      throw new Error('Failed to delete claim');
    } catch (error) {
      console.error('Error deleting claim:', error);
      toast.error('Failed to delete claim');
      throw error;
    }
  }

  // Get claims by status
  async getClaimsByStatus(status) {
    try {
      const claims = db.where(this.claimsCollection, 'status', '==', status);
      return claims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching claims by status:', error);
      throw error;
    }
  }

  // Search claims
  async searchClaims(searchTerm) {
    try {
      const allClaims = await this.getAllClaims();
      
      return allClaims.filter(claim => 
        claim.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching claims:', error);
      throw error;
    }
  }

  // Get claim statistics
  async getClaimStats() {
    try {
      const claims = await this.getAllClaims();
      
      const stats = {
        total: claims.length,
        pending: claims.filter(claim => claim.status === 'pending').length,
        approved: claims.filter(claim => claim.status === 'approved').length,
        rejected: claims.filter(claim => claim.status === 'rejected').length,
        inReview: claims.filter(claim => claim.status === 'in-review').length
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching claim stats:', error);
      throw error;
    }
  }

  // Create notification
  async createNotification(notificationData) {
    try {
      const notification = db.create(this.notificationsCollection, notificationData);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for user
  async getNotificationsByUserId(userId) {
    try {
      const notifications = db.where(this.notificationsCollection, 'userId', '==', userId);
      // Also get admin notifications if user is admin
      if (userId === 'admin') {
        const adminNotifications = db.where(this.notificationsCollection, 'userId', '==', 'admin');
        notifications.push(...adminNotifications);
      }
      
      return notifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20); // Limit to 20 notifications
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const updatedNotification = db.update(this.notificationsCollection, notificationId, {
        read: true,
        readAt: new Date().toISOString()
      });
      return !!updatedNotification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get recent claims
  async getRecentClaims(limitCount = 5) {
    try {
      const claims = db.getAll(this.claimsCollection);
      const sortedClaims = claims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return sortedClaims.slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching recent claims:', error);
      throw error;
    }
  }

  // Get claims by date range
  async getClaimsByDateRange(startDate, endDate) {
    try {
      const claims = db.getAll(this.claimsCollection);
      return claims.filter(claim => {
        const claimDate = new Date(claim.createdAt);
        return claimDate >= new Date(startDate) && claimDate <= new Date(endDate);
      });
    } catch (error) {
      console.error('Error fetching claims by date range:', error);
      throw error;
    }
  }

  // Get claims by priority
  async getClaimsByPriority(priority) {
    try {
      const claims = db.where(this.claimsCollection, 'priority', '==', priority);
      return claims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching claims by priority:', error);
      throw error;
    }
  }
}

export default new ClaimsService();