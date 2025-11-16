import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log('Form submitted - preventDefault called');
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Starting login/register process');
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      console.log('Validation failed: missing email or password');
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      console.log('Making API call to:', endpoint);
      const response = await api.post(endpoint, { email, password });

      console.log('API call successful:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      navigate('/home');
    } catch (err) {
      console.log('Error occurred:', err);
      console.log('Error response:', err.response);
      console.log('Error request:', err.request);
      
      // Handle different error types
      if (err.response) {
        // Server responded with error
        const errorMessage = err.response.data?.message || 'An error occurred';
        console.log('Server error message:', errorMessage);
        console.log('Status code:', err.response.status);
        
        if (err.response.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (err.response.status === 400) {
          setError(errorMessage);
        } else {
          setError(errorMessage || 'An error occurred. Please try again.');
        }
      } else if (err.request) {
        // Request was made but no response received
        console.log('No response received from server');
        setError('Cannot connect to server. Please check your connection and try again.');
      } else {
        // Something else happened
        console.log('Unexpected error:', err.message);
        setError('An unexpected error occurred. Please try again.');
      }
      setLoading(false);
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-black px-4 py-8">
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-center gap-3">
          <Logo className="size-10 sm:size-12 text-green-700" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-green-700 font-bold">Coin Collector</h1>
        </div>
        <h2 className="text-center mb-6 sm:mb-8 text-gray-700 text-lg sm:text-xl md:text-2xl font-semibold">
          {isRegister ? 'Register' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 sm:mb-5">
            <label className="block mb-2 font-semibold text-gray-700 text-sm sm:text-base">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 text-base"
              required
            />
          </div>
          <div className="mb-4 sm:mb-5">
            <label className="block mb-2 font-semibold text-gray-700 text-sm sm:text-base">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {!showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mt-3 mb-3 rounded text-sm sm:text-base">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base sm:text-lg"
            disabled={loading}
          >
            <span className="hidden sm:inline">{loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}</span>
            <span className="sm:hidden">{loading ? '⏳' : isRegister ? '📝' : '🔓'}</span>
          </button>
        </form>
        <p className="text-center mt-4 sm:mt-6 text-gray-600 text-sm sm:text-base">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            className="text-green-700 underline hover:text-green-800 bg-transparent border-none cursor-pointer"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;

