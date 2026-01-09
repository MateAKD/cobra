#!/bin/bash

# Configuration
CRON_JOB="45 23 * * * curl http://localhost:3000/api/cron/daily-summary >> /var/log/cobra-cron.log 2>&1"

# Check if the cron job already exists
if crontab -l 2>/dev/null | grep -q "daily-summary"; then
    echo "✅ Cron job for daily summary already exists. No changes made."
else
    # Append the cron job to existing crontab
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Cron job added: Summary email will be sent daily at 23:45."
fi

# Verify
echo "Current crontab:"
crontab -l
