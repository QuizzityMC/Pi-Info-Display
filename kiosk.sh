#!/bin/bash
# Chromium Kiosk Mode Script
# This script launches Chromium in kiosk mode for the Pi Info Display

# Disable screen blanking and power management
xset s off
xset -dpms
xset s noblank

# Set screen to landscape orientation
xrandr --output HDMI-1 --rotate normal 2>/dev/null || xrandr --output DSI-1 --rotate normal 2>/dev/null || true

# Hide cursor after 5 seconds of inactivity
unclutter -idle 5 &

# Wait for Flask server to be ready
sleep 5

# Launch Chromium in kiosk mode
chromium \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --no-first-run \
    --disable-session-crashed-bubble \
    --disable-translate \
    --check-for-update-interval=31536000 \
    --incognito \
    http://localhost:5000
