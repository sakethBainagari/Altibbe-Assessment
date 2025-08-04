import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PRODUCT_CATEGORIES } from '../types';

interface Step1Props {
  formData: {
    name: string;
    category: string;
  };
  updateFormData: (data: { name: string; category: string }) => void;
}

export default function Step1({ formData, updateFormData }: Step1Props) {
  const navigate = useNavigate();
  const [localData, setLocalData] = useState(formData);
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication before proceeding
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/auth/login');
      return;
    }
    
    // Validation
    const newErrors: { name?: string; category?: string } = {};
    
    if (!localData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!localData.category) {
      newErrors.category = 'Product category is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Update form data and proceed
    updateFormData(localData);
    navigate('/form/step2');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden py-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center text-white/80 hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
          </Link>
        </div>

        {/* Authentication Notice */}
        {!isAuthenticated && (
          <div className="mb-6 p-5 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-2xl">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-blue-300 mb-1">Company Account Required</h3>
                <p className="text-blue-200/80">Please log in to save and track your product assessments permanently.</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-400">Step 1 of 3</span>
            <span className="text-sm text-white/70">Basic Information</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-md">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full shadow-lg" style={{ width: '33.33%' }}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">Basic Information</h1>
            <p className="text-white/70 text-lg">
              Let's start with some basic information about your product.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-3">
                Product Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="name"
                  value={localData.name}
                  onChange={(e) => {
                    setLocalData({ ...localData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border ${
                    errors.name ? 'border-red-400/50' : 'border-white/20'
                  } rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg`}
                  placeholder="Enter your product name"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-300 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Product Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-white/90 mb-3">
                Product Category *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <select
                  id="category"
                  value={localData.category}
                  onChange={(e) => {
                    setLocalData({ ...localData, category: e.target.value });
                    if (errors.category) setErrors({ ...errors, category: undefined });
                  }}
                  className={`w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border ${
                    errors.category ? 'border-red-400/50' : 'border-white/20'
                  } rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg appearance-none cursor-pointer`}
                >
                  <option value="" className="bg-slate-800 text-white">Select a category</option>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category} className="bg-slate-800 text-white">
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.category && (
                <p className="mt-2 text-sm text-red-300 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.category}
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center px-6 py-3 text-white/80 hover:text-white font-medium transition-colors group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
              
              <button
                type="submit"
                className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                Next Step
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
