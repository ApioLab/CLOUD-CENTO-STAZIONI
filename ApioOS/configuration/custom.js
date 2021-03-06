module.exports = {
    name: "Centostazioni",
    autoinstall: {
        default: false
    },
    database: {
        database: "apio",
        hostname: "127.0.0.1",
        port: "27017"
    },
    dependencies: {
        cloud: {
            autoInstall: {
                startAs: "require",
                version: "1.0.0"
            },
            boardSync: {
                startAs: "process",
                version: "1.0.0"
            },
            dongle: {
                startAs: "process",
                version: "1.0.0"
            },
            log: {
                startAs: "process",
                version: "1.0.0"
            },
            networking: {
                startAs: "process",
                version: "1.0.0"
            },
            notification: {
                startAs: "process",
                version: "1.0.0"
            },
            store: {
                startAs: "process",
                version: "1.0.0"
            }
        },
        gateway: {
            autoInstall: {
                startAs: "require",
                version: "1.0.0"
            },
            centostazioni: {
                startAs: "process",
                version: "1.0.0"
            },
            cloud: {
                startAs: "require",
                version: "1.0.0"
            },
            dongle: {
                startAs: "process",
                version: "1.0.0"
            },
            enocean: {
                startAs: "process",
                version: "1.0.0"
            },
            githubUpdate: {
                startAs: "require",
                version: "1.0.0"
            },
            gym: {
                startAs: "process",
                version: "1.0.0"
            },
            log: {
                startAs: "process",
                version: "1.0.0"
            },
            logic: {
                startAs: "process",
                version: "1.0.0"
            },
            networking: {
                startAs: "require",
                version: "1.0.0"
            },
            notification: {
                startAs: "process",
                version: "1.0.0"
            },
            // shutdown: {
            //     startAs: "require",
            //     version: "1.0.0"
            // },
            zwave: {
                startAs: "process",
                version: "1.0.0"
            }
        }
    },
    http: {
        port: 8086
    },
    logging: {
        enabled: true,
        logfile: "./logs/log.json"
    },
    remote: {
        enabled: false,
        uri: "http://www.apio.cloud"
    },
    serial: {
        baudrate: 115200,
        dataRate: "3",
        enabled: true,
        firmwareVersion: "1",
        manufacturer: "Apio_Dongle",
        panId: "0x01",
        port: "/dev/ttyACM0",
        radioPower: "0",
        updateURL: "https://raw.githubusercontent.com/ApioLab/updates/master/Coordinator.cpp.hex"
    },
    sendSystemMails: true,
    type: "gateway",
    remoteAccess: false
};
