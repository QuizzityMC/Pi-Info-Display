// Configuration
const API_BASE = window.location.origin;
const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with actual API key
const CANBERRA_LAT = -35.2809;
const CANBERRA_LON = 149.1300;

// State
let timetableData = [];
let shoppingData = [];
let notesData = [];
let quickLinksData = [];
let weatherDetailsVisible = false;
let currentWeatherData = null;
let nextcloudConfigured = false;
let nextcloudMessageInterval = null;
let currentFocusedInput = null;
let keyboardShiftActive = false;
let keyboardSymbolsActive = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    updateTime();
    updateWeather();
    loadData();
    initializeKeyboard();
    loadNextcloudConfig();
    
    // Update time every second
    setInterval(updateTime, 1000);
    
    // Update weather every 10 minutes
    setInterval(updateWeather, 600000);
});

// Tab Management
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Handle Nextcloud tab specific logic
    if (tabName === 'nextcloud') {
        if (nextcloudConfigured) {
            loadNextcloudMessages();
            // Start polling for new messages every 10 seconds
            if (nextcloudMessageInterval) {
                clearInterval(nextcloudMessageInterval);
            }
            nextcloudMessageInterval = setInterval(loadNextcloudMessages, 10000);
        }
    } else {
        // Stop polling when leaving the tab
        if (nextcloudMessageInterval) {
            clearInterval(nextcloudMessageInterval);
            nextcloudMessageInterval = null;
        }
    }
}

// Time Display
function updateTime() {
    const now = new Date();
    
    // Format time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;
    
    // Format date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-AU', options);
}

// Weather Display
async function updateWeather() {
    try {
        // Check if API key is set
        if (WEATHER_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
            // Use mock data for demonstration
            currentWeatherData = {
                main: { 
                    temp: 22,
                    feels_like: 21,
                    humidity: 65,
                    pressure: 1013
                },
                weather: [{ description: 'partly cloudy' }],
                wind: { speed: 3.5, deg: 180 },
                visibility: 10000,
                sys: { sunrise: Date.now() / 1000 - 3600, sunset: Date.now() / 1000 + 3600 }
            };
            displayWeather(currentWeatherData);
            return;
        }
        
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${CANBERRA_LAT}&lon=${CANBERRA_LON}&units=metric&appid=${WEATHER_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        currentWeatherData = data;
        displayWeather(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        document.querySelector('.weather-desc').textContent = 'Weather unavailable';
    }
}

function displayWeather(data) {
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    
    document.querySelector('.weather-temp').textContent = `${temp}°C`;
    document.querySelector('.weather-desc').textContent = description;
    
    // Update detailed weather info
    updateWeatherDetails(data);
}

function updateWeatherDetails(data) {
    // Feels like
    document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
    
    // Humidity
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    
    // Wind speed
    document.getElementById('wind-speed').textContent = `${data.wind.speed.toFixed(1)} m/s`;
    
    // Wind direction
    const windDeg = data.wind.deg;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const dirIndex = Math.round(windDeg / 45) % 8;
    document.getElementById('wind-direction').textContent = directions[dirIndex];
    
    // Pressure
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    // Visibility
    const visibilityKm = (data.visibility / 1000).toFixed(1);
    document.getElementById('visibility').textContent = `${visibilityKm} km`;
    
    // Sunrise/Sunset
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    document.getElementById('sunrise').textContent = sunrise.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunset').textContent = sunset.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

function toggleWeatherDetails() {
    const panel = document.getElementById('weather-details-panel');
    const btnText = document.getElementById('weather-btn-text');
    
    weatherDetailsVisible = !weatherDetailsVisible;
    
    if (weatherDetailsVisible) {
        panel.classList.remove('hidden');
        btnText.textContent = 'Hide Details';
    } else {
        panel.classList.add('hidden');
        btnText.textContent = 'More Details';
    }
}

// Data Loading
async function loadData() {
    try {
        const response = await fetch(`${API_BASE}/api/data`);
        const data = await response.json();
        timetableData = data.timetables || [];
        shoppingData = data.shopping_lists || [];
        notesData = data.notes || [];
        quickLinksData = data.quick_links || [];
        renderTimetable();
        renderShopping();
        renderNotes();
        renderQuickLinks();
        checkSchoolTimetable();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Timetable Functions
function showAddTimetableForm() {
    document.getElementById('add-timetable-form').classList.remove('hidden');
}

function hideAddTimetableForm() {
    document.getElementById('add-timetable-form').classList.add('hidden');
    document.getElementById('timetable-title').value = '';
    document.getElementById('timetable-time').value = '';
    document.getElementById('timetable-days').value = '';
}

async function addTimetableEvent() {
    const title = document.getElementById('timetable-title').value.trim();
    const time = document.getElementById('timetable-time').value;
    const days = document.getElementById('timetable-days').value.trim();
    
    if (!title || !time) {
        alert('Please fill in title and time');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/timetables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, time, days })
        });
        
        if (response.ok) {
            hideAddTimetableForm();
            await loadData();
        }
    } catch (error) {
        console.error('Error adding timetable event:', error);
        alert('Failed to add event');
    }
}

async function deleteTimetable(id) {
    if (!confirm('Delete this event?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/timetables/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadData();
        }
    } catch (error) {
        console.error('Error deleting timetable:', error);
        alert('Failed to delete event');
    }
}

function renderTimetable() {
    const container = document.getElementById('timetable-list');
    
    if (timetableData.length === 0) {
        container.innerHTML = '<div class="empty-state">No events yet. Add your first event!</div>';
        return;
    }
    
    // Sort by time
    const sorted = [...timetableData].sort((a, b) => a.time.localeCompare(b.time));
    
    container.innerHTML = sorted.map(event => `
        <div class="item">
            <div class="item-content">
                <div class="item-title">${escapeHtml(event.title)}</div>
                <div class="item-details">
                    🕐 ${event.time}${event.days ? ' • ' + escapeHtml(event.days) : ''}
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-delete" onclick="deleteTimetable('${event.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Shopping List Functions
function showAddShoppingForm() {
    document.getElementById('add-shopping-form').classList.remove('hidden');
}

function hideAddShoppingForm() {
    document.getElementById('add-shopping-form').classList.add('hidden');
    document.getElementById('shopping-item').value = '';
    document.getElementById('shopping-quantity').value = '';
}

async function addShoppingItem() {
    const item = document.getElementById('shopping-item').value.trim();
    const quantity = document.getElementById('shopping-quantity').value.trim();
    
    if (!item) {
        alert('Please enter an item name');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/shopping`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item, quantity, completed: false })
        });
        
        if (response.ok) {
            hideAddShoppingForm();
            await loadData();
        }
    } catch (error) {
        console.error('Error adding shopping item:', error);
        alert('Failed to add item');
    }
}

async function toggleShoppingItem(id, completed) {
    try {
        const response = await fetch(`${API_BASE}/api/shopping/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        
        if (response.ok) {
            await loadData();
        }
    } catch (error) {
        console.error('Error updating shopping item:', error);
    }
}

async function deleteShoppingItem(id) {
    if (!confirm('Delete this item?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/shopping/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadData();
        }
    } catch (error) {
        console.error('Error deleting shopping item:', error);
        alert('Failed to delete item');
    }
}

function renderShopping() {
    const container = document.getElementById('shopping-list');
    
    if (shoppingData.length === 0) {
        container.innerHTML = '<div class="empty-state">Your shopping list is empty. Add your first item!</div>';
        return;
    }
    
    // Sort: incomplete first, then by creation time
    const sorted = [...shoppingData].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return a.id.localeCompare(b.id);
    });
    
    container.innerHTML = sorted.map(item => `
        <div class="item shopping-item ${item.completed ? 'completed' : ''}">
            <input type="checkbox" 
                   class="shopping-checkbox" 
                   ${item.completed ? 'checked' : ''} 
                   onchange="toggleShoppingItem('${item.id}', this.checked)">
            <div class="item-content">
                <div class="item-title">${escapeHtml(item.item)}</div>
                ${item.quantity ? `<div class="item-details">${escapeHtml(item.quantity)}</div>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn-delete" onclick="deleteShoppingItem('${item.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// School Timetable Functions
function checkSchoolTimetable() {
    const img = new Image();
    img.onload = function() {
        displaySchoolTimetable(true);
    };
    img.onerror = function() {
        displaySchoolTimetable(false);
    };
    img.src = `${API_BASE}/images/timetable.png?t=${Date.now()}`;
}

function displaySchoolTimetable(exists) {
    const container = document.getElementById('school-timetable-display');
    
    if (exists) {
        container.innerHTML = `
            <img src="${API_BASE}/images/timetable.png?t=${Date.now()}" 
                 alt="School Timetable" 
                 class="timetable-image">
        `;
    } else {
        container.innerHTML = `
            <p class="info-message">To display your school timetable:</p>
            <ol class="instruction-list">
                <li>Save your timetable as <strong>timetable.png</strong></li>
                <li>Upload it to: <code>~/Pi-Info-Display/static/images/</code></li>
                <li>Click the Refresh button above</li>
            </ol>
        `;
    }
}

function refreshSchoolTimetable() {
    checkSchoolTimetable();
}

// Notes Functions
function showAddNoteForm() {
    document.getElementById('add-note-form').classList.remove('hidden');
}

function hideAddNoteForm() {
    document.getElementById('add-note-form').classList.add('hidden');
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
}

async function addNote() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    
    if (!title || !content) {
        alert('Please fill in both title and content');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        
        if (response.ok) {
            hideAddNoteForm();
            await loadData();
        }
    } catch (error) {
        console.error('Error adding note:', error);
        alert('Failed to add note');
    }
}

async function deleteNote(id) {
    if (!confirm('Delete this note?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/notes/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadData();
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note');
    }
}

function renderNotes() {
    const container = document.getElementById('notes-list');
    
    if (notesData.length === 0) {
        container.innerHTML = '<div class="empty-state">No notes yet. Add your first note!</div>';
        return;
    }
    
    // Sort by creation time (newest first)
    const sorted = [...notesData].sort((a, b) => b.created_at.localeCompare(a.created_at));
    
    container.innerHTML = sorted.map(note => `
        <div class="item note-item">
            <div class="item-content">
                <div class="note-title">${escapeHtml(note.title)}</div>
                <div class="note-content">${escapeHtml(note.content)}</div>
                <div class="note-date">${new Date(note.created_at).toLocaleDateString('en-AU', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}</div>
            </div>
            <div class="item-actions">
                <button class="btn-delete" onclick="deleteNote('${note.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Quick Links Functions
function showAddLinkForm() {
    document.getElementById('add-link-form').classList.remove('hidden');
}

function hideAddLinkForm() {
    document.getElementById('add-link-form').classList.add('hidden');
    document.getElementById('link-name').value = '';
    document.getElementById('link-url').value = '';
}

async function addQuickLink() {
    const name = document.getElementById('link-name').value.trim();
    const url = document.getElementById('link-url').value.trim();
    
    if (!name || !url) {
        alert('Please fill in both name and URL');
        return;
    }
    
    // Basic URL validation
    try {
        new URL(url);
    } catch (e) {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/quick_links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, url })
        });
        
        if (response.ok) {
            hideAddLinkForm();
            await loadData();
        }
    } catch (error) {
        console.error('Error adding quick link:', error);
        alert('Failed to add link');
    }
}

async function deleteQuickLink(id) {
    if (!confirm('Delete this link?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/quick_links/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadData();
        }
    } catch (error) {
        console.error('Error deleting link:', error);
        alert('Failed to delete link');
    }
}

function renderQuickLinks() {
    const container = document.getElementById('links-list');
    
    if (quickLinksData.length === 0) {
        container.innerHTML = '<div class="empty-state">No quick links yet. Add your first link!</div>';
        return;
    }
    
    container.innerHTML = quickLinksData.map(link => `
        <div class="link-card">
            <a href="${escapeHtml(link.url)}" target="_blank" class="link-card-content">
                <div class="link-icon">🔗</div>
                <div class="link-name">${escapeHtml(link.name)}</div>
            </a>
            <button class="link-delete-btn" onclick="deleteQuickLink('${link.id}'); event.stopPropagation();">×</button>
        </div>
    `).join('');
}

// Virtual Keyboard Functions
function initializeKeyboard() {
    // Add focus/blur listeners to all keyboard-enabled inputs
    document.addEventListener('focusin', (e) => {
        if (e.target.classList.contains('keyboard-enabled') || 
            e.target.classList.contains('input-field') ||
            e.target.tagName === 'TEXTAREA') {
            currentFocusedInput = e.target;
            showKeyboard();
        }
    });
    
    document.addEventListener('focusout', (e) => {
        // Small delay to allow keyboard button clicks to register
        setTimeout(() => {
            if (!document.activeElement.classList.contains('keyboard-key')) {
                // Don't hide immediately, user might click another input
            }
        }, 100);
    });
}

function showKeyboard() {
    document.getElementById('virtual-keyboard').classList.remove('hidden');
}

function hideKeyboard() {
    document.getElementById('virtual-keyboard').classList.add('hidden');
    if (currentFocusedInput) {
        currentFocusedInput.blur();
    }
}

function typeKey(key) {
    if (!currentFocusedInput) return;
    
    const input = currentFocusedInput;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    
    let charToAdd = key;
    if (keyboardShiftActive && key.length === 1) {
        charToAdd = key.toUpperCase();
        keyboardShiftActive = false;
        updateShiftButton();
    }
    
    input.value = text.substring(0, start) + charToAdd + text.substring(end);
    input.selectionStart = input.selectionEnd = start + charToAdd.length;
    input.focus();
}

function backspaceKey() {
    if (!currentFocusedInput) return;
    
    const input = currentFocusedInput;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    
    if (start !== end) {
        input.value = text.substring(0, start) + text.substring(end);
        input.selectionStart = input.selectionEnd = start;
    } else if (start > 0) {
        input.value = text.substring(0, start - 1) + text.substring(start);
        input.selectionStart = input.selectionEnd = start - 1;
    }
    input.focus();
}

function toggleShift() {
    keyboardShiftActive = !keyboardShiftActive;
    updateShiftButton();
}

function updateShiftButton() {
    const shiftButtons = document.querySelectorAll('.keyboard-key-wide');
    shiftButtons.forEach(btn => {
        if (btn.textContent.includes('Shift')) {
            btn.style.background = keyboardShiftActive ? '#FFD700' : '';
        }
    });
}

function toggleSymbols() {
    keyboardSymbolsActive = !keyboardSymbolsActive;
    // In a full implementation, this would switch to a symbols layout
    // For now, just show an alert
    alert('Symbol keyboard not fully implemented. Use the basic symbols on the current keyboard.');
}

// Nextcloud Functions
async function loadNextcloudConfig() {
    try {
        const response = await fetch(`${API_BASE}/api/nextcloud/config`);
        const config = await response.json();
        
        nextcloudConfigured = config.is_configured;
        
        if (nextcloudConfigured) {
            document.getElementById('nextcloud-chat-container').classList.remove('hidden');
            document.getElementById('nextcloud-not-configured').classList.add('hidden');
            document.getElementById('nextcloud-server').value = config.server_url || '';
            document.getElementById('nextcloud-username').value = config.username || '';
        } else {
            document.getElementById('nextcloud-chat-container').classList.add('hidden');
            document.getElementById('nextcloud-not-configured').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading Nextcloud config:', error);
        nextcloudConfigured = false;
    }
}

function toggleNextcloudSettings() {
    const form = document.getElementById('nextcloud-config-form');
    const isHidden = form.classList.contains('hidden');
    
    if (isHidden) {
        form.classList.remove('hidden');
    } else {
        form.classList.add('hidden');
    }
}

function hideNextcloudSettings() {
    document.getElementById('nextcloud-config-form').classList.add('hidden');
}

async function saveNextcloudConfig() {
    const serverUrl = document.getElementById('nextcloud-server').value.trim();
    const username = document.getElementById('nextcloud-username').value.trim();
    const password = document.getElementById('nextcloud-password').value.trim();
    
    if (!serverUrl || !username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        // First save the config without conversation
        const response = await fetch(`${API_BASE}/api/nextcloud/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                server_url: serverUrl,
                username: username,
                app_password: password,
                conversation_token: ''
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save configuration');
        }
        
        // Now fetch conversations
        const convResponse = await fetch(`${API_BASE}/api/nextcloud/conversations`);
        if (convResponse.ok) {
            const conversations = await convResponse.json();
            
            if (conversations.length === 0) {
                alert('No conversations found. Please create a conversation in Nextcloud Talk first.');
                return;
            }
            
            // Show conversation selector
            const selector = document.getElementById('conversation-selector');
            const select = document.getElementById('conversation-select');
            
            select.innerHTML = conversations.map(conv => 
                `<option value="${conv.token}">${escapeHtml(conv.name)}</option>`
            ).join('');
            
            selector.classList.remove('hidden');
            
            // Wait for user to select conversation
            alert('Please select a conversation from the dropdown below and save again.');
            
        } else {
            throw new Error('Failed to fetch conversations');
        }
        
    } catch (error) {
        console.error('Error saving Nextcloud config:', error);
        alert('Failed to save configuration. Please check your credentials and server URL.');
    }
}

async function finalizeNextcloudConfig() {
    const conversationToken = document.getElementById('conversation-select').value;
    
    if (!conversationToken) {
        alert('Please select a conversation');
        return;
    }
    
    try {
        const serverUrl = document.getElementById('nextcloud-server').value.trim();
        const username = document.getElementById('nextcloud-username').value.trim();
        const password = document.getElementById('nextcloud-password').value.trim();
        
        const response = await fetch(`${API_BASE}/api/nextcloud/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                server_url: serverUrl,
                username: username,
                app_password: password,
                conversation_token: conversationToken
            })
        });
        
        if (response.ok) {
            hideNextcloudSettings();
            await loadNextcloudConfig();
            alert('Nextcloud connected successfully!');
            loadNextcloudMessages();
        } else {
            throw new Error('Failed to save configuration');
        }
    } catch (error) {
        console.error('Error finalizing Nextcloud config:', error);
        alert('Failed to save configuration.');
    }
}

async function disconnectNextcloud() {
    if (!confirm('Disconnect from Nextcloud? This will delete your saved credentials.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/nextcloud/config`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            nextcloudConfigured = false;
            document.getElementById('nextcloud-server').value = '';
            document.getElementById('nextcloud-username').value = '';
            document.getElementById('nextcloud-password').value = '';
            document.getElementById('conversation-selector').classList.add('hidden');
            hideNextcloudSettings();
            await loadNextcloudConfig();
            alert('Disconnected from Nextcloud');
        }
    } catch (error) {
        console.error('Error disconnecting Nextcloud:', error);
        alert('Failed to disconnect');
    }
}

async function loadNextcloudMessages() {
    if (!nextcloudConfigured) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/nextcloud/messages`);
        if (response.ok) {
            const messages = await response.json();
            renderNextcloudMessages(messages);
        } else {
            console.error('Failed to load messages');
        }
    } catch (error) {
        console.error('Error loading Nextcloud messages:', error);
    }
}

function renderNextcloudMessages(messages) {
    const container = document.getElementById('nextcloud-messages');
    
    if (messages.length === 0) {
        container.innerHTML = '<div class="empty-state" style="margin: 20px;">No messages yet. Start the conversation!</div>';
        return;
    }
    
    // Reverse to show oldest first
    const sorted = [...messages].reverse();
    
    container.innerHTML = sorted.map(msg => {
        const date = new Date(msg.timestamp * 1000);
        const timeStr = date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="nextcloud-message">
                <div class="message-header">
                    <span class="message-author">${escapeHtml(msg.actorDisplayName)}</span>
                    <span class="message-time">${timeStr}</span>
                </div>
                <div class="message-content">${escapeHtml(msg.message)}</div>
            </div>
        `;
    }).join('');
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

async function sendNextcloudMessage() {
    const input = document.getElementById('nextcloud-message-input');
    const message = input.value.trim();
    
    if (!message) {
        alert('Please enter a message');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/nextcloud/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        if (response.ok) {
            input.value = '';
            // Reload messages immediately
            await loadNextcloudMessages();
        } else {
            alert('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
    }
}

function handleNextcloudMessageKeypress(event) {
    if (event.key === 'Enter') {
        sendNextcloudMessage();
    }
}

// Update save button to handle conversation selection
document.addEventListener('DOMContentLoaded', () => {
    const conversationSelect = document.getElementById('conversation-select');
    if (conversationSelect) {
        conversationSelect.addEventListener('change', () => {
            const btn = document.querySelector('#nextcloud-config-form .btn-save');
            if (btn && document.getElementById('conversation-selector').classList.contains('hidden') === false) {
                btn.onclick = finalizeNextcloudConfig;
                btn.textContent = 'Connect to Conversation';
            }
        });
    }
});
