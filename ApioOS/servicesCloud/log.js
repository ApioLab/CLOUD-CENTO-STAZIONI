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
var MongoClient = require("mongodb").MongoClient;
var bodyParser = require("body-parser");
var compression = require("compression");
// var configuration = require("../configuration/default.js");
var configuration = require("../apio.js")().config.return().file;
var database = undefined;
var domain = require("domain");
var express = require("express");
var fs = require("fs");
var app = express();
var http = require("http").Server(app);
var socket_server = require("socket.io")(http);
var xlsx = require("node-xlsx");
//var zip = new require("node-zip")();

var mysql = require("mysql");
var sql_db = mysql.createConnection("mysql://root:root@127.0.0.1/Logs");

var appPath = "public/applications";
var d = domain.create();
var logs = {};
var logsBuffer = {};
var port = 8080;
var dailyBuffer = {};
var everySecondBuffer = {};
var fifteenBuffer = {};
var monthlyBuffer = {};
var objectsLogsFiles = {};
var usersLogsFiles = {};

if (process.argv.indexOf("--http-port") > -1) {
    port = Number(process.argv[process.argv.indexOf("--http-port") + 1]);
}

if (configuration.type === "cloud") {
    app.use(function (req, res, next) {
        if ((req.hasOwnProperty("query") && req.query.hasOwnProperty("apioId")) || (req.hasOwnProperty("body") && req.body.hasOwnProperty("apioId"))) {
            appPath = "public/boards/" + (req.query.apioId || req.body.apioId);
        }

        next();
    });
}

// app.use(function (req, res, next) {
//     res.header("Accept", "*");
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET, POST");
//     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
//     next();
// });

app.use(bodyParser.json({
    limit: "50mb"
}));

app.use(bodyParser.urlencoded({
    extended: true,
    limit: "50mb"
}));

app.use(compression());

process.on("SIGINT", function () {
    console.log("About to exit");
    database.close();
    process.exit();
});

d.on("error", function (err) {
    console.log("Domain error: ", err);
});

socket_server.on("connection", function (socket) {
    socket.on("exec_select_from_gateway", function (data) {
        console.log("Dal gateway mi arriva questo: ", data);
        if (data.query.toLowerCase().indexOf("delete") === -1 && data.query.toLowerCase().indexOf("drop table") === -1) {
            var query = data.query;
            if (data.objectId instanceof Array) {
                for (var x in data.objectId) {
                    query = query.replace(new RegExp("`" + data.objectId[x] + "`", "g"), "`" + data.objectId[x] + "_" + data.apioId + "`");
                }
            } else {
                query = query.replace(new RegExp("`" + data.objectId + "`", "g"), "`" + data.objectId + "_" + data.apioId + "`");
            }

            sql_db.query(query, function (error, result) {
                if (error) {
                    socket_server.emit("send_to_client_service", {
                        apioId: data.apioId,
                        message: "send_to_client",
                        data: {
                            who: "logic",
                            message: "get_select_data_from_cloud",
                            data: {
                                to: data.logicName,
                                additional: data.additional,
                                result: "Error"
                            }
                        }
                    });
                } else if (result) {
                    socket_server.emit("send_to_client", {
                        who: data.apioId,
                        message: "send_to_client",
                        data: {
                            who: "logic",
                            message: "get_select_data_from_cloud",
                            data: {
                                to: data.logicName,
                                additional: data.additional,
                                result: result
                            }
                        }
                    });
                } else {
                    socket_server.emit("send_to_client_service", {
                        apioId: data.apioId,
                        message: "send_to_client",
                        data: {
                            who: "logic",
                            message: "get_select_data_from_cloud",
                            data: {
                                to: data.logicName,
                                additional: data.additional,
                                result: {}
                            }
                        }
                    });
                }
            });
        }
    });

    socket.on("close", function (data) {
        if (usersLogsFiles.hasOwnProperty(data.user)) {
            delete usersLogsFiles[data.user][data.objectId];

            if (Object.keys(usersLogsFiles[data.user]).length === 0) {
                delete usersLogsFiles[data.user];
            }
        }
    });

    socket.on("log_require", function (data) {
        if (!usersLogsFiles.hasOwnProperty(data.user)) {
            usersLogsFiles[data.user] = {};
        }

        if (!usersLogsFiles[data.user].hasOwnProperty(data.objectId)) {
            usersLogsFiles[data.user][data.objectId] = 0;
        } else {
            usersLogsFiles[data.user][data.objectId] += 50;
        }

        sql_db.query("SELECT * FROM `" + data.objectId + "_" + data.apioId + "` ORDER BY timestamp DESC LIMIT " + usersLogsFiles[data.user][data.objectId] + ", 50", function (error, result) {
            if (error) {
                console.log("Error while getting logs from table " + data.objectId + ": ", error);
            } else {
                var obj = {};
                for (var i in result) {
                    for (var j in result[i]) {
                        if (j !== "id" && j !== "date" && j !== "timestamp") {
                            if (!obj.hasOwnProperty(j)) {
                                obj[j] = {};
                            }

                            obj[j][result[i].timestamp] = result[i][j] === null ? "0" : String(result[i][j]).replace(".", ",");
                        }
                    }
                }

                socket_server.emit("send_to_client", {
                    message: "log_update",
                    data: {
                        log: obj,
                        objectId: data.objectId
                    }
                });

                obj = undefined;
                global.gc();
            }
        });
    });

    socket.on("log_update", function (data) {
        // if (data.query) {
        //     sql_db.query(data.query.replace("`" + data.objectId + "`", "`" + data.objectId + "_" + data.apioId + "`"), function (error, result) {
        //         if (error) {
        //             console.log("Error while inserting logs in table " + data.objectId + ": ", error);
        //         } else if (result) {
        //             console.log("Data in table " + data.objectId + " successfully interted, result: ", result);
        //         } else {
        //             console.log("No result");
        //         }
        //     });
        // }

        if (database && data.apioId) {
            database.collection("Objects").findOne({
                objectId: data.objectId,
                apioId: data.apioId
            }, function (error, object) {
                if (error) {
                    console.log("Error while getting object with objectId " + data.objectId + " and apioId " + data.apioId + ": ", error);
                } else if (object) {
                    sql_db.query("SHOW COLUMNS FROM `" + data.objectId + "_" + data.apioId + "`", function (error, result) {
                        if (error) {
                            console.log("Error while getting columns from table " + data.objectId + "_" + data.apioId + ": ", error);
                        } else if (result) {
                            var timestamp = new Date().getTime(), fields = [], query_string = "", log = {};
                            if (data && data.properties) {
                                delete data.properties.date;

                                for (var x in result) {
                                    if (result[x].Field !== "id" && result[x].Field !== "timestamp") {
                                        fields.push(result[x].Field);
                                    }
                                }

                                for (var i in object.properties) {
                                    if (fields.indexOf(i) > -1) {
                                        if (query_string) {
                                            if (data.properties[i] !== undefined && typeof data.properties[i] !== "object" && data.properties[i] !== null && data.properties[i] !== "" && !isNaN(String(data.properties[i]).replace(",", "."))) {
                                                query_string += ", `" + i + "` = '" + String(data.properties[i]).replace(",", ".") + "'";
                                                if (!log.hasOwnProperty(i)) {
                                                    log[i] = {};
                                                }

                                                log[i][timestamp] = String(data.properties[i]).replace(",", ".");
                                            } else if (object.properties[i].value !== undefined && typeof object.properties[i].value !== "object" && object.properties[i].value !== null && object.properties[i].value !== "" && !isNaN(String(object.properties[i].value).replace(",", "."))) {
                                                query_string += ", `" + i + "` = '" + String(object.properties[i].value).replace(",", ".") + "'";
                                                if (!log.hasOwnProperty(i)) {
                                                    log[i] = {};
                                                }

                                                log[i][timestamp] = String(object.properties[i].value).replace(",", ".");
                                            }
                                        } else {
                                            query_string = "INSERT INTO `" + data.objectId + "_" + data.apioId + "` SET `timestamp` = '" + timestamp + "'";
                                            if (data.properties[i] !== undefined && typeof data.properties[i] !== "object" && data.properties[i] !== null && data.properties[i] !== "" && !isNaN(String(data.properties[i]).replace(",", "."))) {
                                                query_string += ", `" + i + "` = '" + String(data.properties[i]).replace(",", ".") + "'";
                                                if (!log.hasOwnProperty(i)) {
                                                    log[i] = {};
                                                }

                                                log[i][timestamp] = String(data.properties[i]).replace(",", ".");
                                            } else if (object.properties[i].value !== undefined && typeof object.properties[i].value !== "object" && object.properties[i].value !== null && object.properties[i].value !== "" && !isNaN(String(object.properties[i].value).replace(",", "."))) {
                                                query_string += ", `" + i + "` = '" + String(object.properties[i].value).replace(",", ".") + "'";
                                                if (!log.hasOwnProperty(i)) {
                                                    log[i] = {};
                                                }

                                                log[i][timestamp] = String(object.properties[i].value).replace(",", ".");
                                            }
                                        }
                                    }
                                }

                                sql_db.query(query_string, function (error, result) {
                                    if (error) {
                                        console.log("Error while inserting logs in table " + data.objectId + "_" + data.apioId + ": ", error);
                                    } else if (result) {
                                        console.log("Data in table " + data.objectId + "_" + data.apioId + " successfully interted, result: ", result);
                                    } else {
                                        console.log("No result");
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });

    // socket.on("log_update", function (dataArray) {
    //     // if (data.query) {
    //     //     sql_db.query(data.query.replace("`" + data.objectId + "`", "`" + data.objectId + "_" + data.apioId + "`"), function (error, result) {
    //     //         if (error) {
    //     //             console.log("Error while inserting logs in table " + data.objectId + ": ", error);
    //     //         } else if (result) {
    //     //             console.log("Data in table " + data.objectId + " successfully interted, result: ", result);
    //     //         } else {
    //     //             console.log("No result");
    //     //         }
    //     //     });
    //     // }
    //
    //     if (database && dataArray && dataArray instanceof Array) {
    //         dataArray.forEach(function (data) {
    //             console.log("data: ", data);
    //             if (data.apioId) {
    //                 database.collection("Objects").findOne({
    //                     objectId: data.objectId,
    //                     apioId: data.apioId
    //                 }, function (error, object) {
    //                     if (error) {
    //                         console.log("Error while getting object with objectId " + data.objectId + " and apioId " + data.apioId + ": ", error);
    //                     } else if (object) {
    //                         sql_db.query("SHOW COLUMNS FROM `" + data.objectId + "_" + data.apioId + "`", function (error, result) {
    //                             if (error) {
    //                                 console.log("Error while getting columns from table " + data.objectId + "_" + data.apioId + ": ", error);
    //                             } else if (result) {
    //                                 var timestamp = new Date().getTime(), fields = [], query_string = "", log = {};
    //                                 delete data.properties.date;
    //
    //                                 for (var x in result) {
    //                                     if (result[x].Field !== "id" && result[x].Field !== "timestamp") {
    //                                         fields.push(result[x].Field);
    //                                     }
    //                                 }
    //
    //                                 for (var i in object.properties) {
    //                                     if (fields.indexOf(i) > -1) {
    //                                         if (query_string) {
    //                                             if (data.properties[i] !== undefined && typeof data.properties[i] !== "object" && data.properties[i] !== null && data.properties[i] !== "" && !isNaN(String(data.properties[i]).replace(",", "."))) {
    //                                                 query_string += ", `" + i + "` = '" + String(data.properties[i]).replace(",", ".") + "'";
    //                                                 if (!log.hasOwnProperty(i)) {
    //                                                     log[i] = {};
    //                                                 }
    //
    //                                                 log[i][timestamp] = String(data.properties[i]).replace(",", ".");
    //                                             } else if (object.properties[i].value !== undefined && typeof object.properties[i].value !== "object" && object.properties[i].value !== null && object.properties[i].value !== "" && !isNaN(String(object.properties[i].value).replace(",", "."))) {
    //                                                 query_string += ", `" + i + "` = '" + String(object.properties[i].value).replace(",", ".") + "'";
    //                                                 if (!log.hasOwnProperty(i)) {
    //                                                     log[i] = {};
    //                                                 }
    //
    //                                                 log[i][timestamp] = String(object.properties[i].value).replace(",", ".");
    //                                             }
    //                                         } else {
    //                                             query_string = "INSERT INTO `" + data.objectId + "_" + data.apioId + "` SET `timestamp` = '" + timestamp + "'";
    //                                             if (data.properties[i] !== undefined && typeof data.properties[i] !== "object" && data.properties[i] !== null && data.properties[i] !== "" && !isNaN(String(data.properties[i]).replace(",", "."))) {
    //                                                 query_string += ", `" + i + "` = '" + String(data.properties[i]).replace(",", ".") + "'";
    //                                                 if (!log.hasOwnProperty(i)) {
    //                                                     log[i] = {};
    //                                                 }
    //
    //                                                 log[i][timestamp] = String(data.properties[i]).replace(",", ".");
    //                                             } else if (object.properties[i].value !== undefined && typeof object.properties[i].value !== "object" && object.properties[i].value !== null && object.properties[i].value !== "" && !isNaN(String(object.properties[i].value).replace(",", "."))) {
    //                                                 query_string += ", `" + i + "` = '" + String(object.properties[i].value).replace(",", ".") + "'";
    //                                                 if (!log.hasOwnProperty(i)) {
    //                                                     log[i] = {};
    //                                                 }
    //
    //                                                 log[i][timestamp] = String(object.properties[i].value).replace(",", ".");
    //                                             }
    //                                         }
    //                                     }
    //                                 }
    //
    //                                 sql_db.query(query_string, function (error, result) {
    //                                     if (error) {
    //                                         console.log("Error while inserting logs in table " + data.objectId + "_" + data.apioId + ": ", error);
    //                                     } else if (result) {
    //                                         console.log("Data in table " + data.objectId + "_" + data.apioId + " successfully interted, result: ", result);
    //                                     } else {
    //                                         console.log("No result");
    //                                     }
    //                                 });
    //                             }
    //                         });
    //                     }
    //                 });
    //             }
    //         });
    //     }
    // });
});

sql_db.connect(function (err) {
    if (err) {
        console.error("Error while connecting to MySQL: ", err);
    } else {
        console.log("Successfully connected to MySQL, connection id: " + sql_db.threadId);
    }
});

MongoClient.connect("mongodb://" + configuration.database.hostname + ":" + configuration.database.port + "/" + configuration.database.database, function (error, db) {
    if (error) {
        console.log("Unable to get database");
    } else if (db) {
        database = db;
        console.log("Database correctly initialized");
    }
});

http.listen(port, "localhost", function () {
// http.listen(port, function () {
    console.log("APIO Log Service correctly started on port " + port);
});

app.get("/apio/log/getAllByObjectId/:objectId/properties/:properties", function (req, res) {
    var properties = req.params.properties.split(",");
    database.collection("Objects").findOne({
        apioId: req.query.apioId,
        objectId: req.params.objectId
    }, function (err, object) {
        if (err) {
            res.sendStatus(500);
        } else if (object) {
            database.collection("Services").findOne({apioId: req.query.apioId, name: "log"}, function (err1, service) {
                // var limit = 50;
                if (err1) {
                    console.log("Error while getting service log: ", err1);
                } else if (service) {
                    // limit = Number(service.exportLimit.xlsx);
                }

                // sql_db.query("SELECT * FROM `" + req.params.objectId + "_" + req.query.apioId + "` ORDER BY timestamp DESC LIMIT 0, " + (limit * limit), function (error, result) {
                sql_db.query("SELECT * FROM `" + req.params.objectId + "_" + req.query.apioId + "` ORDER BY timestamp", function (error, result) {
                    if (error) {
                        console.log("Error while getting logs from table " + req.params.objectId + "_" + req.query.apioId + ": ", error);
                    } else {
                        // var obj = {};

                        result.sort(function (a, b) {
                            return Number(a.timestamp) - Number(b.timestamp);
                        });

                        // if (result.length <= 2500) {
                        //     for (var i in result) {
                        //         var keys = Object.keys(result[i]);
                        //         for (var j in keys) {
                        //             if (keys[j] !== "timestamp" && properties.indexOf(keys[j]) === -1) {
                        //                 delete result[i][keys[j]];
                        //             }
                        //         }
                        //     }
                        //
                        //     for (var i in result) {
                        //         for (var j in result[i]) {
                        //             if (j !== "id" && j !== "date" && j !== "timestamp") {
                        //                 if (!obj.hasOwnProperty(j)) {
                        //                     obj[j] = {};
                        //                 }
                        //
                        //                 // obj[j][result[i].timestamp] = result[i][j] === null ? "0" : String(result[i][j]).replace(".", ",");
                        //                 obj[j][result[i].timestamp] = result[i][j] === null ? "-" : String(result[i][j]).replace(".", ",");
                        //             }
                        //         }
                        //     }
                        //
                        //     res.status(200).send(obj);
                        //     obj = undefined;
                        //     global.gc();
                        // } else {
                            var D = new Date(Number(result[0].timestamp));
                            var daysNumber = Math.ceil((Number(result[result.length - 1].timestamp) - Number(result[0].timestamp)) / 1000 / 60 / 60 /24) + 1;
                            var tsArray = [];
                            var now = new Date();
                            for (var i = 0; i <= 1440 * daysNumber; i += 15) {
                                var dateToPush = new Date(D.getFullYear(), D.getMonth(), D.getDate(), 0, i).getTime();
                                if (dateToPush <= now) {
                                    tsArray.push(dateToPush);
                                }
                            }

                            var final = "", obj = {};
                            var processRow = function (row) {
                                for (var j in row) {
                                    if (j !== "timestamp") {
                                        if (!obj.hasOwnProperty(j)) {
                                            obj[j] = {};
                                        }

                                        // obj[j][row.timestamp] = row[j] === null ? "0" : String(row[j]).replace(".", ",");
                                        obj[j][row.timestamp] = row[j] === null ? "-" : String(row[j]).replace(".", ",");
                                    }
                                }
                            };

                            for (var i = 0; i < tsArray.length - 1; i++) {
                                var query = "SELECT ";
                                for (var j in properties) {
                                    if (query === "SELECT ") {
                                        query += "AVG(`" + properties[j] + "`) AS `" + properties[j] + "`";
                                    } else {
                                        query += ", AVG(`" + properties[j] + "`) AS `" + properties[j] + "`";
                                    }
                                }

                                query += ", " + tsArray[i] + " AS timestamp FROM `" + req.params.objectId + "_" + req.query.apioId + "` WHERE (timestamp >= " + tsArray[i] + " AND timestamp < " + tsArray[i + 1] + ")";

                                if (final) {
                                    final += " UNION " + query;
                                } else {
                                    final = query;
                                }
                            }

                            final = "SELECT * FROM (" + final + ") AS T";

                            sql_db.query(final).on("result", function (row) {
                                processRow(row);
                            }).on("end", function () {
                                res.status(200).send(obj);
                                obj = undefined;
                                global.gc();
                            });
                        // }
                    }
                });
            });
        }
    });
});

app.get("/apio/log/exportXLSX", function (req, res) {
    var propertyToInclude = req.query.properties.split(",");
    database.collection("Objects").findOne({
        apioId: req.query.apioId,
        objectId: req.query.objectId
    }, function (err, object) {
        if (err) {
            res.status(500).send(err);
        } else if (object) {
            var isIn = function (timestamp) {
                for (var i in json) {
                    if (typeof json[i][0] !== "string" && json[i][0].getTime() === timestamp) {
                        return i;
                    }
                }

                return -1;
            };

            var json = [["Data"]];
            for (var i = 0; i < propertyToInclude.length; i++) {
                if (object.properties.hasOwnProperty(propertyToInclude[i])) {
                    if (object.properties[propertyToInclude[i]].hasOwnProperty("label")) {
                        json[0].push(object.properties[propertyToInclude[i]].label);
                    } else {
                        json[0].push(object.properties[propertyToInclude[i]].labelon + "/" + object.properties[propertyToInclude[i]].labeloff);
                    }
                } else {
                    json[0].push(propertyToInclude[i]);
                }
            }

            sql_db.query("SELECT * FROM `" + req.query.objectId + "_" + req.query.apioId + "` ORDER BY timestamp DESC LIMIT 0, " + (50 * 250), function (error, result) {
                if (error) {
                    console.log("Error while getting logs from table " + req.query.objectId + "_" + req.query.apioId + ": ", error);
                } else {
                    var obj = {};
                    for (var i in result) {
                        for (var j in result[i]) {
                            if (j !== "id" && j !== "date" && j !== "timestamp") {
                                if (!obj.hasOwnProperty(j)) {
                                    obj[j] = {};
                                }

                                obj[j][result[i].timestamp] = result[i][j] === null ? "0" : String(result[i][j]).replace(".", ",");
                            }
                        }
                    }

                    for (var i = 0; i < propertyToInclude.length; i++) {
                        for (var j in obj[propertyToInclude[i]]) {
                            var index = isIn(Number(j));
                            if (index > -1) {
                                json[index][i + 1] = Number(obj[propertyToInclude[i]][j].replace(",", "."));
                            } else {
                                var arr = [new Date(Number(j))];
                                arr[i + 1] = Number(obj[propertyToInclude[i]][j].replace(",", "."));
                                json.push(arr);
                                arr = undefined;
                            }
                        }
                    }

                    json.sort(function (a, b) {
                        if (typeof a[0] === "object" && typeof b[0] === "string") {
                            return 1;
                        } else if (typeof a[0] === "string" && typeof b[0] === "object") {
                            return -1
                        } else {
                            return b[0].getTime() - a[0].getTime();
                        }
                    });

                    fs.writeFile("../" + appPath + "/" + req.query.objectId + "/Report " + object.name + ".xlsx", xlsx.build([{
                        name: "Foglio 1",
                        data: json
                    }]), function (err) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            obj = undefined;
                            global.gc();
                            res.status(200).send("applications/" + req.query.objectId + "/Report " + object.name + ".xlsx");
                        }
                    });
                }
            });
        } else {
            res.status(404).send("No objects found");
        }
    });
});

app.get("/apio/log/getByDate/objectId/:objectId/date/:date", function (req, res) {
    var dateArr = req.params.date.split("-");
    var todayTimestamp = new Date(Number(dateArr[0]), Number(dateArr[1]) - 1, Number(dateArr[2])).getTime();
    var tomorrowTimestamp = new Date(Number(dateArr[0]), Number(dateArr[1]) - 1, Number(dateArr[2]) + 1).getTime();

    var obj = {};
    var processRow = function (row) {
        for (var j in row) {
            if (j !== "id" && j !== "date" && j !== "timestamp") {
                if (!obj.hasOwnProperty(j)) {
                    obj[j] = {};
                }

                obj[j][row.timestamp] = row[j] === null ? "0" : String(row[j]).replace(".", ",");
            }
        }
    };

    req.pause();
    sql_db.query("SELECT * FROM `" + req.params.objectId + "_" + req.query.apioId + "` WHERE (timestamp >= '" + todayTimestamp + "' AND timestamp < '" + tomorrowTimestamp + "') ORDER BY timestamp DESC").on("error", function () {
        res.status(200).send({});
    }).on("result", function (row) {
        processRow(row);
    }).on("end", function () {
        req.resume();
        res.status(200).send(obj);
        obj = undefined;
        global.gc();
    });
});

app.get("/apio/log/getByRange/objectId/:objectId/from/:from/daysNumber/:daysNumber", function (req, res) {
    var fromComponents = req.params.from.split("-"), obj = {};
    var startTimestamp = new Date(Number(fromComponents[0]), Number(fromComponents[1]) - 1, Number(fromComponents[2])).getTime();
    var endTimestamp = new Date(Number(fromComponents[0]), Number(fromComponents[1]) - 1, Number(fromComponents[2]) + Number(req.params.daysNumber) + 1).getTime();

    var processRow = function (row) {
        for (var j in row) {
            if (j !== "id" && j !== "date" && j !== "timestamp") {
                if (!obj.hasOwnProperty(j)) {
                    obj[j] = {};
                }

                obj[j][row.timestamp] = row[j] === null ? "0" : String(row[j]).replace(".", ",");
            }
        }
    };

    req.pause();
    sql_db.query("SELECT * FROM `" + req.params.objectId + "_" + req.query.apioId + "` WHERE (timestamp >= '" + startTimestamp + "' AND timestamp < '" + endTimestamp + "') ORDER BY timestamp DESC").on("error", function () {
        res.status(200).send({});
    }).on("result", function (row) {
        processRow(row);
    }).on("end", function () {
        req.resume();
        res.status(200).send(obj);
        obj = undefined;
        global.gc();
    });
});

app.get("/apio/log/getSumFileByDate/objectId/:objectId/date/:date", function (req, res) {
    var dateComponents = req.params.date.split("-"), tsArray = [];
    for (var i = 0; i <= 1440; i += 15) {
        tsArray.push(new Date(Number(dateComponents[0]), Number(dateComponents[1]) - 1, Number(dateComponents[2]), 0, i).getTime());
    }

    database.collection("Objects").findOne({
        apioId: req.query.apioId,
        objectId: req.params.objectId
    }, function (err, object) {
        if (err) {
            res.status(200).send({});
        } else if (object) {
            var final = "", obj = {};
            var processRow = function (row) {
                for (var j in row) {
                    if (j !== "timestamp") {
                        if (!obj.hasOwnProperty(j)) {
                            obj[j] = {};
                        }

                        //obj[j][row.timestamp] = row[j] === null ? "0" : String(row[j]).replace(".", ",");
                        if (row[j] != null) {
                            obj[j][row.timestamp] = String(row[j]).replace(".", ",");
                        }
                    }
                }
            };

            for (var i = 0; i < tsArray.length - 1; i++) {
                var query = "SELECT ";
                for (var j in object.properties) {
                    if (object.properties[j].type != "log") {
                        if (query === "SELECT ") {
                            query += "SUM(`" + j + "`) AS `" + j + "`, COUNT(`" + j + "`) AS `count" + j + "`";
                        } else {
                            query += ", SUM(`" + j + "`) AS `" + j + "`, COUNT(`" + j + "`) AS `count" + j + "`";
                        }
                    }
                }

                query += ", " + tsArray[i] + " AS timestamp FROM `" + req.params.objectId + "_" + req.query.apioId + "` WHERE (timestamp >= " + tsArray[i] + " AND timestamp < " + tsArray[i + 1] + ")";

                if (final) {
                    final += " UNION " + query;
                } else {
                    final = query;
                }
            }

            final = "SELECT * FROM (" + final + ") AS T";

            sql_db.query(final).on("result", function (row) {
                processRow(row);
            }).on("end", function () {
                res.status(200).send(obj);
                obj = undefined;
                global.gc();
            });
        } else {
            res.status(200).send({});
        }
    });
});

app.get("/apio/log/getSumFileByRange/objectId/:objectId/from/:from/daysNumber/:daysNumber", function (req, res) {
    var dateComponents = req.params.from.split("-"), tsArray = [];
    for (var i = 0; i <= 1440 * (Number(req.params.daysNumber) + 1); i += 15) {
        tsArray.push(new Date(Number(dateComponents[0]), Number(dateComponents[1]) - 1, Number(dateComponents[2]), 0, i).getTime());
    }

    database.collection("Objects").findOne({
        apioId: req.query.apioId,
        objectId: req.params.objectId
    }, function (err, object) {
        if (err) {
            res.status(200).send({});
        } else if (object) {
            var final = "", obj = {};
            var processRow = function (row) {
                for (var j in row) {
                    if (j !== "timestamp") {
                        if (!obj.hasOwnProperty(j)) {
                            obj[j] = {};
                        }

                        obj[j][row.timestamp] = row[j] === null ? "0" : String(row[j]).replace(".", ",");
                    }
                }
            };

            for (var i = 0; i < tsArray.length - 1; i++) {
                var query = "SELECT ";
                for (var j in object.properties) {
                    if (object.properties[j].type != "log") {
                        if (query === "SELECT ") {
                            query += "SUM(`" + j + "`) AS `" + j + "`, COUNT(`" + j + "`) AS `count" + j + "`";
                        } else {
                            query += ", SUM(`" + j + "`) AS `" + j + "`, COUNT(`" + j + "`) AS `count" + j + "`";
                        }
                    }
                }

                query += ", " + tsArray[i] + " AS timestamp FROM `" + req.params.objectId + "_" + req.query.apioId + "` WHERE (timestamp >= " + tsArray[i] + " AND timestamp < " + tsArray[i + 1] + ")";

                if (final) {
                    final += " UNION " + query;
                } else {
                    final = query;
                }
            }

            final = "SELECT * FROM (" + final + ") AS T";

            sql_db.query(final).on("result", function (row) {
                processRow(row);
            }).on("end", function () {
                res.status(200).send(obj);
                obj = undefined;
                global.gc();
            });
        } else {
            res.status(200).send({});
        }
    });
});

app.post("/apio/log/data/insert", function (req, res) {
    if (req.body.data.command == "$push") {
        var data = {};
        database.collection("Objects").update({objectId: req.body.data.who}, {$push: {"data.manutenzione": req.body.data.data}}, function (e, r) {
            if (e) {
                res.sendStatus(500);
            } else {
                res.sendStatus(200);

            }
        });
    } else if (req.body.data.command == "$set") {
        database.collection("Objects").update({objectId: req.body.data.who}, {$set: {data: req.body.data.data}}, function (e, r) {
            if (e) {
                res.sendStatus(500);
            } else {
                res.sendStatus(200);
            }
        });
    }
});