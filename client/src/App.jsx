import React, { useEffect, useState } from 'react';
import API_BASE from './api';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ListingsGrid from './components/ListingsGrid';
import BentoSection from './components/BentoSection';
import ListVehicleModal from './components/ListVehicleModal';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import BrowseView from './components/BrowseView';
import DetailsView from './components/DetailsView';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import AdminView from './components/AdminView';

function App() {
  const [listings, setListings] = useState([]);
  const [view, setView] = useState('home');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // Restore session from localStorage on first load
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('veloce_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [searchFilters, setSearchFilters] = useState({
    type: '',
    makes: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    year: '',
    sort: 'Newest Arrivals',
    search: ''
  });
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();

      // Home view defaults to retrieving only featured elements
      if (view === 'home') {
        params.append('isFeatured', 'true');
      } else {
        // Browse view appends all active query selectors
        if (searchFilters.type) params.append('type', searchFilters.type);
        if (searchFilters.makes) params.append('makes', searchFilters.makes);
        if (searchFilters.model) params.append('model', searchFilters.model);
        if (searchFilters.minPrice) params.append('minPrice', searchFilters.minPrice);
        if (searchFilters.maxPrice) params.append('maxPrice', searchFilters.maxPrice);
        if (searchFilters.year) params.append('year', searchFilters.year);
        if (searchFilters.sort) params.append('sort', searchFilters.sort);
        if (searchFilters.search) params.append('search', searchFilters.search);
      }

      const response = await fetch(`${API_BASE}/api/listings?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load listings from database API');
      }
      const data = await response.json();
      setListings(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only refetch listings if we are in Home or Browse view
    if (view !== 'details' && view !== 'auth' && view !== 'dashboard') {
      fetchListings();
    }
  }, [view, searchFilters]);

  // Handle queries submitted from the main Hero search form
  const handleHeroSearch = (filters) => {
    setView('browse');
    setSelectedVehicleId(null);
    setSearchFilters({
      type: filters.type || '',
      makes: filters.make || '',
      model: filters.model || '',
      minPrice: '',
      maxPrice: '',
      year: '',
      sort: 'Newest Arrivals',
      search: ''
    });
  };

  // Handle queries submitted from the top Navbar search bar
  const handleNavbarSearch = (text) => {
    setView('browse');
    setSelectedVehicleId(null);
    setSearchFilters({
      type: '',
      makes: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      year: '',
      sort: 'Newest Arrivals',
      search: text
    });
  };

  // Handle filters checked/selected within the sidebar Browse view
  const handleSidebarFilterChange = (newFilters) => {
    setSearchFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Helper: redirect guest users to auth page
  const requireAuth = (callback) => {
    if (!currentUser) {
      setView('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    if (callback) callback();
    return true;
  };

  // Switch views from clicking menu links (Browse, logo)
  const handleNavigationSelect = (type) => {
    setSelectedVehicleId(null);
    if (type === null) {
      setView('home');
      setSearchFilters({
        type: '',
        makes: '',
        model: '',
        minPrice: '',
        maxPrice: '',
        year: '',
        sort: 'Newest Arrivals',
        search: ''
      });
    } else if (type === 'auth') {
      setView('auth');
    } else if (type === 'dashboard') {
      requireAuth(() => {
        const isUserAdmin = currentUser && (
          currentUser.email.toLowerCase() === 'ajanidhruvraj@gmail.com' ||
          currentUser.email.toLowerCase() === 'ajanidhruvraj@gmail..com'
        );
        setView(isUserAdmin ? 'admin' : 'dashboard');
      });
    } else if (type === 'admin') {
      requireAuth(() => setView('admin'));
    } else {
      requireAuth(() => {
        setView('browse');
        setSearchFilters({
          type: type === 'all' ? '' : type,
          makes: '',
          model: '',
          minPrice: '',
          maxPrice: '',
          year: '',
          sort: 'Newest Arrivals',
          search: ''
        });
      });
    }
  };

  // Select a vehicle card to view details (requires login)
  const handleSelectVehicle = (id) => {
    requireAuth(() => {
      setSelectedVehicleId(id);
      setView('details');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // Return from details view back to catalog
  const handleBackToBrowse = () => {
    setView('browse');
    setSelectedVehicleId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('veloce_user');
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to restrict listing vehicle access to logged in users
  const handleOpenListModal = () => {
    if (currentUser) {
      setIsListModalOpen(true);
    } else {
      setView('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // SEGREGATE listings for segment rendering on the Home view
  const cars = listings.filter(item => item.type === 'car');
  const bikes = listings.filter(item => item.type === 'bike');

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col justify-between">
      <div>
        <Navbar 
          onOpenListModal={handleOpenListModal} 
          onSelectType={handleNavigationSelect}
          onSearch={handleNavbarSearch}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {view === 'home' && (
          <>
            <Hero onSearch={handleHeroSearch} />

            {/* Trust Markers Section */}
            <section className="py-12 bg-surface-container-low border-y border-outline-variant">
              <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-4xl">verified_user</span>
                    <div>
                      <p className="font-headline-md text-[16px] font-bold text-primary">Verified Sellers</p>
                      <p className="text-on-surface-variant text-sm">Background checked</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-4xl">payments</span>
                    <div>
                      <p className="font-headline-md text-[16px] font-bold text-primary">Secure Payments</p>
                      <p className="text-on-surface-variant text-sm">Escrow protection</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-4xl">health_and_safety</span>
                    <div>
                      <p className="font-headline-md text-[16px] font-bold text-primary">Vehicle History</p>
                      <p className="text-on-surface-variant text-sm">Full transparency</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-4xl">support_agent</span>
                    <div>
                      <p className="font-headline-md text-[16px] font-bold text-primary">24/7 Concierge</p>
                      <p className="text-on-surface-variant text-sm">Expert assistance</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {loading ? (
              <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-on-surface-variant">Loading curated collection...</p>
              </div>
            ) : error ? (
              <div className="py-24 text-center px-4 max-w-md mx-auto">
                <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
                <p className="mt-4 text-error font-semibold">Connection Error</p>
                <p className="text-on-surface-variant text-sm mt-1 mb-6">{error}</p>
                <button 
                  onClick={fetchListings}
                  className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold hover:opacity-85"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <>
                <ListingsGrid 
                  title="Featured Cars" 
                  subtitle="Curated selections from the world's finest collections."
                  listings={cars} 
                  type="car"
                  onSelectVehicle={handleSelectVehicle}
                />
                
                <BentoSection onOpenListModal={handleOpenListModal} />
                
                <ListingsGrid 
                  title="Featured Bikes" 
                  subtitle="Two-wheeled masterpieces of design and speed."
                  listings={bikes} 
                  type="bike"
                  onSelectVehicle={handleSelectVehicle}
                />
              </>
            )}
          </>
        )}

        {view === 'browse' && (
          <BrowseView 
            listings={listings}
            onFilterChange={handleSidebarFilterChange}
            initialFilters={searchFilters}
            loading={loading}
            onSelectVehicle={handleSelectVehicle}
          />
        )}

        {view === 'details' && (
          <DetailsView 
            vehicleId={selectedVehicleId}
            onBackToBrowse={handleBackToBrowse}
            onSelectVehicle={handleSelectVehicle}
          />
        )}

        {view === 'auth' && (
          <AuthView 
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              localStorage.setItem('veloce_user', JSON.stringify(user));
              const isUserAdmin = user && (
                user.email.toLowerCase() === 'ajanidhruvraj@gmail.com' ||
                user.email.toLowerCase() === 'ajanidhruvraj@gmail..com'
              );
              setView(isUserAdmin ? 'admin' : 'dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToHome={() => {
              setView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {view === 'dashboard' && (
          <DashboardView 
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenListModal={() => setIsListModalOpen(true)}
          />
        )}

        {view === 'admin' && (
          <AdminView 
            currentUser={currentUser}
            onLogout={handleLogout}
            onSelectType={handleNavigationSelect}
          />
        )}

        <Newsletter />
      </div>

      <Footer />

      <ListVehicleModal 
        isOpen={isListModalOpen} 
        onClose={() => setIsListModalOpen(false)}
        onSuccess={fetchListings}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;
