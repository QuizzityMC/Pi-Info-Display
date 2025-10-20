#!/usr/bin/env python3
"""
Flask server for Pi Info Display kiosk application.
Serves the web interface and provides API endpoints for data persistence.
"""
import os
import json
from datetime import datetime
from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Data storage file
DATA_FILE = 'data.json'

def load_data():
    """Load data from JSON file."""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {
        'timetables': [],
        'shopping_lists': [],
        'notes': [],
        'quick_links': []
    }

def save_data(data):
    """Save data to JSON file."""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    """Serve the main application page."""
    return render_template('index.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    """Get all stored data."""
    return jsonify(load_data())

@app.route('/api/timetables', methods=['GET', 'POST'])
def timetables():
    """Handle timetable operations."""
    data = load_data()
    
    if request.method == 'POST':
        new_timetable = request.json
        new_timetable['id'] = datetime.now().isoformat()
        data['timetables'].append(new_timetable)
        save_data(data)
        return jsonify(new_timetable), 201
    
    return jsonify(data['timetables'])

@app.route('/api/timetables/<timetable_id>', methods=['DELETE', 'PUT'])
def timetable_item(timetable_id):
    """Handle individual timetable operations."""
    data = load_data()
    
    if request.method == 'DELETE':
        data['timetables'] = [t for t in data['timetables'] if t['id'] != timetable_id]
        save_data(data)
        return '', 204
    
    if request.method == 'PUT':
        for i, t in enumerate(data['timetables']):
            if t['id'] == timetable_id:
                data['timetables'][i] = {**t, **request.json, 'id': timetable_id}
                save_data(data)
                return jsonify(data['timetables'][i])
        return jsonify({'error': 'Not found'}), 404

@app.route('/api/shopping', methods=['GET', 'POST'])
def shopping():
    """Handle shopping list operations."""
    data = load_data()
    
    if request.method == 'POST':
        new_item = request.json
        new_item['id'] = datetime.now().isoformat()
        new_item['completed'] = False
        data['shopping_lists'].append(new_item)
        save_data(data)
        return jsonify(new_item), 201
    
    return jsonify(data['shopping_lists'])

@app.route('/api/shopping/<item_id>', methods=['DELETE', 'PUT'])
def shopping_item(item_id):
    """Handle individual shopping list item operations."""
    data = load_data()
    
    if request.method == 'DELETE':
        data['shopping_lists'] = [s for s in data['shopping_lists'] if s['id'] != item_id]
        save_data(data)
        return '', 204
    
    if request.method == 'PUT':
        for i, s in enumerate(data['shopping_lists']):
            if s['id'] == item_id:
                data['shopping_lists'][i] = {**s, **request.json, 'id': item_id}
                save_data(data)
                return jsonify(data['shopping_lists'][i])
        return jsonify({'error': 'Not found'}), 404

@app.route('/api/config', methods=['GET', 'POST'])
def config():
    """Handle configuration operations."""
    config_file = os.path.join(os.path.dirname(__file__), 'static', 'js', 'app.js')
    
    if request.method == 'GET':
        # Return current config status
        try:
            with open(config_file, 'r') as f:
                content = f.read()
                has_api_key = 'YOUR_OPENWEATHERMAP_API_KEY' not in content
                return jsonify({'weather_configured': has_api_key})
        except Exception:
            return jsonify({'weather_configured': False})
    
    return jsonify({'error': 'Method not allowed'}), 405

@app.route('/api/notes', methods=['GET', 'POST'])
def notes():
    """Handle notes operations."""
    data = load_data()
    
    if request.method == 'POST':
        new_note = request.json
        new_note['id'] = datetime.now().isoformat()
        new_note['created_at'] = datetime.now().isoformat()
        data['notes'].append(new_note)
        save_data(data)
        return jsonify(new_note), 201
    
    return jsonify(data.get('notes', []))

@app.route('/api/notes/<note_id>', methods=['DELETE', 'PUT'])
def note_item(note_id):
    """Handle individual note operations."""
    data = load_data()
    
    if request.method == 'DELETE':
        data['notes'] = [n for n in data.get('notes', []) if n['id'] != note_id]
        save_data(data)
        return '', 204
    
    if request.method == 'PUT':
        for i, n in enumerate(data.get('notes', [])):
            if n['id'] == note_id:
                data['notes'][i] = {**n, **request.json, 'id': note_id}
                save_data(data)
                return jsonify(data['notes'][i])
        return jsonify({'error': 'Not found'}), 404

@app.route('/api/quick_links', methods=['GET', 'POST'])
def quick_links():
    """Handle quick links operations."""
    data = load_data()
    
    if request.method == 'POST':
        new_link = request.json
        new_link['id'] = datetime.now().isoformat()
        data['quick_links'].append(new_link)
        save_data(data)
        return jsonify(new_link), 201
    
    return jsonify(data.get('quick_links', []))

@app.route('/api/quick_links/<link_id>', methods=['DELETE', 'PUT'])
def quick_link_item(link_id):
    """Handle individual quick link operations."""
    data = load_data()
    
    if request.method == 'DELETE':
        data['quick_links'] = [l for l in data.get('quick_links', []) if l['id'] != link_id]
        save_data(data)
        return '', 204
    
    if request.method == 'PUT':
        for i, l in enumerate(data.get('quick_links', [])):
            if l['id'] == link_id:
                data['quick_links'][i] = {**l, **request.json, 'id': link_id}
                save_data(data)
                return jsonify(data['quick_links'][i])
        return jsonify({'error': 'Not found'}), 404

@app.route('/images/<path:filename>')
def serve_image(filename):
    """Serve images from the static/images directory."""
    return send_from_directory(os.path.join(app.root_path, 'static', 'images'), filename)

if __name__ == '__main__':
    # Run on all interfaces for access from browser
    app.run(host='0.0.0.0', port=5000, debug=False)
