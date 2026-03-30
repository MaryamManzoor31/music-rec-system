# API Testing Guide

This guide shows you how to test the Music Chatbot API endpoints using curl or Postman.

## Prerequisites

- Backend server running on `http://localhost:5000`
- curl or Postman installed

## Health Check

**Test if the server is running:**

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status": "ok", "songs_loaded": 2000}
```

## Test Chat Endpoint

### Test 1: Joyful mood request

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want joyful songs",
    "session_id": "test_session_1"
  }'
```

### Test 2: Energetic pop songs

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Energetic pop songs please",
    "session_id": "test_session_1"
  }'
```

### Test 3: Artist-based recommendation

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Songs like The Weeknd",
    "session_id": "test_session_1"
  }'
```

### Test 4: Melancholic music

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need melancholic music right now",
    "session_id": "test_session_1"
  }'
```

### Test 5: Setting preferences

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "No explicit songs please",
    "session_id": "test_session_1"
  }'
```

## Test Preferences Endpoint

### Get preferences

```bash
curl http://localhost:5000/api/preferences?session_id=test_session_1
```

### Update preferences

```bash
curl -X POST http://localhost:5000/api/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_session_1",
    "preferences": {
      "exclude_explicit": true,
      "year_range": [2010, 2020]
    }
  }'
```

## Test Search Endpoint

### Search for songs

```bash
curl "http://localhost:5000/api/songs/search?q=britney"
```

### Search for artist

```bash
curl "http://localhost:5000/api/songs/search?q=eminem"
```

## Using Postman

1. Open Postman
2. Create a new request
3. Select POST method
4. Enter URL: `http://localhost:5000/api/chat`
5. Go to Headers tab, add:
   - Key: `Content-Type`
   - Value: `application/json`
6. Go to Body tab, select "raw", format "JSON"
7. Paste your JSON request:

```json
{
  "message": "I want energetic pop songs",
  "session_id": "test_session_1"
}
```

8. Click Send

## Expected Response Format

```json
{
  "response": "Found 5 song(s) with energetic vibe in pop! 🎵",
  "intent": "recommend",
  "recommendations": [
    {
      "id": "0",
      "artist": "Artist Name",
      "song": "Song Name",
      "genre": "pop",
      "mood": "Joyful",
      "year": 2000,
      "popularity": 77,
      "energy": 0.83,
      "valence": 0.89,
      "danceability": 0.75,
      "tempo": 95.05,
      "explicit": "FALSE"
    }
  ]
}
```

## Common Test Scenarios

### Full User Journey

1. **User opens app** (frontend loads and calls preferences endpoint)
2. **User selects mood filter** (frontend sends preference update)
3. **User types message** (frontend sends chat request)
4. **Backend processes** and returns recommendations
5. **User searches for artist** (frontend calls search endpoint)

### Test sequence:

```bash
# 1. Get initial preferences
curl http://localhost:5000/api/preferences?session_id=user_1

# 2. Update preferences
curl -X POST http://localhost:5000/api/preferences \
  -H "Content-Type: application/json" \
  -d '{"session_id": "user_1", "preferences": {"exclude_explicit": true}}'

# 3. Chat with preference applied
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "joyful songs", "session_id": "user_1"}'

# 4. Search for specific song
curl "http://localhost:5000/api/songs/search?q=thriller"
```

## Troubleshooting API Issues

### Issue: Connection Refused
- Verify backend is running: `python app.py` in backend folder
- Check port 5000 is not occupied

### Issue: CORS Error
- Ensure Flask-CORS is installed: `pip install flask-cors`
- Check backend `app.py` has CORS enabled

### Issue: No Recommendations
- Verify CSV file exists in `backend/data/songs_normalize.csv`
- Check CSV has correct column names
- Try simpler keywords in message

### Issue: API Returns Error
- Check backend console for Python errors
- Verify request JSON format is correct
- Check session_id format (should be string)

## Load Testing

To test with multiple requests:

```bash
# Bash script for 10 requests
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/chat \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"I want energetic songs\", \"session_id\": \"test_$i\"}"
  echo "Request $i completed"
  sleep 1
done
```

## Performance Metrics

Expected response times:
- Simple keyword search: < 100ms
- Recommendation with filtering: 200-500ms
- Artist similarity search: 300-800ms

---

Happy testing! 🎵
