#!/bin/bash
# Auto-start X and Kiosk in CLI mode
# This script is designed to be run from .bashrc or as a systemd service

# Only run if on tty1 (main console) and not already in X
if [ "$(tty)" = "/dev/tty1" ] && [ -z "$DISPLAY" ]; then
    echo "Starting Pi Info Display Kiosk..."
    
    # Start X server with the kiosk
    startx "$(dirname "$0")/kiosk.sh" -- -nocursor
fi
