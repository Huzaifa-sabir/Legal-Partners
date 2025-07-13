import React, { useState, useEffect } from 'react';
import policiesService from '../../services/policiesService';
import { X, Save, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const PolicyForm = ({ policy, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    effectiveDate: '',
    expirationDate: '',
    version: '1.0',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    if (policy) {
      setFormData({
        title: policy.title || '',
        description: policy.description || '',
        content: policy.content || '',
        category: policy.category || '',
        effectiveDate: policy.effectiveDate ? policy.effectiveDate.split('T')[0] : '',
        expirationDate: policy.expirationDate ? policy.expirationDate.split('T')[0] : '',
        version: policy.version || '1.0',
        active: policy.active !== undefined ? policy.active : true
      });
    }
  }, [policy]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Policy title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Policy description is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Policy content is required';
    }

    if (!formData.category) {
      newErrors.category = 'Policy category is required';
    }

    if (formData.effectiveDate && formData.expirationDate) {
      const effectiveDate = new Date(formData.effectiveDate);
      const expirationDate = new Date(formData.expirationDate);
      
      if (expirationDate <= effectiveDate) {
        newErrors.expirationDate = 'Expiration date must be after effective date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const policyData = {
        ...formData,
        effectiveDate: formData.effectiveDate ? new Date(formData.effectiveDate).toISOString() : null,
        expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : null
      };

      if (policy) {
        await policiesService.updatePolicy(policy.id, policyData);
        toast.success('Policy updated successfully');
      } else {
        await policiesService.createPolicy(policyData);
        toast.success('Policy created successfully');
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving policy:', error);
      toast.error(error.message || 'Failed to save policy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="modal-header">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="modal-title">
            {policy ? 'Edit Policy' : 'Create New Policy'}
          </h2>
        </div>
        <button onClick={onCancel} className="modal-close">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="modal-body">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Policy Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter policy title"
                required
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`form-select ${errors.category ? 'border-red-500' : ''}`}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`form-textarea ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Enter policy description"
                required
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="effectiveDate" className="form-label">
                  Effective Date
                </label>
                <input
                  type="date"
                  id="effectiveDate"
                  name="effectiveDate"
                  value={formData.effectiveDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="expirationDate" className="form-label">
                  Expiration Date
                </label>
                <input
                  type="date"
                  id="expirationDate"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleChange}
                  className={`form-input ${errors.expirationDate ? 'border-red-500' : ''}`}
                />
                {errors.expirationDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.expirationDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="version" className="form-label">
                Version
              </label>
              <input
                type="text"
                id="version"
                name="version"
                value={formData.version}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 1.0, 2.1"
              />
            </div>

            <div className="form-group">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active Policy
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Only active policies will be visible to clients
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label">
                Policy Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={12}
                className={`form-textarea ${errors.content ? 'border-red-500' : ''}`}
                placeholder="Enter the full policy content, terms, and conditions..."
                required
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                You can use markdown formatting for better readability
              </p>
            </div>
          </div>
        </div>
      </form>

      <div className="modal-footer">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="loading-spinner w-4 h-4 mr-2"></div>
              {policy ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            <div className="flex items-center">
              <Save className="w-4 h-4 mr-2" />
              {policy ? 'Update Policy' : 'Create Policy'}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default PolicyForm;