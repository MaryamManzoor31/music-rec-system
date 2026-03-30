// Configuration
const API_BASE = 'http://localhost:5000/api';
const SESSION_ID = 'session_' + Date.now();

console.log('✅ App.js loaded!');
console.log('API Base:', API_BASE);
console.log('Session ID:', SESSION_ID);

// DOM Elements (will be initialized after DOM loads)
let chatForm, chatInput, messagesContainer, recommendationsSection, songsList;
let moodButtons, genreFilter, explicitFilter, yearFilter, yearDisplay;

// State
let userPreferences = {
    preferred_moods: [],
    preferred_genres: [],
    exclude_explicit: false,
    year_range: [1999, 2025]
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    console.log('🔧 Initializing app...');
    
    // Get DOM Elements
    chatForm = document.getElementById('chat-form');
    chatInput = document.getElementById('chat-input');
    messagesContainer = document.getElementById('chat-messages');
    recommendationsSection = document.getElementById('recommendations');
    songsList = document.getElementById('songs-list');
    moodButtons = document.querySelectorAll('.mood-btn');
    genreFilter = document.getElementById('genre-filter');
    explicitFilter = document.getElementById('explicit-filter');
    yearFilter = document.getElementById('year-filter');
    yearDisplay = document.getElementById('year-display');
    
    // Check if all elements exist
    if (!chatForm) {
        console.error('❌ chat-form not found!');
        return;
    }
    console.log('✅ All DOM elements found');

    // Event Listeners
    chatForm.addEventListener('submit', handleChatSubmit);
    moodButtons.forEach(btn => {
        btn.addEventListener('click', handleMoodSelect);
    });
    genreFilter.addEventListener('change', handleGenreChange);
    explicitFilter.addEventListener('change', handleExplicitChange);
    yearFilter.addEventListener('input', handleYearChange);
    
    console.log('✅ Event listeners attached');
    
    // Load preferences on page load
    loadPreferences();
}

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
        
        console.log('API Response:', data);
        console.log('Recommendations:', data.recommendations);
        
        // Display bot response
        addMessage(data.response, 'bot');
        
        // Display recommendations if available
        if (data.recommendations && data.recommendations.length > 0) {
            console.log('Displaying', data.recommendations.length, 'songs');
            displayRecommendations(data.recommendations);
        } else {
            console.log('No recommendations returned');
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
    console.log('displayRecommendations called with', songs.length, 'songs');
    
    // Clear previous songs
    songsList.innerHTML = '';
    
    // Show the recommendations section
    recommendationsSection.classList.remove('hidden');
    recommendationsSection.style.display = 'block';
    
    // Add songs to the grid
    songs.forEach((song, index) => {
        const card = createSongCard(song);
        songsList.appendChild(card);
    });
    
    console.log('Total cards added:', songsList.children.length);
    
    // Scroll to recommendations after a brief delay to ensure DOM is updated
    setTimeout(() => {
        console.log('Scrolling to recommendations...');
        recommendationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
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
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Load user preferences from backend
 */
async function loadPreferences() {
    try {
        const response = await fetch(`${API_BASE}/preferences?session_id=${SESSION_ID}`);
        if (response.ok) {
            const prefs = await response.json();
            userPreferences = { ...userPreferences, ...prefs };
            console.log('✅ Preferences loaded:', userPreferences);
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}
