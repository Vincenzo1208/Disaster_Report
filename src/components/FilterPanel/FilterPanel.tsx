import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Filter, RotateCcw, Map, Satellite, Calendar, Tag, AlertCircle } from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { setFilters, clearFilters, toggleBasemapStyle } from '../../store/incidentSlice';
import { INCIDENT_TYPES, SEVERITY_LEVELS } from '../../types/incident';

export const FilterPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { filters, basemapStyle } = useSelector((state: RootState) => state.incidents);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.types, type]
      : filters.types.filter(t => t !== type);
    dispatch(setFilters({ types: newTypes }));
  };

  const handleSeverityChange = (severity: string, checked: boolean) => {
    const newSeverities = checked
      ? [...filters.severities, severity]
      : filters.severities.filter(s => s !== severity);
    dispatch(setFilters({ severities: newSeverities }));
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    dispatch(setFilters({
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const hasActiveFilters = filters.types.length > 0 || 
                          filters.severities.length > 0 || 
                          filters.dateRange.start || 
                          filters.dateRange.end;

  const getSeverityColor = (severity: string) => {
    const baseColors = {
      'Critical': isDarkMode ? 'bg-red-900/50 text-red-300 border-red-800' : 'bg-red-100 text-red-800 border-red-200',
      'High': isDarkMode ? 'bg-orange-900/50 text-orange-300 border-orange-800' : 'bg-orange-100 text-orange-800 border-orange-200',
      'Medium': isDarkMode ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-blue-100 text-blue-800 border-blue-200',
      'Low': isDarkMode ? 'bg-green-900/50 text-green-300 border-green-800' : 'bg-green-100 text-green-800 border-green-200',
    };
    return baseColors[severity as keyof typeof baseColors] || (isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200');
  };

  return (
    <div className={`h-full overflow-y-auto transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-800/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700' 
          : 'border-slate-200 bg-gradient-to-r from-slate-50 to-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                Filters
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Refine your view
              </p>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-xl transition-colors font-semibold border ${
                isDarkMode 
                  ? 'text-red-400 hover:bg-red-900/20 border-red-800' 
                  : 'text-red-600 hover:bg-red-50 border-red-200'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Basemap Toggle */}
        <div className="space-y-3">
          <h3 className={`text-sm font-semibold flex items-center space-x-2 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <Map className="w-4 h-4" />
            <span>Map Style</span>
          </h3>
          <button
            onClick={() => dispatch(toggleBasemapStyle())}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border shadow-sm ${
              isDarkMode 
                ? 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-slate-600' 
                : 'bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-slate-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              {basemapStyle === 'streets' ? (
                <Map className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
              ) : (
                <Satellite className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
              )}
              <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                {basemapStyle === 'streets' ? 'Street View' : 'Satellite View'}
              </span>
            </div>
            <div className={`text-xs px-2 py-1 rounded-lg border ${
              isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-500 border-slate-300'
            }`}>
              Toggle
            </div>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Incident Types */}
        <div className="space-y-4">
          <h3 className={`text-sm font-semibold flex items-center space-x-2 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <Tag className="w-4 h-4" />
            <span>Incident Types</span>
            {filters.types.length > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
              }`}>
                {filters.types.length}
              </span>
            )}
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {INCIDENT_TYPES.map((type) => (
              <label key={type} className={`flex items-center space-x-3 cursor-pointer group p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
              }`}>
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={(e) => handleTypeChange(type, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className={`text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-slate-300 group-hover:text-slate-100' 
                    : 'text-slate-700 group-hover:text-slate-900'
                }`}>
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Severity Levels */}
        <div className="space-y-4">
          <h3 className={`text-sm font-semibold flex items-center space-x-2 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <AlertCircle className="w-4 h-4" />
            <span>Severity Levels</span>
            {filters.severities.length > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                isDarkMode ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800'
              }`}>
                {filters.severities.length}
              </span>
            )}
          </h3>
          <div className="space-y-3">
            {SEVERITY_LEVELS.map((severity) => (
              <label key={severity} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.severities.includes(severity)}
                  onChange={(e) => handleSeverityChange(severity, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  filters.severities.includes(severity) 
                    ? getSeverityColor(severity) + ' ring-2 ring-offset-1 ring-blue-500' 
                    : getSeverityColor(severity) + ' opacity-70 group-hover:opacity-100'
                }`}>
                  {severity}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-4">
          <h3 className={`text-sm font-semibold flex items-center space-x-2 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <Calendar className="w-4 h-4" />
            <span>Date Range</span>
          </h3>
          <div className={`space-y-4 p-4 rounded-xl border transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-2">
              <label className={`block text-xs font-semibold uppercase tracking-wide ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                From Date
              </label>
              <input
                type="date"
                value={filters.dateRange.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-600 text-slate-200' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-xs font-semibold uppercase tracking-wide ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                To Date
              </label>
              <input
                type="date"
                value={filters.dateRange.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-600 text-slate-200' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};