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
    printf "| %-10s | %-21s | %-49s |\n" "Date" "Activity" "Notes" >> "$LOG_FILE"
    printf "|-%-10s-|-%-21s-|-%-49s-|\n" "----------" "---------------------" "-------------------------------------------------" | tr ' ' '-' >> "$LOG_FILE"
fi

# Check if entry for today already exists
if grep -q "$DATE" "$LOG_FILE"; then
    echo "Entry for $DATE already exists. Updating notes..."
    # Format line to match table header alignment
    NEW_LINE=$(printf "| %-10s | %-21s | %-49s |" "$DATE" "System Heartbeat" "Heartbeat at $TIME")
    
    # Portable sed replacement
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/| $DATE |.*/$NEW_LINE/" "$LOG_FILE"
    else
        sed -i "s/| $DATE |.*/$NEW_LINE/" "$LOG_FILE"
    fi
else
    printf "| %-10s | %-21s | %-49s |\n" "$DATE" "System Heartbeat" "Heartbeat at $TIME" >> "$LOG_FILE"
fi

# Git operations
git add "$LOG_FILE"
# Only commit if there are changes
if ! git diff --cached --quiet; then
    git commit -m "chore: daily heartbeat $DATE [skip ci]"
    git push origin main
else
    echo "No changes to commit."
fi
