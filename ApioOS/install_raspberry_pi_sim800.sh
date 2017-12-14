#!/bin/bash
if [[ $EUID -ne 0 ]]; then
    echo "This script must be run as root" 1>&2
    exit 1
else
    apn=$1
    phone=$2
    user=$3
    pass=$4

    if [ -z $apn ]; then
        apn="internet.wind.biz"
    fi

    if [ -z $phone ]; then
        phone="*99**1*1#"
    fi

    if [ "$#" == 0 ] || [ "$#" == 2 ] || [ "$#" == 4 ]; then
        #Insalling peripheral
        echo -e "\ndtoverlay=pi3-miniuart-bt\nenable_uart=1\nforce_turbo=1" >> /boot/config.txt

        sed -i -e "s/console=\(\w\+\|\w\+,\w\+\) //g" /boot/cmdline.txt

        sed -i -e "s/After=.*/After=dev-ttyS0.device/" /lib/systemd/system/hciuart.service
        sed -i -e "s/ExecStart=.*/ExecStart=\/usr\/lib\/hciattach \/dev\/ttyS0 bcm43xx 460800 noflow -/" /lib/systemd/system/hciuart.service

        #Configure peripheral
        mkdir -p /etc/ppp/peers
        mkdir -p /etc/ppp/chatscripts

        echo -e "/dev/ttyAMA0\n115200\nnoauth\ndefaultroute\nreplacedefaultroute\nusepeerdns\nunit 0\npersist\nchap-interval 321\nlcp-echo-interval 20\nlcp-echo-failure 3\nnoipdefault\nnoremoteip\nupdetach" > /etc/ppp/options-mobile

        if [ -z $user ] && [ -z $pass ]; then
            echo -e "file /etc/ppp/options-mobile\nconnect \"/usr/sbin/chat -v -t15 -f /etc/ppp/chatscripts/mobile-modem.chat\"" > /etc/ppp/peers/mobile-noauth
        else
            echo -e "file /etc/ppp/options-mobile\nuser \"$user\"\npassword \"$pass\"\nconnect \"/usr/sbin/chat -v -t15 -f /etc/ppp/chatscripts/mobile-modem.chat\"" > /etc/ppp/peers/mobile-auth
        fi

        echo -e "ABORT 'BUSY'\nABORT 'NO CARRIER'\nABORT 'VOICE'\nABORT 'NO DIALTONE'\nABORT 'NO DIAL TONE'\nABORT 'NO ANSWER'\nABORT 'DELAYED'\nREPORT CONNECT\nTIMEOUT 6\n'' 'ATQ0'\n'OK-AT-OK' 'ATZ'\nTIMEOUT 3\n'OK' @/etc/ppp/chatscripts/pin\n'OK\d-AT-OK' 'ATI'\n'OK' 'ATZ'\n'OK' 'AT+CFUN=1'\n'OK' @/etc/ppp/chatscripts/mode\n'OK-AT-OK' @/etc/ppp/chatscripts/apn\n'OK' 'ATDT$phone'\nTIMEOUT 30\nCONNECT ''" > /etc/ppp/chatscripts/mobile-modem.chat
        echo -e "AT+CGDCONT=1,\"IP\",\"$apn\"" > /etc/ppp/chatscripts/my-operator-apn
        echo -e "AT" > /etc/ppp/chatscripts/pin.NONE
        echo -e "AT" > /etc/ppp/chatscripts/mode.NONE

        ln -s /etc/ppp/chatscripts/my-operator-apn /etc/ppp/chatscripts/apn
        ln -s /etc/ppp/chatscripts/mode.NONE /etc/ppp/chatscripts/mode
        ln -s /etc/ppp/chatscripts/pin.NONE /etc/ppp/chatscripts/pin

        mv /etc/ppp/peers/provider /etc/ppp/peers/provider.example

        if [ -z $user ] && [ -z $pass ]; then
            ln -s /etc/ppp/peers/mobile-noauth /etc/ppp/peers/provider
        else
            ln -s /etc/ppp/peers/mobile-auth /etc/ppp/peers/provider
        fi

        lines_number=$(wc -l < /etc/rc.local)
        sed -i "$((lines_number-1)) a echo 17 > /sys/class/gpio/export\necho out > /sys/class/gpio/gpio17/direction\necho 1 > /sys/class/gpio/gpio17/value\npon" /etc/rc.local

        answer="x"
        while [[ $answer != "y" && $answer != "n" ]]; do
            read -p "A reboot is required, wanna proceed? (y/n) " answer
            if [[ $answer != "y" && $answer != "n" ]]; then
                echo "Please type y or n"
            elif [[ $answer == "y" ]]; then
                reboot
            fi
        done
    else
        echo "No arguments, two arguments or four arguments have to be passed"
        exit 1
    fi
    exit 0
fi