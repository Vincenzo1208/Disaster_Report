import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Send, X, AlertTriangle, User } from 'lucide-react';
import { AppDispatch, RootState } from '../../store';
import { createIncident } from '../../store/incidentSlice';
import { INCIDENT_TYPES, SEVERITY_LEVELS } from '../../types/incident';

interface IncidentFormProps {
  selectedLocation?: { lat: number; lng: number } | null;
  onLocationSelect: () => void;
  onClose: () => void;
  isOpen: boolean;
  isSelectingLocation?: boolean;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({
  selectedLocation,
  onLocationSelect,
  onClose,
  isOpen,
  isSelectingLocation = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const [formData, setFormData] = useState({
    incidentType: '',
    severity: 'Medium' as const,
    description: '',
    reporterName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!selectedLocation) {
      setSubmitError('Please select a location on the map');
      return;
    }

    if (!formData.incidentType) {
      setSubmitError('Please select an incident type');
      return;
    }

    if (!formData.description.trim()) {
      setSubmitError('Please provide a description');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting incident:', {
        ...formData,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      });

      await dispatch(createIncident({
        incidentType: formData.incidentType,
        severity: formData.severity,
        description: formData.description.trim(),
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        reporterName: formData.reporterName.trim() || undefined,
      })).unwrap();
      
      // Reset form
      setFormData({
        incidentType: '',
        severity: 'Medium',
        description: '',
        reporterName: '',
      });
      
      console.log('Incident created successfully');
      onClose();
    } catch (error) {
      console.error('Failed to create incident:', error);
      setSubmitError('Failed to submit incident. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      'Critical': isDarkMode ? 'border-red-800 bg-red-900/50 text-red-300' : 'border-red-300 bg-red-50 text-red-800',
      'High': isDarkMode ? 'border-orange-800 bg-orange-900/50 text-orange-300' : 'border-orange-300 bg-orange-50 text-orange-800',
      'Medium': isDarkMode ? 'border-blue-800 bg-blue-900/50 text-blue-300' : 'border-blue-300 bg-blue-50 text-blue-800',
      'Low': isDarkMode ? 'border-green-800 bg-green-900/50 text-green-300' : 'border-green-300 bg-green-50 text-green-800',
    };
    return colors[severity as keyof typeof colors] || (isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-300 bg-gray-50 text-gray-800');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className={`rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border pointer-events-auto transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-slate-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-6 border-b rounded-t-2xl transition-colors duration-300 ${
            isDarkMode 
              ? 'border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700' 
              : 'border-slate-200 bg-gradient-to-r from-slate-50 to-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    Report New Incident
                  </h2>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Provide details about the emergency situation
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
                disabled={isSubmitting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {submitError && (
              <div className={`p-4 border rounded-xl text-sm flex items-center space-x-2 ${
                isDarkMode 
                  ? 'bg-red-900/50 border-red-800 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Incident Type */}
            <div className="space-y-2">
              <label className={`block text-sm font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Incident Type *
              </label>
              <select
                required
                value={formData.incidentType}
                onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-slate-200' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select incident type</option>
                {INCIDENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div className="space-y-3">
              <label className={`block text-sm font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Severity Level *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SEVERITY_LEVELS.map((level) => (
                  <label key={level} className="cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value={level}
                      checked={formData.severity === level}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value as typeof formData.severity })}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className={`p-3 rounded-xl border-2 text-center font-semibold transition-all duration-200 ${
                      formData.severity === level 
                        ? getSeverityColor(level) + ' ring-2 ring-offset-2 ring-blue-500' 
                        : isDarkMode 
                          ? 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500' 
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}>
                      {level}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className={`block text-sm font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about the incident, including current status, affected areas, and any immediate dangers..."
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
                disabled={isSubmitting}
              />
            </div>

            {/* Reporter Name */}
            <div className="space-y-2">
              <label className={`block text-sm font-semibold flex items-center space-x-2 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <User className="w-4 h-4" />
                <span>Reporter Name (Optional)</span>
              </label>
              <input
                type="text"
                value={formData.reporterName}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                placeholder="Your name or organization"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
                disabled={isSubmitting}
              />
            </div>

            {/* Location */}
            <div className={`space-y-3 p-4 rounded-xl border transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
            }`}>
              <label className={`block text-sm font-semibold flex items-center space-x-2 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <MapPin className="w-4 h-4" />
                <span>Incident Location *</span>
              </label>
              <div className="flex items-center space-x-3">
                {selectedLocation ? (
                  <div className={`flex-1 p-3 border rounded-xl ${
                    isDarkMode ? 'bg-green-900/50 border-green-800' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className={`flex items-center ${
                      isDarkMode ? 'text-green-300' : 'text-green-800'
                    }`}>
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-semibold">Location Selected</div>
                        <div className={isDarkMode ? 'text-green-400' : 'text-green-600'}>
                          {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`flex-1 p-3 border rounded-xl ${
                    isDarkMode ? 'bg-amber-900/50 border-amber-800' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className={`flex items-center ${
                      isDarkMode ? 'text-amber-300' : 'text-amber-800'
                    }`}>
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-semibold">No Location Selected</div>
                        <div className={isDarkMode ? 'text-amber-400' : 'text-amber-600'}>
                          {isSelectingLocation ? 'Click on map to select location' : 'Click button to select location'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={onLocationSelect}
                  className={`px-4 py-3 rounded-xl transition-colors font-semibold shadow-sm ${
                    isSelectingLocation 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={isSubmitting}
                >
                  {isSelectingLocation ? 'Selecting...' : selectedLocation ? 'Change' : 'Select'}
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className={`flex space-x-3 pt-4 border-t transition-colors duration-300 ${
              isDarkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-6 py-3 border rounded-xl transition-colors font-semibold ${
                  isDarkMode 
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedLocation}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};