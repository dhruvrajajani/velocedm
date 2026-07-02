import React, { useState, useEffect } from 'react';
import API_BASE from '../api';

const DetailsView = ({ vehicleId, onBackToBrowse, onSelectVehicle }) => {
  const [vehicle, setVehicle] = useState(null);
  const [similarVehicles, setSimilarVehicles] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inquiry Form States
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Seller & Reviews States
  const [sellerInfo, setSellerInfo] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [revName, setRevName] = useState('');
  const [revEmail, setRevEmail] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchVehicleDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch current vehicle details
      const response = await fetch(`${API_BASE}/api/listings/${vehicleId}`);
      if (!response.ok) {
        throw new Error('Failed to load vehicle details');
      }
      const data = await response.json();
      setVehicle(data);
      setActiveImageIndex(0);
      setInquiryMsg(`Hello, I am interested in your ${data.title} listed on Veloce. Please contact me with more information.`);

      const ownerEmail = data.owner || 'demo@veloce.com';

      // 2. Fetch seller profile details
      try {
        const sellerRes = await fetch(`${API_BASE}/api/sellers/${encodeURIComponent(ownerEmail)}`);
        if (sellerRes.ok) {
          const sellerData = await sellerRes.json();
          setSellerInfo(sellerData);
        }
      } catch (sellerErr) {
        console.error('Failed to load seller info', sellerErr);
      }

      // 3. Fetch reviews for the seller
      try {
        const reviewsRes = await fetch(`${API_BASE}/api/reviews?seller=${encodeURIComponent(ownerEmail)}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviewsList(reviewsData);
        }
      } catch (reviewsErr) {
        console.error('Failed to load seller reviews', reviewsErr);
      }

      // 4. Fetch similar vehicles of the same type (limited to 3)
      const similarResponse = await fetch(`${API_BASE}/api/listings?type=${data.type}`);
      if (similarResponse.ok) {
        const similarData = await similarResponse.json();
        const filtered = similarData.filter(item => item._id !== vehicleId).slice(0, 3);
        setSimilarVehicles(filtered);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicleId]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail || !inquiryMsg) {
      alert('Please fill out all fields.');
      return;
    }
    setSubmittingInquiry(true);
    try {
      const response = await fetch(`${API_BASE}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: vehicle._id,
          listingTitle: vehicle.title,
          sellerEmail: vehicle.owner || 'demo@veloce.com',
          buyerName,
          buyerEmail,
          message: inquiryMsg
        })
      });
      if (response.ok) {
        setInquirySent(true);
        setTimeout(() => {
          setShowInquiryForm(false);
          setInquirySent(false);
          setBuyerName('');
          setBuyerEmail('');
        }, 3000);
      } else {
        const d = await response.json();
        alert(d.message || 'Failed to send inquiry.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!revName || !revEmail || !revComment) {
      alert('Please fill in all fields.');
      return;
    }
    setSubmittingReview(true);
    try {
      const ownerEmail = vehicle.owner || 'demo@veloce.com';
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerEmail: ownerEmail,
          reviewerName: revName,
          reviewerEmail: revEmail,
          rating: Number(revRating),
          comment: revComment
        })
      });
      if (response.ok) {
        alert('Review submitted successfully!');
        setRevName('');
        setRevEmail('');
        setRevRating(5);
        setRevComment('');
        setShowReviewForm(false);

        // Refetch seller and review details to update rating display
        const sellerRes = await fetch(`${API_BASE}/api/sellers/${encodeURIComponent(ownerEmail)}`);
        if (sellerRes.ok) {
          const sellerData = await sellerRes.json();
          setSellerInfo(sellerData);
        }
        const reviewsRes = await fetch(`${API_BASE}/api/reviews?seller=${encodeURIComponent(ownerEmail)}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviewsList(reviewsData);
        }
      } else {
        const d = await response.json();
        alert(d.message || 'Failed to submit review.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center flex-grow flex flex-col justify-center items-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-on-surface-variant font-medium">Loading premium vehicle portfolio...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="py-24 text-center px-4 max-w-md mx-auto flex-grow flex flex-col justify-center items-center">
        <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
        <p className="mt-4 text-error font-semibold">Error Loading Details</p>
        <p className="text-on-surface-variant text-sm mt-1 mb-6">{error || 'Vehicle not found.'}</p>
        <button 
          onClick={onBackToBrowse}
          className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold hover:opacity-85"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const galleryImages = vehicle.gallery && vehicle.gallery.length > 0
    ? vehicle.gallery
    : [vehicle.imageUrl];

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

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const specifications = vehicle.specifications || {
    'Make': vehicle.make,
    'Model': vehicle.model,
    'Year': vehicle.year,
    'Mileage': formatMileage(vehicle.mileage),
    'Transmission': vehicle.type === 'car' ? (vehicle.transmission || 'Automatic') : 'Manual Gearing',
    'Fuel Type': vehicle.fuelType || 'Petrol',
    'Engine Size': vehicle.type === 'bike' ? (vehicle.engineSize || '1000cc') : 'N/A',
    'Location': vehicle.location || 'Stuttgart, Germany'
  };

  const defaultNarrative = `${vehicle.year} ${vehicle.make} ${vehicle.model} represents the pinnacle of modern engineering, blending uncompromising performance with refined design details. Draped in high-end finishes, this specific chassis is finished in custom paint with custom specifications. The cockpit is a masterclass in ergonomics and luxury styling. This vehicle has been maintained to showroom condition and remains verified.`;

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 flex-grow">
      {/* Breadcrumbs Navigation */}
      <div className="mb-8">
        <nav className="flex text-on-surface-variant gap-2 mb-4 font-label-sm text-label-sm items-center">
          <button onClick={onBackToBrowse} className="hover:text-primary font-semibold select-none cursor-pointer">
            Inventory
          </button>
          <span>/</span>
          <span className="hover:text-primary font-medium capitalize">
            {vehicle.type === 'car' ? 'High-End Performance' : 'Enthusiast Two-Wheelers'}
          </span>
          <span>/</span>
          <span className="text-primary font-bold">{vehicle.title}</span>
        </nav>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface font-bold">
          {vehicle.title}
        </h1>
        <p className="text-on-surface-variant font-body-lg text-body-lg mt-2">
          {vehicle.type === 'car' ? 'Premium Trim' : 'Superbike'} • {vehicle.location || 'Showroom Condition'} • {vehicle.fuelType || 'Petrol'}
        </p>
      </div>

      {/* Gallery & Transaction Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Area: Gallery, Narrative, Specifications */}
        <div className="lg:col-span-8 space-y-12">
          {/* Main Photo Gallery */}
          <section className="space-y-4">
            <div className="relative group aspect-[16/9] overflow-hidden rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] bg-surface-container">
              <img 
                className="w-full h-full object-cover transition-opacity duration-300" 
                src={galleryImages[activeImageIndex]} 
                alt={`${vehicle.title} - View ${activeImageIndex + 1}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = vehicle.type === 'car' 
                    ? "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
                    : "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80";
                }}
              />
              {galleryImages.length > 1 && (
                <>
                  <div className="absolute inset-y-0 left-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={handlePrevImage}
                      className="bg-surface/85 p-2 rounded-full hover:bg-surface transition-colors shadow-lg flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={handleNextImage}
                      className="bg-surface/85 p-2 rounded-full hover:bg-surface transition-colors shadow-lg flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnail Selection */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {galleryImages.map((img, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`aspect-[16/9] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      index === activeImageIndex ? 'border-primary' : 'border-transparent hover:border-outline-variant'
                    }`}
                  >
                    <img 
                      className="w-full h-full object-cover" 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = vehicle.type === 'car'
                          ? "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=100&q=80"
                          : "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=100&q=80";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Vehicle Description Narrative */}
          <section className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Vehicle Narrative</h2>
            <div className="prose max-w-none text-on-surface-variant font-body-lg text-body-lg leading-relaxed whitespace-pre-line">
              <p>{vehicle.narrative || defaultNarrative}</p>
            </div>
          </section>

          {/* Technical Specifications */}
          <section className="space-y-6">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
              {Object.entries(specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between py-4 border-b border-outline-variant items-center">
                  <span className="text-on-surface-variant font-semibold capitalize">{key}</span>
                  <span className="text-on-surface font-medium">{val}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Seller Reviews Section */}
          <section className="space-y-6 pt-6 border-t border-outline-variant/30">
            <div className="flex justify-between items-center border-b border-outline-variant pb-4">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Seller Reviews</h2>
              <button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-label-sm font-label-sm text-primary uppercase tracking-wider hover:underline cursor-pointer font-bold"
              >
                {showReviewForm ? 'Cancel' : 'Leave a Review'}
              </button>
            </div>

            {/* Leave a Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="p-6 border border-outline-variant rounded-xl bg-surface-container-low space-y-4">
                <h4 className="font-bold text-primary">Write a Dealership Review</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Your Name *</label>
                    <input 
                      type="text" 
                      required
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-primary font-semibold focus:ring-1 focus:ring-primary outline-none" 
                      placeholder="e.g. John Smith" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Your Email *</label>
                    <input 
                      type="email" 
                      required
                      value={revEmail}
                      onChange={(e) => setRevEmail(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-primary font-semibold focus:ring-1 focus:ring-primary outline-none" 
                      placeholder="e.g. john@example.com" 
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Rating *</label>
                    <select 
                      value={revRating}
                      onChange={(e) => setRevRating(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-primary font-bold focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="5">★★★★★ (5 Stars)</option>
                      <option value="4">★★★★☆ (4 Stars)</option>
                      <option value="3">★★★☆☆ (3 Stars)</option>
                      <option value="2">★★☆☆☆ (2 Stars)</option>
                      <option value="1">★☆☆☆☆ (1 Star)</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Review Comment *</label>
                    <textarea 
                      required
                      rows="3"
                      value={revComment}
                      onChange={(e) => setRevComment(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-primary font-semibold focus:ring-1 focus:ring-primary outline-none resize-none" 
                      placeholder="Share your buying/selling experience with this dealer..." 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={submittingReview}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-xs hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            {reviewsList.length === 0 ? (
              <p className="text-on-surface-variant text-sm italic">No reviews have been posted for this seller yet.</p>
            ) : (
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev._id} className="p-5 border border-outline-variant/30 rounded-xl bg-surface-container-lowest space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-sm">{rev.reviewerName}</span>
                        <div className="flex text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span 
                              key={i} 
                              className="material-symbols-outlined text-[16px]" 
                              style={{ fontVariationSettings: `'FILL' ${i < rev.rating ? 1 : 0}` }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Sidebar: Transaction Card & Quick Specs */}
        <aside className="lg:col-span-4 sticky top-28 space-y-6">
          {/* Action Transaction Box */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_8px_30px_rgba(0,0,0,0.08)] border border-outline-variant/30">
            <div className="mb-6">
              <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest font-bold">Fixed Price</span>
              <div className="text-display-lg font-display-lg text-primary mt-1 font-bold">{formatPrice(vehicle.price)}</div>
              <p className="text-on-surface-variant mt-2 text-sm font-medium">
                Financing available from {formatPrice(vehicle.price * 0.012)}/mo
              </p>
            </div>
            
            <div className="space-y-3">
              <button className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer">
                Buy Now
              </button>
              <button 
                onClick={() => setShowInquiryForm(!showInquiryForm)}
                className="w-full bg-surface text-primary border border-primary py-4 rounded-lg font-bold text-lg hover:bg-surface-container-low active:scale-[0.98] transition-all cursor-pointer"
              >
                {showInquiryForm ? 'Cancel Contact' : 'Contact Seller'}
              </button>
            </div>

            {showInquiryForm && (
              <form onSubmit={handleInquirySubmit} className="mt-4 p-4 border border-outline-variant rounded-lg bg-surface-container-low space-y-4">
                {inquirySent ? (
                  <div className="text-green-600 font-bold text-sm text-center py-4">
                    ✓ Inquiry sent successfully! The seller will contact you shortly.
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Your Name *</label>
                      <input 
                        type="text"
                        required
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full bg-surface px-3 py-2 text-sm border border-outline-variant rounded-lg outline-none text-primary font-semibold focus:ring-1 focus:ring-primary"
                        placeholder="e.g. John Smith"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Your Email *</label>
                      <input 
                        type="email"
                        required
                        value={buyerEmail}
                        onChange={(e) => e.target.value && setBuyerEmail(e.target.value)}
                        className="w-full bg-surface px-3 py-2 text-sm border border-outline-variant rounded-lg outline-none text-primary font-semibold focus:ring-1 focus:ring-primary"
                        placeholder="e.g. smith@example.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-outline">Message *</label>
                      <textarea 
                        required
                        rows="3"
                        value={inquiryMsg}
                        onChange={(e) => setInquiryMsg(e.target.value)}
                        className="w-full bg-surface px-3 py-2 text-sm border border-outline-variant rounded-lg outline-none text-primary font-semibold focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={submittingInquiry}
                      className="w-full py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {submittingInquiry ? 'Sending...' : 'Send Inquiry'}
                    </button>
                  </>
                )}
              </form>
            )}

            <hr className="my-8 border-outline-variant"/>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-on-surface-variant font-medium text-sm">
                <span className="material-symbols-outlined text-green-600 font-bold">verified</span>
                <span>Certified Inspection Report</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant font-medium text-sm">
                <span className="material-symbols-outlined text-green-600 font-bold">local_shipping</span>
                <span>Enclosed Nationwide Shipping</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant font-medium text-sm">
                <span className="material-symbols-outlined text-green-600 font-bold">gavel</span>
                <span>Escrow Protection Included</span>
              </div>
            </div>
          </div>

          {/* Quick Specs Widget */}
          <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
            <h4 className="font-bold text-primary">Quick Check</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface rounded-lg">
                <p className="text-xs text-on-surface-variant uppercase font-bold">Mileage</p>
                <p className="font-bold text-primary mt-1">{formatMileage(vehicle.mileage)}</p>
              </div>
              <div className="p-4 bg-surface rounded-lg">
                <p className="text-xs text-on-surface-variant uppercase font-bold">Year</p>
                <p className="font-bold text-primary mt-1">{vehicle.year}</p>
              </div>
              <div className="p-4 bg-surface rounded-lg">
                <p className="text-xs text-on-surface-variant uppercase font-bold">Owners</p>
                <p className="font-bold text-primary mt-1">1</p>
              </div>
              <div className="p-4 bg-surface rounded-lg">
                <p className="text-xs text-on-surface-variant uppercase font-bold">Status</p>
                <p className="font-bold text-green-600 mt-1">Available</p>
              </div>
            </div>
          </div>

          {/* Share / Watchlist Actions */}
          <div className="flex justify-center gap-6 py-2">
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">share</span>
              <span className="font-label-sm text-label-sm font-semibold">Share</span>
            </button>
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">favorite</span>
              <span className="font-label-sm text-label-sm font-semibold">Watchlist</span>
            </button>
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">report</span>
              <span className="font-label-sm text-label-sm font-semibold">Report</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Seller Information Card */}
      <div className="mt-12">
        <section className="bg-surface-container-low p-8 rounded-xl space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Seller Information</h2>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-4xl">verified_user</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md font-bold">
                {sellerInfo ? sellerInfo.businessName : 'Prestige Motors Group'}
              </h3>
              <p className="text-on-surface-variant font-medium">
                {sellerInfo ? (sellerInfo.isVerified ? 'Authorized Dealer' : 'Independent Enthusiast') : 'Authorized Dealer'} • {sellerInfo ? sellerInfo.address : 'Beverly Hills, CA'}
              </p>
              <div className="flex items-center gap-1 mt-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span 
                    key={i} 
                    className="material-symbols-outlined scale-75 text-yellow-500" 
                    style={{ fontVariationSettings: `'FILL' ${i < Math.round(sellerInfo ? sellerInfo.rating : 4.9) ? 1 : 0}` }}
                  >
                    star
                  </span>
                ))}
                <span className="ml-2 font-bold text-sm text-primary">
                  {sellerInfo ? sellerInfo.rating : '4.9'} ({reviewsList.length} Reviews)
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Similar Acquisitions Grid */}
      {similarVehicles.length > 0 && (
        <section className="mt-24 space-y-8">
          <div className="flex justify-between items-end border-b border-outline-variant pb-4">
            <div>
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary font-bold">Similar Acquisitions</h2>
              <p className="text-on-surface-variant mt-2 font-medium">Curated performance vehicles currently in stock</p>
            </div>
            <button onClick={onBackToBrowse} className="text-primary font-bold hover:underline cursor-pointer">
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarVehicles.map((item) => (
              <div 
                key={item._id}
                onClick={() => onSelectVehicle(item._id)}
                className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      src={item.imageUrl} 
                      alt={item.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = item.type === 'car'
                          ? "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
                          : "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    {item.isFeatured && (
                      <div className="absolute top-4 right-4 bg-surface/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-headline-md text-headline-md text-primary group-hover:text-primary transition-colors line-clamp-1 font-bold">
                        {item.title}
                      </h3>
                      <span className="text-lg font-bold text-primary flex-shrink-0">{formatPrice(item.price)}</span>
                    </div>
                    <div className="flex gap-4 text-on-surface-variant font-label-sm text-label-sm uppercase mt-4 font-semibold">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">calendar_today</span> 
                        {item.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">speed</span> 
                        {formatMileage(item.mileage)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">settings</span> 
                        {item.type === 'car' ? (item.transmission || 'Auto') : (item.engineSize || 'Manual')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default DetailsView;
