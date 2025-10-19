// Configuration
const API_BASE = window.location.origin;
const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with actual API key
const CANBERRA_LAT = -35.2809;
const CANBERRA_LON = 149.1300;

// State
let timetableData = [];
let shoppingData = [];
let weatherDetailsVisible = false;
let currentWeatherData = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    updateTime();
    updateWeather();
    loadData();
    
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
        renderTimetable();
        renderShopping();
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
