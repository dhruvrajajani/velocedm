import React, { useState, useEffect } from 'react';
import API_BASE from '../api';

const AuthView = ({ onAuthSuccess, onBackToHome }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const hasRealGoogleClientId = googleClientId && !googleClientId.includes('placeholder') && googleClientId.length > 20;

  // Google OAuth Initialization (Only if a real Client ID is configured)
  useEffect(() => {
    if (!hasRealGoogleClientId) return;

    // Dynamically load Google Identity Services Script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleSignIn();
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [isLogin, hasRealGoogleClientId]);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const btnEl = document.getElementById("google-signin-button");
      if (btnEl) {
        window.google.accounts.id.renderButton(btnEl, {
          theme: "outline",
          size: "large",
          width: btnEl.offsetWidth || 180,
          text: "signin_with",
          shape: "rectangular"
        });
      }
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setMessage('Authenticating with Google...');
    setIsError(false);

    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Google Authentication failed on backend');
      }

      setMessage('Welcome! Redirecting...');
      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess(data.user);
        }
      }, 600);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dev-mode Google login: constructs a mock JWT and calls the backend
  const handleDevGoogleLogin = async () => {
    setLoading(true);
    setMessage('Signing in with Google...');
    setIsError(false);

    const payloadObj = {
      email: 'google.user@gmail.com',
      given_name: 'Google',
      family_name: 'User',
      picture: ''
    };

    try {
      const headerBase64 = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
      const payloadBase64 = btoa(JSON.stringify(payloadObj));
      const mockToken = `${headerBase64}.${payloadBase64}.mocksignature`;

      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: mockToken })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Google Auth simulation failed');
      }

      setMessage('Welcome! Redirecting...');
      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess(data.user);
        }
      }, 600);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      setMessage(data.message || 'Login successful!');
      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess(data.user);
        }
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupFirstName || !signupLastName || !signupEmail || !signupPassword) {
      setErrorMsg('Please fill in all registration fields.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: signupFirstName,
          lastName: signupLastName,
          email: signupEmail,
          password: signupPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setMessage(data.message || 'Registration successful!');
      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess(data.user);
        }
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setErrorMsg = (msg) => {
    setIsError(true);
    setMessage(msg);
  };

  return (
    <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 flex-grow flex items-center justify-center min-h-[80vh]">
      {/* Background Ambient Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-secondary-fixed rounded-full blur-[100px] opacity-10"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[45%] h-[45%] bg-tertiary-fixed rounded-full blur-[100px] opacity-10"></div>
      </div>

      {/* Auth Shell Card */}
      <div className="relative z-10 w-full flex flex-col md:flex-row bg-surface-container-lowest rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.06)] border border-outline-variant/30 overflow-hidden min-h-[680px]">
        
        {/* Left Grid Panel: Cover details */}
        <div className="hidden md:flex md:w-3/5 relative bg-primary items-end p-12 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center opacity-85 mix-blend-overlay transition-all duration-700 hover:scale-[1.03]" 
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBNf_fiB4aJXj4JJinHUOcvOABsyNBrKF18oCgzjTPXd3-5wbZ6Vxvrn5Zprg3ShKB7mtME9ydzQYzDf6wyfn9wvu20E6nkmIAADGPYWHKbcCXuEU4LY0kmJTZNPdf7FCx32q9J4Sidn71waXEv7dRYKUTMu8cgmXY7StdnBH1bkVPMgrRx1RwqiHRTHOSY83HrfZ33LvMCappFDxSeaQifPZwz1rUXh0ONjYBVU_lUHWr2E7K65VMr')` }}
            >
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          </div>
          <div className="relative z-10 space-y-3">
            <span 
              onClick={onBackToHome}
              className="font-display-lg text-white select-none cursor-pointer tracking-tighter hover:opacity-90 block text-[42px]"
            >
              Veloce.
            </span>
            <p className="font-body-lg text-white/70 max-w-md leading-relaxed text-sm">
              Experience the future of automotive acquisition. Secure, seamless, and sophisticated marketplace for the discerning enthusiast.
            </p>
          </div>
        </div>

        {/* Right Grid Panel: Auth Form */}
        <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-surface-container-lowest">
          
          {/* Header Switcher Toggles */}
          <div className="flex items-center gap-6 mb-8 border-b border-outline-variant pb-2">
            <button 
              onClick={() => { setIsLogin(true); setMessage(''); }}
              className={`font-headline-md text-headline-md relative pb-2 transition-colors cursor-pointer font-bold ${
                isLogin ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Login
              {isLogin && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full transition-all duration-300"></span>}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setMessage(''); }}
              className={`font-headline-md text-headline-md relative pb-2 transition-colors cursor-pointer font-bold ${
                !isLogin ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Sign Up
              {!isLogin && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full transition-all duration-300"></span>}
            </button>
          </div>

          {/* Feedback alerts */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 text-sm font-semibold flex items-center gap-2 ${
              isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              <span className="material-symbols-outlined text-[18px]">
                {isError ? 'error' : 'check_circle'}
              </span>
              <span>{message}</span>
            </div>
          )}

          {/* Login Container Forms */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-label-sm text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Email Address</label>
                  <div className="flex items-center px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                    <span className="material-symbols-outlined text-outline mr-3 text-[20px]">mail</span>
                    <input 
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-md font-semibold text-primary outline-none placeholder:text-outline/40" 
                      placeholder="name@example.com" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-label-sm text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Password</label>
                    <a className="text-[10px] font-bold text-primary/70 hover:text-primary uppercase tracking-wider transition-colors" href="#">Forgot?</a>
                  </div>
                  <div className="flex items-center px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                    <span className="material-symbols-outlined text-outline mr-3 text-[20px]">lock</span>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-body-md font-semibold text-primary outline-none placeholder:text-outline/40" 
                      placeholder="••••••••" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="material-symbols-outlined text-outline hover:text-primary transition-colors cursor-pointer select-none text-[20px]"
                    >
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Continue to Dashboard'}
              </button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant"></div>
                </div>
                <div className="relative flex justify-center text-label-sm">
                  <span className="bg-surface-container-lowest px-4 text-outline font-bold text-[10px] uppercase tracking-widest">Or continue with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="flex justify-center w-full">
                {hasRealGoogleClientId ? (
                  <div id="google-signin-button" className="w-full flex justify-center h-[46px] overflow-hidden rounded-lg"></div>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleDevGoogleLogin} 
                    className="flex items-center justify-center gap-2.5 w-full h-[46px] border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors group active:scale-[0.98] cursor-pointer"
                  >
                    <img className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATw5Ir_pa8uRE1OMQxrVXHR7axWeKUHr9aVdyrxGBXZJw4utZM-qeFln3GfmZiIUX192XVcgM1IRZEYzEO3Kjqy-STLrUczuI1_T3TCx9p0ybYZK8zyG686cHKJbNey1qjAz8GwDKJcydEIeolDfc_bCWVnzn8BvI_CV-lsu-QyUndnFXMvvPnygaIo_EmlhdJlXEln8ACbx3iBn0mzTo6XmoddbWF7bU0v1t9O1mrvpCKOXI-_75V" alt="Google logo"/>
                    <span className="font-bold text-sm text-on-surface group-hover:text-primary">Sign in with Google</span>
                  </button>
                )}
              </div>
            </form>
          ) : (
            /* Signup Container Forms */
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-label-sm text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">First Name</label>
                    <input 
                      type="text"
                      value={signupFirstName}
                      onChange={(e) => setSignupFirstName(e.target.value)}
                      required
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md font-semibold text-primary outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline/40"
                      placeholder="John" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Last Name</label>
                    <input 
                      type="text"
                      value={signupLastName}
                      onChange={(e) => setSignupLastName(e.target.value)}
                      required
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md font-semibold text-primary outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline/40"
                      placeholder="Doe" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="font-label-sm text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Email Address</label>
                  <input 
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md font-semibold text-primary outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline/40"
                    placeholder="name@example.com" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-sm text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Create Password</label>
                  <input 
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md font-semibold text-primary outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline/40"
                    placeholder="Min. 8 characters" 
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.checked)}
                  className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-0 cursor-pointer"
                />
                <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">
                  I agree to the <a className="text-primary font-bold underline decoration-outline-variant underline-offset-4" href="#">Terms of Service</a> and <a className="text-primary font-bold underline decoration-offset-4" href="#">Privacy Policy</a>.
                </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>


            </form>
          )}

          {/* Footer Assistance Links */}
          <div className="mt-10 text-center border-t border-outline-variant/30 pt-6">
            <p className="text-[11px] text-on-surface-variant font-medium">
              Need help? <a className="text-primary font-bold hover:underline" href="#">Contact Veloce Concierge</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
