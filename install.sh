#!/bin/bash
# Installation script for Pi Info Display Kiosk
# This script sets up the Raspberry Pi as a kiosk for the info display

set -e

echo "==================================="
echo "Pi Info Display Kiosk Installation"
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

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
sudo apt-get install -y \
    python3 \
    python3-pip \
    chromium-browser \
    unclutter \
    xdotool \
    x11-xserver-utils \
    lightdm

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r "$INSTALL_DIR/requirements.txt"

# Make scripts executable
echo "Setting script permissions..."
chmod +x "$INSTALL_DIR/kiosk.sh"
chmod +x "$INSTALL_DIR/app.py"

# Install systemd service for Flask backend
echo "Installing Flask backend service..."
sudo cp "$INSTALL_DIR/pi-info-display.service" /etc/systemd/system/
sudo sed -i "s|/home/pi/Pi-Info-Display|$INSTALL_DIR|g" /etc/systemd/system/pi-info-display.service
sudo sed -i "s|User=pi|User=$USER|g" /etc/systemd/system/pi-info-display.service
sudo systemctl daemon-reload
sudo systemctl enable pi-info-display.service
sudo systemctl start pi-info-display.service

# Configure autostart for kiosk mode
echo "Configuring kiosk autostart..."
mkdir -p ~/.config/autostart

cat > ~/.config/autostart/kiosk.desktop <<EOF
[Desktop Entry]
Type=Application
Name=Kitchen Info Display Kiosk
Exec=$INSTALL_DIR/kiosk.sh
X-GNOME-Autostart-enabled=true
EOF

# Configure LXDE autostart (alternative method)
mkdir -p ~/.config/lxsession/LXDE-pi
cat > ~/.config/lxsession/LXDE-pi/autostart <<EOF
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash
@xset s off
@xset -dpms
@xset s noblank
@$INSTALL_DIR/kiosk.sh
EOF

# Disable screen blanking in lightdm
sudo bash -c 'cat > /etc/lightdm/lightdm.conf <<EOF
[Seat:*]
xserver-command=X -s 0 -dpms
EOF'

# Create empty data file if it doesn't exist
touch "$INSTALL_DIR/data.json"
echo '{"timetables":[],"shopping_lists":[]}' > "$INSTALL_DIR/data.json"

echo ""
echo "==================================="
echo "Installation Complete!"
echo "==================================="
echo ""
echo "The Pi Info Display kiosk has been installed successfully."
echo ""
echo "Backend service status:"
sudo systemctl status pi-info-display.service --no-pager | head -10
echo ""
echo "To complete the setup:"
echo "1. Optional: Add your OpenWeatherMap API key to static/js/app.js"
echo "   (Get a free key from: https://openweathermap.org/api)"
echo "2. Reboot your Raspberry Pi: sudo reboot"
echo ""
echo "After reboot, the kiosk will start automatically."
echo "The display will be available at: http://localhost:5000"
echo ""
