import React, { useState, useEffect } from 'react';
import API_BASE from '../api';

const AdminView = ({ currentUser, onLogout, onSelectType }) => {
  const [activeSubTab, setActiveSubTab] = useState('approvals'); // 'overview', 'approvals', 'users', 'transactions', 'settings'
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Email authorization check helper
  const isAdmin = (user) => {
    if (!user) return false;
    const email = user.email.toLowerCase().trim();
    return email === 'ajanidhruvraj@gmail.com' || email === 'ajanidhruvraj@gmail..com';
  };

  useEffect(() => {
    if (isAdmin(currentUser)) {
      fetchAdminData();
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch listings
      const listingsResponse = await fetch(`${API_BASE}/api/listings`);
      if (!listingsResponse.ok) {
        throw new Error('Failed to load listings data');
      }
      const listingsData = await listingsResponse.json();
      setListings(listingsData);

      // 2. Fetch users
      const usersResponse = await fetch(`${API_BASE}/api/auth/users`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // 3. Fetch inquiries
      const inquiriesResponse = await fetch(`${API_BASE}/api/inquiries`);
      if (inquiriesResponse.ok) {
        const inquiriesData = await inquiriesResponse.json();
        setInquiries(inquiriesData);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, title) => {
    setActionMessage('');
    try {
      const response = await fetch(`${API_BASE}/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: true })
      });
      if (!response.ok) {
        throw new Error('Failed to approve listing');
      }
      setActionMessage(`"${title}" has been successfully approved and featured in the marketplace.`);
      fetchAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id, title) => {
    if (!window.confirm(`Are you sure you want to reject/delete listing "${title}"?`)) return;
    setActionMessage('');
    try {
      const response = await fetch(`${API_BASE}/api/listings/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to reject listing');
      }
      setActionMessage(`"${title}" was rejected and removed from database.`);
      fetchAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  // If user is not authorized, display premium Access Denied page
  if (!isAdmin(currentUser)) {
    return (
      <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 flex-grow flex items-center justify-center min-h-[80vh]">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-red-100 rounded-full blur-[120px] opacity-10"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[45%] h-[45%] bg-red-200 rounded-full blur-[120px] opacity-10"></div>
        </div>
        <div className="relative z-10 max-w-md w-full bg-surface-container-lowest p-10 rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.06)] border border-outline-variant/30 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 text-error flex items-center justify-center rounded-full mx-auto ring-8 ring-red-50/50">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_bad</span>
          </div>
          <h2 className="font-display-lg text-headline-md text-primary font-bold">Access Restricted</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            The Veloce Marketplace Administration Panel is exclusively accessible to authorized accounts. The account <strong>{currentUser?.email || 'Guest'}</strong> does not possess administrative privileges.
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={() => onSelectType(null)}
              className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-sm"
            >
              Return to Catalog
            </button>
            <button 
              onClick={onLogout}
              className="w-full py-3 border border-outline-variant hover:bg-surface-container-low text-primary font-bold rounded-lg active:scale-[0.98] transition-all cursor-pointer text-sm"
            >
              Sign in with Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats dynamically
  const activeCount = listings.length;
  const pendingCount = listings.filter(item => !item.isFeatured).length;
  const featuredCount = listings.filter(item => item.isFeatured).length;
  const totalUsers = users.length;
  
  // Calculate Gross Portfolio Value dynamically from featured listings
  const grossValuation = listings.reduce((acc, curr) => acc + (curr.isFeatured ? curr.price : 0), 0);
  const userInitials = `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();

  // Filter listings based on search
  const filteredListings = listings.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      item.make.toLowerCase().includes(query) ||
      item.model.toLowerCase().includes(query) ||
      (item.owner && item.owner.toLowerCase().includes(query))
    );
  });

  // Filter users based on search
  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      u.firstName.toLowerCase().includes(query) ||
      u.lastName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  });

  const pendingListings = filteredListings.filter(item => !item.isFeatured);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-container-max mx-auto flex flex-col md:flex-row min-h-[85vh] flex-grow">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-outline-variant bg-surface-container-lowest py-8 flex flex-col gap-2 flex-shrink-0">
        <div className="px-6 mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">shield_person</span>
          <p className="font-label-sm text-primary uppercase tracking-widest text-[11px] font-bold">Admin Console</p>
        </div>

        <button 
          onClick={() => setActiveSubTab('approvals')}
          className={`flex items-center gap-3 px-6 py-4 text-left transition-all font-semibold border-r-4 cursor-pointer w-full ${
            activeSubTab === 'approvals' 
              ? 'bg-surface-container border-primary text-primary font-bold' 
              : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeSubTab === 'approvals' ? "'FILL' 1" : undefined }}>verified</span>
          <span className="font-body-md text-sm flex-1">Listing Approvals</span>
          {pendingCount > 0 && (
            <span className="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-3 px-6 py-4 text-left transition-all font-semibold border-r-4 cursor-pointer w-full ${
            activeSubTab === 'overview' 
              ? 'bg-surface-container border-primary text-primary font-bold' 
              : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeSubTab === 'overview' ? "'FILL' 1" : undefined }}>dashboard</span>
          <span className="font-body-md text-sm">Overview Stats</span>
        </button>

        <button 
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-3 px-6 py-4 text-left transition-all font-semibold border-r-4 cursor-pointer w-full ${
            activeSubTab === 'users' 
              ? 'bg-surface-container border-primary text-primary font-bold' 
              : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeSubTab === 'users' ? "'FILL' 1" : undefined }}>group</span>
          <span className="font-body-md text-sm">User Management</span>
          {totalUsers > 0 && (
            <span className="ml-auto bg-surface-variant text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full font-bold">
              {totalUsers}
            </span>
          )}
        </button>

        <button 
          onClick={() => {
            alert('System Settings are simulation-only in developer preview mode.');
            setActiveSubTab('settings');
          }}
          className={`flex items-center gap-3 px-6 py-4 text-left transition-all font-semibold border-r-4 cursor-pointer w-full ${
            activeSubTab === 'settings' 
              ? 'bg-surface-container border-primary text-primary font-bold' 
              : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeSubTab === 'settings' ? "'FILL' 1" : undefined }}>settings</span>
          <span className="font-body-md text-sm">System Settings</span>
        </button>

        <div className="mt-auto px-6 pt-8 border-t border-outline-variant/30 space-y-4">
          {/* Admin Profile Info Card */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-primary text-xs truncate">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-[9px] text-on-surface-variant font-semibold uppercase tracking-wider">Super Admin</p>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="flex items-center gap-3 py-2 text-left transition-all font-semibold cursor-pointer w-full text-red-500 hover:text-red-700"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-body-md text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-margin-mobile md:p-margin-desktop bg-surface overflow-x-hidden">
        
        {/* Alerts & Action Feedback */}
        {actionMessage && (
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg mb-6 text-sm font-semibold flex items-center gap-2 animate-pulse">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Global Operations Headers */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-10 border-b border-outline-variant pb-6">
          <div>
            <h1 className="font-display-lg text-display-lg-mobile md:text-headline-md text-on-surface font-bold">Marketplace Console</h1>
            <p className="text-on-surface-variant font-body-md text-sm mt-1">Global Operations &amp; Intelligence Dashboard</p>
          </div>
          
          {/* Search bar inside admin view */}
          <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/60 w-full lg:w-72">
            <span className="material-symbols-outlined text-outline text-[18px] mr-2">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm p-0 w-full text-primary outline-none font-semibold"
              placeholder={activeSubTab === 'users' ? "Search users..." : "Search entries..."}
            />
          </div>
        </div>

        {/* KPI Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0px_8px_30px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">group</span>
              </div>
            </div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Total Users</p>
            <h3 className="text-2xl font-bold text-primary">{totalUsers}</h3>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0px_8px_30px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-on-tertiary-fixed">directions_car</span>
              </div>
            </div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Active Listings</p>
            <h3 className="text-2xl font-bold text-primary">{activeCount}</h3>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0px_8px_30px_rgba(0,0,0,0.05)] ring-2 ring-primary/5">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary">pending_actions</span>
              </div>
              <span className="text-[10px] font-bold text-error uppercase tracking-wider">Priority</span>
            </div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-primary">{pendingCount}</h3>
          </div>

          <div className="bg-primary p-6 rounded-xl shadow-md transition-all hover:translate-y-[-2px]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white">payments</span>
              </div>
              <span className="text-[10px] font-bold text-white/70 uppercase">Showcase</span>
            </div>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Portfolio Valuation</p>
            <h3 className="text-2xl font-bold text-white">{formatPrice(grossValuation)}</h3>
          </div>
        </div>

        {/* Dynamic approvals sub-view tab */}
        {activeSubTab === 'approvals' && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
            <div className="px-6 py-5 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-headline-md font-bold text-primary">Listing Approvals</h2>
                <p className="text-on-surface-variant text-xs mt-1">High-value vehicle listings waiting for authorization</p>
              </div>
              <div className="text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
                {pendingListings.length} Requests Found
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-on-surface-variant font-semibold">Loading submissions...</p>
              </div>
            ) : error ? (
              <div className="py-24 text-center">
                <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
                <p className="text-error font-bold mt-4">Connection Failed</p>
                <p className="text-on-surface-variant text-sm mt-1">{error}</p>
              </div>
            ) : pendingListings.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-full mx-auto mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <h3 className="font-bold text-primary text-lg">All caught up!</h3>
                <p className="text-on-surface-variant text-sm mt-1">There are no pending listing approval requests currently in the queue.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/40">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Vehicle</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Seller</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Requested Price</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {pendingListings.map((item) => (
                      <tr key={item._id} className="hover:bg-surface-container-low/20 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-10 rounded bg-surface-container overflow-hidden flex-shrink-0">
                              <img className="w-full h-full object-cover" src={item.imageUrl} alt={item.title} />
                            </div>
                            <div>
                              <p className="font-bold text-primary text-sm line-clamp-1">{item.title}</p>
                              <p className="text-[10px] text-outline mt-0.5">ID: {item._id.substring(0,8).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-primary font-semibold text-sm truncate max-w-[150px]">{item.owner || 'Standard Individual'}</p>
                          <p className="text-[10px] text-outline mt-0.5">{item.location || 'Unknown Location'}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-primary font-bold text-sm">{formatPrice(item.price)}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleApprove(item._id, item.title)}
                              className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors cursor-pointer"
                              title="Approve & Feature"
                            >
                              <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            </button>
                            <button 
                              onClick={() => handleReject(item._id, item.title)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Reject & Delete"
                            >
                              <span className="material-symbols-outlined text-[20px]">cancel</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Overview Tab Content */}
        {activeSubTab === 'overview' && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] space-y-6">
            <h2 className="text-headline-md font-bold text-primary border-b border-outline-variant/20 pb-4">Global Operations Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-surface-container-low rounded-xl space-y-2">
                <h3 className="font-bold text-primary text-sm uppercase tracking-wider">Featured Showcase vs Pending</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Monitor the ratio of verified featured acquisitions to incoming user submissions.
                </p>
                <div className="pt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-primary mb-1">
                      <span>Featured Showcase</span>
                      <span>{featuredCount} ({activeCount > 0 ? ((featuredCount/activeCount)*100).toFixed(0) : 0}%)</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${activeCount > 0 ? (featuredCount/activeCount)*100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-primary mb-1">
                      <span>Pending Verification</span>
                      <span>{pendingCount} ({activeCount > 0 ? ((pendingCount/activeCount)*100).toFixed(0) : 0}%)</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: `${activeCount > 0 ? (pendingCount/activeCount)*100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-surface-container-low rounded-xl flex flex-col justify-center items-center text-center">
                <span className="material-symbols-outlined text-primary text-5xl mb-3">gavel</span>
                <h4 className="font-bold text-primary">Verification Authority</h4>
                <p className="text-xs text-on-surface-variant mt-2 max-w-xs leading-relaxed">
                  You are logged in as the master administrator account. You possess full override authority to verify, promote, edit, or reject listings across the Veloce platform.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Management tab */}
        {activeSubTab === 'users' && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
            <div className="px-6 py-5 border-b border-outline-variant/30">
              <h2 className="text-headline-md font-bold text-primary">User Registry</h2>
              <p className="text-on-surface-variant text-xs mt-1">Manage registered accounts and dealerships</p>
            </div>
            
            {loading ? (
              <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-on-surface-variant font-semibold">Loading users database...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-16 text-center">
                <span className="material-symbols-outlined text-outline text-5xl mb-4">group</span>
                <h3 className="font-bold text-primary text-lg">No users found</h3>
                <p className="text-on-surface-variant text-sm mt-1">Try refining your search keyword query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/40">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Name</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Email Address</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Joined Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline text-right">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {filteredUsers.map((u) => {
                      const isEmailAdmin = u.email.toLowerCase() === 'ajanidhruvraj@gmail.com' || u.email.toLowerCase() === 'ajanidhruvraj@gmail..com';
                      return (
                        <tr key={u._id || u.email} className="hover:bg-surface-container-low/20 transition-colors">
                          <td className="px-6 py-5">
                            <p className="font-bold text-primary text-sm">{u.firstName} {u.lastName}</p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-on-surface-variant text-sm font-semibold">{u.email}</p>
                          </td>
                          <td className="px-6 py-5 text-sm text-outline">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'N/A'}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              isEmailAdmin
                                ? 'bg-primary text-white'
                                : 'bg-surface-variant text-on-surface-variant'
                            }`}>
                              {isEmailAdmin ? 'Super Admin' : 'Seller'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* System Settings Mock tab */}
        {activeSubTab === 'settings' && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] text-center py-16">
            <span className="material-symbols-outlined text-outline text-5xl mb-4">settings</span>
            <h3 className="font-bold text-primary text-lg">System Configurations</h3>
            <p className="text-on-surface-variant text-sm mt-1 max-w-md mx-auto leading-relaxed">
              System flags, security configurations, and API keys are managed via environment variables and server configuration profiles.
            </p>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminView;
