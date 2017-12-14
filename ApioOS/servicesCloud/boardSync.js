//Copyright 2014-2015 Alex Benfaremo, Alessandro Chelli, Lorenzo Di Berardino, Matteo Di Sabatino

/********************************* LICENSE **********************************
 *                                                                          *
 * This file is part of ApioOS.                                             *
 *                                                                          *
 * ApioOS is free software released under the GPLv2 license: you can        *
 * redistribute it and/or modify it under the terms of the GNU General      *
 * Public License version 2 as published by the Free Software Foundation.   *
 *                                                                          *
 * ApioOS is distributed in the hope that it will be useful, but            *
 * WITHOUT ANY WARRANTY; without even the implied warranty of               *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the             *
 * GNU General Public License version 2 for more details.                   *
 *                                                                          *
 * To read the license either open the file COPYING.txt or                  *
 * visit <http://www.gnu.org/licenses/gpl2.txt>                             *
 *                                                                          *
 ****************************************************************************/

"use strict";
var Apio = require("../apio.js")(false);
var express = require("express");
var fs = require("fs");
var app = express();
var http = require("http").Server(app);
var socketServer = require("socket.io")(http);

var boardsToSync = {};
var port = 8087;

process.on("uncaughtException", function (err) {
    console.log("Caught exception: ", err);
});

Apio.Database.connect(function () {
    socketServer.on("connection", function (socket) {
        socket.on("disconnect", function () {
            var keys = Object.keys(boardsToSync);
            for (var k = 0, found = false; !found && k < keys.length; k++) {
                if (boardsToSync[keys[k]].socket.id === socket.id) {
                    found = true;
                    delete boardsToSync[keys[k]];
                }
            }
        });

        if (socket.handshake.address.indexOf("127.0.0.1") === -1) {
            if (socket.handshake.query.hasOwnProperty("associate") && socket.handshake.query.associate && socket.handshake.query.hasOwnProperty("token")) {
                var isUUIDGood = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (socket.handshake.query.token === "") {
                    if (isUUIDGood.test(socket.handshake.query.associate)) {
                        Apio.Database.db.collection("systems").findOne({apioId: socket.handshake.query.associate}, function (err_f, b) {
                            if (err_f) {
                                console.log("Error while searching for board with apioId " + socket.handshake.query.associate + ": ", err_f);
                            } else if (b) {
                                socket.emit("get_apio_token", Apio.Token.getFromText(socket.handshake.query.associate, fs.readFileSync("../cloud_key.apio", "utf8")));
                            } else {
                                if (!boardsToSync.hasOwnProperty(socket.handshake.query.associate)) {
                                    var now = new Date().getTime();
                                    boardsToSync[socket.handshake.query.associate] = {
                                        socket: socket,
                                        timestamp: now
                                    };
                                    socket.emit("apio_first_sync", now);
                                }

                                var interval;
                                if (!interval) {
                                    interval = setInterval(function () {
                                        if (Object.keys(boardsToSync).length) {
                                            var keys = Object.keys(boardsToSync);
                                            for (var i in keys) {
                                                if (new Date().getTime() - boardsToSync[keys[i]].timestamp >= 10 * 60 * 1000) {
                                                    boardsToSync[keys[i]].socket.disconnect();
                                                    delete boardsToSync[keys[i]];
                                                }
                                            }
                                        } else {
                                            clearInterval(interval);
                                        }
                                    }, 0);
                                }
                            }
                        });
                    } else {
                        socket.disconnect();
                    }
                } else {
                    socket.disconnect();
                }
            } else {
                socket.disconnect();
            }
        } else {
            socket.on("apio_board_has_been_enabled", function (data) {
                boardsToSync[data.body.apioId].socket.emit("get_apio_token", data.bytes);
                delete boardsToSync[data.body.apioId];
            });

            socket.on("apio_ask_boards_to_sync", function () {
                var j = {};
                for (var i in boardsToSync) {
                    j[i] = boardsToSync[i].socket.id;
                }
                socket.emit("apio_get_boards_to_sync", j);
            });
        }
    });
}, false);


http.listen(port, function () {
    console.log("APIO Board Sync service correctly started on port");
});