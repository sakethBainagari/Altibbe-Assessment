import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FormData } from '../types';
import config from '../config/environment';

interface Step3Props {
  formData: FormData;
  resetForm: () => void;
}

export default function Step3({ formData, resetForm }: Step3Props) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // Add auth header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Submit to backend API
      const response = await axios.post(`${config.apiUrl}/submit-product`, {
        name: formData.name,
        category: formData.category,
        questions: [], // These would come from step 2 in a real implementation
        answers: formData.answers
      }, { headers });

      if (response.data.success) {
        setSubmitted(true);
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (err: any) {
      let errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        errorMessage = 'Please log in to save your product assessment. Redirecting to login...';
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    setError(null);

    try {
      console.log('Sending PDF request with data:', {
        name: formData.name,
        category: formData.category,
        answers: formData.answers
      });

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // Add auth header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(`${config.apiUrl}/generate-pdf`, {
        name: formData.name,
        category: formData.category,
        questions: [], // These would come from step 2 in a real implementation
        answers: formData.answers
      }, {
        responseType: 'blob', // Important for handling binary data
        headers,
        timeout: 30000 // 30 seconds timeout for PDF generation
      });

      console.log('PDF response received:', response);
      console.log('Response headers:', response.headers);
      console.log('Response data type:', typeof response.data);
      console.log('Response data size:', response.data.size);

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
      const baseFilename = `product-report-${formData.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
      link.download = isTextFile ? `${baseFilename}.txt` : `${baseFilename}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('File download initiated successfully:', link.download);

    } catch (err: any) {
      console.error('PDF generation error:', err);
      let errorMessage = 'Failed to download PDF';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'PDF generation timed out. Please try again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'PDF generation endpoint not found. Please check if backend is running.';
      } else if (err.response?.status === 500) {
        errorMessage = err.response?.data?.message || 'Server error during PDF generation';
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to backend. Please ensure backend is running on port 5000.';
      }
      
      setError(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const handleStartOver = () => {
    resetForm();
    setSubmitted(false);
    setError(null);
    navigate('/');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">🎉 Success!</h2>
          <p className="text-gray-200 mb-8 leading-relaxed">
            Your product information has been successfully submitted and analyzed by our AI system.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 shadow-lg"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  📊 Download Report (PDF)
                </>
              )}
            </button>
            
            <button
              onClick={handleStartOver}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔄 Submit Another Product
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/30 transform hover:scale-105 backdrop-blur-sm"
            >
              📈 View Dashboard
            </button>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm">
              <p className="text-red-200">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-gray-300 hover:text-white transition-colors duration-200 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">📋 Review & Submit</h1>
            <p className="text-gray-300 text-lg">Verify your information before submission</p>
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">✓</div>
                <div className="w-12 h-1 bg-green-500 rounded"></div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">✓</div>
                <div className="w-12 h-1 bg-green-500 rounded"></div>
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">3</div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            {/* Product Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                Product Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                  <div className="text-white font-semibold text-lg">{formData.name}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <div className="text-white font-semibold text-lg">{formData.category}</div>
                </div>
              </div>
            </div>

            {/* Answers Review */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                Assessment Responses
              </h2>
              <div className="space-y-4">
                {formData.answers.map((answer, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-gray-300 font-medium mb-2">
                      Question {index + 1}: {answer.questionId.charAt(0).toUpperCase() + answer.questionId.slice(1).replace('_', ' ')}
                    </div>
                    <div className="text-white font-semibold">
                      {typeof answer.answer === 'boolean' 
                        ? (answer.answer ? '✅ Yes' : '❌ No')
                        : answer.answer
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-white/20">
              <button
                type="button"
                onClick={() => navigate('/form/step2')}
                disabled={submitting}
                className="px-6 py-3 text-gray-300 hover:text-white font-medium disabled:opacity-50 transition-colors duration-200 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm"
              >
                ← Previous Step
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transform hover:scale-105 shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚀</span>
                    Submit Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
