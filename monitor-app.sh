#!/bin/bash

# Configuration
URL="http://localhost:3000"
PM2_APP_NAME="cobra-app"
LOG_FILE="/var/www/cobra/logs/watchdog.log"
MAX_RETRIES=3

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Timestamp
timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# Check function
check_health() {
    # Try to connect with a timeout of 10 seconds
    if curl --output /dev/null --silent --head --fail --max-time 10 "$URL"; then
        return 0 # Success
    else
        return 1 # Failure
    fi
}

# Main logic
if check_health; then
    # App is running fine, do nothing or log verbose
    # echo "$(timestamp): Health check passed." >> "$LOG_FILE"
    exit 0
else
    echo "$(timestamp): ⚠️ Health check FAILED for $URL" >> "$LOG_FILE"
    
    # Retry a few times to avoid false positives
    for i in $(seq 1 $MAX_RETRIES); do
        sleep 5
        if check_health; then
            echo "$(timestamp): ✅ Recovered on retry $i." >> "$LOG_FILE"
            exit 0
        fi
    done

    # If we get here, the app is definitely down
    echo "$(timestamp): 🚨 App continues to fail. Restarting PM2 process..." >> "$LOG_FILE"
    
    # Restart the specific app using PM2
    # We use full path or ensure pm2 is in PATH. 
    # Usually ~/.npm-global/bin/pm2 or /usr/bin/pm2 depending on install
    export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin
    
    pm2 restart "$PM2_APP_NAME" --update-env >> "$LOG_FILE" 2>&1
    
    # Wait and check again
    sleep 15
    if check_health; then
         echo "$(timestamp): ✅ App successfully restarted and responding." >> "$LOG_FILE"
    else
         echo "$(timestamp): ❌ App failed to recover even after restart. Possible critical error." >> "$LOG_FILE"
         # Optional: Reboot server if really desperate?
         # reboot
    fi
fi
