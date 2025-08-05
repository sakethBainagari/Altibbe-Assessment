import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config/environment';

interface Product {
  _id: string;
  name: string;
  category: string;
  createdAt: string;
  transparencyScore?: {
    overall_score: number;
    score_level: string;
    score_color: string;
  };
}

interface User {
  id: string;
  email: string;
  companyName: string;
  role: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
    loadProducts();
  }, []);

  const loadUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/auth/login');
    }
  };

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const response = await axios.get(`${config.apiUrl}/my-products`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setProducts(response.data.data.products);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/auth/login');
      } else {
        setError('Failed to load products');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleDownloadReport = async (product: Product) => {
    setDownloadingId(product._id);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(`${config.apiUrl}/generate-pdf`, {
        name: product.name,
        category: product.category,
        questions: [],
        answers: []
      }, {
        responseType: 'blob',
        headers,
        timeout: 30000
      });

      console.log('PDF response received:', response);
      console.log('Response headers:', response.headers);

      // Check content type to determine if it's PDF or text
      const contentType = response.headers['content-type'] || 'application/pdf';
      const isTextFile = contentType.includes('text/plain');
      
      // Create blob with correct MIME type
      const blob = new Blob([response.data], { 
        type: isTextFile ? 'text/plain' : 'application/pdf' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on content type
      const baseFilename = `product-report-${product.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
      link.download = isTextFile ? `${baseFilename}.txt` : `${baseFilename}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      let errorMessage = 'Failed to download report';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Report generation timed out. Please try again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Report generation service not available.';
      } else if (err.response?.status === 500) {
        errorMessage = err.response?.data?.message || 'Server error during report generation';
      }
      
      setError(errorMessage);
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
          <p className="text-white/80 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center text-white/80 hover:text-white mr-8 transition-colors group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Company Dashboard</h1>
                <p className="text-white/70">Welcome back, <span className="text-blue-400 font-medium">{user?.companyName}</span></p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/form/step1"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Assessment
              </Link>
              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-white font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 overflow-hidden shadow-xl rounded-2xl transform hover:scale-105 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">{products.length}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-300 truncate">📊 Total Products</dt>
                      <dd className="text-xl font-bold text-white">{products.length} assessed</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 overflow-hidden shadow-xl rounded-2xl transform hover:scale-105 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {products.filter(p => p.transparencyScore && p.transparencyScore.overall_score >= 70).length}
                      </span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-300 truncate">✅ High Scores</dt>
                      <dd className="text-xl font-bold text-white">
                        {products.filter(p => p.transparencyScore && p.transparencyScore.overall_score >= 70).length} products 70%+
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 overflow-hidden shadow-xl rounded-2xl transform hover:scale-105 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">🤖</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-300 truncate">🔮 AI-Powered</dt>
                      <dd className="text-xl font-bold text-white">Smart assessments</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl overflow-hidden rounded-2xl">
            <div className="px-6 py-6 border-b border-white/20">
              <h3 className="text-2xl leading-6 font-bold text-white flex items-center">
                <span className="mr-3">📈</span>
                Your Product Assessments
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-gray-300">
                Track transparency scores and download reports for all your products.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border-b border-red-400/30 backdrop-blur-sm">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">No products yet</h3>
                <p className="mt-1 text-sm text-gray-300 mb-8">Get started by creating your first product assessment.</p>
                <Link
                  to="/form/step1"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  🚀 Start Assessment
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {products.map((product) => (
                  <li key={product._id} className="px-6 py-6 hover:bg-white/5 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {product.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white">{product.name}</p>
                          <p className="text-sm text-gray-300 flex items-center">
                            <span className="mr-2">🏷️</span>
                            {product.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        {product.transparencyScore && (
                          <div className="text-center">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                              product.transparencyScore.overall_score >= 80 ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                              product.transparencyScore.overall_score >= 60 ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                              product.transparencyScore.overall_score >= 40 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                              'bg-red-500/20 text-red-300 border border-red-400/30'
                            }`}>
                              <span className="mr-1">
                                {product.transparencyScore.overall_score >= 80 ? '🟢' :
                                 product.transparencyScore.overall_score >= 60 ? '🔵' :
                                 product.transparencyScore.overall_score >= 40 ? '🟡' : '🔴'}
                              </span>
                              {product.transparencyScore.overall_score}% {product.transparencyScore.score_level}
                            </div>
                          </div>
                        )}
                        <div className="text-sm text-gray-400 flex items-center">
                          <span className="mr-1">📅</span>
                          {formatDate(product.createdAt)}
                        </div>
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleDownloadReport(product)}
                            disabled={downloadingId === product._id}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
                          >
                            {downloadingId === product._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <span className="mr-1">📄</span>
                                View Report
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
