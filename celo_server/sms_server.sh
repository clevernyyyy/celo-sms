#!/bin/sh
# /etc/init.d/remubots.sh
# v0.2 phillips321.co.uk
### BEGIN INIT INFO
# Provides:          sms_server.sh
# Required-Start:    $network
# Required-Stop:     $network
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Celo SMS service
# Description:       Twilio SMS bot
### END INIT INFO

f_message(){
        echo "[+] $1"
}

# Carry out specific functions when asked to by the system
case "$1" in
        start)
                f_message "Starting Celo SMS Server"
                node /home/celosms/celo_server/sms_server.js &
                sleep 2
                f_message "Celo SMS started"
                ;;
        stop)
                f_message "Stopping Celo SMS Server..."
                killall node
                f_message "Celo Server stopped"
                ;;
        restart)
                f_message "Restarting daemon: Celo SMS Server"
                killall node
                node /home/celosms/celo_server/sms_server.js &
                sleep 2
                f_message "Restarted daemon: Celo SMS Server"
                ;;
        status)
                pid=`ps -A | grep node | grep -v "grep" | grep -v node. | awk '{print $1}' | head -n 1`
                if [ -n "$pid" ];
                then
                        f_message "Node is running with pid ${pid}"
                        f_message "Node was started with the following command line"
                        cat /proc/${pid}/cmdline ; echo ""
                else
                        f_message "Could not find Node running"
                fi
                ;;
        *)
                f_message "Usage: $0 {start|stop|status|restart}"
                exit 1
                ;;
esac
exit 0



