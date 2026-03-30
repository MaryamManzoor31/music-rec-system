import re
from typing import Tuple, Dict

class ChatbotNLP:
    def __init__(self):
        # Define keyword patterns
        self.mood_patterns = {
            'joyful': r'\b(happy|joyful|fun|upbeat|cheerful|good mood|positive)\b',
            'energetic': r'\b(energetic|energize|fast|high energy|intense|pump|upbeat|party)\b',
            'melancholic': r'\b(sad|melancholic|slow|mellow|down|blue|blue mood)\b',
            'emotional': r'\b(emotional|deep|touching|heartfelt|feelings?)\b'
        }
        
        self.genre_keywords = {
            'pop': r'\bpop\b',
            'rock': r'\brock\b',
            'hip hop': r'\b(hip hop|hip-hop|rap)\b',
            'country': r'\bcountry\b',
            'r&b': r'\b(r&b|r and b|rnb)\b',
            'dance': r'\b(dance|electronic|edm)\b'
        }
        
        self.preference_keywords = {
            'explicit': r'\b(explicit|clean|parental|language)\b',
            'acoustic': r'\bacoustic\b',
            'tempo': r'\b(fast|slow|tempo)\b'
        }
        
        self.intents = {
            'recommend': r'\b(recommend|suggest|show me|play|give me|find|search)\b',
            'set_preference': r'\b(prefer|like|don\'t like|exclude|no explicit)\b',
            'search': r'\b(search|find|look for)\b',
            'help': r'\b(help|how|explain|what can you|guide)\b'
        }
    
    def process_message(self, message: str) -> Tuple[str, Dict]:
        """
        Analyze user message and extract intent + entities
        Returns: (intent, entities_dict)
        """
        intent = self.detect_intent(message)
        entities = self.extract_entities(message)
        return intent, entities
    
    def detect_intent(self, message: str) -> str:
        """Detect user intent"""
        for intent_type, pattern in self.intents.items():
            if re.search(pattern, message, re.IGNORECASE):
                return intent_type
        return 'recommend'  # Default intent
    
    def extract_entities(self, message: str) -> Dict:
        """Extract mood, genre, artist, and other preferences"""
        entities = {}
        
        # Extract mood
        for mood, pattern in self.mood_patterns.items():
            if re.search(pattern, message, re.IGNORECASE):
                entities['mood'] = mood
                break
        
        # Extract genres
        entities['genres'] = []
        for genre, pattern in self.genre_keywords.items():
            if re.search(pattern, message, re.IGNORECASE):
                entities['genres'].append(genre)
        
        # Extract artist name (simple: capitalized words)
        capitalized = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', message)
        if capitalized:
            entities['artist'] = ' '.join(capitalized[:2])  # First 1-2 capitalized words
        
        # Extract preferences
        if re.search(r'\bno explicit\b|\bclean\b', message, re.IGNORECASE):
            entities['exclude_explicit'] = True
        if re.search(r'\bfast\b', message, re.IGNORECASE):
            entities['tempo_preference'] = 'fast'
        elif re.search(r'\bslow\b', message, re.IGNORECASE):
            entities['tempo_preference'] = 'slow'
        
        return entities
    
    def generate_response(self, intent: str, entities: Dict, result_count: int) -> str:
        """Generate human-friendly bot response"""
        if intent == 'help':
            return "I can recommend songs based on mood, genre, or artist. Try saying: 'Energetic pop songs' or 'Melancholic music like...'"
        
        mood = entities.get('mood', '')
        genres = entities.get('genres', [])
        artist = entities.get('artist', '')
        
        if result_count == 0:
            return "Sorry, no songs match your preferences. Try adjusting your filters!"
        
        response = f"Found {result_count} song(s)"
        if mood:
            response += f" with {mood} vibe"
        if genres:
            response += f" in {', '.join(genres)}"
        if artist:
            response += f" similar to {artist}"
        response += "! 🎵"
        
        return response
