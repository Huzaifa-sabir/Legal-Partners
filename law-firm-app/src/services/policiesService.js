import { db } from './localStorage';
import toast from 'react-hot-toast';

class PoliciesService {
  constructor() {
    this.policiesCollection = 'policies';
  }

  // Create new policy (admin only)
  async createPolicy(policyData) {
    try {
      const newPolicy = {
        ...policyData,
        active: true
      };

      const policy = db.create(this.policiesCollection, newPolicy);
      toast.success('Policy created successfully');
      
      return policy;
    } catch (error) {
      console.error('Error creating policy:', error);
      toast.error('Failed to create policy');
      throw error;
    }
  }

  // Get all policies
  async getAllPolicies() {
    try {
      const policies = db.getAll(this.policiesCollection);
      return policies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to fetch policies');
      throw error;
    }
  }

  // Get active policies only
  async getActivePolicies() {
    try {
      const policies = db.where(this.policiesCollection, 'active', '==', true);
      return policies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching active policies:', error);
      throw error;
    }
  }

  // Get policy by ID
  async getPolicyById(policyId) {
    try {
      const policy = db.getById(this.policiesCollection, policyId);
      return policy;
    } catch (error) {
      console.error('Error fetching policy:', error);
      throw error;
    }
  }

  // Update policy (admin only)
  async updatePolicy(policyId, updateData) {
    try {
      const updatedPolicy = db.update(this.policiesCollection, policyId, updateData);
      
      if (updatedPolicy) {
        toast.success('Policy updated successfully');
        return true;
      }
      throw new Error('Policy not found');
    } catch (error) {
      console.error('Error updating policy:', error);
      toast.error('Failed to update policy');
      throw error;
    }
  }

  // Delete policy (admin only)
  async deletePolicy(policyId) {
    try {
      const success = db.delete(this.policiesCollection, policyId);
      if (success) {
        toast.success('Policy deleted successfully');
        return true;
      }
      throw new Error('Failed to delete policy');
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast.error('Failed to delete policy');
      throw error;
    }
  }

  // Toggle policy status (activate/deactivate)
  async togglePolicyStatus(policyId, active) {
    try {
      const updatedPolicy = db.update(this.policiesCollection, policyId, { active });
      
      if (updatedPolicy) {
        toast.success(`Policy ${active ? 'activated' : 'deactivated'} successfully`);
        return true;
      }
      throw new Error('Policy not found');
    } catch (error) {
      console.error('Error toggling policy status:', error);
      toast.error('Failed to update policy status');
      throw error;
    }
  }

  // Search policies
  async searchPolicies(searchTerm) {
    try {
      const allPolicies = await this.getAllPolicies();
      
      return allPolicies.filter(policy => 
        policy.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching policies:', error);
      throw error;
    }
  }

  // Get policies by category
  async getPoliciesByCategory(category) {
    try {
      const policies = db.where(this.policiesCollection, 'category', '==', category);
      const activePolicies = policies.filter(policy => policy.active);
      return activePolicies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching policies by category:', error);
      throw error;
    }
  }

  // Get recent policies
  async getRecentPolicies(limitCount = 5) {
    try {
      const policies = db.where(this.policiesCollection, 'active', '==', true);
      const sortedPolicies = policies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return sortedPolicies.slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching recent policies:', error);
      throw error;
    }
  }

  // Get policy statistics
  async getPolicyStats() {
    try {
      const policies = await this.getAllPolicies();
      
      const stats = {
        total: policies.length,
        active: policies.filter(policy => policy.active).length,
        inactive: policies.filter(policy => !policy.active).length,
        categories: [...new Set(policies.map(policy => policy.category))].length
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching policy stats:', error);
      throw error;
    }
  }

  // Get policies grouped by category
  async getPoliciesGroupedByCategory() {
    try {
      const policies = await this.getActivePolicies();
      
      const grouped = policies.reduce((acc, policy) => {
        const category = policy.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(policy);
        return acc;
      }, {});
      
      return grouped;
    } catch (error) {
      console.error('Error grouping policies by category:', error);
      throw error;
    }
  }
}

export default new PoliciesService();