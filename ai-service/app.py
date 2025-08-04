from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    logger.info("✅ Gemini AI configured successfully")
else:
    model = None
    logger.warning("⚠️ GEMINI_API_KEY not found. AI features will be disabled.")

@app.route('/', methods=['GET'])
def home():
    """Health check and service information"""
    return jsonify({
        'service': 'Altibbe AI Service',
        'status': 'running',
        'ai_enabled': model is not None,
        'endpoints': {
            'health': '/health',
            'generate': '/api/generate',
            'chat': '/api/chat',
            'generate_questions': '/api/generate-questions',
            'transparency_score': '/api/transparency-score'
        }
    })

@app.route('/health', methods=['GET'])
def health():
    """Detailed health check"""
    return jsonify({
        'status': 'healthy',
        'ai_model': 'gemini-1.5-flash' if model else 'disabled',
        'api_key_configured': GEMINI_API_KEY is not None
    })

@app.route('/api/generate', methods=['POST'])
def generate_text():
    """Generate text using Gemini AI"""
    try:
        if not model:
            return jsonify({
                'error': 'AI model not configured',
                'message': 'Please set GEMINI_API_KEY in environment variables'
            }), 503

        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({
                'error': 'Missing prompt',
                'message': 'Please provide a prompt in the request body'
            }), 400

        prompt = data['prompt']
        max_tokens = data.get('max_tokens', 1000)
        temperature = data.get('temperature', 0.7)

        logger.info(f"Generating text for prompt: {prompt[:50]}...")

        # Generate response using Gemini
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=temperature,
            )
        )

        return jsonify({
            'success': True,
            'response': response.text,
            'model': 'gemini-1.5-flash'
        })

    except Exception as e:
        logger.error(f"Error generating text: {str(e)}")
        return jsonify({
            'error': 'Generation failed',
            'message': str(e)
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat with AI using conversation context"""
    try:
        if not model:
            return jsonify({
                'error': 'AI model not configured',
                'message': 'Please set GEMINI_API_KEY in environment variables'
            }), 503

        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                'error': 'Missing message',
                'message': 'Please provide a message in the request body'
            }), 400

        message = data['message']
        context = data.get('context', [])
        
        logger.info(f"Processing chat message: {message[:50]}...")

        # Build conversation context
        conversation_prompt = ""
        if context:
            for msg in context:
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                conversation_prompt += f"{role}: {content}\n"
        
        conversation_prompt += f"user: {message}\nassistant:"

        # Generate response
        response = model.generate_content(conversation_prompt)

        return jsonify({
            'success': True,
            'response': response.text,
            'model': 'gemini-1.5-flash'
        })

    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        return jsonify({
            'error': 'Chat failed',
            'message': str(e)
        }), 500

@app.route('/api/transparency-score', methods=['POST'])
def calculate_transparency_score():
    """Calculate transparency score based on product answers (Optional bonus feature)"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'Missing request data',
                'message': 'Please provide product data with answers'
            }), 400

        product_name = data.get('product_name', '')
        category = data.get('category', '')
        answers = data.get('answers', [])
        
        if not answers:
            return jsonify({
                'error': 'Missing answers',
                'message': 'Please provide product answers for scoring'
            }), 400

        logger.info(f"Calculating transparency score for {product_name} ({category})")

        # Calculate score based on multiple criteria
        score_breakdown = calculate_transparency_breakdown(answers, category)
        
        # Overall score (0-100)
        overall_score = sum(score_breakdown.values()) / len(score_breakdown)
        
        # Determine score level
        if overall_score >= 80:
            score_level = "Excellent"
            score_color = "green"
        elif overall_score >= 60:
            score_level = "Good" 
            score_color = "blue"
        elif overall_score >= 40:
            score_level = "Fair"
            score_color = "yellow"
        else:
            score_level = "Needs Improvement"
            score_color = "red"

        # Generate AI-powered recommendations if model is available
        recommendations = []
        if model:
            try:
                recommendations = generate_ai_recommendations(product_name, category, answers, score_breakdown)
            except Exception as e:
                logger.warning(f"Could not generate AI recommendations: {str(e)}")
                recommendations = generate_basic_recommendations(score_breakdown)
        else:
            recommendations = generate_basic_recommendations(score_breakdown)

        return jsonify({
            'success': True,
            'transparency_score': {
                'overall_score': round(overall_score, 1),
                'score_level': score_level,
                'score_color': score_color,
                'breakdown': {k: round(v, 1) for k, v in score_breakdown.items()},
                'recommendations': recommendations,
                'product_name': product_name,
                'category': category,
                'total_answers': len(answers)
            }
        })

    except Exception as e:
        logger.error(f"Error calculating transparency score: {str(e)}")
        return jsonify({
            'error': 'Scoring failed',
            'message': str(e)
        }), 500

def calculate_transparency_breakdown(answers, category):
    """Calculate detailed transparency score breakdown"""
    
    # Initialize scoring categories
    scores = {
        'completeness': 0,          # How many questions were answered
        'quality': 0,              # Quality of answers (length, detail)
        'transparency': 0,         # Transparency indicators
        'compliance': 0            # Category-specific compliance
    }
    
    if not answers:
        return scores
    
    # 1. Completeness Score (0-100)
    # Based on how many questions were answered with meaningful responses
    answered_count = 0
    total_count = len(answers)
    
    for answer in answers:
        if answer.get('answer') and str(answer['answer']).strip():
            # Check if answer is meaningful (not just "yes" or very short)
            answer_text = str(answer['answer']).strip().lower()
            if len(answer_text) > 3 and answer_text not in ['yes', 'no', 'n/a', 'na']:
                answered_count += 1
            elif answer_text in ['yes', 'true'] and 'certified' in answer.get('questionId', ''):
                answered_count += 1  # Positive answers to certification questions count
    
    scores['completeness'] = (answered_count / total_count * 100) if total_count > 0 else 0
    
    # 2. Quality Score (0-100)
    # Based on detail and thoroughness of answers
    quality_points = 0
    quality_total = 0
    
    for answer in answers:
        answer_text = str(answer.get('answer', '')).strip()
        if answer_text:
            quality_total += 1
            # Longer, detailed answers score higher
            if len(answer_text) > 50:
                quality_points += 100
            elif len(answer_text) > 20:
                quality_points += 75
            elif len(answer_text) > 10:
                quality_points += 50
            else:
                quality_points += 25
    
    scores['quality'] = (quality_points / (quality_total * 100)) * 100 if quality_total > 0 else 0
    
    # 3. Transparency Score (0-100)
    # Based on transparency-indicating keywords and certifications
    transparency_keywords = [
        'certified', 'organic', 'tested', 'verified', 'compliant', 'standard',
        'warranty', 'guarantee', 'documentation', 'certificate', 'audit',
        'eco-friendly', 'sustainable', 'ethical', 'cruelty-free'
    ]
    
    transparency_points = 0
    for answer in answers:
        answer_text = str(answer.get('answer', '')).lower()
        for keyword in transparency_keywords:
            if keyword in answer_text:
                transparency_points += 10
                break  # One point per answer
    
    scores['transparency'] = min(transparency_points * 10, 100)  # Cap at 100
    
    # 4. Category-specific Compliance Score (0-100)
    compliance_score = calculate_category_compliance(answers, category)
    scores['compliance'] = compliance_score
    
    return scores

def calculate_category_compliance(answers, category):
    """Calculate category-specific compliance score"""
    
    category_requirements = {
        'Electronics': ['warranty', 'safety', 'energy', 'certification'],
        'Food & Beverage': ['expiry', 'organic', 'allergen', 'shelf'],
        'Clothing': ['material', 'care', 'size', 'manufacturing'],
        'Health & Beauty': ['ingredients', 'tested', 'dermatolog', 'expiry']
    }
    
    required_terms = category_requirements.get(category, ['quality', 'origin', 'standard'])
    compliance_points = 0
    
    for answer in answers:
        answer_text = str(answer.get('answer', '')).lower()
        question_id = str(answer.get('questionId', '')).lower()
        
        for term in required_terms:
            if term in answer_text or term in question_id:
                compliance_points += 25
                break
    
    return min(compliance_points, 100)

def generate_ai_recommendations(product_name, category, answers, score_breakdown):
    """Generate AI-powered recommendations using Gemini"""
    try:
        prompt = f"""
Based on the transparency assessment for "{product_name}" (Category: {category}), provide 3 specific recommendations to improve transparency.

Current scores:
- Completeness: {score_breakdown['completeness']:.1f}/100
- Quality: {score_breakdown['quality']:.1f}/100  
- Transparency: {score_breakdown['transparency']:.1f}/100
- Compliance: {score_breakdown['compliance']:.1f}/100

Generate practical, actionable recommendations that would help improve the lowest-scoring areas. Focus on what the product seller could realistically implement.

Format as JSON array:
[
  "Specific recommendation 1",
  "Specific recommendation 2", 
  "Specific recommendation 3"
]
"""

        response = model.generate_content(prompt)
        
        # Try to parse JSON recommendations
        import json
        import re
        
        json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
        if json_match:
            recommendations = json.loads(json_match.group())
            return recommendations[:3]  # Limit to 3
            
    except Exception as e:
        logger.warning(f"AI recommendation generation failed: {str(e)}")
    
    # Fallback to basic recommendations
    return generate_basic_recommendations(score_breakdown)

def generate_basic_recommendations(score_breakdown):
    """Generate basic recommendations based on score breakdown"""
    recommendations = []
    
    # Find the lowest scoring area and provide recommendations
    lowest_score = min(score_breakdown.values())
    lowest_area = min(score_breakdown, key=score_breakdown.get)
    
    recommendation_map = {
        'completeness': "Provide more detailed answers to all questions to improve transparency",
        'quality': "Include more specific details and explanations in your responses",
        'transparency': "Add more certifications, standards compliance, and quality documentation",
        'compliance': "Ensure all category-specific requirements and standards are addressed"
    }
    
    recommendations.append(recommendation_map.get(lowest_area, "Improve overall product transparency"))
    
    # Add general recommendations
    if score_breakdown['transparency'] < 70:
        recommendations.append("Consider obtaining relevant certifications for your product category")
    
    if score_breakdown['quality'] < 70:
        recommendations.append("Provide more comprehensive documentation and detailed product information")
        
    # Ensure we have at least 3 recommendations
    while len(recommendations) < 3:
        recommendations.append("Continue to improve product transparency and documentation")
    
    return recommendations[:3]

@app.route('/api/generate-questions', methods=['POST'])
def generate_questions():
    """Generate intelligent follow-up questions based on product category or description"""
    try:
        if not model:
            return jsonify({
                'error': 'AI model not configured',
                'message': 'Please set GEMINI_API_KEY in environment variables'
            }), 503

        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'Missing request data',
                'message': 'Please provide request body with category or description'
            }), 400

        category = data.get('category', '')
        description = data.get('description', '')
        product_name = data.get('product_name', '')
        
        if not category and not description:
            return jsonify({
                'error': 'Missing required fields',
                'message': 'Please provide either category or description'
            }), 400

        logger.info(f"Generating questions for category: {category}, description: {description[:50]}...")

        # Create a detailed prompt for generating questions
        prompt = f"""
You are helping create a product transparency form for everyday buyers and businesses who want to know important details about products they're purchasing.

Product to Analyze:
- Product Name: "{product_name if product_name else 'Generic Product'}"
- Category: "{category if category else 'General'}"
- Context: {description if description else f'A product in the {category} category'}

Your Task: Generate exactly 3 simple, clear questions that a buyer would reasonably ask about "{product_name}" to make an informed purchasing decision.

Critical Requirements:
1. Questions should be SIMPLE and easy to understand for regular buyers
2. Focus on practical concerns like quality, safety, warranty, and value
3. Make questions specific to "{product_name}" but keep them accessible
4. Avoid technical jargon, regulatory terms, or complex compliance language
5. Think like a smart consumer who wants transparency but isn't an expert

Question Categories (choose the most relevant):
- Product quality and durability
- Warranty and customer support
- Safety features and certifications
- Materials and manufacturing quality
- Environmental friendliness
- Value and cost considerations

Format as JSON array with this EXACT structure:
[
  {{
    "id": "buyer_question_1",
    "question": "Simple question about {product_name}?",
    "type": "text|number|boolean|select",
    "required": true|false,
    "options": ["option1", "option2"] // only for select type
  }}
]

EXAMPLES of good buyer-friendly questions:
- For "iPhone 15" (Electronics): "What is the warranty period for the iPhone 15?"
- For "Organic Almond Milk" (Food): "Is this almond milk certified organic?"
- For "Nike Air Max" (Clothing): "What materials are used in the Nike Air Max shoes?"
- For "Tesla Model 3" (Automotive): "What is the expected battery life for the Tesla Model 3?"

Generate questions that a regular buyer would ask about "{product_name}".
"""

        # Generate response using Gemini
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=1000,
                temperature=0.7,
            )
        )

        # Parse the response to extract JSON
        response_text = response.text.strip()
        
        # Try to extract JSON from the response
        import json
        import re
        
        # Look for JSON array in the response
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            try:
                questions = json.loads(json_str)
                
                # Validate and clean the questions
                validated_questions = []
                for i, q in enumerate(questions[:3]):  # Limit to 3 questions
                    validated_q = {
                        'id': q.get('id', f'ai_question_{i+1}'),
                        'question': q.get('question', '').strip(),
                        'type': q.get('type', 'text'),
                        'required': q.get('required', True)
                    }
                    
                    # Add options for select type
                    if validated_q['type'] == 'select' and 'options' in q:
                        validated_q['options'] = q['options']
                    
                    if validated_q['question']:  # Only add if question is not empty
                        validated_questions.append(validated_q)
                
                return jsonify({
                    'success': True,
                    'questions': validated_questions,
                    'model': 'gemini-1.5-flash',
                    'category': category,
                    'count': len(validated_questions)
                })
                
            except json.JSONDecodeError:
                # Fallback: parse manually or use default questions
                logger.warning("Failed to parse AI response as JSON, using fallback questions")
                
        # Fallback questions if AI parsing fails
        fallback_questions = generate_fallback_questions(category, product_name)
        return jsonify({
            'success': True,
            'questions': fallback_questions,
            'model': 'gemini-1.5-flash (fallback)',
            'category': category,
            'count': len(fallback_questions),
            'note': 'Used fallback questions due to AI response parsing issue'
        })

    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        
        # Return fallback questions in case of any error
        fallback_questions = generate_fallback_questions(data.get('category', 'General'), data.get('product_name', ''))
        return jsonify({
            'success': True,
            'questions': fallback_questions,
            'model': 'fallback',
            'category': data.get('category', 'General'),
            'count': len(fallback_questions),
            'note': f'Used fallback questions due to error: {str(e)}'
        })

def generate_fallback_questions(category, product_name=''):
    """Generate fallback questions when AI fails - buyer-friendly version"""
    
    # Use product name in questions if available
    product_ref = f"this {product_name}" if product_name else "this product"
    
    category_questions = {
        'Electronics': [
            {
                'id': 'warranty_period',
                'question': f'How long is the warranty for {product_ref}?',
                'type': 'text',
                'required': True
            },
            {
                'id': 'energy_efficiency',
                'question': f'Is {product_ref} energy efficient?',
                'type': 'boolean',
                'required': True
            },
            {
                'id': 'safety_certifications',
                'question': f'What safety certifications does {product_ref} have?',
                'type': 'text',
                'required': True
            }
        ],
        'Food & Beverage': [
            {
                'id': 'expiry_shelf_life',
                'question': f'What is the shelf life of {product_ref}?',
                'type': 'text',
                'required': True
            },
            {
                'id': 'organic_certified',
                'question': f'Is {product_ref} certified organic?',
                'type': 'boolean',
                'required': False
            },
            {
                'id': 'allergen_information',
                'question': f'Does {product_ref} contain any common allergens?',
                'type': 'text',
                'required': True
            }
        ],
        'Clothing': [
            {
                'id': 'material_composition',
                'question': f'What materials is {product_ref} made from?',
                'type': 'text',
                'required': True
            },
            {
                'id': 'care_instructions',
                'question': f'How should I care for {product_ref}?',
                'type': 'text',
                'required': True
            },
            {
                'id': 'size_availability',
                'question': f'What sizes are available for {product_ref}?',
                'type': 'text',
                'required': False
            }
        ],
        'Health & Beauty': [
            {
                'id': 'ingredients_list',
                'question': f'What are the main ingredients in {product_ref}?',
                'type': 'text',
                'required': True
            },
            {
                'id': 'skin_tested',
                'question': f'Has {product_ref} been tested for sensitive skin?',
                'type': 'boolean',
                'required': True
            },
            {
                'id': 'expiry_date',
                'question': f'What is the shelf life of {product_ref}?',
                'type': 'text',
                'required': True
            }
        ]
    }
    
    # Get category-specific questions or default ones
    questions = category_questions.get(category, [
        {
            'id': 'quality_standards',
            'question': f'What quality standards does {product_ref} meet?',
            'type': 'text',
            'required': True
        },
        {
            'id': 'country_of_origin',
            'question': f'Where is {product_ref} manufactured?',
            'type': 'text',
            'required': True
        },
        {
            'id': 'customer_support',
            'question': f'What customer support is available for {product_ref}?',
            'type': 'text',
            'required': False
        }
    ])
    
    return questions

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': [
            'GET /',
            'GET /health',
            'POST /api/generate',
            'POST /api/chat',
            'POST /api/generate-questions',
            'POST /api/transparency-score'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': 'Something went wrong on our end'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    logger.info(f"🚀 Starting AI Service on port {port}")
    logger.info(f"🔧 Debug mode: {debug}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
