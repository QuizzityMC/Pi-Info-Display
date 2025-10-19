# Pi Info Display - Kitchen Kiosk

A touchscreen-friendly information display for Raspberry Pi, designed for kitchen wall mounting with a 7" display (Raspberry Pi 5 + Pi Display 2).

## Features

- **Real-time Clock**: Always-on time and date display
- **Weather Display**: Live weather for Canberra, Australia
- **Timetable Manager**: Create and manage daily schedules and events
- **Shopping List**: Track grocery items with checkbox completion
- **Kiosk Mode**: Auto-starts at boot in fullscreen mode
- **Touch-Optimized UI**: Large buttons and controls for touchscreen use

## Hardware Requirements

- Raspberry Pi 5
- Raspberry Pi Display 2 (7" touchscreen)
- 16GB+ microSD card
- Power supply

## Software Stack

- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Backend**: Python Flask
- **Display**: Chromium in kiosk mode
- **OS**: Raspberry Pi OS (Bookworm recommended)

## Quick Start Installation

### 1. Prepare Your Raspberry Pi

Flash Raspberry Pi OS (Desktop version) onto your SD card using Raspberry Pi Imager:
- Choose "Raspberry Pi OS (64-bit)" with desktop
- Configure WiFi and enable SSH if needed
- Boot up your Raspberry Pi

### 2. Clone and Install

```bash
# Clone the repository
cd ~
git clone https://github.com/QuizzityMC/Pi-Info-Display.git
cd Pi-Info-Display

# Run the installation script
chmod +x install.sh
./install.sh
```

The installation script will:
- Update system packages
- Install required dependencies (Python, Chromium, etc.)
- Set up the Flask backend as a system service
- Configure kiosk mode to auto-start
- Set up screen power management

### 3. Optional: Configure Weather API

For live weather data (free tier available):

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Edit `static/js/app.js`
3. Replace `YOUR_OPENWEATHERMAP_API_KEY` with your actual API key

```javascript
const WEATHER_API_KEY = 'your_actual_api_key_here';
```

### 4. Reboot

```bash
sudo reboot
```

After reboot, the kiosk will automatically start in fullscreen mode.

## Manual Testing

To test the application before rebooting:

```bash
# Start the Flask backend
python3 app.py

# Open in a browser
chromium-browser --kiosk http://localhost:5000
```

## Usage

### Time and Weather
The header displays:
- Current time (updates every second)
- Current date
- Weather for Canberra, Australia (updates every 10 minutes)

### Timetable Tab
1. Tap "Timetable" tab
2. Tap "+ Add Event" button
3. Enter event title, time, and optional days
4. Tap "Save"
5. Events are sorted by time automatically

### Shopping List Tab
1. Tap "Shopping List" tab
2. Tap "+ Add Item" button
3. Enter item name and optional quantity
4. Tap "Save"
5. Check off items as you shop
6. Delete completed items

## File Structure

```
Pi-Info-Display/
├── app.py                      # Flask backend server
├── requirements.txt            # Python dependencies
├── pi-info-display.service     # Systemd service file
├── install.sh                  # Installation script
├── kiosk.sh                    # Kiosk mode launcher
├── data.json                   # Data storage (created on first run)
├── templates/
│   └── index.html              # Main HTML template
└── static/
    ├── css/
    │   └── style.css           # Styles (touch-optimized)
    └── js/
        └── app.js              # Frontend application logic
```

## API Endpoints

The Flask backend provides REST API endpoints:

- `GET /` - Main application page
- `GET /api/data` - Get all data
- `GET /api/timetables` - Get all timetable events
- `POST /api/timetables` - Create new timetable event
- `PUT /api/timetables/<id>` - Update timetable event
- `DELETE /api/timetables/<id>` - Delete timetable event
- `GET /api/shopping` - Get all shopping items
- `POST /api/shopping` - Create new shopping item
- `PUT /api/shopping/<id>` - Update shopping item
- `DELETE /api/shopping/<id>` - Delete shopping item

## Customization

### Change Weather Location

Edit `static/js/app.js`:

```javascript
const CANBERRA_LAT = -35.2809;  // Change to your latitude
const CANBERRA_LON = 149.1300;  // Change to your longitude
```

Update the location text in `templates/index.html`:

```html
<div class="weather-location">Your City, Country</div>
```

### Adjust Display Size

The UI is responsive and optimized for 800x480 (7" display). For different screen sizes, modify the media queries in `static/css/style.css`.

### Change Colors

Edit the gradient in `static/css/style.css`:

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## Troubleshooting

### Service Not Starting

Check service status:
```bash
sudo systemctl status pi-info-display.service
```

View logs:
```bash
sudo journalctl -u pi-info-display.service -f
```

### Kiosk Not Auto-Starting

Check autostart configuration:
```bash
cat ~/.config/autostart/kiosk.desktop
```

### Screen Blanking

If screen still blanks, edit `/boot/config.txt`:
```
# Add these lines
hdmi_blanking=1
```

### Touch Not Working

Ensure the official 7" touchscreen is properly connected. Check with:
```bash
dmesg | grep -i touch
```

## Uninstallation

```bash
# Stop and disable services
sudo systemctl stop pi-info-display.service
sudo systemctl disable pi-info-display.service
sudo rm /etc/systemd/system/pi-info-display.service

# Remove autostart
rm ~/.config/autostart/kiosk.desktop
rm -rf ~/.config/lxsession/LXDE-pi

# Remove the application directory
cd ~
rm -rf Pi-Info-Display
```

## Development

To modify and test changes:

1. Edit files in the repository
2. Restart the Flask service: `sudo systemctl restart pi-info-display.service`
3. Refresh the browser (or use `Ctrl+R` in kiosk mode)

For live development:
```bash
# Run Flask in debug mode
python3 app.py

# Access from browser
chromium-browser http://localhost:5000
```

## Security Notes

- The Flask server runs on localhost only (not accessible from network)
- No authentication required (designed for local use)
- Data stored in plain text JSON file
- For internet-exposed deployments, add authentication

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.

## Credits

Built for Raspberry Pi 5 + Pi Display 2 (7" touchscreen)
Weather data from OpenWeatherMap API