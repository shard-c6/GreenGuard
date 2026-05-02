#!/bin/bash

# Configuration
LOG_FILE="DAILY_LOG.md"
DATE=$(date +'%Y-%m-%d')
TIME=$(date +'%H:%M:%S')

# Ensure we are in the project root
cd "$(dirname "$0")/.." || exit

# Create log file if it doesn't exist
if [ ! -f "$LOG_FILE" ]; then
    echo "# GreenGuard Technical Log" > "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    echo "| Date | Activity | Notes |" >> "$LOG_FILE"
    echo "|------|----------|-------|" >> "$LOG_FILE"
fi

# Check if entry for today already exists
if grep -q "$DATE" "$LOG_FILE"; then
    echo "Entry for $DATE already exists. Updating notes..."
    # Optionally append to the notes column or just leave it
    sed -i '' "s/| $DATE |.*/| $DATE | System Heartbeat | Heartbeat at $TIME |/" "$LOG_FILE"
else
    echo "| $DATE | System Heartbeat | Heartbeat at $TIME |" >> "$LOG_FILE"
fi

# Git operations
git add "$LOG_FILE"
git commit -m "chore: daily heartbeat $DATE [skip ci]"
git push origin main
