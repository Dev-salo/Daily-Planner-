import os
from flask import Blueprint, request, jsonify
from flask_login import login_required
import google.generativeai as genai


assistant_bp = Blueprint('assistant', __name__)

@assistant_bp.route('/api/chat', methods=['POST'])
@login_required
def chat():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400

    user_message = data['message']
    api_key = os.environ.get('GEMINI_API_KEY')
    
    if not api_key:
        return jsonify({'error': 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.'}), 500

    try:
        # Initialize the Google GenAI client
        client = genai.Client(api_key=api_key)
        
        # Call the Gemini model with specific instructions
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction="You are a helpful productivity and time management assistant for the Daily Planner System. Provide concise, actionable advice on planning, tasks, and organization."
            )
        )
        
        return jsonify({
            'response': response.text
        })
    except Exception as e:
        error_msg = str(e)
        print(f"Error calling Gemini API: {error_msg}")
        return jsonify({'error': f"Failed to get response from AI assistant. Details: {error_msg}"}), 500
