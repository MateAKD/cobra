#!/bin/bash
# Security Audit Script for Cobra VPS
echo "🔍 STARTING SECURITY AUDIT..."
echo "=============================="

# 1. Check SSH Config
echo "[SSH Configuration]"
grep "^PermitRootLogin" /etc/ssh/sshd_config || echo "PermitRootLogin not set (default is usually yes/prohibit-password)"
grep "^PasswordAuthentication" /etc/ssh/sshd_config || echo "PasswordAuthentication not set (default is yes)"
echo ""

# 2. Check Firewall (UFW)
echo "[Firewall Status]"
if command -v ufw >/dev/null; then
    ufw status verbose
else
    echo "⚠️  UFW is not installed."
fi
echo ""

# 3. Check Open Ports
echo "[Open Ports]"
# Use ss or netstat
ss -tuln
echo ""

# 4. Check Root Users (UID 0)
echo "[Users with Root Privileges]"
awk -F: '($3 == 0) {print}' /etc/passwd
echo ""

# 5. Check for Suspicious Processes
echo "[Top CPU Consumers]"
ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu | head -6
echo ""

# 6. Check last logins
echo "[Recent Logins]"
last -n 5
echo ""

# 7. Check for critical security updates
echo "[Updates Pending]"
/usr/lib/update-notifier/apt-check --human-readable 2>/dev/null || echo "Could not check updates."

echo "=============================="
echo "✅ AUDIT COMPLETE"
