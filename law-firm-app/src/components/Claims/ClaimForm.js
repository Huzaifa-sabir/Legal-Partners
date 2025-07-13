import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import claimsService from '../../services/claimsService';
import { 
  Upload, 
  X, 
  FileText, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const ClaimForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    clientName: currentUser?.displayName || '',
    clientEmail: currentUser?.email || '',
    clientPhone: '',
    clientAddress: '',
    claimType: '',
    dateOfIncident: '',
    timeOfIncident: '',
    locationOfIncident: '',
    description: '',
    claimAmount: '',
    priority: 'medium',
    witnessName: '',
    witnessContact: '',
    insuranceCompany: '',
    policyNumber: '',
    previousClaims: false,
    previousClaimsDetails: '',
    medicalTreatment: false,
    medicalProvider: '',
    policeReport: false,
    policeReportNumber: '',
    emergencyServices: false,
    additionalNotes: ''
  });
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const claimTypes = [
    'Personal Injury',
    'Auto Accident',
    'Medical Malpractice',
    'Workers Compensation',
    'Property Damage',
    'Insurance Dispute',
    'Contract Dispute',
    'Employment Issue',
    'Slip and Fall',
    'Product Liability',
    'Professional Negligence',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600', description: 'Non-urgent matter' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600', description: 'Standard processing time' },
    { value: 'high', label: 'High Priority', color: 'text-orange-600', description: 'Urgent attention needed' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600', description: 'Immediate action required' }
  ];

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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    // Limit total files to 10
    const totalFiles = files.length + validFiles.length;
    if (totalFiles > 10) {
      toast.error('Maximum 10 files allowed per claim.');
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
    
    // Clear file input
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Client Information
      if (!formData.clientName.trim()) {
        newErrors.clientName = 'Client name is required';
      }

      if (!formData.clientEmail.trim()) {
        newErrors.clientEmail = 'Email is required';
      } else if (!formData.clientEmail.includes('@')) {
        newErrors.clientEmail = 'Valid email is required';
      }

      if (!formData.clientPhone.trim()) {
        newErrors.clientPhone = 'Phone number is required';
      }

      if (!formData.clientAddress.trim()) {
        newErrors.clientAddress = 'Address is required';
      }
    }

    if (step === 2) {
      // Incident Details
      if (!formData.claimType) {
        newErrors.claimType = 'Claim type is required';
      }

      if (!formData.dateOfIncident) {
        newErrors.dateOfIncident = 'Date of incident is required';
      } else {
        const incidentDate = new Date(formData.dateOfIncident);
        const today = new Date();
        if (incidentDate > today) {
          newErrors.dateOfIncident = 'Date of incident cannot be in the future';
        }
      }

      if (!formData.timeOfIncident) {
        newErrors.timeOfIncident = 'Time of incident is required';
      }

      if (!formData.locationOfIncident.trim()) {
        newErrors.locationOfIncident = 'Location of incident is required';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.trim().length < 50) {
        newErrors.description = 'Description must be at least 50 characters';
      }

      if (formData.claimAmount && isNaN(parseFloat(formData.claimAmount))) {
        newErrors.claimAmount = 'Claim amount must be a valid number';
      }
    }

    if (step === 3) {
      // Additional Information
      if (formData.previousClaims && !formData.previousClaimsDetails.trim()) {
        newErrors.previousClaimsDetails = 'Please provide details about previous claims';
      }

      if (formData.medicalTreatment && !formData.medicalProvider.trim()) {
        newErrors.medicalProvider = 'Please provide medical provider information';
      }

      if (formData.policeReport && !formData.policeReportNumber.trim()) {
        newErrors.policeReportNumber = 'Please provide police report number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps
    let allValid = true;
    for (let step = 1; step <= totalSteps; step++) {
      if (!validateStep(step)) {
        allValid = false;
        break;
      }
    }

    if (!allValid) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);

    try {
      const claimData = {
        ...formData,
        userId: currentUser.uid,
        claimAmount: formData.claimAmount ? parseFloat(formData.claimAmount) : null,
        dateOfIncident: new Date(formData.dateOfIncident).toISOString(),
        submittedAt: new Date().toISOString()
      };

      await claimsService.createClaim(claimData, files);
      toast.success('Claim submitted successfully!');
      navigate('/claims');
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error(error.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStepTitle = (step) => {
    const titles = {
      1: 'Client Information',
      2: 'Incident Details',
      3: 'Additional Information',
      4: 'Documents & Review'
    };
    return titles[step];
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
              step < currentStep 
                ? 'bg-green-500 border-green-500 text-white' 
                : step === currentStep 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'bg-gray-200 border-gray-300 text-gray-500'
            }`}>
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            {step < 4 && (
              <div className={`flex-1 h-1 mx-4 transition-colors ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
        </h2>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Personal Details</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="clientName" className="form-label">
                Full Name *
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className={`form-input ${errors.clientName ? 'border-red-500' : ''}`}
                placeholder="Enter your full legal name"
                required
              />
              {errors.clientName && (
                <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="clientEmail" className="form-label">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="clientEmail"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  className={`form-input pl-10 ${errors.clientEmail ? 'border-red-500' : ''}`}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              {errors.clientEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.clientEmail}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="clientPhone" className="form-label">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="clientPhone"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  className={`form-input pl-10 ${errors.clientPhone ? 'border-red-500' : ''}`}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              {errors.clientPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.clientPhone}</p>
              )}
            </div>

            <div className="form-group md:col-span-2">
              <label htmlFor="clientAddress" className="form-label">
                Mailing Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="clientAddress"
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleChange}
                  rows={3}
                  className={`form-textarea pl-10 ${errors.clientAddress ? 'border-red-500' : ''}`}
                  placeholder="Enter your complete mailing address"
                  required
                />
              </div>
              {errors.clientAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.clientAddress}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Incident Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="claimType" className="form-label">
                Type of Claim *
              </label>
              <select
                id="claimType"
                name="claimType"
                value={formData.claimType}
                onChange={handleChange}
                className={`form-select ${errors.claimType ? 'border-red-500' : ''}`}
                required
              >
                <option value="">Select claim type</option>
                {claimTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.claimType && (
                <p className="text-red-500 text-sm mt-1">{errors.claimType}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="dateOfIncident" className="form-label">
                Date of Incident *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  id="dateOfIncident"
                  name="dateOfIncident"
                  value={formData.dateOfIncident}
                  onChange={handleChange}
                  className={`form-input pl-10 ${errors.dateOfIncident ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              {errors.dateOfIncident && (
                <p className="text-red-500 text-sm mt-1">{errors.dateOfIncident}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="timeOfIncident" className="form-label">
                Time of Incident *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  id="timeOfIncident"
                  name="timeOfIncident"
                  value={formData.timeOfIncident}
                  onChange={handleChange}
                  className={`form-input pl-10 ${errors.timeOfIncident ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              {errors.timeOfIncident && (
                <p className="text-red-500 text-sm mt-1">{errors.timeOfIncident}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="claimAmount" className="form-label">
                Estimated Claim Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  id="claimAmount"
                  name="claimAmount"
                  value={formData.claimAmount}
                  onChange={handleChange}
                  className={`form-input pl-10 ${errors.claimAmount ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.claimAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.claimAmount}</p>
              )}
            </div>

            <div className="form-group md:col-span-2">
              <label htmlFor="locationOfIncident" className="form-label">
                Location of Incident *
              </label>
              <input
                type="text"
                id="locationOfIncident"
                name="locationOfIncident"
                value={formData.locationOfIncident}
                onChange={handleChange}
                className={`form-input ${errors.locationOfIncident ? 'border-red-500' : ''}`}
                placeholder="Exact location where the incident occurred"
                required
              />
              {errors.locationOfIncident && (
                <p className="text-red-500 text-sm mt-1">{errors.locationOfIncident}</p>
              )}
            </div>

            <div className="form-group md:col-span-2">
              <label htmlFor="priority" className="form-label">
                Priority Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {priorities.map(priority => (
                  <label key={priority.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`p-3 border-2 rounded-lg transition-all ${
                      formData.priority === priority.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className={`font-medium ${priority.color}`}>
                        {priority.label}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {priority.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group md:col-span-2">
              <label htmlFor="description" className="form-label">
                Detailed Description of Incident *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className={`form-textarea ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Please provide a detailed description of what happened, including sequence of events, people involved, and any relevant circumstances..."
                required
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.description.length}/1000 characters (minimum 50)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Additional Information</h3>
        </div>
        <div className="card-body">
          <div className="space-y-6">
            {/* Witness Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Witness Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="witnessName" className="form-label">
                    Witness Name
                  </label>
                  <input
                    type="text"
                    id="witnessName"
                    name="witnessName"
                    value={formData.witnessName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Full name of witness"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="witnessContact" className="form-label">
                    Witness Contact
                  </label>
                  <input
                    type="text"
                    id="witnessContact"
                    name="witnessContact"
                    value={formData.witnessContact}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Phone number or email"
                  />
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Insurance Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="insuranceCompany" className="form-label">
                    Insurance Company
                  </label>
                  <input
                    type="text"
                    id="insuranceCompany"
                    name="insuranceCompany"
                    value={formData.insuranceCompany}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Name of insurance company"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="policyNumber" className="form-label">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    id="policyNumber"
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Insurance policy number"
                  />
                </div>
              </div>
            </div>

            {/* Previous Claims */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Previous Claims</h4>
              <div className="space-y-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="previousClaims"
                    checked={formData.previousClaims}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Have you filed similar claims before?
                  </span>
                </label>
                
                {formData.previousClaims && (
                  <div className="form-group">
                    <label htmlFor="previousClaimsDetails" className="form-label">
                      Previous Claims Details *
                    </label>
                    <textarea
                      id="previousClaimsDetails"
                      name="previousClaimsDetails"
                      value={formData.previousClaimsDetails}
                      onChange={handleChange}
                      rows={3}
                      className={`form-textarea ${errors.previousClaimsDetails ? 'border-red-500' : ''}`}
                      placeholder="Please describe your previous claims..."
                      required={formData.previousClaims}
                    />
                    {errors.previousClaimsDetails && (
                      <p className="text-red-500 text-sm mt-1">{errors.previousClaimsDetails}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Medical Treatment */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Medical Treatment</h4>
              <div className="space-y-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="medicalTreatment"
                    checked={formData.medicalTreatment}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Did you receive medical treatment for this incident?
                  </span>
                </label>
                
                {formData.medicalTreatment && (
                  <div className="form-group">
                    <label htmlFor="medicalProvider" className="form-label">
                      Medical Provider Details *
                    </label>
                    <textarea
                      id="medicalProvider"
                      name="medicalProvider"
                      value={formData.medicalProvider}
                      onChange={handleChange}
                      rows={3}
                      className={`form-textarea ${errors.medicalProvider ? 'border-red-500' : ''}`}
                      placeholder="Hospital/clinic name, doctor's name, treatment received..."
                      required={formData.medicalTreatment}
                    />
                    {errors.medicalProvider && (
                      <p className="text-red-500 text-sm mt-1">{errors.medicalProvider}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Police Report */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Police Report</h4>
              <div className="space-y-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="policeReport"
                    checked={formData.policeReport}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Was a police report filed?
                  </span>
                </label>
                
                {formData.policeReport && (
                  <div className="form-group">
                    <label htmlFor="policeReportNumber" className="form-label">
                      Police Report Number *
                    </label>
                    <input
                      type="text"
                      id="policeReportNumber"
                      name="policeReportNumber"
                      value={formData.policeReportNumber}
                      onChange={handleChange}
                      className={`form-input ${errors.policeReportNumber ? 'border-red-500' : ''}`}
                      placeholder="Enter police report number"
                      required={formData.policeReport}
                    />
                    {errors.policeReportNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.policeReportNumber}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Services */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="emergencyServices"
                  checked={formData.emergencyServices}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                />
                <span className="text-sm font-medium text-gray-700">
                  Were emergency services (ambulance, fire department) involved?
                </span>
              </label>
            </div>

            {/* Additional Notes */}
            <div className="form-group">
              <label htmlFor="additionalNotes" className="form-label">
                Additional Notes
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={4}
                className="form-textarea"
                placeholder="Any additional information that might be relevant to your claim..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Supporting Documents */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Supporting Documents</h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload relevant documents such as photos, reports, receipts, medical records, etc.
          </p>
        </div>
        <div className="card-body">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xlsx,.xls"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-medium text-gray-700 mb-2">
                Click to upload files or drag and drop
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Maximum 10 files, 10MB each
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, XLS, XLSX
              </p>
            </label>
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Uploaded Files ({files.length}/10)
              </h4>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Guidelines */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-blue-900 mb-2">Document Guidelines:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Photos of the incident scene, damage, or injuries</li>
              <li>• Police reports or incident reports</li>
              <li>• Medical records and bills</li>
              <li>• Insurance correspondence</li>
              <li>• Receipts for expenses related to the incident</li>
              <li>• Witness statements or contact information</li>
              <li>• Any other relevant documentation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Claim Summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Claim Summary</h3>
          <p className="text-sm text-gray-600 mt-1">
            Please review your information before submitting
          </p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Information Summary */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Client Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{formData.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{formData.clientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{formData.clientPhone}</span>
                </div>
              </div>
            </div>

            {/* Incident Summary */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Incident Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{formData.claimType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {formData.dateOfIncident} at {formData.timeOfIncident}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{formData.locationOfIncident}</span>
                </div>
                {formData.claimAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">${parseFloat(formData.claimAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className={`font-medium capitalize ${
                    priorities.find(p => p.value === formData.priority)?.color || 'text-gray-900'
                  }`}>
                    {formData.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information Summary */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Additional Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Previous Claims:</span>
                  <span className="font-medium">{formData.previousClaims ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medical Treatment:</span>
                  <span className="font-medium">{formData.medicalTreatment ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Police Report:</span>
                  <span className="font-medium">{formData.policeReport ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Services:</span>
                  <span className="font-medium">{formData.emergencyServices ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Documents Summary */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Supporting Documents</h4>
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Files Uploaded:</span>
                  <span className="font-medium">{files.length} files</span>
                </div>
                {files.length > 0 && (
                  <div className="space-y-1">
                    {files.slice(0, 3).map((file, index) => (
                      <div key={index} className="text-gray-600 text-xs truncate">
                        • {file.name}
                      </div>
                    ))}
                    {files.length > 3 && (
                      <div className="text-gray-500 text-xs">
                        ... and {files.length - 3} more files
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-amber-900 mb-2">Legal Disclaimer & Acknowledgment</h3>
            <div className="text-sm text-amber-800 space-y-2">
              <p>By submitting this claim, I acknowledge and agree to the following:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All information provided is true and accurate to the best of my knowledge</li>
                <li>I understand that providing false information may result in claim denial</li>
                <li>I authorize the investigation of this claim and release of relevant information</li>
                <li>I understand that this submission does not guarantee claim approval</li>
                <li>Legal representation does not begin until a formal attorney-client agreement is executed</li>
                <li>I consent to electronic communication regarding this claim</li>
              </ul>
              
              <div className="mt-4 pt-4 border-t border-amber-200">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3 mt-1"
                  />
                  <span className="text-sm font-medium text-amber-900">
                    I have read, understood, and agree to the above terms and conditions. I also acknowledge that I have reviewed all information provided in this claim form for accuracy and completeness.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">File New Legal Claim</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Complete this comprehensive form to submit your legal claim with all necessary information and supporting documents.
        </p>
      </div>

      {/* Progress Bar */}
      {renderProgressBar()}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          <div className="flex space-x-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
                disabled={loading}
              >
                Previous Step
              </button>
            )}
            
            <button
              type="button"
              onClick={() => navigate('/claims')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Save as Draft
            </button>
          </div>
          
          <div className="flex space-x-4">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
                disabled={loading}
              >
                Next Step
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary btn-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="loading-spinner w-5 h-5 mr-3"></div>
                    Submitting Claim...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Submit Legal Claim
                  </div>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="text-center text-sm text-gray-500">
          Step {currentStep} of {totalSteps} - {Math.round((currentStep / totalSteps) * 100)}% Complete
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Technical Support</h4>
            <p className="text-gray-600">Having trouble with the form?</p>
            <a href="mailto:support@legalpartners.com" className="text-blue-600 hover:text-blue-700">
              support@legalpartners.com
            </a>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Legal Questions</h4>
            <p className="text-gray-600">Need legal advice before filing?</p>
            <a href="tel:+15551234567" className="text-blue-600 hover:text-blue-700">
              +1 (555) 123-4567
            </a>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Document Help</h4>
            <p className="text-gray-600">Unsure what documents to upload?</p>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              View Document Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimForm;