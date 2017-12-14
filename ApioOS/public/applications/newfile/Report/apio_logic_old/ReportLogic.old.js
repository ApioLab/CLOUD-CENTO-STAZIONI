var MongoClient = require("mongodb").MongoClient;
var fileComponents = __filename.split("/");
var logicName = fileComponents[fileComponents.length - 1];
var Apio = require("../../apio.js")(false);
var configuration = Apio.config.return().file;
var fs = require("fs");
var socket_client = require("socket.io-client")("http://localhost:" + Apio.Configuration.http.port, {query: "associate=logic&token=" + Apio.Token.getFromText("logic", fs.readFileSync("../" + Apio.Configuration.type + "_key.apio", "utf8"))});
//var mysql = require("mysql");
//var sql_db = mysql.createConnection("mysql://root:root@dev.apio.cloud/Logs");



//var apioId = Apio.System.getApioIdentifier();
//sql_db.connect(function (err) {
//    if (err) {
//        console.log("Error while connecting to MySQL: ", err);
//    } else {
//        console.log("Successfully connected to MySQL, connection id: " + sql_db.threadId);
//    }
//});

var database;
var json = {};
MongoClient.connect("mongodb://" + configuration.database.hostname + ":" + configuration.database.port + "/" + configuration.database.database, function (error, db) {
    if (error) {
        // console.log("Unable to get database");
    } else if (db) {
        // console.log("Connected to DB");
        database = db;
        database.collection("Objects").findOne({objectId: "_TMP_"}, function (err, result) {
            if (err) {
                // console.log("Error while getting the report app");
            } else if (result) {
                //json.type = result.db.type;
                json = result.db;
                json.current = {};
                json.previous = {};
                json.current.consumed = null;
                json.previous.consumed = null;

                // console.log("report app found");
                console.log("tipo di intervento : ", result.db.type," nel report _TMP_");
                if (result.db.type == "VAZ") {
                    var keys = Object.keys(result.db.energyCounters);
                    if (typeof result.db.energyCounters["produced"] !== "undefined" && result.db.energyCounters["produced"] != null && result.db.energyCounters["produced"].length > 0) {
                        json.current.produced = null;
                        json.previous.produced = null;

                    }
                    if (typeof result.db.energyCounters["input"] !== "undefined" && result.db.energyCounters["input"] != null && result.db.energyCounters["input"].length > 0) {
                        json.current.input = null;
                        json.previous.input = null;
                    }
                }
                var length = Object.keys(result.db.amount).length;
                if (length == 2) {
                    json.current.F1 = null;
                    json.previous.F1 = null;
                    json.current.F23 = null;
                    json.previous.F23 = null;

                } else if (length == 3) {
                    json.current.F1 = null;
                    json.previous.F1 = null;
                    json.current.F2 = null;
                    json.previous.F2 = null;
                    json.current.F3 = null;
                    json.previous.F3 = null;

                }
            }
        });

    }
});

module.exports = function (logic, request, socketServer) {
    //socketServer.on("connection",function(socket){

    // });

    /*setInterval(function () {
     socketServer.emit("send_to_cloud_service", {
     service: "log",
     message: "exec_select_from_gateway",
     data: {
     query: "SELECT energy FROM `Logs`.`39`  ORDER BY `timestamp` ASC LIMIT 1",
     logicName: logicName,
     objectId: "39"
     }
     });*/
    //console.log("dopo 5 secondi invio messaggio");

    //socket_client.on("get_select_data_from_cloud", function (data) {
    //
    //    if (data.to == logicName) {
    //    }
    //    console.log("Abbiamo ricevuto questi dati: ", data);
    //    socket_client.off("get_select_data_from_cloud");
    //});
    //}, 2000);


    socket_client.on("get_select_data_from_cloud", function (data) {
        //console.log("data: ", data);
        if (data.to == logicName && data.additional.type == "consumed") {
            if (data.additional.selector == 0) {
                json.previous.consumed = data.result[0].summed ? Number(data.result[0].summed) : 0;
            } else if (data.additional.selector == 1) {
                json.current.consumed = data.result[0].summed ? Number(data.result[0].summed) : 0;
            }
        } else if (data.to == logicName && data.additional.type == "produced") {
            if (data.additional.selector == 0) {
                json.previous.produced = data.result[0].summed ? Number(data.result[0].summed) : 0;
            } else if (data.additional.selector == 1) {
                json.current.produced = data.result[0].summed ? Number(data.result[0].summed) : 0;
            }
        } else if (data.to == logicName && data.additional.type == "input") {
            if (data.additional.selector == 0) {
                json.previous.input = data.result[0].summed ? Number(data.result[0].summed) : 0;
            } else if (data.additional.selector == 1) {
                json.current.input = data.result[0].summed ? Number(data.result[0].summed) : 0;
            }
        } else if (data.to == logicName && data.additional.type == "F1") {
            //console.log("F1 arrivato");
            if (data.additional.selector == 0) {
                json.previous.F1 = data.result[0].summed ? Number(data.result[0].summed) : 0;
            } else if (data.additional.selector == 1) {
                json.current.F1 = data.result[0].summed ? Number(data.result[0].summed) : 0;
            }
        } else if (data.to == logicName && data.additional.type == "F2") {
            //console.log("F2 arrivato");
            if (data.additional.selector == 0) {
                json.previous.F2 = data.result[0].summed ? Number(data.result[0].summed) : 0;
            } else if (data.additional.selector == 1) {
                json.current.F2 = data.result[0].summed ? Number(data.result[0].summed) : 0;
            }
        } else if (data.to == logicName && data.additional.type == "F3") {
            //console.log("F3 arrivato");
            if (data.additional.selector == 0) {
                json.previous.F3 = data.result[0].summed ? Number(data.result[0].summed) : 0;
            } else if (data.additional.selector == 1) {
                json.current.F3 = data.result[0].summed ? Number(data.result[0].summed) : 0;
            }
        } else if (data.to == logicName && data.additional.type == "F23") {
            //console.log("F23 arrivato");
            if (data.additional.selector == 0) {
                json.previous.F23 = data.result[0].summed ? Number(data.result[0].summed) : 0;
            } else if (data.additional.selector == 1) {
                json.current.F23 = data.result[0].summed ? Number(data.result[0].summed) : 0;
            }
        }
    });

    var produced_tot;
    var consumed_tot;
    var input_tot;
    var previous_produced_tot;
    var previous_consumed_tot;
    var previous_input_tot;
    var previous_autoConsumed;
    var autoConsumed;

    var amounts;
    var energySlots;
    var previousAmounts;
    var previousEnergySlots;
    var consume_refs;
    var production_refs;
    var consume_exp;
    var production_exp;

    var today = new Date();
    var today_ts = new Date().getTime();
    var previous_startMonth_ts = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();
    var previous_endMonth_ts = new Date(today.getFullYear(), today.getMonth(), 1).getTime();


//var searchInSql = function (elem, start, end, callback) {
//    var result = {
//        maxData: {},
//        minData: {}
//    };
//    sql_db.query("SELECT * FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start + "' AND timestamp < '" + end + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1", function (err_sql, res_sql) {
//        if (err_sql) {
//            console.log("Error while getting logs from table " + elem + ": ", err_sql);
//        } else if (res_sql) {
//            if (res_sql.length) {
//                result.minData = res_sql[0];
//                sql_db.query("SELECT * FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start + "' AND timestamp < '" + end + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1", function (err_sql, res_sql) {
//                    if (err_sql) {
//                        console.log("Error while getting logs from table " + elem + ": ", err_sql);
//                    } else if (res_sql) {
//                        if (res_sql.length) {
//                            result.maxData = res_sql[0];
//                            //console.log("result: ", result);
//                            if (callback) {
//                                callback(result);
//                            }
//                        } else {
//                            console.log("maxData vuoto");
//                            if (callback) {
//                                callback(result);
//                            }
//                        }
//                    } else {
//                        console.log("maxData non definito");
//                        if (callback) {
//                            callback(result);
//                        }
//                    }
//                });
//            } else {
//                console.log("minData vuoto");
//                if (callback) {
//                    callback(result);
//                }
//            }
//        } else {
//            console.log("minData non definito");
//            if (callback) {
//                callback(result);
//            }
//        }
//    });
//};


    var monthSearch = function (counters, type, start, end, database, selector) {
        var result;
        //var today = new Date();
        var query = "";
        var energyProperty;
        counters.forEach(function (elem, index, ref_array) {
            database.collection("Objects").findOne({objectId: elem}, function (err, mongo_result) {
                if (err) {
                    console.log("error while retrieving data on MONGO");
                } else if (mongo_result) {
                    if (type == "input") {
                        energyProperty = "expEnergy";
                    } else if (mongo_result.properties.hasOwnProperty("energy")) {
                        energyProperty = "energy";
                    } else if (mongo_result.properties.hasOwnProperty("impEnergy")) {
                        energyProperty = "impEnergy";
                    } else if (mongo_result.properties.hasOwnProperty("totalEnergy")) {
                        energyProperty = "totalEnergy";
                    }
                }
                if (query == "") {
                    query = "SELECT SUM(energy) as summed FROM( "
                }
                query += "(SELECT -1*" + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start + "' AND timestamp < '" + end + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1) UNION ALL ";
                query += "(SELECT " + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start + "' AND timestamp < '" + end + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1) ";

                if (index == ref_array.length - 1) {
                    query += " ) as result";
                    //console.log("query: ", query);
                    //console.log("sto per inviare la query mensile di ", type);
                    /*socket_client.on("get_select_data_from_cloud", function (data) {
                     //console.log("*******Ho ricevuto dei dati: *******");
                     //console.log();
                     //console.log("****INVIATA*****",query);
                     //console.log();
                     //console.log("****RICEVUTA****",data.query);
                     if (data.to == logicName && data.query == query) {
                     console.log("ho ricevuto la query mensile di ", type);
                     result = data.result;
                     callback(result);
                     socket_client.off("get_select_data_from_cloud");
                     }
                     });*/
                    socketServer.emit("send_to_cloud_service", {
                        service: "log",
                        message: "exec_select_from_gateway",
                        data: {
                            query: query,
                            logicName: logicName,
                            objectId: ref_array,
                            additional: {
                                type: type,
                                selector: selector
                            }
                        }
                    });


                    /*sql_db.query(query, function (err_sql, res_sql) {
                     if (err_sql) {
                     console.log("error while retrieving summed data from SQL");
                     } else if (res_sql) {
                     callback(res_sql);
                     }
                     });*/

                } else {
                    query += "UNION ALL "
                }


            });

        });


    };

//var timeSlot = function (counters, today, start, end, database, callback) {
//    if (callback) {
//        //var today = new Date();
//        var query = "";
//        var energyProperty;
//        counters.forEach(function (elem, index, ref_array) {
//            database.collection("Objects").findOne({objectId: elem}, function (err, result) {
//                if (err) {
//                    console.log("error while retrieving data on MONGO");
//                } else if (result) {
//                    if (result.properties.hasOwnProperty("energy")) {
//                        energyProperty = "energy";
//                    } else if (result.properties.hasOwnProperty("impEnergy")) {
//                        energyProperty = "impEnergy";
//                    }
//                }
//                if (query == "") {
//                    query = "SELECT SUM(energy) as summed FROM( "
//                }
//                for (var i = 1; i <= today.getDate(); i++) {
//                    //console.log("giorno: ",i);
//                    var start_ts = new Date(today.getFullYear(), today.getMonth(), i).getTime() + start * 60 * 60 * 1000;
//                    //var end_ts = start_ts + (end - start + 1) * 60 * 60 * 1000; // da scommentare nel caso serva anche l'ora successiva a quella attuale;
//                    var end_ts = start_ts + (end - start ) * 60 * 60 * 1000;
//                    query += "(SELECT -1*" + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts + "' AND timestamp < '" + end_ts + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1) UNION ALL ";
//                    query += "(SELECT " + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts + "' AND timestamp < '" + end_ts + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1) ";
//                    if (index == ref_array.length - 1 && i == today.getDate()) {
//                        query += " ) as result";
//                        //console.log("query: ",query);
//                        sql_db.query(query, function (err_sql, res_sql) {
//                            if (err_sql) {
//                                console.log("error while retrieving summed data from SQL");
//                            } else if (res_sql) {
//                                callback(res_sql);
//                            }
//                        });
//                    } else {
//                        query += "UNION ALL "
//                    }
//                }
//
//            });
//
//        });
//    }
//};

    var timeSlot = function (counters, today, slot, database, selector) {

        var query = "";
        var energyProperty;
        counters.forEach(function (elem, index, ref_array) {
            database.collection("Objects").findOne({objectId: elem}, function (err, result) {
                if (err) {
                    console.log("error while retrieving data on MONGO");
                } else if (result) {
                    if (result.properties.hasOwnProperty("energy")) {
                        energyProperty = "energy";
                    } else if (result.properties.hasOwnProperty("impEnergy")) {
                        energyProperty = "impEnergy";
                    } else if (result.properties.hasOwnProperty("totalEnergy")) {
                        energyProperty = "totalEnergy";
                    }
                }
                if (query == "") {
                    query = "SELECT SUM(energy) as summed FROM( "
                }
                function EasterMon(Y) {
                    var C = Math.floor(Y / 100);
                    var N = Y - 19 * Math.floor(Y / 19);
                    var K = Math.floor((C - 17) / 25);
                    var I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + 19 * N + 15;
                    I = I - 30 * Math.floor((I / 30));
                    I = I - Math.floor(I / 28) * (1 - Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11));
                    var J = Y + Math.floor(Y / 4) + I + 2 - C + Math.floor(C / 4);
                    J = J - 7 * Math.floor(J / 7);
                    var L = I - J;
                    var M = 3 + Math.floor((L + 40) / 44);
                    var D = L + 28 - 31 * Math.floor(M / 4);
                    var date = new Date(today.getFullYear(), M - 1, D + 1);
                    return date;
                }

                var date;
                var day;
                var easterMon = String(EasterMon(today.getFullYear()).getMonth() + 1) + "." + String(EasterMon(today.getFullYear()).getDate());
                for (var i = 1; i <= today.getDate(); i++) {
                    var flag = true;
                    day = new Date(today.getFullYear(), today.getMonth(), i).getDay();
                    date = String(today.getMonth() + 1) + "." + i;
                    //console.log("giorno: ",i);
                    if (slot == "F1") {
                        if (date != "1.1" && date != "1.6" && date != easterMon && date != "4.25" && date != "5.1" && date != "6.2" && date != "8.15" && date != "11.1" && date != "12.8" && date != "12.25" && date != "12.26" && day != 0 && day != 6) {
                            var start_ts = new Date(today.getFullYear(), today.getMonth(), i).getTime() + 8 * 60 * 60 * 1000;
                            //var end_ts = start_ts + (end - start + 1) * 60 * 60 * 1000; // da scommentare nel caso serva anche l'ora successiva a quella attuale;
                            var end_ts = start_ts + (19 - 8) * 60 * 60 * 1000;
                            query += "(SELECT -1*" + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts + "' AND timestamp < '" + end_ts + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1) UNION ALL ";
                            query += "(SELECT " + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts + "' AND timestamp < '" + end_ts + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1) ";
                        } else {
                            flag = false;
                        }
                    } else if (slot == "F23") {
                        if (date != "1.1" && date != "1.6" && date != easterMon && date != "4.25" && date != "5.1" && date != "6.2" && date != "8.15" && date != "11.1" && date != "12.8" && date != "12.25" && date != "12.26" && day != 0 && day != 6) {
                            var start_ts_1 = new Date(today.getFullYear(), today.getMonth(), i).getTime();
                            var end_ts_1 = start_ts_1 + 8 * 60 * 60 * 1000;
                            var start_ts_2 = new Date(today.getFullYear(), today.getMonth(), i).getTime() + 19 * 60 * 60 * 1000;
                            var end_ts_2 = start_ts_2 + (24 - 19) * 60 * 60 * 1000;
                            query += "(SELECT -1*" + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts_1 + "' AND timestamp < '" + end_ts_1 + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1) UNION ALL ";
                            query += "(SELECT " + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts_1 + "' AND timestamp < '" + end_ts_1 + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1) UNION ALL ";
                            query += "(SELECT -1*" + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts_2 + "' AND timestamp < '" + end_ts_2 + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1) UNION ALL ";
                            query += "(SELECT " + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts_2 + "' AND timestamp < '" + end_ts_2 + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1) ";

                        } else if (date == "1.1" || date == "1.6" || date == easterMon || date == "4.25" || date == "5.1" || date == "6.2" || date == "8.15" || date == "11.1" || date == "12.8" || date == "12.25" || date == "12.26" || day == 0 || day == 6) {

                            var start_ts = new Date(today.getFullYear(), today.getMonth(), i).getTime();
                            //var end_ts = start_ts + (end - start + 1) * 60 * 60 * 1000; // da scommentare nel caso serva anche l'ora successiva a quella attuale;
                            var end_ts = start_ts + 24 * 60 * 60 * 1000;
                            query += "(SELECT -1*" + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts + "' AND timestamp < '" + end_ts + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1) UNION ALL ";
                            query += "(SELECT " + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts + "' AND timestamp < '" + end_ts + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1) ";
                        } else {
                            flag = false;
                        }
                    } else if (slot == "F2") {
                        if (date != "1.1" && date != "1.6" && date != easterMon && date != "4.25" && date != "5.1" && date != "6.2" && date != "8.15" && date != "11.1" && date != "12.8" && date != "12.25" && date != "12.26" && day != 0 && day != 6) {
                            var start_ts_1 = new Date(today.getFullYear(), today.getMonth(), i).getTime() + 7 * 60 * 60 * 1000;
                            var end_ts_1 = start_ts_1 + (8 - 7) * 60 * 60 * 1000;
                            var start_ts_2 = new Date(today.getFullYear(), today.getMonth(), i).getTime() + 19 * 60 * 60 * 1000;
                            var end_ts_2 = start_ts_2 + (23 - 19) * 60 * 60 * 1000;
                            query += "(SELECT -1*" + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts_1 + "' AND timestamp < '" + end_ts_1 + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1) UNION ALL ";
                            query += "(SELECT " + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts_1 + "' AND timestamp < '" + end_ts_1 + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1) UNION ALL ";
                            query += "(SELECT -1*" + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts_2 + "' AND timestamp < '" + end_ts_2 + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1) UNION ALL ";
                            query += "(SELECT " + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts_2 + "' AND timestamp < '" + end_ts_2 + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1) ";

                        } else if (date != "1.1" && date != "1.6" && date != easterMon && date != "4.25" && date != "5.1" && date != "6.2" && date != "8.15" && date != "11.1" && date != "12.8" && date != "12.25" && date != "12.26" && day == 6) {
                            var start_ts = new Date(today.getFullYear(), today.getMonth(), i).getTime() + 7 * 60 * 60 * 1000;
                            //var end_ts = start_ts + (end - start + 1) * 60 * 60 * 1000; // da scommentare nel caso serva anche l'ora successiva a quella attuale;
                            var end_ts = start_ts + (23 - 7) * 60 * 60 * 1000;
                            query += "(SELECT -1*" + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts + "' AND timestamp < '" + end_ts + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1) UNION ALL ";
                            query += "(SELECT " + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts + "' AND timestamp < '" + end_ts + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1) ";
                        } else {
                            flag = false;
                        }
                    } else if (slot == "F3") {
                        if (date != "1.1" && date != "1.6" && date != easterMon && date != "4.25" && date != "5.1" && date != "6.2" && date != "8.15" && date != "11.1" && date != "12.8" && date != "12.25" && date != "12.26" && day != 0) {
                            var start_ts_1 = new Date(today.getFullYear(), today.getMonth(), i).getTime();
                            var end_ts_1 = start_ts_1 + 7 * 60 * 60 * 1000;
                            var start_ts_2 = new Date(today.getFullYear(), today.getMonth(), i).getTime() + 23 * 60 * 60 * 1000;
                            var end_ts_2 = start_ts_2 + (24 - 23) * 60 * 60 * 1000;
                            query += "(SELECT -1*" + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts_1 + "' AND timestamp < '" + end_ts_1 + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1) UNION ALL ";
                            query += "(SELECT " + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts_1 + "' AND timestamp < '" + end_ts_1 + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1) UNION ALL ";
                            query += "(SELECT -1*" + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts_2 + "' AND timestamp < '" + end_ts_2 + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1) UNION ALL ";
                            query += "(SELECT " + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts_2 + "' AND timestamp < '" + end_ts_2 + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1) ";

                        } else if (date == "1.1" || date == "1.6" || date == easterMon || date == "4.25" || date == "5.1" || date == "6.2" || date == "8.15" || date == "11.1" || date == "12.8" || date == "12.25" || date == "12.26" || day == 0) {
                            var start_ts = new Date(today.getFullYear(), today.getMonth(), i).getTime();
                            //var end_ts = start_ts + (end - start + 1) * 60 * 60 * 1000; // da scommentare nel caso serva anche l'ora successiva a quella attuale;
                            var end_ts = start_ts + 24 * 60 * 60 * 1000;
                            query += "(SELECT -1*" + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts + "' AND timestamp < '" + end_ts + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` ASC LIMIT 1) UNION ALL ";
                            query += "(SELECT " + energyProperty + " AS energy FROM `Logs`.`" + elem + "` WHERE (timestamp >= '" + start_ts + "' AND timestamp < '" + end_ts + "' AND " + energyProperty + " IS NOT NULL) ORDER BY `timestamp` DESC LIMIT 1) ";
                        } else {
                            flag = false;
                        }
                    }
                    if (index == ref_array.length - 1 && i == today.getDate()) {
                        query += " ) as result";
                        //console.log("query: ",query);

                        /*socket_client.on("get_select_data_from_cloud", function (data) {
                         //console.log("Abbiamo ricevuto questi dati: ", data);
                         if (data.to == logicName && data.query == query) {
                         result = data.result;
                         callback(result);
                         socket_client.off("get_select_data_from_cloud");
                         }
                         });*/
                        //console.log("**************sto per inviare la query da timeslot*******");
                        //console.log();
                        //console.log("slot: ", slot," selector: ",selector,"query: ",query);
                        socketServer.emit("send_to_cloud_service", {
                            service: "log",
                            message: "exec_select_from_gateway",
                            data: {
                                query: query,
                                logicName: logicName,
                                objectId: ref_array,
                                additional: {
                                    type: slot,
                                    selector: selector
                                }
                            }
                        });


                    } else if (flag) {
                        query += "UNION ALL "
                    }
                }


            });

        });
    };

    var interval = setInterval(function () {

        database.collection("Objects").findOne({objectId: "_TMP_"}, function (err, result) {
                if (err) {
                    console.log("Error while getting the report app");
                } else if (result) {
                    console.log("report app found");
                    console.log("tipo di intervento: ", result.db.type);
                    var keys = Object.keys(result.db.energyCounters);
                    var aux = [];
                    for (var q in keys) {
                        if (typeof result.db.energyCounters[keys[q]] !== "undefined" && result.db.energyCounters[keys[q]] != null && result.db.energyCounters[keys[q]].length > 0) {
                            //result.db.energyCounters.splice(q,1);
                            aux.push(keys[q]);
                            //q--;
                        }
                    }
                    aux.forEach(function (j, index0, ref_array_0) {
                        console.log("tipo di vettore: ", j);

                        /*if (j=="consumed" && result.db.energyCounters[j].length){
                         var slots=Object.keys(result.db.amount);
                         for (var k =0; k<slots.length;k++) {
                         var slot = slots[k].split("-");
                         timeSlot(result.db.energyCounters[j], Number(slot[0]), Number(slot[1]), database, function (res) {
                         energySlots[k]=res;
                         amounts[k]=res*result.db.amount[slots[k]];

                         });
                         }
                         }*/

                        monthSearch(result.db.energyCounters[j], j, previous_startMonth_ts, previous_endMonth_ts, database, 0);

                        monthSearch(result.db.energyCounters[j], j, previous_endMonth_ts, today_ts, database, 1);


                        var length = Object.keys(result.db.amount).length;
                        if (length == 2) {
                            timeSlot(result.db.energyCounters["consumed"], new Date(today.getFullYear(), today.getMonth(), 0), "F1", database, 0);
                            timeSlot(result.db.energyCounters["consumed"], today, "F1", database, 1);
                            timeSlot(result.db.energyCounters["consumed"], new Date(today.getFullYear(), today.getMonth(), 0), "F23", database, 0);
                            timeSlot(result.db.energyCounters["consumed"], today, "F23", database, 1);


                        } else if (length == 3) {
                            timeSlot(result.db.energyCounters["consumed"], new Date(today.getFullYear(), today.getMonth(), 0), "F1", database, 0);
                            timeSlot(result.db.energyCounters["consumed"], today, "F1", database, 1);
                            timeSlot(result.db.energyCounters["consumed"], new Date(today.getFullYear(), today.getMonth(), 0), "F2", database, 0);
                            timeSlot(result.db.energyCounters["consumed"], today, "F2", database, 1);
                            timeSlot(result.db.energyCounters["consumed"], new Date(today.getFullYear(), today.getMonth(), 0), "F3", database, 0);
                            timeSlot(result.db.energyCounters["consumed"], today, "F3", database, 1);
                        }

                    });
                }
            }
        );
    }, 20000);

    var controllo = function () {
        if (typeof json != "undefined") {
            //console.log("controllo");
            //console.log("json.current: ", json.current);
            //console.log("json.previous: ", json.previous);
            var flag = true;
            var keyPrevious = Object.keys(json.previous);
            var keyCurrent = Object.keys(json.current);
            for (var i = 0; flag && i < keyPrevious.length; i++) {
                if (json.previous[keyPrevious[i]] === null) {
                    flag = false;
                }
            }
            for (var i = 0; flag && i < keyCurrent.length; i++) {
                if (json.current[keyCurrent[i]] === null) {
                    flag = false;
                }
            }
            if (flag) {
                //console.log("entro nella fase di scrittura");
                //json.previous.consumed.toFixed(2);
                var prevMonth = today.getMonth();
                if (prevMonth == 0) {
                    prevMonth = 12;
                }

                var consume_exp = [[], []];
                var production_exp = [];
                var consume_refs = [[], []];
                var slotConsume = [[], []];
                var slotAmounts = [[], []];

                var length = Object.keys(json.amount).length;
                /// da modificare perché si dovranno inserire le fasce per i riferimenti
                if (length == 1) {
                    slotConsume[0][0] = (json.previous.consumed / 1000).toFixed(2);
                    slotConsume[1][0] = (json.current.consumed / 1000).toFixed(2);

                    slotAmounts[0][0] = (json.previous.consumed / 1000 * Number(json.amount.F0)).toFixed(2);
                    slotAmounts[1][0] = (json.current.consumed / 1000 * Number(json.amount.F0)).toFixed(2);

                } else if (length == 2) {
                    slotConsume[0][0] = (json.previous.F1 / 1000).toFixed(2);
                    slotConsume[0][1] = (json.previous.F23 / 1000).toFixed(2);
                    slotConsume[1][0] = (json.current.F1 / 1000).toFixed(2);
                    slotConsume[1][1] = (json.current.F23 / 1000).toFixed(2);

                    slotAmounts[0][0] = (json.previous.F1 / 1000 * Number(json.amount.F1)).toFixed(2);
                    slotAmounts[0][1] = (json.previous.F23 / 1000 * Number(json.amount.F23)).toFixed(2);
                    slotAmounts[1][0] = (json.current.F1 / 1000 * Number(json.amount.F1)).toFixed(2);
                    slotAmounts[1][1] = (json.current.F23 / 1000 * Number(json.amount.F23)).toFixed(2);
                } else if (length == 3) {
                    slotConsume[0][0] = (json.previous.F1 / 1000).toFixed(2);
                    slotConsume[0][1] = (json.previous.F2 / 1000).toFixed(2);
                    slotConsume[0][2] = (json.previous.F3 / 1000).toFixed(2);
                    slotConsume[1][0] = (json.current.F1 / 1000).toFixed(2);
                    slotConsume[1][1] = (json.current.F2 / 1000).toFixed(2);
                    slotConsume[1][2] = (json.current.F3 / 1000).toFixed(2);

                    slotAmounts[0][0] = (json.previous.F1 / 1000 * Number(json.amount.F1)).toFixed(2);
                    slotAmounts[0][1] = (json.previous.F2 / 1000 * Number(json.amount.F2)).toFixed(2);
                    slotAmounts[0][2] = (json.previous.F3 / 1000 * Number(json.amount.F3)).toFixed(2);
                    slotAmounts[1][0] = (json.current.F1 / 1000 * Number(json.amount.F1)).toFixed(2);
                    slotAmounts[1][1] = (json.current.F2 / 1000 * Number(json.amount.F2)).toFixed(2);
                    slotAmounts[1][2] = (json.current.F3 / 1000 * Number(json.amount.F3)).toFixed(2);
                }
                json.refs.consume.forEach(function (elem) {
                        //consume_refs[mese][Fascia] Mese:0 precedente, 1 corrente;
                        if (elem.month == String(prevMonth)) {
                            if (length == 1) {
                                consume_refs[0][0] = elem.energy;
                            } else if (length == 2) {
                                if (elem.slot == "F1") {
                                    consume_refs[0][0] = elem.energy;

                                } else if (elem.slot == "F23") {
                                    consume_refs[0][1] = elem.energy;
                                }
                            } else if (length == 3) {
                                if (elem.slot == "F1") {
                                    consume_refs[0][0] = elem.energy;

                                } else if (elem.slot == "F2") {
                                    consume_refs[0][1] = elem.energy;
                                } else if (elem.slot == "F3") {
                                    consume_refs[0][2] = elem.energy;
                                }
                            }


                        } else if (elem.month == String(today.getMonth() + 1)) {
                            if (length == 1) {
                                consume_refs[1][0] = elem.energy;
                            } else if (length == 2) {
                                if (elem.slot == "F1") {
                                    consume_refs[1][0] = elem.energy;

                                } else if (elem.slot == "F23") {
                                    consume_refs[1][1] = elem.energy;
                                }
                            } else if (length == 3) {
                                if (elem.slot == "F1") {
                                    consume_refs[1][0] = elem.energy;

                                } else if (elem.slot == "F2") {
                                    consume_refs[1][1] = elem.energy;
                                } else if (elem.slot == "F3") {
                                    consume_refs[1][2] = elem.energy;
                                }
                            }
                        }
                    }
                );


                var keys = Object.keys(json.expect);
                for (var k in keys) {
                    json.expect[keys[k]].forEach(function (elem) {
                        if (elem.month == String(prevMonth)) {
                            if (keys[k] == "consume") {
                                if (length == 1) {
                                    consume_exp[0][0] = elem.energy;
                                } else if (length == 2) {
                                    if (elem.slot == "F1") {
                                        consume_exp[0][0] = elem.energy;

                                    } else if (elem.slot == "F23") {
                                        consume_exp[0][1] = elem.energy;
                                    }
                                } else if (length == 3) {
                                    if (elem.slot == "F1") {
                                        consume_exp[0][0] = elem.energy;

                                    } else if (elem.slot == "F2") {
                                        consume_exp[0][1] = elem.energy;
                                    } else if (elem.slot == "F3") {
                                        consume_exp[0][2] = elem.energy;
                                    }
                                }
                            } else if (keys[k] == "production" && json.type == "VAZ") {
                                production_exp[0] = elem.energy;
                            }
                        } else if (elem.month == String(today.getMonth() + 1)) {
                            if (keys[k] == "consume") {
                                if (length == 1) {
                                    consume_exp[1][0] = elem.energy;
                                } else if (length == 2) {
                                    if (elem.slot == "F1") {
                                        consume_exp[1][0] = elem.energy;
                                    } else if (elem.slot == "F23") {
                                        consume_exp[1][1] = elem.energy;
                                    }
                                } else if (length == 3) {
                                    if (elem.slot == "F1") {
                                        consume_exp[1][0] = elem.energy;
                                    } else if (elem.slot == "F2") {
                                        consume_exp[1][1] = elem.energy;
                                    } else if (elem.slot == "F3") {
                                        consume_exp[1][2] = elem.energy;
                                    }
                                }
                            } else if (keys[k] == "production" && json.type == "VAZ") {
                                production_exp[1] = elem.energy;
                            }
                        }
                    });
                }

                json.current.consumed /= 1000;
                //json.current.consumed.toFixed(2);
                json.previous.consumed /= 1000;
                //var compareCons = "[[[";

                //for (var index in consume_refs) {
                //    for (var index1 in consume_refs[index]) {
                //        compareCons += consume_refs[index][index1] + "," + consume_exp[index][index1] + "," + slotConsume[index][index1] + "]";
                //        if (index1 == consume_refs[index].length - 1) {
                //            compareCons += "]"
                //        } else {
                //            compareCons += ",["
                //        }
                //    }
                //    if (index == consume_refs.length - 1) {
                //        compareCons += "]"
                //    } else {
                //        compareCons += ",[["
                //    }
                //}

                var compareCons1 = "[";
                var compareCons2 = "[";
                var compareCons3 = "[";

                for (var index in consume_refs) {
                    for (var index1 in consume_refs[index]) {

                        var aux = "[" + consume_refs[index][index1] + "," + consume_exp[index][index1] + "," + slotConsume[index][index1] + "]";
                        if (index1 == 0) {
                            compareCons1 += aux;
                            if (index != consume_refs.length - 1) {
                                compareCons1 += ",";
                            }
                        } else if (index1 == 1) {
                            compareCons2 += aux;
                            if (index != consume_refs.length - 1) {
                                compareCons2 += ",";
                            }
                        } else if (index1 == 2) {
                            compareCons3 += aux;
                            if (index != consume_refs.length - 1) {
                                compareCons3 += ",";
                            }
                        }
                    }
                    if (index == consume_refs.length - 1 && index1 == consume_refs[index].length - 1) {
                        compareCons1 += "]";
                        compareCons2 += "]";
                        compareCons3 += "]";

                    }
                }
                // console.log("**********************QUI********************");
                // console.log("compareCons: ", compareCons1, compareCons2, compareCons3);
                //var compareCons = "[[" + consume_refs[0].energy + "," + consume_exp[0].energy + "," + json.previous.consumed.toFixed(2) + "],[" + consume_refs[1].energy + "," + consume_exp[1].energy + "," + json.current.consumed.toFixed(2) + "]]";
                if (compareCons1 != "[]") {
                    logic.setProperty("_TMP_", "compareCons1", compareCons1, true, false);
                }
                if (compareCons2 != "[]") {
                    logic.setProperty("_TMP_", "compareCons2", compareCons2, true, false);
                }
                if (compareCons3 != "[]") {
                    logic.setProperty("_TMP_", "compareCons3", compareCons3, true, false);
                }
                if (json.type == "VAZ") {
                    if (json.current.hasOwnProperty("input")) {
                        json.current.input /= 1000;
                        //json.current.input.toFixed(2);

                        json.current.autoConsumed = json.current.produced - json.current.input;
                        json.previous.input /= 1000;
                        json.previous.autoConsumed = json.previous.produced - json.previous.input;
                        //json.previous.input.toFixed(2);
                    }
                    if (json.current.hasOwnProperty("produced")) {

                        json.current.produced /= 1000;
                        //json.current.produced.toFixed(2);
                        json.previous.produced /= 1000;
                        //json.previous.produced.toFixed(2);
                        var compareProd = "[[" + production_exp[0] + "," + json.previous.produced + "],[" + production_exp[1] + "," + json.current.produced + "]]";
                        // console.log("compareProd: ", compareProd);

                        logic.setProperty("_TMP_", "compareProd", compareProd, true, false);
                    }
                    logic.setProperty("_TMP_", "eneProdNew", json.current.produced != null ? json.current.produced.toFixed(2) : "0", true, false);
                    logic.setProperty("_TMP_", "eneProdOld", json.previous.produced != null ? json.previous.produced.toFixed(2) : "0", true, false);
                    logic.setProperty("_TMP_", "eneAuto", json.current.autoConsumed != null ? json.current.autoConsumed.toFixed(2) : "0", true, false);
                }
                /*var amountsString = "[";
                 var previousSlotString = "[";
                 var previousAmountsString = "[";
                 for (var q in energySlots) {
                 slotString += energySlots[q];
                 amountsString += amounts[q];
                 previousSlotString += String(previousEnergySlots[q]);
                 previousAmountsString += String(previousAmounts[q]);
                 if (q == energySlots.length - 1) {
                 previousSlotString += "]";
                 previousAmountsString += "]";
                 slotString += "]";
                 amountsString += "]";
                 } else {
                 previousSlotString += ",";
                 previousAmountsString += ",";
                 slotString += ",";
                 amountsString += ",";
                 }
                 }*/

                logic.setProperty("_TMP_", "eneConsOld", json.previous.consumed.toFixed(2), true, false);
                logic.setProperty("_TMP_", "eneConsNew", json.current.consumed.toFixed(2), true, false);
                logic.setProperty("_TMP_", "eneSlots", JSON.stringify(slotConsume[1]));
                // console.log("Ripatizione consumi: ", slotConsume[1]);

                var jsonConsume = {
                    "month": String(prevMonth),
                    "year": String(prevMonth == 12 ? today.getFullYear() - 1 : today.getFullYear()),
                    "energy": json.previous.consumed.toFixed(2)
                };
                var jsonSlots = {
                    "month": String(prevMonth),
                    "year": String(prevMonth == 12 ? today.getFullYear() - 1 : today.getFullYear()),
                    "energy": slotConsume[0],
                    "amounts": slotAmounts[0]
                }
                var flagConsume = false;
                if (Number(jsonConsume.energy) != 0) {
                    flagConsume = true;
                }

                if (flagConsume) {
                    database.collection("Objects").update({"objectId": "_TMP_"}, {"$addToSet": {"db.actual.consume": jsonConsume}}, function (err, res) {
                        // console.log(res)
                    });
                    database.collection("Objects").update({"objectId": "_TMP_"}, {"$addToSet": {"db.actual.slots": jsonSlots}}, function (err, res) {
                        // console.log(res)
                    });
                }
                if (json.type == "VAZ" && json.current.hasOwnProperty("produced")) {

                    var jsonProduce = {
                        "month": String(prevMonth),
                        "year": String(prevMonth == 12 ? today.getFullYear() - 1 : today.getFullYear()),
                        "energy": json.previous.produced.toFixed(2)
                    };
                    var jsonAutoconsume = {
                        "month": String(prevMonth),
                        "year": String(prevMonth == 12 ? today.getFullYear() - 1 : today.getFullYear()),
                        "energy": json.previous.autoConsumed.toFixed(2)
                    };
                    console.log();
                    console.log("i dati per il report_TMP_ sono i seguenti");
                    console.log("****");
                    console.log("json.current: ",json.current);
                    console.log("json.current: ",json.previous);
                    console.log("****");
                    console.log();

                    var flagProduce = false;
                    if (Number(jsonConsume.energy) != 0) {
                        flagProduce = true;
                    }
                    if (flagProduce) {
                        database.collection("Objects").update({"objectId": "_TMP_"}, {"$addToSet": {"db.actual.production": jsonProduce}}, function (err, res) {
                            // console.log(res)
                        });
                        database.collection("Objects").update({"objectId": "_TMP_"}, {"$addToSet": {"db.actual.autoconsume": jsonAutoconsume}}, function (err, res) {
                            // console.log(res)
                        });
                    }
                }


                /*console.log("consumed_tot: ", consumed_tot);
                 console.log("produced_tot: ", produced_tot);
                 console.log("input_tot: ", input_tot);
                 console.log("previous_input_tot: ", previous_input_tot);
                 console.log("previous_consumed_tot: ", previous_consumed_tot);
                 console.log("previous_produced_tot: ", previous_produced_tot);
                 console.log("autoConsumed: ", autoConsumed);
                 console.log("finito di interrogare SQL");*/
                ////REINIZIALIZZO VARIABILI E STRUTTURA
                today = new Date();
                today_ts = new Date().getTime();
                previous_startMonth_ts = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();
                previous_endMonth_ts = new Date(today.getFullYear(), today.getMonth(), 1).getTime();

                database.collection("Objects").findOne({objectId: "_TMP_"}, function (err, result) {
                    if (err) {
                        // console.log("Error while getting the report app");
                    } else if (result) {
                        json = {};
                        json = result.db;
                        json.current = {};
                        json.previous = {};
                        json.current.consumed = null;
                        json.previous.consumed = null;


                        // console.log("report app found");
                        // console.log("tipo di intervento: ", result.db.type);
                        if (result.db.type == "VAZ") {
                            var keys = Object.keys(result.db.energyCounters);
                            if (typeof result.db.energyCounters["produced"] !== "undefined" && result.db.energyCounters["produced"] != null && result.db.energyCounters["produced"].length > 0) {
                                json.current.produced = null;
                                json.previous.produced = null;

                            }
                            if (typeof result.db.energyCounters["input"] !== "undefined" && result.db.energyCounters["input"] != null && result.db.energyCounters["input"].length > 0) {
                                json.current.input = null;
                                json.previous.input = null;

                            }
                        }
                        var length = Object.keys(result.db.amount).length;
                        if (length == 2) {
                            json.current.F1 = null;
                            json.previous.F1 = null;
                            json.current.F23 = null;
                            json.previous.F23 = null;

                        } else if (length == 3) {
                            json.current.F1 = null;
                            json.previous.F1 = null;
                            json.current.F2 = null;
                            json.previous.F2 = null;
                            json.current.F3 = null;
                            json.previous.F3 = null;

                        }
                    }
                });

            }
        }
    }
    setInterval(controllo, 5000);

    var loop = function () {

    };
    return loop;
};