# Quick Start Guide

Get your Pi Info Display kiosk running in 5 minutes!

## Prerequisites

- Raspberry Pi 5 with Raspberry Pi OS (Desktop) installed
- Raspberry Pi Display 2 (7" touchscreen) connected
- Internet connection (for initial setup and weather updates)

## Installation Steps

### 1. Clone the Repository

```bash
cd ~
git clone https://github.com/QuizzityMC/Pi-Info-Display.git
cd Pi-Info-Display
```

### 2. Run the Installation Script

```bash
chmod +x install.sh
./install.sh
```

The script will:
- Install system packages (Python, Chromium, etc.)
- Install Python dependencies
- Set up auto-start services
- Configure kiosk mode

This takes about 5-10 minutes depending on your internet speed.

### 3. Optional: Add Weather API Key

For live weather data:

1. Get a free API key from https://openweathermap.org/api
2. Edit `static/js/app.js`
3. Replace `YOUR_OPENWEATHERMAP_API_KEY` with your key
4. Save the file

Without an API key, the app shows mock weather data (22°C, partly cloudy).

### 4. Reboot

```bash
sudo reboot
```

After reboot, the kiosk will start automatically in fullscreen!

## What You'll See

- **Header**: Real-time clock and weather for Canberra
- **Timetable Tab**: Add and manage daily events
- **Shopping List Tab**: Track grocery items with checkboxes

## Using the Display

### Add a Timetable Event

1. Tap **Timetable** tab
2. Tap **+ Add Event**
3. Enter title (e.g., "Morning Coffee")
4. Set time (e.g., "07:00")
5. Enter days (e.g., "Mon, Wed, Fri") - optional
6. Tap **Save**

### Add Shopping Items

1. Tap **Shopping List** tab
2. Tap **+ Add Item**
3. Enter item name (e.g., "Milk")
4. Enter quantity (e.g., "2 liters") - optional
5. Tap **Save**
6. Check off items as you shop

### Delete Items

Tap the red **Delete** button next to any item.

## Customization

### Change Location

Edit `static/js/app.js`:

```javascript
const CANBERRA_LAT = -35.2809;  // Your latitude
const CANBERRA_LON = 149.1300;  // Your longitude
```

Edit `templates/index.html`:

```html
<div class="weather-location">Your City, Country</div>
```

Then restart:
```bash
sudo systemctl restart pi-info-display.service
```

### Change Colors

Edit `static/css/style.css` and modify the gradient:

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## Troubleshooting

### Service Not Running

Check status:
```bash
sudo systemctl status pi-info-display.service
```

View logs:
```bash
sudo journalctl -u pi-info-display.service -f
```

Restart service:
```bash
sudo systemctl restart pi-info-display.service
```

### Kiosk Not Starting

Check if autostart is configured:
```bash
ls -la ~/.config/autostart/kiosk.desktop
```

Manually start kiosk:
```bash
~/Pi-Info-Display/kiosk.sh
```

### Screen Goes Blank

Disable screen blanking:
```bash
xset s off
xset -dpms
xset s noblank
```

### Touch Not Working

Verify touchscreen is detected:
```bash
dmesg | grep -i touch
```

Check USB connections and reboot.

## Manual Testing

Test without auto-start:

1. Stop the service:
   ```bash
   sudo systemctl stop pi-info-display.service
   ```

2. Start Flask manually:
   ```bash
   cd ~/Pi-Info-Display
   python3 app.py
   ```

3. Open browser (new terminal):
   ```bash
   chromium-browser http://localhost:5000
   ```

## Accessing from Another Device

While Flask runs on localhost by default, you can access it from another device on your network:

1. Find your Pi's IP address:
   ```bash
   hostname -I
   ```

2. From another device, open browser to:
   ```
   http://YOUR_PI_IP:5000
   ```

Note: The kiosk mode auto-start only affects the Pi's display.

## Default Settings

- **Port**: 5000
- **Location**: Canberra, Australia
- **Weather Update**: Every 10 minutes
- **Time Update**: Every second
- **Data Storage**: `data.json` in app directory
- **Auto-start**: Enabled after installation

## Next Steps

- Add your daily events and shopping items
- Mount the display on your kitchen wall
- Enjoy your smart kitchen display!

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review [config.example.txt](config.example.txt)
- Open an issue on GitHub

---

**Tip**: The display works offline (except weather). Your timetables and shopping lists are stored locally and persist across reboots.
