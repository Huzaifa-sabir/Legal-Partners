import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import claimsService from '../../services/claimsService';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Calendar,
  DollarSign,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const ClaimsList = () => {
  const { currentUser, isAdmin } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showClaimDetails, setShowClaimDetails] = useState(false);
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
    { value: 'in-review', label: 'In Review', icon: AlertTriangle, color: 'text-blue-600 bg-blue-100' },
    { value: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-600 bg-red-100' }
  ];

  useEffect(() => {
    fetchClaims();
  }, [currentUser, isAdmin]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      let claimsData;
      
      if (isAdmin()) {
        claimsData = await claimsService.getAllClaims();
      } else {
        claimsData = await claimsService.getClaimsByUserId(currentUser.uid);
      }
      
      setClaims(claimsData);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClaim = (claim) => {
    setSelectedClaim(claim);
    setShowClaimDetails(true);
  };

  const handleUpdateStatus = async (claimId, newStatus, adminNotes = '') => {
    if (!isAdmin()) return;
    
    setUpdating(true);
    try {
      await claimsService.updateClaimStatus(claimId, newStatus, adminNotes);
      await fetchClaims();
      setShowClaimDetails(false);
    } catch (error) {
      console.error('Error updating claim status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClaim = async (claimId) => {
    if (window.confirm('Are you sure you want to delete this claim?')) {
      try {
        await claimsService.deleteClaim(claimId);
        await fetchClaims();
      } catch (error) {
        console.error('Error deleting claim:', error);
      }
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.claimType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin() ? 'All Claims' : 'My Claims'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin() 
              ? 'Review and manage client claims' 
              : 'Track your submitted claims and their status'}
          </p>
        </div>
        
        <Link to="/claims/new" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          New Claim
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select pl-10"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search criteria.' 
              : 'You haven\'t submitted any claims yet.'}
          </p>
          <Link to="/claims/new" className="btn btn-primary">
            <Plus className="w-5 h-5" />
            File Your First Claim
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClaims.map((claim) => {
            const statusConfig = getStatusConfig(claim.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={claim.id} className="card hover:shadow-lg transition-shadow">
                <div className="card-header">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {claim.claimType}
                      </h3>
                      {/* <p className="text-sm text-gray-600">
                        Claim #{claim.id.slice(-8).toUpperCase()}
                      </p> */}
                       <p className="text-sm text-gray-600">
                         Claim #{claim.id ? String(claim.id).slice(-8).toUpperCase() : 'N/A'}
                      </p>
                    </div>
                    
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{claim.clientName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Incident: {formatDate(claim.dateOfIncident)}</span>
                    </div>
                    
                    {claim.claimAmount && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(claim.claimAmount)}</span>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {claim.description}
                    </p>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      Filed {formatDate(claim.createdAt)}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewClaim(claim)}
                        className="btn btn-sm btn-secondary"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {isAdmin() && (
                        <button
                          onClick={() => handleDeleteClaim(claim.id)}
                          className="btn btn-sm btn-danger"
                          title="Delete Claim"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Claim Details Modal */}
      {showClaimDetails && selectedClaim && (
        <ClaimDetailsModal
          claim={selectedClaim}
          isAdmin={isAdmin()}
          onClose={() => setShowClaimDetails(false)}
          onUpdateStatus={handleUpdateStatus}
          updating={updating}
        />
      )}
    </div>
  );
};

// Claim Details Modal Component
const ClaimDetailsModal = ({ claim, isAdmin, onClose, onUpdateStatus, updating }) => {
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState(claim.status);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const handleSubmitUpdate = () => {
    onUpdateStatus(claim.id, newStatus, adminNotes);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl">
        <div className="modal-header">
          <h2 className="modal-title">Claim Details</h2>
          <button onClick={onClose} className="modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Claim Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Claim Type</label>
                    <p className="text-gray-900">{claim.claimType}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of Incident</label>
                    <p className="text-gray-900">{formatDate(claim.dateOfIncident)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Claim Amount</label>
                    <p className="text-gray-900">{formatCurrency(claim.claimAmount)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      claim.priority === 'high' ? 'bg-red-100 text-red-800' :
                      claim.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {claim.priority?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{claim.clientName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{claim.clientEmail}</p>
                  </div>
                  
                  {claim.clientPhone && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{claim.clientPhone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Description and Documents */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{claim.description}</p>
                </div>
              </div>

              {claim.documents && claim.documents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</h3>
                  <div className="space-y-2">
                    {claim.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-secondary"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {claim.adminNotes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-800">{claim.adminNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="form-select"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="form-textarea"
                    rows={3}
                    placeholder="Add notes about the claim review..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={updating}
          >
            Close
          </button>
          
          {isAdmin && (
            <button
              onClick={handleSubmitUpdate}
              disabled={updating || newStatus === claim.status}
              className={`btn btn-primary ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {updating ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Claim'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimsList;