#!/bin/bash
# Update script for Pi Info Display Kiosk
# This script updates the application while preserving your weather API settings

set -e

echo "==================================="
echo "Pi Info Display Update Script"
echo "==================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "Please do not run this script as root"
    exit 1
fi

# Get the installation directory
INSTALL_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Installation directory: $INSTALL_DIR"
echo ""

# Backup weather API key if it exists
API_KEY_FILE="$INSTALL_DIR/static/js/app.js"
if [ -f "$API_KEY_FILE" ]; then
    echo "Backing up weather API settings..."
    CURRENT_API_KEY=$(grep -oP "const WEATHER_API_KEY = '\K[^']+" "$API_KEY_FILE" || echo "YOUR_OPENWEATHERMAP_API_KEY")
    CURRENT_LAT=$(grep -oP "const CANBERRA_LAT = \K[^;]+" "$API_KEY_FILE" || echo "-35.2809")
    CURRENT_LON=$(grep -oP "const CANBERRA_LON = \K[^;]+" "$API_KEY_FILE" || echo "149.1300")
    echo "  API Key: ${CURRENT_API_KEY:0:10}..."
    echo "  Location: $CURRENT_LAT, $CURRENT_LON"
fi

# Pull latest changes
echo ""
echo "Pulling latest updates from GitHub..."
git fetch origin
git pull origin main || git pull origin master

# Restore API key if it was set
if [ "$CURRENT_API_KEY" != "YOUR_OPENWEATHERMAP_API_KEY" ]; then
    echo ""
    echo "Restoring your weather API settings..."
    sed -i "s/const WEATHER_API_KEY = '[^']*'/const WEATHER_API_KEY = '$CURRENT_API_KEY'/" "$API_KEY_FILE"
    sed -i "s/const CANBERRA_LAT = [^;]*/const CANBERRA_LAT = $CURRENT_LAT/" "$API_KEY_FILE"
    sed -i "s/const CANBERRA_LON = [^;]*/const CANBERRA_LON = $CURRENT_LON/" "$API_KEY_FILE"
    echo "  Weather API settings restored!"
fi

# Update Python dependencies
echo ""
echo "Updating Python dependencies..."
pip3 install -r "$INSTALL_DIR/requirements.txt" --upgrade

# Make scripts executable
echo "Setting script permissions..."
chmod +x "$INSTALL_DIR/kiosk.sh"
chmod +x "$INSTALL_DIR/app.py"
chmod +x "$INSTALL_DIR/update.sh"

# Update systemd service file if needed
echo ""
echo "Updating system service..."
sudo cp "$INSTALL_DIR/pi-info-display.service" /etc/systemd/system/
sudo sed -i "s|/home/pi/Pi-Info-Display|$INSTALL_DIR|g" /etc/systemd/system/pi-info-display.service
sudo sed -i "s|User=pi|User=$USER|g" /etc/systemd/system/pi-info-display.service
sudo systemctl daemon-reload

# Restart the Flask service
echo "Restarting Flask backend service..."
sudo systemctl restart pi-info-display.service

echo ""
echo "==================================="
echo "Update Complete!"
echo "==================================="
echo ""
echo "The Pi Info Display has been updated successfully."
echo "Your weather API settings have been preserved."
echo ""
echo "Backend service status:"
sudo systemctl status pi-info-display.service --no-pager | head -10
echo ""
echo "To see the changes, refresh your browser or reboot:"
echo "  sudo reboot"
echo ""
