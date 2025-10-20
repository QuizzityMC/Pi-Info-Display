#!/bin/bash
# CLI Mode Kiosk Script
# This script launches Chromium in kiosk mode on the framebuffer (without X11)
# Suitable for running on Raspberry Pi OS Lite or in CLI mode

# Wait for the Flask server to be ready
echo "Waiting for Flask server to start..."
for i in {1..30}; do
    if curl -s http://localhost:5000 > /dev/null 2>&1; then
        echo "Flask server is ready!"
        break
    fi
    sleep 1
done

# Check if we're in a graphical environment
if [ -n "$DISPLAY" ]; then
    echo "Graphical environment detected, using standard kiosk mode"
    exec /bin/bash "$(dirname "$0")/kiosk.sh"
else
    echo "CLI mode detected - Flask backend is running"
    echo "Access the display from a browser at: http://$(hostname -I | awk '{print $1}'):5000"
    echo "Or configure xinit/startx to run the kiosk script for local display"
    
    # Keep the script running
    tail -f /dev/null
fi
