// Configuration
const API_BASE = 'http://localhost:5000/api';
const SESSION_ID = 'session_' + Date.now();

// DOM Elements
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const messagesContainer = document.getElementById('chat-messages');
const recommendationsSection = document.getElementById('recommendations');
const songsList = document.getElementById('songs-list');
const moodButtons = document.querySelectorAll('.mood-btn');
const genreFilter = document.getElementById('genre-filter');
const explicitFilter = document.getElementById('explicit-filter');
const yearFilter = document.getElementById('year-filter');
const yearDisplay = document.getElementById('year-display');

// State
let userPreferences = {
    preferred_moods: [],
    preferred_genres: [],
    exclude_explicit: false,
    year_range: [1999, 2025]
};

// Event Listeners
chatForm.addEventListener('submit', handleChatSubmit);
moodButtons.forEach(btn => {
    btn.addEventListener('click', handleMoodSelect);
});
genreFilter.addEventListener('change', handleGenreChange);
explicitFilter.addEventListener('change', handleExplicitChange);
yearFilter.addEventListener('input', handleYearChange);

// Functions

/**
 * Handle chat form submission
 */
async function handleChatSubmit(e) {
    e.preventDefault();
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Display user message
    addMessage(message, 'user');
    chatInput.value = '';
    
    try {
        // Send to backend
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                session_id: SESSION_ID
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display bot response
        addMessage(data.response, 'bot');
        
        // Display recommendations if available
        if (data.recommendations && data.recommendations.length > 0) {
            displayRecommendations(data.recommendations);
        }
    } catch (error) {
        addMessage('Sorry, something went wrong. Please try again. Make sure the backend server is running on http://localhost:5000', 'bot');
        console.error('Error:', error);
    }
}

/**
 * Add message to chat
 */
function addMessage(text, sender) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${sender}-message`;
    messageEl.innerHTML = `<p>${escapeHtml(text)}</p>`;
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Display recommended songs
 */
function displayRecommendations(songs) {
    songsList.innerHTML = '';
    recommendationsSection.classList.remove('hidden');
    
    songs.forEach(song => {
        const card = createSongCard(song);
        songsList.appendChild(card);
    });
}

/**
 * Create song card element
 */
function createSongCard(song) {
    const card = document.createElement('div');
    card.className = 'song-card';
    
    const explicit = song.explicit === 'TRUE' || song.explicit === true ? '🔞' : '';
    
    card.innerHTML = `
        <div class="song-title">${escapeHtml(song.song)}</div>
        <div class="song-artist">${escapeHtml(song.artist)}</div>
        
        <div class="song-meta">
            <span class="meta-tag">${escapeHtml(song.genre)}</span>
            <span class="meta-tag">${song.mood}</span>
            ${explicit ? `<span class="meta-tag">${explicit}</span>` : ''}
        </div>
        
        <div class="song-features">
            <div class="feature-item">Energy: <span class="feature-value">${song.energy}</span></div>
            <div class="feature-item">Valence: <span class="feature-value">${song.valence}</span></div>
            <div class="feature-item">Danceability: <span class="feature-value">${song.danceability}</span></div>
            <div class="feature-item">Tempo: <span class="feature-value">${song.tempo} BPM</span></div>
        </div>
    `;
    
    return card;
}

/**
 * Handle mood button clicks
 */
function handleMoodSelect(e) {
    const mood = e.target.dataset.mood;
    e.target.classList.toggle('active');
    
    // Update preferences
    if (e.target.classList.contains('active')) {
        if (!userPreferences.preferred_moods.includes(mood)) {
            userPreferences.preferred_moods.push(mood);
        }
    } else {
        userPreferences.preferred_moods = userPreferences.preferred_moods.filter(m => m !== mood);
    }
    
    updatePreferences();
}

/**
 * Handle genre change
 */
function handleGenreChange(e) {
    userPreferences.preferred_genres = e.target.value ? [e.target.value] : [];
    updatePreferences();
}

/**
 * Handle explicit filter change
 */
function handleExplicitChange(e) {
    userPreferences.exclude_explicit = e.target.checked;
    updatePreferences();
}

/**
 * Handle year range change
 */
function handleYearChange(e) {
    const year = parseInt(e.target.value);
    userPreferences.year_range = [1999, year];
    yearDisplay.textContent = `Up to ${year}`;
    updatePreferences();
}

/**
 * Update user preferences on backend
 */
async function updatePreferences() {
    try {
        await fetch(`${API_BASE}/preferences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: SESSION_ID,
                preferences: userPreferences
            })
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
    }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load preferences on page load
window.addEventListener('load', async () => {
    try {
        const response = await fetch(`${API_BASE}/preferences?session_id=${SESSION_ID}`);
        if (response.ok) {
            const prefs = await response.json();
            userPreferences = { ...userPreferences, ...prefs };
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
});
