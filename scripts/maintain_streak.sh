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

# Step 1: Create the branch first so we do all commits in it
BRANCH_NAME="chore/streak-$DATE"
git checkout -b "$BRANCH_NAME"

# ════════════════════════════════════════════════════════════════
# COMMIT 1: Shardul Chogale (Account 1)
# ════════════════════════════════════════════════════════════════
git config user.name "Shardul Chogale"
git config user.email "144150911+shard-c6@users.noreply.github.com"

ENTRY_SHARDUL=$(printf "| %-10s | %-21s | %-49s |" "$DATE" "System Heartbeat (S)" "Heartbeat at $TIME by Shardul")

if grep -q "$DATE" "$LOG_FILE"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s#| $DATE |.*#${ENTRY_SHARDUL//&/\\&}#" "$LOG_FILE"
    else
        sed -i "s#| $DATE |.*#${ENTRY_SHARDUL//&/\\&}#" "$LOG_FILE"
    fi
else
    printf "%s\n" "$ENTRY_SHARDUL" >> "$LOG_FILE"
fi

git add "$LOG_FILE"
git commit -m "chore: daily heartbeat Shardul $DATE [skip ci]"

# ════════════════════════════════════════════════════════════════
# PUSH AND MERGE (preserving commit authors via standard merge)
# ════════════════════════════════════════════════════════════════
git push -u origin "$BRANCH_NAME"

# Check if gh CLI is available
if command -v gh &> /dev/null; then
    gh pr create --title "chore: daily heartbeat $DATE" --body "Automated daily heartbeat for Shardul" --base main --head "$BRANCH_NAME"
    gh pr merge "$BRANCH_NAME" --merge --delete-branch
else
    git checkout main
    git merge "$BRANCH_NAME" --no-ff -m "Merge branch '$BRANCH_NAME'"
    git push origin main
    git branch -d "$BRANCH_NAME"
fi

