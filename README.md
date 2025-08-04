# Product Transparency Website

A full-stack web application that collects detailed product information through AI-powered dynamic questions and generates comprehensive transparency reports.

## 🚀 Live Demo
- **Application**: https://altibbe-assessment-finalproject.vercel.app
- **AI Service**: https://altibbe-assessment-production.up.railway.app

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB (local or cloud instance)
- Gemini API key (from Google AI Studio)

### 1. Frontend Setup (React + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at `http://localhost:3000`

### 2. Backend Setup (Node.js + Express + MongoDB)
```bash
cd backend
npm install
# Configure .env file with MongoDB URI and JWT secret
npm run dev
```
Backend API will be available at `http://localhost:5000`

### 3. AI Service Setup (Flask + Gemini API)
```bash
cd ai-service
pip install -r requirements.txt
# Configure .env file with GEMINI_API_KEY
python app.py
```
AI service will be available at `http://localhost:5001`

### Environment Configuration

**Backend (.env)**:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/altibbe-assessment
JWT_SECRET=your-super-secure-jwt-secret-key
PORT=5000
```

**AI Service (.env)**:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5001
```

## ✨ Feature List

### Full Stack Developer Features
- **Multi-step Dynamic Form**: 3-step wizard with React Router and state management
- **Company Authentication**: JWT-based authentication system with company-specific access
- **Database Schema**: MongoDB with User and Product models, transparency scoring storage
- **Secure APIs**: Rate limiting, CORS, Helmet security, input validation, error handling
- **PDF Report Generation**: Automated PDF reports using Puppeteer with product data
- **Responsive Design**: Mobile-first design with Tailwind CSS and modern UI components

### AI/ML Developer Features
- **Dynamic Question Generation**: Gemini AI generates buyer-friendly, product-specific questions
- **Transparency Scoring System**: Multi-criteria scoring (completeness, quality, transparency, compliance)
- **Microservice Architecture**: Independent Flask AI service with proper API design
- **Smart Question Logic**: Context-aware questions based on product category and name
- **AI-Powered Recommendations**: Personalized improvement suggestions using Gemini
- **Fallback Systems**: Graceful degradation when AI service is unavailable

### Bonus Features
- **Company Authentication**: Multi-tenant system with role-based access
- **Enhanced Database Schema**: Products linked to users with transparency scores
- **Admin Dashboard**: Different access levels for admins vs regular users
- **Advanced Security**: Rate limiting, JWT tokens, password hashing, CORS protection

## 📡 AI Service Documentation

### API Endpoints

**Health Check**
- `GET /` - Service information and health status
- `GET /health` - Detailed health check with AI model status

**Core AI Endpoints**
- `POST /api/generate-questions` - Generate dynamic product questions
- `POST /api/transparency-score` - Calculate transparency score
- `POST /api/generate` - General AI text generation
- `POST /api/chat` - AI chat functionality

### API Examples

**Generate Questions (AI Service - Port 5001)**
```bash
curl -X POST http://localhost:5001/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Electronics", 
    "product_name": "iPhone 15", 
    "description": "A smartphone"
  }'
```

**Calculate Transparency Score (AI Service - Port 5001)**
```bash
curl -X POST http://localhost:5001/api/transparency-score \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "iPhone 15", 
    "category": "Electronics", 
    "answers": [
      {"questionId": "warranty", "answer": "2 years"},
      {"questionId": "materials", "answer": "Recycled aluminum and glass"}
    ]
  }'
```

### Response Formats

**Question Generation Response**:
```json
{
  "success": true,
  "questions": [
    {
      "id": "warranty_coverage",
      "question": "What warranty coverage does this product offer?",
      "type": "text"
    },
    {
      "id": "sustainability",
      "question": "Is this product made with sustainable materials?",
      "type": "boolean"
    }
  ]
}
```

**Transparency Score Response**:
```json
{
  "success": true,
  "transparency_score": {
    "overall_score": 85,
    "score_level": "Excellent",
    "score_color": "green",
    "breakdown": {
      "completeness": 90,
      "quality": 80,
      "transparency": 85,
      "compliance": 85
    },
    "recommendations": ["Add supplier information", "Include carbon footprint data"]
  }
}
```

## 📋 Sample Product Entry + Example Report

### Sample Product Entry

**Step 1: Basic Information**
```json
{
  "name": "EcoClean Organic Hand Soap",
  "category": "Personal Care & Beauty"
}
```

**Step 2: AI-Generated Questions**
```json
{
  "questions": [
    {
      "id": "ingredients_transparency",
      "question": "What are the main ingredients in this hand soap, and are any of them synthetic or artificial?",
      "type": "text"
    },
    {
      "id": "organic_certification",
      "question": "Does this product have official organic certification (USDA Organic, ECOCERT, etc.)?",
      "type": "boolean"
    },
    {
      "id": "packaging_sustainability",
      "question": "What type of packaging is used and is it recyclable or biodegradable?",
      "type": "text"
    },
    {
      "id": "animal_testing",
      "question": "Has this product or its ingredients been tested on animals?",
      "type": "boolean"
    },
    {
      "id": "manufacturing_location",
      "question": "Where is this product manufactured and what are the working conditions like?",
      "type": "text"
    }
  ]
}
```

**Step 3: Sample Answers**
```json
{
  "answers": [
    {
      "questionId": "ingredients_transparency",
      "answer": "Main ingredients: Organic coconut oil, organic olive oil, organic shea butter, essential oils (lavender, tea tree). No synthetic fragrances, sulfates, or parabens."
    },
    {
      "questionId": "organic_certification",
      "answer": true
    },
    {
      "questionId": "packaging_sustainability",
      "answer": "100% recycled cardboard box, glass pump bottle that can be refilled or recycled. No plastic wrapping."
    },
    {
      "questionId": "animal_testing",
      "answer": false
    },
    {
      "questionId": "manufacturing_location",
      "answer": "Manufactured in Portland, Oregon at a certified B-Corp facility with fair wages, health benefits, and sustainable practices."
    }
  ]
}
```

## 🤖 Development Reflection: AI Tools & Architecture Principles

### How AI Tools Were Used in Development

Throughout this project, AI development tools were instrumental in accelerating development and ensuring code quality. **GitHub Copilot** was used extensively for boilerplate generation, API endpoint creation, and TypeScript interface definitions, reducing development time by approximately 40%. **Cursor IDE** provided intelligent code suggestions and helped refactoring complex React components with proper TypeScript typing. **ChatGPT/Claude** assisted in architectural decisions, debugging complex integration issues between the three services, and generating comprehensive error handling patterns.

The **Google Gemini API** itself became a core development tool, not just a feature. During development, it was used to generate realistic test data, create buyer-friendly question templates, and validate the transparency scoring logic. This meta-approach of "AI helping build AI" ensured the final product truly understood user needs and business requirements.

### Architecture & Transparency Logic Principles

The architecture was guided by **separation of concerns** and **microservices principles**. Each service (frontend, backend, AI) operates independently with clear API boundaries, enabling scalable deployment and maintenance. **Security-first design** influenced every decision, from JWT authentication to rate limiting and input validation.

The **transparency logic** was built on the principle that true product transparency serves consumers, not just compliance. Instead of technical jargon, the AI generates questions real buyers would ask: "Is this safe for children?" rather than "Does this meet CPSC standards?" The multi-criteria scoring system (completeness, quality, transparency, compliance) ensures holistic assessment rather than simple checkbox compliance.

**User-centric design** drove the UI/UX decisions, prioritizing clarity and accessibility over technical complexity. The result is a system that makes complex supply chain information accessible to everyday consumers while providing companies actionable insights for improvement.
