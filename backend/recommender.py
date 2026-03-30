import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import euclidean_distances

class RecommendationEngine:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.audio_features = ['danceability', 'energy', 'valence', 'acousticness', 
                               'instrumentalness', 'liveness', 'tempo']
        # Normalize tempo to 0-1 range if needed
        for feature in self.audio_features:
            if feature in self.df.columns:
                try:
                    self.df[feature] = pd.to_numeric(self.df[feature], errors='coerce')
                except:
                    pass
    
    def get_recommendations(self, mood=None, genre=None, artist=None, 
                           count=10, user_prefs=None) -> list:
        """
        Get song recommendations based on mood, genre, artist
        """
        results = self.df.copy()
        
        # Filter by mood
        if mood:
            results = results[results['mood'].str.lower() == mood.lower()]
        
        # Filter by genre
        if genre:
            results = results[results['genre'].str.lower().str.contains(genre.lower(), na=False)]
        
        # Filter by explicit preference
        if user_prefs and user_prefs.get('exclude_explicit'):
            results = results[results['explicit'].astype(str).str.upper() == 'FALSE']
        
        # Filter by year range
        if user_prefs and 'year_range' in user_prefs:
            min_year, max_year = user_prefs['year_range']
            results = results[(results['year'] >= min_year) & (results['year'] <= max_year)]
        
        # Find similar songs if artist provided (simple name matching)
        if artist:
            similar = self._find_similar_by_artist(results, artist, count * 2)
            results = similar
        
        # Sort by relevance (popularity + recency)
        try:
            results['popularity'] = pd.to_numeric(results['popularity'], errors='coerce')
            results['year'] = pd.to_numeric(results['year'], errors='coerce')
            results = results.sort_values(by=['popularity', 'year'], ascending=[False, False])
        except:
            pass
        
        # Return top recommendations
        return self._format_results(results.head(count))
    
    def _find_similar_by_artist(self, df: pd.DataFrame, artist_query: str, count: int) -> pd.DataFrame:
        """Find songs similar to a given artist"""
        # Find songs by the artist
        artist_songs = df[df['artist'].str.lower().str.contains(artist_query.lower(), na=False)]
        
        if artist_songs.empty:
            return df.head(count)
        
        # Get available audio features that exist in the dataframe
        available_features = [f for f in self.audio_features if f in df.columns]
        
        if not available_features:
            return df.head(count)
        
        # Calculate average audio features of artist's songs
        avg_features = artist_songs[available_features].apply(pd.to_numeric, errors='coerce').mean()
        
        # Fill NaN values
        avg_features = avg_features.fillna(avg_features.mean())
        
        # Find songs with similar audio features
        feature_data = df[available_features].apply(pd.to_numeric, errors='coerce').fillna(0)
        
        distances = euclidean_distances(
            feature_data.values,
            [avg_features.values]
        ).flatten()
        
        df_copy = df.copy()
        df_copy['similarity'] = distances
        return df_copy.sort_values('similarity').head(count)
    
    def _format_results(self, songs_df: pd.DataFrame) -> list:
        """Format songs into JSON-friendly format"""
        results = []
        for _, song in songs_df.iterrows():
            try:
                results.append({
                    'id': str(_.name) if hasattr(_, 'name') else 0,
                    'artist': str(song.get('artist', 'Unknown')),
                    'song': str(song.get('song', 'Unknown')),
                    'genre': str(song.get('genre', 'Unknown')),
                    'mood': str(song.get('mood', 'Unknown')),
                    'year': int(float(song.get('year', 0))) if pd.notna(song.get('year')) else 0,
                    'popularity': int(float(song.get('popularity', 0))) if pd.notna(song.get('popularity')) else 0,
                    'energy': round(float(song.get('energy', 0)) if pd.notna(song.get('energy')) else 0, 2),
                    'valence': round(float(song.get('valence', 0)) if pd.notna(song.get('valence')) else 0, 2),
                    'danceability': round(float(song.get('danceability', 0)) if pd.notna(song.get('danceability')) else 0, 2),
                    'tempo': round(float(song.get('tempo', 0)) if pd.notna(song.get('tempo')) else 0, 1),
                    'explicit': str(song.get('explicit', 'false')).upper()
                })
            except Exception as e:
                print(f"Error formatting song: {e}")
                continue
        return results
    
    def search_songs(self, query: str, limit: int = 10) -> list:
        """Search songs by name or artist"""
        query_lower = query.lower()
        
        try:
            results = self.df[
                (self.df['artist'].str.lower().str.contains(query_lower, na=False)) |
                (self.df['song'].str.lower().str.contains(query_lower, na=False))
            ]
        except:
            results = pd.DataFrame()
        
        return self._format_results(results.head(limit))
