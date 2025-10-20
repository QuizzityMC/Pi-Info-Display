#!/bin/bash
# Chromium Kiosk Mode Script
# This script launches Chromium in kiosk mode for the Pi Info Display

# Disable screen blanking and power management
xset s off
xset -dpms
xset s noblank

# Force screen to landscape orientation (lock it)
xrandr --output HDMI-1 --rotate normal 2>/dev/null || xrandr --output DSI-1 --rotate normal 2>/dev/null || true

# Additional landscape enforcement for touchscreen displays
xrandr --output DSI-1 --mode 800x480 2>/dev/null || true
xrandr --output HDMI-1 --mode 800x480 2>/dev/null || true

# Hide cursor after 5 seconds of inactivity
unclutter -idle 5 &

# Wait for Flask server to be ready
sleep 5

# Launch Chromium in kiosk mode with landscape forced
chromium \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --no-first-run \
    --disable-session-crashed-bubble \
    --disable-translate \
    --check-for-update-interval=31536000 \
    --incognito \
    --window-position=0,0 \
    --window-size=800,480 \
    http://localhost:5000
