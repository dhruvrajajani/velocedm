import React, { useState } from 'react';
import API_BASE from '../api';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Subscription failed.');
      }

      setMessage(data.message || 'Successfully subscribed!');
      setEmail('');
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 border-t border-outline-variant">
      <div className="px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto text-center">
        <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">Never miss a drop.</h2>
        <p className="text-on-surface-variant mb-10">
          Join our mailing list to receive exclusive early access to the rarest vehicle listings and market analysis.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-6 py-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-primary font-medium"
            placeholder="Your email address" 
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-on-primary px-10 py-4 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm font-semibold ${isError ? 'text-error' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
