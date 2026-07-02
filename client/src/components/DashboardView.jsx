import React, { useEffect, useState } from 'react';
import API_BASE from '../api';

const DashboardView = ({ currentUser, onLogout, onOpenListModal }) => {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'saved', 'inquiries', 'insights', 'settings'
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dealership Profile States
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Dynamic stats
  const totalViews = listings.length > 0 ? (listings.length * 1050 + 1204).toLocaleString() : '0';
  const totalInquiriesCount = inquiries.length;

  const fetchDashboardData = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      // 1. Fetch user listings
      const listingsResponse = await fetch(`${API_BASE}/api/listings?owner=${encodeURIComponent(currentUser.email)}`);
      if (!listingsResponse.ok) {
        throw new Error('Failed to load dashboard listings');
      }
      const listingsData = await listingsResponse.json();
      setListings(listingsData);

      // 2. Fetch user inquiries
      const inquiriesResponse = await fetch(`${API_BASE}/api/inquiries?seller=${encodeURIComponent(currentUser.email)}`);
      if (inquiriesResponse.ok) {
        const inquiriesData = await inquiriesResponse.json();
        setInquiries(inquiriesData);
      }

      // 3. Fetch seller profile details
      const sellerRes = await fetch(`${API_BASE}/api/sellers/${encodeURIComponent(currentUser.email)}`);
      if (sellerRes.ok) {
        const sellerData = await sellerRes.json();
        setBusinessName(sellerData.businessName || '');
        setAddress(sellerData.address || '');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/listings/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (vehicle) => {
    alert(`Editing details for "${vehicle.title}" is a premium developer feature. Values: Price ${formatPrice(vehicle.price)}.`);
  };

  const handleBoost = (title) => {
    alert(`"${title}" has been successfully boosted! It will receive priority search placements.`);
  };

  const handleReply = (buyerEmail, listingTitle) => {
    alert(`Composing email draft reply to ${buyerEmail} regarding your "${listingTitle}" listing...`);
  };

  const handleUpdateSellerProfile = async (e) => {
    e.preventDefault();
    if (!businessName || !address) {
      alert('Please enter both Dealership Name and Address.');
      return;
    }
    setUpdatingProfile(true);
    try {
      const response = await fetch(`${API_BASE}/api/sellers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          businessName,
          address
        })
      });
      if (response.ok) {
        alert('Dealership profile updated successfully!');
      } else {
        const d = await response.json();
        alert(d.message || 'Failed to update profile.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (mi) => {
    return new Intl.NumberFormat('en-US').format(mi) + ' mi';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-container-max mx-auto flex flex-col md:flex-row min-h-[85vh] flex-grow">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-outline-variant bg-surface-container-lowest py-8 flex flex-col gap-2 flex-shrink-0">
        <div className="px-6 mb-8">
          <p className="font-label-sm text-outline uppercase tracking-widest text-[10px] font-bold">Dashboard</p>
        </div>
        
        <button 
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-3 px-6 py-4 text-left transition-all font-semibold border-r-4 cursor-pointer w-full ${
            activeTab === 'listings' 
              ? 'bg-surface-container border-primary text-primary font-bold' 
              : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">directions_car</span>
          <span className="font-body-md text-sm">My Listings</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-3 px-6 py-4 text-left transition-all font-semibold border-r-4 cursor-pointer w-full ${
            activeTab === 'saved' 
              ? 'bg-surface-container border-primary text-primary font-bold' 
              : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">bookmark</span>
          <span className="font-body-md text-sm">Saved</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-3 px-6 py-4 text-left transition-all font-semibold border-r-4 cursor-pointer w-full ${
            activeTab === 'inquiries' 
              ? 'bg-surface-container border-primary text-primary font-bold' 
              : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span className="font-body-md text-sm">Inquiries</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-3 px-6 py-4 text-left transition-all font-semibold border-r-4 cursor-pointer w-full ${
            activeTab === 'insights' 
              ? 'bg-surface-container border-primary text-primary font-bold' 
              : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          <span className="font-body-md text-sm">Insights</span>
        </button>
        
        <div className="mt-auto px-6 pt-8 border-t border-outline-variant/30 space-y-2">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 py-3 text-left transition-all font-semibold cursor-pointer w-full ${
              activeTab === 'settings' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="font-body-md text-sm">Settings</span>
          </button>
          
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 py-3 text-left transition-all font-semibold cursor-pointer w-full text-red-500 hover:text-red-700"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-body-md text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-margin-mobile md:p-margin-desktop bg-surface">
        {activeTab === 'listings' && (
          <>
            {/* Header & Analytics Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 border-b border-outline-variant pb-6">
              <div>
                <h1 className="font-display-lg text-display-lg-mobile md:text-headline-md text-on-surface font-bold">Active Listings</h1>
                <p className="text-on-surface-variant font-body-md text-sm mt-1">Manage your current inventory and monitor performance.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/30 min-w-[120px]">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Views</p>
                  <p className="text-2xl font-bold text-primary mt-1">{totalViews}</p>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-outline-variant/30 min-w-[120px]">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Inquiries</p>
                  <p className="text-2xl font-bold text-primary mt-1">{totalInquiriesCount}</p>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-on-surface-variant">Fetching inventory records...</p>
              </div>
            ) : error ? (
              <div className="py-24 text-center">
                <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
                <p className="text-error font-semibold mt-4">Failed to fetch inventory</p>
                <p className="text-on-surface-variant text-sm mt-1">{error}</p>
              </div>
            ) : listings.length === 0 ? (
              /* Empty State CTA */
              <div className="p-12 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center text-center bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
                <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-full mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">add_circle</span>
                </div>
                <h3 className="font-headline-md text-on-surface font-bold">Ready to sell another masterpiece?</h3>
                <p className="text-on-surface-variant max-w-md mx-auto mt-2 mb-8 text-sm">
                  Reach millions of collectors and enthusiasts. Our premium listing process takes less than 5 minutes.
                </p>
                <button 
                  onClick={onOpenListModal}
                  className="bg-primary text-on-primary px-10 py-3 rounded-full font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  Create New Listing
                </button>
              </div>
            ) : (
              /* Vehicle Card List */
              <div className="space-y-6">
                {listings.map((item) => (
                  <div 
                    key={item._id}
                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row transition-all duration-300 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
                  >
                    {/* Vehicle Image */}
                    <div className="lg:w-1/3 h-52 lg:h-auto overflow-hidden relative">
                      <img 
                        className="w-full h-full object-cover" 
                        src={item.imageUrl} 
                        alt={item.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = item.type === 'car'
                            ? "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
                            : "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-grow p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                          <div>
                            <span className={`inline-block px-3 py-0.5 text-[9px] font-bold rounded-full mb-2 uppercase tracking-widest ${
                              item.isFeatured ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface-variant'
                            }`}>
                              {item.isFeatured ? 'Featured' : 'Standard'}
                            </span>
                            <h3 className="text-headline-md font-bold text-primary line-clamp-1">{item.title}</h3>
                            <p className="text-on-surface-variant text-xs mt-1">ID: VEL-{item._id.substring(0,6).toUpperCase()} • Posted recently</p>
                          </div>
                          <p className="text-headline-md font-bold text-primary sm:text-right">{formatPrice(item.price)}</p>
                        </div>

                        {/* Specs grid */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 pb-6 border-b border-outline-variant/30 text-on-surface-variant text-sm font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-outline text-[18px]">speed</span>
                            <span>{formatMileage(item.mileage)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-outline text-[18px]">settings_input_component</span>
                            <span>{item.type === 'car' ? (item.transmission || 'Automatic') : (item.engineSize || 'Manual')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-outline text-[18px]">local_gas_station</span>
                            <span>{item.fuelType || 'Petrol'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons & stats summary */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-4">
                        <div className="flex gap-6 text-on-surface-variant text-xs font-semibold">
                          <div>
                            <p className="text-outline uppercase text-[9px] tracking-wider">Views</p>
                            <p className="font-bold text-primary text-sm mt-0.5">{(item.price * 0.008 + 20).toFixed(0)}</p>
                          </div>
                          <div>
                            <p className="text-outline uppercase text-[9px] tracking-wider">Inquiries</p>
                            <p className="font-bold text-primary text-sm mt-0.5">
                              {inquiries.filter(inq => inq.listingId === item._id).length}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant hover:bg-surface-container-low rounded-lg font-bold text-xs cursor-pointer select-none"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-bold text-xs cursor-pointer select-none"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                          </button>
                          {item.isFeatured === false && (
                            <button 
                              onClick={() => handleBoost(item.title)}
                              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer select-none"
                            >
                              Boost Listing
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Saved Items Mock view */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <h1 className="font-display-lg text-headline-md text-on-surface font-bold border-b border-outline-variant pb-6">Saved Masterpieces</h1>
            <div className="p-12 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
              <span className="material-symbols-outlined text-outline text-5xl mb-4">bookmark_border</span>
              <p className="text-primary font-bold text-lg">No saved vehicles yet</p>
              <p className="text-on-surface-variant text-sm mt-1 mb-6">Click the heart button on listing grids to build your curated wishlist collection.</p>
              <button 
                onClick={onOpenListModal}
                className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all cursor-pointer shadow-md"
              >
                Explore Catalog
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Buyer Inquiries Tab view */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <h1 className="font-display-lg text-headline-md text-on-surface font-bold border-b border-outline-variant pb-6">Buyer Inquiries</h1>
            {inquiries.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
                <span className="material-symbols-outlined text-outline text-5xl mb-4">chat_bubble_outline</span>
                <p className="text-primary font-bold text-lg">No inquiries yet</p>
                <p className="text-on-surface-variant text-sm mt-1">Incoming buyer contact messages will be listed here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {inquiries.map((inq) => (
                  <div key={inq._id} className="p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl space-y-4 shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Regarding Listing</span>
                        <h4 className="font-bold text-primary text-body-lg mt-0.5">{inq.listingTitle}</h4>
                      </div>
                      <span className="text-xs text-on-surface-variant font-semibold bg-surface-container px-3 py-1 rounded-full">
                        {formatDate(inq.createdAt)}
                      </span>
                    </div>
                    
                    <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20">
                      <p className="text-sm font-semibold text-primary mb-1">
                        Buyer: {inq.buyerName} ({inq.buyerEmail})
                      </p>
                      <p className="text-on-surface-variant text-sm mt-2 leading-relaxed italic">
                        "{inq.message}"
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button 
                        onClick={() => handleReply(inq.buyerEmail, inq.listingTitle)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">reply</span> Reply to Buyer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Insights Mock view */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h1 className="font-display-lg text-headline-md text-on-surface font-bold border-b border-outline-variant pb-6">Portfolio Insights</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
                <h3 className="font-bold text-primary mb-2">Market Valuation</h3>
                <p className="text-on-surface-variant text-sm">Real-time demand metrics for your portfolio.</p>
                <div className="h-48 flex items-end justify-between gap-4 mt-8">
                  <div className="w-full bg-outline-variant/40 rounded-t-lg h-[20%] text-center text-[10px] text-on-surface font-bold pt-2">Jan</div>
                  <div className="w-full bg-outline-variant/40 rounded-t-lg h-[40%] text-center text-[10px] text-on-surface font-bold pt-2">Feb</div>
                  <div className="w-full bg-outline-variant/40 rounded-t-lg h-[35%] text-center text-[10px] text-on-surface font-bold pt-2">Mar</div>
                  <div className="w-full bg-primary rounded-t-lg h-[80%] text-center text-[10px] text-white font-bold pt-2">Apr</div>
                </div>
              </div>
              <div className="p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex flex-col justify-center items-center text-center">
                <span className="material-symbols-outlined text-primary text-5xl mb-4">trending_up</span>
                <h3 className="font-bold text-primary text-lg">Acquisition Rank: Top 4%</h3>
                <p className="text-on-surface-variant text-sm mt-1 max-w-xs">Your listed inventory is performing better than 96% of similar luxury car categories in California.</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings view */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h1 className="font-display-lg text-headline-md text-on-surface font-bold border-b border-outline-variant pb-6">Dashboard Settings</h1>
            
            {/* Account Settings */}
            <section className="space-y-4">
              <h3 className="font-bold text-primary text-lg border-b border-outline-variant/30 pb-2">Account Profile</h3>
              <div className="grid grid-cols-2 gap-4 max-w-xl">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-outline">First Name</label>
                  <input type="text" defaultValue={currentUser?.firstName} disabled className="w-full px-4 py-2 border border-outline-variant rounded-lg font-semibold bg-surface-container-low text-outline cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Last Name</label>
                  <input type="text" defaultValue={currentUser?.lastName} disabled className="w-full px-4 py-2 border border-outline-variant rounded-lg font-semibold bg-surface-container-low text-outline cursor-not-allowed" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Email Address</label>
                  <input type="email" disabled defaultValue={currentUser?.email} className="w-full px-4 py-2 border border-outline-variant rounded-lg font-semibold bg-surface-container-low text-outline cursor-not-allowed" />
                </div>
              </div>
            </section>

            {/* Dealership profile settings */}
            <section className="space-y-4 pt-6 border-t border-outline-variant/30">
              <h3 className="font-bold text-primary text-lg border-b border-outline-variant/30 pb-2">Dealership Settings</h3>
              <form onSubmit={handleUpdateSellerProfile} className="space-y-4 max-w-xl">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Dealership / Business Name</label>
                  <input 
                    type="text" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg font-semibold bg-surface text-primary outline-none focus:ring-1 focus:ring-primary" 
                    placeholder="e.g. Prestige Motors Group"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Showroom Address / Location</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg font-semibold bg-surface text-primary outline-none focus:ring-1 focus:ring-primary" 
                    placeholder="e.g. Beverly Hills, CA"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={updatingProfile}
                  className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {updatingProfile ? 'Saving...' : 'Save Dealership Settings'}
                </button>
              </form>
            </section>

            {/* Notifications configuration */}
            <section className="space-y-4 pt-6 border-t border-outline-variant/30">
              <h3 className="font-bold text-primary text-lg border-b border-outline-variant/30 pb-2">Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-0" />
                  <span className="text-body-md text-on-surface-variant font-semibold">Email notifications on inquiry messages</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-0" />
                  <span className="text-body-md text-on-surface-variant font-semibold">Notify me about weekly market demand summaries</span>
                </label>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardView;
