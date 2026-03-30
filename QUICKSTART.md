# 🚀 Quick Start Guide

Get the Music Recommendation Chatbot up and running in 5 minutes!

## For Windows Users

### Step 1: Run Setup Script
Double-click `setup.bat` in the project root folder

This will:
- Create a Python virtual environment
- Install all dependencies
- Display next steps

### Step 2: Start Backend
```bash
cd backend
venv\Scripts\activate
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

### Step 3: Start Frontend (in a NEW terminal)
```bash
cd frontend
python -m http.server 8000
```

### Step 4: Open Browser
Navigate to: `http://localhost:8000`

---

## For macOS/Linux Users

### Step 1: Run Setup Script
```bash
chmod +x setup.sh
./setup.sh
```

### Step 2: Start Backend
```bash
cd backend
source venv/bin/activate
python app.py
```

### Step 3: Start Frontend (in a NEW terminal)
```bash
cd frontend
python -m http.server 8000
```

### Step 4: Open Browser
Navigate to: `http://localhost:8000`

---

## Test It Out

Once everything is running, try these commands in the chatbot:

💡 **Try these:**
- "I want energetic pop songs"
- "Recommend melancholic music"
- "Songs like The Weeknd"
- "No explicit songs please"
- "Show me joyful songs"

---

## Troubleshooting

### ❌ Backend won't start
```bash
# Make sure you're in the backend folder
cd backend

# Make sure virtual environment is activated
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Check Python is installed
python --version
```

### ❌ Frontend shows "Connection refused"
- Verify backend is running on `http://localhost:5000`
- Check your firewall isn't blocking port 5000
- Try accessing `http://localhost:5000/health` directly

### ❌ No songs showing up
- Check `backend/data/songs_normalize.csv` exists
- Verify backend console shows "Loaded 2000 songs"
- Try simpler keywords like just "pop" or "energetic"

### ❌ Frontend won't load
- Check frontend server is running on port 8000
- Try clearing browser cache (Ctrl+Shift+Delete)
- Check browser console for errors (F12)

---

## Detailed Documentation

- **README.md** - Full project documentation
- **API_TESTING.md** - How to test endpoints with curl/Postman
- **backend/requirements.txt** - Python dependencies

---

## Next Steps

1. ✅ Run the application locally
2. 📖 Read the full README.md for advanced features
3. 🔍 Check out API_TESTING.md to test endpoints
4. 🎨 Customize the UI in `frontend/style.css`
5. 🧠 Modify the NLP engine in `backend/chatbot.py`

---

**Questions?** Check the Troubleshooting section in README.md

**Ready to deploy?** See Deployment Options in README.md

---

Happy recommending! 🎵
