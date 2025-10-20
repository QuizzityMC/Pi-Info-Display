# Pi Info Display - Kitchen Kiosk

A touchscreen-friendly information display for Raspberry Pi, designed for kitchen wall mounting with a 7" display (Raspberry Pi 5 + Pi Display 2).

## Features

- **Real-time Clock**: Always-on time and date display
- **Weather Display**: Live weather for Canberra, Australia (with detailed weather information)
- **Timetable Manager**: Create and manage daily schedules and events
- **School Timetable**: Display a custom timetable image (upload timetable.png)
- **Notes & Reminders**: Create and manage notes with timestamps
- **Shopping List**: Track grocery items with checkbox completion
- **Quick Links**: Store and access frequently used websites
- **Nextcloud Chat**: Communicate via Nextcloud Talk with one selected conversation
- **Virtual Keyboard**: Onscreen keyboard for all input fields (touchscreen-friendly)
- **Kiosk Mode**: Auto-starts at boot in fullscreen mode (desktop and CLI mode support)
- **Touch-Optimized UI**: Large buttons and controls for touchscreen use

## Screenshots

### Main Display - Timetable Tab
The main interface showing the real-time clock, current weather, and empty timetable view.

![Main Timetable View](https://github.com/user-attachments/assets/fd869baf-4609-4e84-a123-d9785623c0bf)

### Timetable with Events
Manage your daily schedule with custom events, times, and recurring days.

![Timetable with Events](https://github.com/user-attachments/assets/6990a313-19a3-4ccf-ba7c-e6be8ac2f3d4)

### Shopping List
Track your grocery items with checkboxes to mark items as purchased.

![Shopping List](https://github.com/user-attachments/assets/45f00ba0-c7af-4814-ac00-96dd26a950e8)

### Shopping List with Items
View and manage your shopping items with quantities.

![Shopping List with Items](https://github.com/user-attachments/assets/d98d3dc2-996d-4304-9605-a120df5425b4)

### Weather Details
Click "More Details" to see comprehensive weather information including humidity, wind, pressure, and more.

![Weather Details](https://github.com/user-attachments/assets/c06f2042-83ce-435c-b692-2569155837be)

### Nextcloud Chat
Communicate with a single Nextcloud Talk conversation directly from the kiosk.

![Nextcloud Chat with Virtual Keyboard](https://github.com/user-attachments/assets/6ecc8258-0710-4213-8dae-4c3738b9b03c)

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

Flash Raspberry Pi OS (Desktop or Lite version) onto your SD card using Raspberry Pi Imager:
- **Desktop version**: Choose "Raspberry Pi OS (64-bit)" with desktop for graphical interface
- **Lite version**: Choose "Raspberry Pi OS Lite (64-bit)" for headless/CLI mode
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

```
6790aa032d69ca8bea93e1d3dee8bb00
```

The installation script will:
- Update system packages
- Install required dependencies (Python, Chromium, etc.)
- Set up the Flask backend as a system service
- Configure kiosk mode to auto-start in both desktop and CLI modes
- Set up screen power management
- Configure CLI mode auto-start (runs automatically on tty1)

### 3. Update Existing Installation

If you already have Pi Info Display installed and want to update to the latest version:

```bash
cd ~/Pi-Info-Display
chmod +x update.sh
./update.sh
```

The update script will:
- Pull the latest changes from GitHub
- Preserve your weather API settings
- Update dependencies
- Restart the service

### 4. Optional: Configure Weather API

For live weather data (free tier available):

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Edit `static/js/app.js`
3. Replace `YOUR_OPENWEATHERMAP_API_KEY` with your actual API key

```javascript
const WEATHER_API_KEY = 'your_actual_api_key_here';
```

### 5. Optional: Add School Timetable Image

To display a school timetable:

1. Create or save your timetable as an image
2. Name it `timetable.png`
3. Upload to: `~/Pi-Info-Display/static/images/`
4. Access it from the "School Timetable" tab in the app

### 6. Reboot

```bash
sudo reboot
```

After reboot:
- **Desktop mode**: The kiosk will automatically start in fullscreen mode
- **CLI mode**: The kiosk will auto-start with X server on tty1
- **Remote access**: Access from any browser at `http://<pi-ip-address>:5000`

## Auto-Start Modes

The Pi Info Display supports multiple auto-start configurations:

### Desktop Mode (Default)
- Automatically configured during installation
- Kiosk starts via `~/.config/autostart/kiosk.desktop`
- Best for Raspberry Pi OS with Desktop

### CLI Mode (Headless)
- Automatically configured during installation
- Kiosk starts via `~/.bashrc` integration
- Runs `startx` with the kiosk on tty1
- Best for Raspberry Pi OS Lite
- Requires X server packages (installed by install.sh)

### Remote Access Only
- Flask backend runs as a systemd service
- Access the display from any browser on your network
- Visit `http://<raspberry-pi-ip>:5000`

## Manual Testing

To test the application before rebooting:

```bash
# Start the Flask backend
python3 app.py

# Open in a browser
chromium --kiosk http://localhost:5000
```

## Usage

### Time and Weather
The header displays:
- Current time (updates every second)
- Current date
- Weather for Canberra, Australia (updates every 10 minutes)
- **Weather Details Button**: Click to see detailed weather information including:
  - Feels like temperature
  - Humidity
  - Wind speed and direction
  - Atmospheric pressure
  - Visibility
  - Sunrise and sunset times

### Timetable Tab
1. Tap "Timetable" tab
2. Tap "+ Add Event" button
3. Enter event title, time, and optional days
4. Tap "Save"
5. Events are sorted by time automatically

### School Timetable Tab
1. Save your school timetable as `timetable.png`
2. Upload it to `~/Pi-Info-Display/static/images/`
3. Tap "School Timetable" tab
4. Click "🔄 Refresh" to load the image
5. Your timetable image will be displayed full-width

### Notes & Reminders Tab
1. Tap "Notes" tab
2. Tap "+ Add Note" button
3. Enter note title and content
4. Tap "Save"
5. Notes are sorted by creation time (newest first)
6. Delete notes when no longer needed

### Shopping List Tab
1. Tap "Shopping List" tab
2. Tap "+ Add Item" button
3. Enter item name and optional quantity
4. Tap "Save"
5. Check off items as you shop
6. Delete completed items

### Quick Links Tab
1. Tap "Quick Links" tab
2. Tap "+ Add Link" button
3. Enter link name and URL
4. Tap "Save"
5. Click on links to open them in a new tab
6. Delete links by clicking the × button

### Nextcloud Chat Tab
1. Tap "Nextcloud Chat" tab
2. Tap "⚙️ Settings" button
3. Enter your Nextcloud server URL (e.g., https://cloud.thalizar.info)
4. Enter your Nextcloud username
5. Enter an app password (generate one in Nextcloud Settings → Security)
6. Tap "Save & Connect"
7. Select a conversation from the dropdown
8. Tap "Connect to Conversation"
9. View messages and send new messages
10. Messages update automatically every 10 seconds

**Virtual Keyboard:**
- The virtual keyboard appears automatically when you tap any text field
- Use letter keys, numbers, and basic symbols
- Tap "⇧ Shift" for uppercase letters
- Tap "⌫" to delete characters
- Tap "Hide" to dismiss the keyboard
- Works with all input fields throughout the application

## File Structure

```
Pi-Info-Display/
├── app.py                      # Flask backend server
├── requirements.txt            # Python dependencies
├── pi-info-display.service     # Systemd service file
├── install.sh                  # Installation script
├── update.sh                   # Update script (preserves settings)
├── kiosk.sh                    # Kiosk mode launcher (desktop)
├── kiosk-cli.sh                # CLI mode kiosk launcher
├── auto-start-x.sh             # Auto-start X server in CLI mode
├── data.json                   # Data storage (created on first run)
├── templates/
│   └── index.html              # Main HTML template
└── static/
    ├── css/
    │   └── style.css           # Styles (touch-optimized)
    ├── js/
    │   └── app.js              # Frontend application logic
    └── images/
        ├── README.md           # Instructions for timetable.png
        └── timetable.png       # School timetable image (user-provided)
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
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/<id>` - Update note
- `DELETE /api/notes/<id>` - Delete note
- `GET /api/quick_links` - Get all quick links
- `POST /api/quick_links` - Create new quick link
- `PUT /api/quick_links/<id>` - Update quick link
- `DELETE /api/quick_links/<id>` - Delete quick link
- `GET /images/<filename>` - Serve images from static/images directory
- `GET /api/nextcloud/config` - Get Nextcloud configuration (without password)
- `POST /api/nextcloud/config` - Save Nextcloud configuration
- `DELETE /api/nextcloud/config` - Delete Nextcloud configuration
- `GET /api/nextcloud/conversations` - Get list of Nextcloud Talk conversations
- `GET /api/nextcloud/messages` - Get messages from selected conversation
- `POST /api/nextcloud/messages` - Send a message to selected conversation

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

For CLI mode, check if auto-start is configured:
```bash
grep "auto-start-x.sh" ~/.bashrc
```

### CLI Mode Not Starting Display

If you're in CLI mode and the display doesn't start automatically:
1. Ensure you're on tty1 (the main console)
2. Check if X server packages are installed: `sudo apt-get install xserver-xorg xinit`
3. Manually start with: `startx ~/Pi-Info-Display/kiosk.sh`

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
chromium http://localhost:5000
```

## Security Notes

- The Flask server runs on all interfaces (0.0.0.0) to allow network access
- No authentication required for the web interface (designed for local/home network use)
- Data stored in plain text JSON file (including Nextcloud app passwords)
- Nextcloud app passwords are stored locally - use dedicated app passwords, not your main password
- For internet-exposed deployments, add authentication and use HTTPS
- Keep your Raspberry Pi on a trusted network

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.

## Credits

Built for Raspberry Pi 5 + Pi Display 2 (7" touchscreen)
Weather data from OpenWeatherMap API
