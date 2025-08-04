import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  companyName: string;
  role: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header with Glass Effect */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">TransparencyAI</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{user.companyName.charAt(0)}</span>
                    </div>
                    <span className="text-white font-medium">{user.companyName}</span>
                  </div>
                  <Link
                    to="/dashboard"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white/80 hover:text-white font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="text-white/80 hover:text-white font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              AI-Powered
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> 
                {" "}Product{" "}
              </span>
              Transparency
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your compliance process with intelligent assessments, 
              dynamic AI questions, and professional transparency reports
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/form/step1"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
              >
                <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Free Assessment
                <svg className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              {!user && (
                <Link
                  to="/auth/register"
                  className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-medium rounded-full transition-all duration-300 border border-white/20 hover:border-white/40"
                >
                  <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Create Company Account
                </Link>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/60 text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>AI-Powered Questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Professional Reports</span>
              </div>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* AI Intelligence Card */}
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart AI Questions</h3>
              <p className="text-white/70 leading-relaxed">
                Our advanced AI generates contextual questions tailored to your specific product category, 
                ensuring comprehensive transparency assessment.
              </p>
              <div className="mt-6 flex items-center text-blue-400 font-medium">
                <span>Powered by Gemini AI</span>
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Scoring System Card */}
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Transparency Scoring</h3>
              <p className="text-white/70 leading-relaxed">
                Get detailed transparency scores with multi-criteria evaluation. 
                Understand your product's compliance level with actionable insights.
              </p>
              <div className="mt-6 flex items-center text-purple-400 font-medium">
                <span>Multi-dimensional Analysis</span>
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Professional Reports Card */}
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl md:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Professional PDFs</h3>
              <p className="text-white/70 leading-relaxed">
                Generate comprehensive PDF reports with detailed analysis, 
                recommendations, and compliance documentation ready for stakeholders.
              </p>
              <div className="mt-6 flex items-center text-green-400 font-medium">
                <span>Export & Share</span>
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-xl text-white/70">Simple 3-step process to get your transparency report</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Product Details</h3>
                <p className="text-white/70">Enter your product information and select the appropriate category for assessment</p>
              </div>
              
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI Assessment</h3>
                <p className="text-white/70">Answer AI-generated questions specifically designed for your product type</p>
              </div>
              
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Get Results</h3>
                <p className="text-white/70">Receive your transparency score and download professional PDF report</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
