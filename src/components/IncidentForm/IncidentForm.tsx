import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { MapPin, Send, X, AlertTriangle, User } from 'lucide-react';
import { AppDispatch } from '../../store';
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
    switch (severity) {
      case 'Critical': return 'border-red-300 bg-red-50 text-red-800';
      case 'High': return 'border-orange-300 bg-orange-50 text-orange-800';
      case 'Medium': return 'border-blue-300 bg-blue-50 text-blue-800';
      case 'Low': return 'border-green-300 bg-green-50 text-green-800';
      default: return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Report New Incident</h2>
                  <p className="text-sm text-slate-500">Provide details about the emergency situation</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Incident Type *
              </label>
              <select
                required
                value={formData.incidentType}
                onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                disabled={isSubmitting}
              >
                <option value="">Select incident type</option>
                {INCIDENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
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
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}>
                      {level}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about the incident, including current status, affected areas, and any immediate dangers..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm transition-all duration-200"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className=" text-sm font-semibold text-slate-700 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Reporter Name (Optional)</span>
              </label>
              <input
                type="text"
                value={formData.reporterName}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                placeholder="Your name or organization"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className=" text-sm font-semibold text-slate-700 flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Incident Location *</span>
              </label>
              <div className="flex items-center space-x-3">
                {selectedLocation ? (
                  <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center text-green-800">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-semibold">Location Selected</div>
                        <div className="text-green-600">
                          {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center text-amber-800">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-semibold">No Location Selected</div>
                        <div className="text-amber-600">
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

            <div className="flex space-x-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
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