import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, Clock, User, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { setSelectedIncident } from '../../store/incidentSlice';
import { Incident } from '../../types/incident';
import { format } from 'date-fns';

const getSeverityColor = (severity: string, isDarkMode: boolean) => {
  const colors = {
    'Critical': isDarkMode ? 'bg-red-900/50 text-red-300 border-red-800' : 'bg-red-100 text-red-800 border-red-200',
    'High': isDarkMode ? 'bg-orange-900/50 text-orange-300 border-orange-800' : 'bg-orange-100 text-orange-800 border-orange-200',
    'Medium': isDarkMode ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-blue-100 text-blue-800 border-blue-200',
    'Low': isDarkMode ? 'bg-green-900/50 text-green-300 border-green-800' : 'bg-green-100 text-green-800 border-green-200',
  };
  return colors[severity as keyof typeof colors] || (isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200');
};

const getSeverityIcon = (severity: string, isDarkMode: boolean) => {
  const iconColor = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  switch (severity) {
    case 'Critical': return <AlertTriangle className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />;
    case 'High': return <TrendingUp className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />;
    case 'Medium': return <Activity className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />;
    case 'Low': return <Activity className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />;
    default: return <Activity className={`w-4 h-4 ${iconColor}`} />;
  }
};

const IncidentCard: React.FC<{ incident: Incident }> = ({ incident }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedIncident } = useSelector((state: RootState) => state.incidents);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  
  const isCritical = (incident.incidentType === 'Fire' || incident.incidentType === 'Explosion') && 
                    incident.severity === 'Critical';
  const isSelected = selectedIncident?.id === incident.id;

  const handleClick = () => {
    dispatch(setSelectedIncident(incident));
  };

  return (
    <div
      onClick={handleClick}
      className={`p-5 border rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
        isSelected 
          ? `border-blue-500 shadow-xl ring-2 ring-blue-500 ring-opacity-50 ${
              isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
            }` 
          : `border-opacity-50 hover:shadow-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'border-slate-600 hover:border-slate-500 bg-slate-800/50' 
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`
      } ${
        isCritical 
          ? `ring-2 ring-red-500 ring-opacity-50 animate-pulse shadow-lg ${
              isDarkMode ? 'bg-gradient-to-br from-red-900/30 to-orange-900/30' : 'bg-gradient-to-br from-red-50 to-orange-50'
            }` 
          : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl shadow-sm transition-colors duration-300 ${
            isCritical 
              ? 'bg-red-500 text-white' 
              : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}>
            {getSeverityIcon(incident.severity, isDarkMode)}
          </div>
          <div>
            <h3 className={`font-bold text-lg transition-colors duration-300 ${
              isCritical 
                ? isDarkMode ? 'text-red-300' : 'text-red-900'
                : isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {incident.incidentType}
            </h3>
            {isCritical && (
              <div className={`flex items-center space-x-1 ${
                isDarkMode ? 'text-red-400' : 'text-red-700'
              }`}>
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-semibold uppercase tracking-wide">Critical Alert</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-xl text-xs font-bold border shadow-sm ${getSeverityColor(incident.severity, isDarkMode)}`}>
            {incident.severity}
          </span>
        </div>
      </div>
      
      {/* Description */}
      <p className={`text-sm mb-4 line-clamp-2 leading-relaxed transition-colors duration-300 ${
        isDarkMode ? 'text-slate-300' : 'text-slate-600'
      }`}>
        {incident.description}
      </p>
      
      {/* Metadata */}
      <div className={`space-y-2 text-xs transition-colors duration-300 ${
        isDarkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        <div className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'
        }`}>
          <MapPin className={`w-3 h-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <span className="font-mono">
            {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className={`w-3 h-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <span>{format(new Date(incident.timestamp), 'MMM d, HH:mm')}</span>
          </div>
          
          {incident.reporterName && (
            <div className="flex items-center space-x-1">
              <User className={`w-3 h-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <span className="truncate max-w-20">{incident.reporterName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`mt-3 pt-3 border-t transition-colors duration-300 ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isCritical ? 'bg-red-500 animate-pulse' : 
              incident.severity === 'High' ? 'bg-orange-500' :
              incident.severity === 'Medium' ? 'bg-blue-500' : 'bg-green-500'
            }`}></div>
            <span className={`text-xs font-semibold transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {isCritical ? 'Requires Immediate Attention' : 'Active'}
            </span>
          </div>
          {isSelected && (
            <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${
              isDarkMode ? 'text-blue-300 bg-blue-900/50' : 'text-blue-600 bg-blue-100'
            }`}>
              Selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const IncidentList: React.FC = () => {
  const { filteredIncidents, loading } = useSelector((state: RootState) => state.incidents);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);

  const criticalCount = filteredIncidents.filter(
    incident => (incident.incidentType === 'Fire' || incident.incidentType === 'Explosion') && 
                incident.severity === 'Critical'
  ).length;

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className={`font-semibold transition-colors duration-300 ${
          isDarkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Loading incidents...
        </p>
        <p className={`text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Please wait while we fetch the latest data
        </p>
      </div>
    );
  }

  if (filteredIncidents.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className={`p-4 rounded-2xl inline-block mb-4 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
        }`}>
          <AlertTriangle className={`w-12 h-12 mx-auto transition-colors duration-300 ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`} />
        </div>
        <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
          isDarkMode ? 'text-slate-200' : 'text-slate-800'
        }`}>
          No Incidents Found
        </h3>
        <p className={`text-sm mb-4 transition-colors duration-300 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Try adjusting your filters or report a new incident to get started
        </p>
        <div className={`text-xs p-3 rounded-xl transition-colors duration-300 ${
          isDarkMode ? 'text-slate-500 bg-slate-800' : 'text-slate-400 bg-slate-50'
        }`}>
          Current filters may be too restrictive
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`px-6 py-4 border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-slate-700' 
          : 'bg-gradient-to-r from-slate-50 to-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-slate-100' : 'text-slate-800'
            }`}>
              Active Incidents
            </h3>
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {criticalCount > 0 && (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${
              isDarkMode ? 'bg-red-900/50 border-red-800' : 'bg-red-100 border-red-200'
            }`}>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className={`text-sm font-bold ${
                isDarkMode ? 'text-red-300' : 'text-red-700'
              }`}>
                {criticalCount} Critical
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Incident List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredIncidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  );
};