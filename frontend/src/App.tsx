import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Step1 from './pages/Step1';
import Step2 from './pages/Step2';
import Step3 from './pages/Step3';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { FormData, Answer } from './types';

function App() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    answers: []
  });

  const updateStep1Data = (data: { name: string; category: string }) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const updateStep2Data = (data: { answers: Answer[] }) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      answers: []
    });
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route 
            path="/form/step1" 
            element={
              <Step1 
                formData={{ name: formData.name, category: formData.category }}
                updateFormData={updateStep1Data}
              />
            } 
          />
          <Route 
            path="/form/step2" 
            element={
              <Step2 
                formData={formData}
                updateFormData={updateStep2Data}
              />
            } 
          />
          <Route 
            path="/form/step3" 
            element={
              <Step3 
                formData={formData}
                resetForm={resetForm}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
