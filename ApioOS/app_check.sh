#!/bin/bash
app_ps=$(ps aux | grep app.js | grep node)

if [[ -z $app_ps ]]; then
    pkill node
    bash /home/pi/start.sh
fi

exit 0
