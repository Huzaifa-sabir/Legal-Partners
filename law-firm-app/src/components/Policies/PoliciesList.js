import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import policiesService from '../../services/policiesService';
import PolicyForm from './PolicyForm';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  FileText,
  Calendar,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

const PoliciesList = () => {
  const { isAdmin } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const categories = [
    'Corporate Law',
    'Personal Injury',
    'Real Estate',
    'Family Law',
    'Criminal Defense',
    'Employment Law',
    'Immigration',
    'Intellectual Property'
  ];

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const policiesData = await policiesService.getAllPolicies();
      setPolicies(policiesData);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = () => {
    setEditingPolicy(null);
    setShowPolicyForm(true);
  };

  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy);
    setShowPolicyForm(true);
  };

  const handleDeletePolicy = async (policyId) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await policiesService.deletePolicy(policyId);
        await fetchPolicies();
      } catch (error) {
        console.error('Error deleting policy:', error);
      }
    }
  };

  const handleToggleStatus = async (policyId, currentStatus) => {
    try {
      await policiesService.togglePolicyStatus(policyId, !currentStatus);
      await fetchPolicies();
    } catch (error) {
      console.error('Error toggling policy status:', error);
    }
  };

  const handlePolicyFormSubmit = async () => {
    setShowPolicyForm(false);
    setEditingPolicy(null);
    await fetchPolicies();
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || policy.category === selectedCategory;
    const matchesStatus = showInactive || policy.active;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Policies</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin() ? 'Manage company policies and legal documents' : 'View available policies and legal information'}
          </p>
        </div>
        
        {isAdmin() && (
          <button
            onClick={handleCreatePolicy}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5" />
            Add Policy
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select pl-10"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Status Toggle */}
          {isAdmin() && (
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Show inactive policies</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Policies Grid */}
      {filteredPolicies.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search criteria.' 
              : 'No policies have been created yet.'}
          </p>
          {isAdmin() && !searchTerm && !selectedCategory && (
            <button
              onClick={handleCreatePolicy}
              className="btn btn-primary mt-4"
            >
              Create First Policy
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <div key={policy.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-header">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {policy.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        {policy.category || 'Uncategorized'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(policy.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${
                      policy.active ? 'badge-success' : 'badge-danger'
                    }`}>
                      {policy.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {policy.description}
                </p>
                
                {policy.effectiveDate && (
                  <div className="mt-4 text-sm text-gray-500">
                    <strong>Effective Date:</strong> {formatDate(policy.effectiveDate)}
                  </div>
                )}
              </div>

              {isAdmin() && (
                <div className="card-footer">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPolicy(policy)}
                        className="btn btn-sm btn-secondary"
                        title="Edit Policy"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleStatus(policy.id, policy.active)}
                        className={`btn btn-sm ${policy.active ? 'btn-warning' : 'btn-success'}`}
                        title={policy.active ? 'Deactivate Policy' : 'Activate Policy'}
                      >
                        {policy.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete Policy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <span className="text-xs text-gray-400">
                      Updated {formatDate(policy.updatedAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Policy Form Modal */}
      {showPolicyForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <PolicyForm
              policy={editingPolicy}
              onSubmit={handlePolicyFormSubmit}
              onCancel={() => {
                setShowPolicyForm(false);
                setEditingPolicy(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliciesList;