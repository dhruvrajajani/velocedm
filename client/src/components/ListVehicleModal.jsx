import React, { useState } from 'react';
import API_BASE from '../api';

const ListVehicleModal = ({ isOpen, onClose, onSuccess, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'car',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    engineSize: '',
    location: '',
    imageUrl: '',
    isFeatured: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Form validation
    if (!formData.title || !formData.make || !formData.model || !formData.price || !formData.mileage) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        owner: currentUser ? currentUser.email : ''
      };

      const response = await fetch(`${API_BASE}/api/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to list vehicle.');
      }

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        title: '',
        type: 'car',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        price: '',
        mileage: '',
        transmission: 'Automatic',
        fuelType: 'Gasoline',
        engineSize: '',
        location: '',
        imageUrl: '',
        isFeatured: false
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-surface rounded-xl shadow-2xl border border-outline-variant max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant">
          <h2 className="font-headline-md text-primary">List Your Vehicle</h2>
          <button 
            onClick={onClose} 
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-1 rounded-full hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-error-container text-on-error-container p-4 rounded-lg text-sm border border-error">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-primary mb-1">Listing Title *</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                placeholder="e.g. 2023 Porsche 911 GT3 RS"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Vehicle Type *</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>

            {/* Make */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Make *</label>
              <input 
                type="text" 
                name="make" 
                value={formData.make} 
                onChange={handleChange}
                placeholder="e.g. Porsche"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
                required
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Model *</label>
              <input 
                type="text" 
                name="model" 
                value={formData.model} 
                onChange={handleChange}
                placeholder="e.g. 911 GT3"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
                required
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Year *</label>
              <input 
                type="number" 
                name="year" 
                value={formData.year} 
                onChange={handleChange}
                min="1900" 
                max={new Date().getFullYear() + 1}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Price (USD) *</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange}
                placeholder="e.g. 150000"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
                required
              />
            </div>

            {/* Mileage */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Mileage (mi) *</label>
              <input 
                type="number" 
                name="mileage" 
                value={formData.mileage} 
                onChange={handleChange}
                placeholder="e.g. 1200"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
                required
              />
            </div>

            {/* Conditional Fields based on Type */}
            {formData.type === 'car' ? (
              <>
                {/* Transmission */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">Transmission</label>
                  <select 
                    name="transmission" 
                    value={formData.transmission} 
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="PDK Auto">PDK Auto</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">Fuel Type</label>
                  <select 
                    name="fuelType" 
                    value={formData.fuelType} 
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
                  >
                    <option value="Gasoline">Gasoline</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                {/* Engine Size */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">Engine Size (cc) *</label>
                  <input 
                    type="text" 
                    name="engineSize" 
                    value={formData.engineSize} 
                    onChange={handleChange}
                    placeholder="e.g. 1103cc"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
                    required
                  />
                </div>
                {/* Fuel Type (Bike) */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-1">Fuel Type</label>
                  <select 
                    name="fuelType" 
                    value={formData.fuelType} 
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </>
            )}

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Location</label>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange}
                placeholder="e.g. Stuttgart, Germany"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">Image URL</label>
              <input 
                type="url" 
                name="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange}
                placeholder="https://example.com/car.jpg"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
              />
            </div>

            {/* Featured */}
            <div className="md:col-span-2 flex items-center gap-2">
              <input 
                type="checkbox" 
                name="isFeatured" 
                id="isFeatured"
                checked={formData.isFeatured} 
                onChange={handleChange}
                className="w-4 h-4 text-primary bg-surface-container-low border-outline-variant rounded focus:ring-primary focus:ring-0"
              />
              <label htmlFor="isFeatured" className="text-sm font-semibold text-primary select-none cursor-pointer">
                Feature this vehicle on the home page grid
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-outline-variant pt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 border border-outline-variant text-primary rounded-lg font-bold hover:bg-surface-container transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? 'Submitting...' : 'Submit Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListVehicleModal;
