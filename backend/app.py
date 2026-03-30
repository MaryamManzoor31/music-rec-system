from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from chatbot import ChatbotNLP
from recommender import RecommendationEngine
import os

app = Flask(__name__)
CORS(app)

# Load data and initialize engines
try:
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'songs_normalize.csv')
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} songs from dataset")
    print(f"Columns: {list(df.columns)}")
except Exception as e:
    print(f"Error loading data: {e}")
    df = pd.DataFrame()

chatbot = ChatbotNLP()
recommender = RecommendationEngine(df)

# Store user preferences per session
user_preferences = {}

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint
    Input: { "message": "user message", "session_id": "unique_id" }
    Output: { "response": "bot response", "recommendations": [...] }
    """
    data = request.json
    user_message = data.get('message', '').lower().strip()
    session_id = data.get('session_id', 'default')
    
    # Initialize preferences if new session
    if session_id not in user_preferences:
        user_preferences[session_id] = {
            'preferred_moods': [],
            'preferred_genres': [],
            'exclude_explicit': False,
            'tempo_preference': 'any',
            'year_range': [1999, 2025]
        }
    
    try:
        # Detect intent and extract entities
        intent, entities = chatbot.process_message(user_message)
        
        # Update preferences based on intent
        if intent == 'set_preference':
            if 'exclude_explicit' in entities:
                user_preferences[session_id]['exclude_explicit'] = entities['exclude_explicit']
            if 'tempo_preference' in entities:
                user_preferences[session_id]['tempo_preference'] = entities['tempo_preference']
        
        # Get recommendations
        mood = entities.get('mood')
        genre = entities.get('genres', [None])[0] if entities.get('genres') else None
        artist = entities.get('artist')
        
        recommendations = recommender.get_recommendations(
            mood=mood,
            genre=genre,
            artist=artist,
            count=10,
            user_prefs=user_preferences[session_id]
        )
        
        # Generate response message
        bot_response = chatbot.generate_response(intent, entities, len(recommendations))
        
        return jsonify({
            'response': bot_response,
            'recommendations': recommendations,
            'intent': intent
        })
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({
            'response': f'Error processing request: {str(e)}',
            'recommendations': [],
            'intent': 'error'
        }), 500

@app.route('/api/preferences', methods=['GET'])
def get_preferences():
    """Get current user preferences"""
    session_id = request.args.get('session_id', 'default')
    prefs = user_preferences.get(session_id, {})
    return jsonify(prefs)

@app.route('/api/preferences', methods=['POST'])
def update_preferences():
    """Update user preferences"""
    data = request.json
    session_id = data.get('session_id', 'default')
    
    if session_id not in user_preferences:
        user_preferences[session_id] = {
            'preferred_moods': [],
            'preferred_genres': [],
            'exclude_explicit': False,
            'tempo_preference': 'any',
            'year_range': [1999, 2025]
        }
    
    user_preferences[session_id].update(data.get('preferences', {}))
    return jsonify({'status': 'updated'})

@app.route('/api/songs/search', methods=['GET'])
def search_songs():
    """Search songs by name or artist"""
    query = request.args.get('q', '').lower()
    results = recommender.search_songs(query)
    return jsonify(results)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'songs_loaded': len(df)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
