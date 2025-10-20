#!/usr/bin/env python3
"""
Flask server for Pi Info Display kiosk application.
Serves the web interface and provides API endpoints for data persistence.
"""
import os
import json
import requests
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
        'quick_links': [],
        'nextcloud_config': {}
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

@app.route('/api/nextcloud/config', methods=['GET', 'POST', 'DELETE'])
def nextcloud_config():
    """Handle Nextcloud configuration operations."""
    data = load_data()
    
    if request.method == 'GET':
        # Return config without password
        config = data.get('nextcloud_config', {})
        safe_config = {
            'server_url': config.get('server_url', ''),
            'username': config.get('username', ''),
            'conversation_token': config.get('conversation_token', ''),
            'is_configured': bool(config.get('server_url') and config.get('username') and config.get('app_password'))
        }
        return jsonify(safe_config)
    
    if request.method == 'POST':
        config = request.json
        data['nextcloud_config'] = {
            'server_url': config.get('server_url', '').rstrip('/'),
            'username': config.get('username', ''),
            'app_password': config.get('app_password', ''),
            'conversation_token': config.get('conversation_token', '')
        }
        save_data(data)
        return jsonify({'success': True}), 201
    
    if request.method == 'DELETE':
        data['nextcloud_config'] = {}
        save_data(data)
        return '', 204

@app.route('/api/nextcloud/conversations', methods=['GET'])
def nextcloud_conversations():
    """Get list of Nextcloud Talk conversations."""
    data = load_data()
    config = data.get('nextcloud_config', {})
    
    if not config.get('server_url') or not config.get('username') or not config.get('app_password'):
        return jsonify({'error': 'Nextcloud not configured'}), 400
    
    try:
        url = f"{config['server_url']}/ocs/v2.php/apps/spreed/api/v4/room"
        response = requests.get(
            url,
            auth=(config['username'], config['app_password']),
            headers={'OCS-APIRequest': 'true', 'Accept': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            conversations = data.get('ocs', {}).get('data', [])
            # Simplify conversation data
            simplified = [{
                'token': conv['token'],
                'name': conv['displayName'],
                'type': conv['type']
            } for conv in conversations]
            return jsonify(simplified)
        else:
            return jsonify({'error': 'Failed to fetch conversations', 'status': response.status_code}), 400
    except Exception:
        return jsonify({'error': 'Failed to connect to Nextcloud server'}), 500

@app.route('/api/nextcloud/messages', methods=['GET', 'POST'])
def nextcloud_messages():
    """Get or send messages in a Nextcloud Talk conversation."""
    data = load_data()
    config = data.get('nextcloud_config', {})
    
    if not config.get('server_url') or not config.get('username') or not config.get('app_password'):
        return jsonify({'error': 'Nextcloud not configured'}), 400
    
    conversation_token = config.get('conversation_token')
    if not conversation_token:
        return jsonify({'error': 'No conversation selected'}), 400
    
    if request.method == 'GET':
        try:
            # Get last 50 messages
            url = f"{config['server_url']}/ocs/v2.php/apps/spreed/api/v1/chat/{conversation_token}"
            response = requests.get(
                url,
                auth=(config['username'], config['app_password']),
                headers={'OCS-APIRequest': 'true', 'Accept': 'application/json'},
                params={'limit': 50, 'lookIntoFuture': 0}
            )
            
            if response.status_code == 200:
                data = response.json()
                messages = data.get('ocs', {}).get('data', [])
                # Simplify message data
                simplified = [{
                    'id': msg['id'],
                    'message': msg['message'],
                    'actorDisplayName': msg['actorDisplayName'],
                    'actorId': msg['actorId'],
                    'timestamp': msg['timestamp']
                } for msg in messages]
                return jsonify(simplified)
            else:
                return jsonify({'error': 'Failed to fetch messages', 'status': response.status_code}), 400
        except Exception:
            return jsonify({'error': 'Failed to connect to Nextcloud server'}), 500
    
    if request.method == 'POST':
        message = request.json.get('message', '').strip()
        if not message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        try:
            url = f"{config['server_url']}/ocs/v2.php/apps/spreed/api/v1/chat/{conversation_token}"
            response = requests.post(
                url,
                auth=(config['username'], config['app_password']),
                headers={'OCS-APIRequest': 'true', 'Accept': 'application/json'},
                json={'message': message}
            )
            
            if response.status_code in [200, 201]:
                return jsonify({'success': True}), 201
            else:
                return jsonify({'error': 'Failed to send message', 'status': response.status_code}), 400
        except Exception:
            return jsonify({'error': 'Failed to connect to Nextcloud server'}), 500

if __name__ == '__main__':
    # Run on all interfaces for access from browser
    app.run(host='0.0.0.0', port=5000, debug=False)
