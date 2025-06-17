import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Plus, List, Map as MapIcon, AlertTriangle, Activity } from 'lucide-react';
import { store } from './store';
import { DisasterMap } from './components/Map/DisasterMap';
import { IncidentForm } from './components/IncidentForm/IncidentForm';
import { IncidentList } from './components/IncidentList/IncidentList';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { fetchIncidents } from './store/incidentSlice';

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { error, filteredIncidents } = useSelector((state: RootState) => state.incidents);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  
  const [showForm, setShowForm] = useState(false);
  const [formLocation, setFormLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  useEffect(() => {
    dispatch(fetchIncidents());
  }, [dispatch]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showForm]);

  const handleMapClick = (lat: number, lng: number) => {
    console.log('Map clicked:', lat, lng, 'isSelectingLocation:', isSelectingLocation);
    if (isSelectingLocation) {
      setFormLocation({ lat, lng });
      setIsSelectingLocation(false);
      console.log('Location set:', { lat, lng });
    }
  };

  const handleReportIncident = () => {
    setShowForm(true);
    setFormLocation(null);
    setIsSelectingLocation(false);
  };

  const handleLocationSelect = () => {
    setIsSelectingLocation(true);
    console.log('Location selection mode activated');
  };

  const handleFormClose = () => {
    setShowForm(false);
    setFormLocation(null);
    setIsSelectingLocation(false);
  };

  const criticalIncidents = filteredIncidents.filter(
    incident => (incident.incidentType === 'Fire' || incident.incidentType === 'Explosion') && 
                incident.severity === 'Critical'
  );

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      {/* Enhanced Header */}
      <header className={`shadow-lg border-b z-20 relative transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-slate-800/95 backdrop-blur-sm border-slate-700/50' 
          : 'bg-white/95 backdrop-blur-sm border-slate-200/50'
      }`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                  isDarkMode 
                    ? 'from-slate-100 to-slate-300' 
                    : 'from-slate-800 to-slate-600'
                }`}>
                  Disaster Response Center
                </h1>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Real-time incident monitoring & reporting
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Stats Badge */}
              <div className={`hidden sm:flex items-center space-x-4 px-4 py-2 rounded-xl transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
              }`}>
                <div className="flex items-center space-x-2">
                  <Activity className={`w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} />
                  <span className={`text-sm font-semibold ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    {filteredIncidents.length} Active
                  </span>
                </div>
                {criticalIncidents.length > 0 && (
                  <div className="flex items-center space-x-2 px-2 py-1 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-red-700 dark:text-red-300">
                      {criticalIncidents.length} Critical
                    </span>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Mobile List Toggle */}
              <button
                onClick={() => setShowMobileList(!showMobileList)}
                className={`md:hidden p-3 rounded-xl transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {showMobileList ? <MapIcon className="w-5 h-5" /> : <List className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleReportIncident}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Report Incident</span>
              </button>
            </div>
          </div>
          
          {error && (
            <div className={`mt-4 p-4 border rounded-xl text-sm flex items-center space-x-2 ${
              isDarkMode 
                ? 'bg-red-900/50 border-red-800 text-red-300' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Sidebar */}
        <div className={`${
          showMobileList 
            ? 'fixed inset-0 z-30' 
            : 'hidden md:flex'
        } md:w-96 flex-col shadow-2xl border-r transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-slate-800/95 backdrop-blur-sm border-slate-700/50' 
            : 'bg-white/95 backdrop-blur-sm border-slate-200/50'
        }`}>
          {showMobileList && (
            <div className={`p-6 border-b md:hidden transition-colors duration-300 ${
              isDarkMode 
                ? 'border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700' 
                : 'border-slate-200 bg-gradient-to-r from-slate-50 to-white'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  Control Panel
                </h2>
                <button
                  onClick={() => setShowMobileList(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <MapIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className={`h-1/2 border-b transition-colors duration-300 ${
              isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'
            }`}>
              <FilterPanel />
            </div>
            <div className="h-1/2">
              <IncidentList />
            </div>
          </div>
        </div>

        {/* Enhanced Map Container */}
        <div className={`flex-1 relative ${showMobileList ? 'hidden md:block' : 'block'}`}>
          <DisasterMap
            onMapClick={handleMapClick}
            clickableMarker={formLocation ? [formLocation.lat, formLocation.lng] : undefined}
            isSelectingLocation={isSelectingLocation}
          />
          
          {/* Location Selection Indicator */}
          {isSelectingLocation && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
              <div className="flex items-center space-x-2">
                <MapIcon className="w-5 h-5" />
                <span className="font-semibold">Click on the map to select location</span>
              </div>
            </div>
          )}
          
          {/* Map Overlay Info */}
          <div className={`absolute top-4 right-4 z-10 rounded-xl shadow-lg p-4 border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-slate-800/95 backdrop-blur-sm border-slate-700/50' 
              : 'bg-white/95 backdrop-blur-sm border-slate-200/50'
          }`}>
            <div className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <div className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                Legend
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Form Modal */}
      {showForm && (
        <IncidentForm
          isOpen={showForm}
          onClose={handleFormClose}
          selectedLocation={formLocation}
          onLocationSelect={handleLocationSelect}
          isSelectingLocation={isSelectingLocation}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;