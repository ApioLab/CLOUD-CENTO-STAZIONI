#!/bin/bash
#ppp0=$((ifconfig ppp0) 2>&1)
#if [[ $ppp0 == *"error fetching"* ]]; then
#    ps_ppp=$(ps aux | grep ppp)
#    if [[ $ps_ppp == *"pppd"* ]]; then
#        echo 17 > /sys/class/gpio/export
#        echo out > /sys/class/gpio/gpio17/direction
#        echo 1 > /sys/class/gpio/gpio17/value
#        exec poff &
#        echo 18 > /sys/class/gpio/export
#        echo out > /sys/class/gpio/gpio18/direction
#        echo 0 > /sys/class/gpio/gpio18/value
#        sleep 0.5
#        echo 18 > /sys/class/gpio/export
#        echo out > /sys/class/gpio/gpio18/direction
#        echo 1 > /sys/class/gpio/gpio18/value
#        echo out > /sys/class/gpio/gpio18/direction
#        exec pon
#    else
#        echo 17 > /sys/class/gpio/export
#        echo out > /sys/class/gpio/gpio17/direction
#        echo 1 > /sys/class/gpio/gpio17/value
#        echo 18 > /sys/class/gpio/export
#        echo out > /sys/class/gpio/gpio18/direction
#        echo 0 > /sys/class/gpio/gpio18/value
#        sleep 0.5
#        echo 18 > /sys/class/gpio/export
#        echo out > /sys/class/gpio/gpio18/direction
#        echo 1 > /sys/class/gpio/gpio18/value
#        sleep 0.5
#        echo out > /sys/class/gpio/gpio18/direction
#        exec pon
#    fi
#else
#    ping_res=$(ping -c 3 -I ppp0 www.google.it > /dev/null; echo $?)
#    if [[ "$ping_res" == 0 ]]; then
#        echo "Successfully connected"
#    else
#        echo 17 > /sys/class/gpio/export
#        echo out > /sys/class/gpio/gpio17/direction
#        echo 1 > /sys/class/gpio/gpio17/value
#        exec poff &
#        echo 18 > /sys/class/gpio/export
#        echo out > /sys/class/gpio/gpio18/direction
#        echo 0 > /sys/class/gpio/gpio18/value
#        sleep 0.5
#        echo 1 > /sys/class/gpio/gpio18/value
#        sleep 0.5
#        echo out > /sys/class/gpio/gpio18/direction
#        exec pon
#    fi
#fi
#exit 0

#app.js check
app_ps_result=$(ps aux | grep app.js | grep 'node --expose_gc')
if [[ -z "$app_ps_result" ]]; then
    pkill node
    sleep 5
    bash /home/pi/start.sh
else
    echo "Apio is running"
fi

#app.js check - part II
running_appjs=$(ps aux | grep app.js | grep -v grep | wc -l)
if [[ $running_appjs -gt 2 ]]; then
    pkill node
    sleep 5
    bash /home/pi/start.sh
fi

running_scriptjs=$(ps aux | grep script.js | grep -v grep | wc -l)
if [[ $running_scriptjs -gt 2 ]]; then
    pkill node
    sleep 5
    bash /home/pi/start.sh
fi

#ls_gpio14_error=$((ls /sys/class/gpio/gpio14) 3>&1 1>/dev/null 2>&3)
#if [[ ! -z "$ls_gpio14_error" ]]; then
#    echo 14 | sudo tee /sys/class/gpio/export
#    echo in | sudo tee /sys/class/gpio/gpio14/direction
#fi

#is_module_mounted=$(sudo cat /sys/class/gpio/gpio14/value)
#if [[ $is_module_mounted -eq 0 ]]; then
#    echo "The module is unmounted"
#else
f=$(cat /home/pi/ApioOS/enableGSMModule.txt)
if [[ $f -eq 1 ]]; then
    ppp0=$((ifconfig ppp0) 2>&1)
    if [[ $ppp0 == *"error fetching"* ]]; then
        ps_ppp=$(ps aux | grep ppp)

        ls_gpio17_error=$((ls /sys/class/gpio/gpio17) 3>&1 1>/dev/null 2>&3)
        if [[ ! -z "$ls_gpio17_error" ]]; then
            echo 17 | sudo tee /sys/class/gpio/export
            echo out | sudo tee /sys/class/gpio/gpio17/direction
        fi

        ls_gpio18_error=$((ls /sys/class/gpio/gpio18) 3>&1 1>/dev/null 2>&3)
        if [[ ! -z "$ls_gpio18_error" ]]; then
            echo 18 | sudo tee /sys/class/gpio/export
            echo out | sudo tee /sys/class/gpio/gpio18/direction
        fi

        if [[ $ps_ppp == *"pppd"* ]]; then
            echo 1 | sudo tee /sys/class/gpio/gpio17/value
            sudo poff &

            sleep 1.5
            echo 0 | sudo tee /sys/class/gpio/gpio18/value
            sleep 1.5
            echo 1 | sudo tee /sys/class/gpio/gpio18/value
            sleep 1.5
            echo out | sudo tee /sys/class/gpio/gpio18/direction
            sleep 1.5
            sudo pon
        else
            echo 1 | sudo tee /sys/class/gpio/gpio17/value
            sleep 1.5
            echo 0 | sudo tee /sys/class/gpio/gpio18/value
            sleep 1.5
            echo 1 | sudo tee /sys/class/gpio/gpio18/value
            sleep 1.5
            echo out | sudo tee /sys/class/gpio/gpio18/direction
            sleep 1.5
            sudo pon
        fi
    #else
    #    ping_res=$(ping -c 3 -I ppp0 www.google.it > /dev/null; echo $?)
    #    if [[ "$ping_res" == 0 ]]; then
    #        echo "Successfully connected"
    #    else
    #        ls_gpio17_error=$((ls /sys/class/gpio/gpio17) 3>&1 1>/dev/null 2>&3)
    #        if [[ ! -z "$ls_gpio17_error" ]]; then
    #            echo 17 | sudo tee /sys/class/gpio/export
    #            echo out | sudo tee /sys/class/gpio/gpio17/direction
    #        fi
    #
    #        ls_gpio18_error=$((ls /sys/class/gpio/gpio18) 3>&1 1>/dev/null 2>&3)
    #        if [[ ! -z "$ls_gpio18_error" ]]; then
    #            echo 18 | sudo tee /sys/class/gpio/export
    #            echo out | sudo tee /sys/class/gpio/gpio18/direction
    #        fi
    #
    #        echo 1 | sudo tee /sys/class/gpio/gpio17/value
    #        sudo poff &
    #        sleep 1.5
    #        echo 0 | sudo tee /sys/class/gpio/gpio18/value
    #        sleep 1.5
    #        echo 1 | sudo tee /sys/class/gpio/gpio18/value
    #        sleep 1.5
    #        echo out | sudo tee /sys/class/gpio/gpio18/direction
    #        sleep 1.5
    #        sudo pon
    #    fi
    fi
else
    echo "GSM Module not enabled"
fi
#fi

exit 0
