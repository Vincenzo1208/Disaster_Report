import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Filter,  RotateCcw, Map, Satellite, Calendar, Tag, AlertCircle } from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { setFilters, clearFilters, toggleBasemapStyle } from '../../store/incidentSlice';
import { INCIDENT_TYPES, SEVERITY_LEVELS } from '../../types/incident';

export const FilterPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { filters, basemapStyle } = useSelector((state: RootState) => state.incidents);

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
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm h-full overflow-y-auto">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Filters</h2>
              <p className="text-sm text-slate-500">Refine your view</p>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold border border-red-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
            <Map className="w-4 h-4" />
            <span>Map Style</span>
          </h3>
          <button
            onClick={() => dispatch(toggleBasemapStyle())}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 rounded-xl transition-all duration-200 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center space-x-3">
              {basemapStyle === 'streets' ? (
                <Map className="w-5 h-5 text-slate-600" />
              ) : (
                <Satellite className="w-5 h-5 text-slate-600" />
              )}
              <span className="font-semibold text-slate-700">
                {basemapStyle === 'streets' ? 'Street View' : 'Satellite View'}
              </span>
            </div>
            <div className="text-xs text-slate-500 bg-white px-2 py-1 rounded-lg border">
              Toggle
            </div>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
            <Tag className="w-4 h-4" />
            <span>Incident Types</span>
            {filters.types.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                {filters.types.length}
              </span>
            )}
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {INCIDENT_TYPES.map((type) => (
              <label key={type} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={(e) => handleTypeChange(type, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Severity Levels</span>
            {filters.severities.length > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-bold">
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

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Date Range</span>
          </h3>
          <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateRange.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateRange.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};