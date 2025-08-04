import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Question, Answer } from '../types';
import config from '../config/environment';

interface Step2Props {
  formData: {
    name: string;
    category: string;
    answers: Answer[];
  };
  updateFormData: (data: { answers: Answer[] }) => void;
}

export default function Step2({ formData, updateFormData }: Step2Props) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>(formData.answers);
  const [loading, setLoading] = useState(true);

  // Generate AI-powered questions based on category and product name
  useEffect(() => {
    const generateQuestionsFromAI = async (category: string, productName: string): Promise<Question[]> => {
      try {
        // Call AI service to generate questions with detailed context
        const response = await fetch(`${config.aiServiceUrl}/api/generate-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: category,
            product_name: productName,
            description: `A ${category} product named "${productName}" requiring transparency assessment for regulatory compliance and quality assurance`
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.questions) {
            console.log('AI-generated questions:', data.questions);
            return data.questions;
          }
        }
        
        // Fallback to static questions if AI fails
        console.log('AI service unavailable, using static questions');
        return generateStaticQuestions(category);
        
      } catch (error) {
        console.error('Error calling AI service:', error);
        return generateStaticQuestions(category);
      }
    };

    const generateStaticQuestions = (category: string): Question[] => {
      const baseQuestions: Question[] = [
        {
          id: 'description',
          question: 'Provide a detailed description of your product',
          type: 'textarea',
          required: true
        },
        {
          id: 'price',
          question: 'What is the retail price?',
          type: 'number',
          required: true
        }
      ];

      const categorySpecificQuestions: Record<string, Question[]> = {
        'Electronics': [
          {
            id: 'warranty',
            question: 'Warranty period (in months)',
            type: 'number',
            required: true
          },
          {
            id: 'brand',
            question: 'Brand name',
            type: 'text',
            required: true
          }
        ],
        'Food & Beverage': [
          {
            id: 'expiry',
            question: 'Shelf life (in days)',
            type: 'number',
            required: true
          },
          {
            id: 'organic',
            question: 'Is this product organic?',
            type: 'boolean',
            required: false
          }
        ],
        'Clothing': [
          {
            id: 'material',
            question: 'Primary material',
            type: 'text',
            required: true
          },
          {
            id: 'size_range',
            question: 'Available size range',
            type: 'text',
            required: true
          }
        ]
      };

      const specificQuestions = categorySpecificQuestions[category] || [];
      return [...baseQuestions, ...specificQuestions];
    };

    // Generate questions (AI-powered with fallback)
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const generatedQuestions = await generateQuestionsFromAI(formData.category, formData.name);
        setQuestions(generatedQuestions);
        
        // Initialize answers if not present
        const initialAnswers = answers.length > 0 ? answers : 
          generatedQuestions.map(q => ({
            questionId: q.id,
            answer: q.type === 'boolean' ? false : ''
          }));
        
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Error loading questions:', error);
        // Use static questions as final fallback
        const staticQuestions = generateStaticQuestions(formData.category);
        setQuestions(staticQuestions);
        
        const initialAnswers = answers.length > 0 ? answers : 
          staticQuestions.map(q => ({
            questionId: q.id,
            answer: q.type === 'boolean' ? false : ''
          }));
        
        setAnswers(initialAnswers);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [formData.category, formData.name]);

  const handleAnswerChange = (questionId: string, value: string | number | boolean) => {
    const updatedAnswers = answers.map(answer =>
      answer.questionId === questionId
        ? { ...answer, answer: value }
        : answer
    );
    setAnswers(updatedAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for required questions
    const requiredQuestions = questions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => {
      const answer = answers.find(a => a.questionId === q.id);
      return !answer || answer.answer === '' || answer.answer === null;
    });

    if (missingAnswers.length > 0) {
      alert('Please answer all required questions.');
      return;
    }

    updateFormData({ answers });
    navigate('/form/step3');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-purple-400 to-blue-400 mx-auto"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-white/30 mx-auto"></div>
          </div>
          
          <h3 className="text-white font-bold text-xl mb-2">
            🤖 AI Engine Working
          </h3>
          <p className="text-purple-200 font-medium mb-3">
            Generating questions for "{formData.name}"
          </p>
          <p className="text-sm text-blue-200 mb-2">
            ✨ Creating personalized {formData.category} assessment
          </p>
          <p className="text-xs text-gray-300">
            Analyzing compliance requirements and industry standards...
          </p>
          
          <div className="mt-6 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

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
            to="/dashboard"
            className="flex items-center text-white/80 hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-400">Step 2 of 3</span>
            <span className="text-sm text-white/70">Dynamic Questions</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-md">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full shadow-lg" style={{ width: '66.66%' }}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">Product Details</h1>
            <p className="text-white/70 text-lg">
              Please answer the following AI-generated questions about your {formData.category.toLowerCase()} product.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {questions.map((question) => {
              const answer = answers.find(a => a.questionId === question.id);
              
              return (
                <div key={question.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <label className="block text-sm font-medium text-white/90 mb-4">
                    {question.question}
                    {question.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  
                  {question.type === 'text' && (
                    <input
                      type="text"
                      value={answer?.answer as string || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required={question.required}
                      placeholder="Enter your answer..."
                    />
                  )}
                  
                  {question.type === 'number' && (
                    <input
                      type="number"
                      value={answer?.answer as number || ''}
                      onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required={question.required}
                      placeholder="Enter a number..."
                    />
                  )}
                  
                  {question.type === 'textarea' && (
                    <textarea
                      value={answer?.answer as string || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                      required={question.required}
                      placeholder="Provide detailed information..."
                    />
                  )}
                  
                  {question.type === 'boolean' && (
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name={question.id}
                          checked={answer?.answer === true}
                          onChange={() => handleAnswerChange(question.id, true)}
                          className="mr-3 w-4 h-4 text-blue-500 bg-white/10 border-white/20 focus:ring-blue-500"
                        />
                        <span className="text-white/90 group-hover:text-white transition-colors">Yes</span>
                      </label>
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name={question.id}
                          checked={answer?.answer === false}
                          onChange={() => handleAnswerChange(question.id, false)}
                          className="mr-3 w-4 h-4 text-blue-500 bg-white/10 border-white/20 focus:ring-blue-500"
                        />
                        <span className="text-white/90 group-hover:text-white transition-colors">No</span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8">
              <button
                type="button"
                onClick={() => navigate('/form/step1')}
                className="flex items-center px-6 py-3 text-white/80 hover:text-white font-medium transition-colors group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Previous Step
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
