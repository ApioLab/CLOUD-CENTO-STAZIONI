"use strict";
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var request = require("request");
var fs = require("fs-extra");

// var os = require("os");
// console.log("OS: ",os.hostname());
// console.log("OS2: ",os.networkInterfaces());


var storeUrl = "http://store.apio.cloud";
var MongoClient = require("mongodb");
var MongoClient = MongoClient.MongoClient;
var mongoDBCloud = undefined;

app.use(bodyParser.json({
    limit: "50mb"
}));

app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: true
}));


var http = require("http").Server(app);
var socketServer = require("socket.io")(http);

var boardsConnected = {};
var storeSocketId;
var port = 8088;
var delete_temp = function(data) {
    console.log("inizio procedura di eliminazione");
    var numberOfKeys = 0;
    var json ={}
    var search = function (obj, json, callback) {
        numberOfKeys += Object.keys(obj).length;
        for (var k in obj) {
            if (typeof obj[k] == "object" && obj[k] !== null) {
                search(obj[k], json, callback);
            } else if (typeof obj[k] == "string" && obj[k].indexOf("http://") > -1) {
                json[obj[k]] = "";
            }
            numberOfKeys--;
            // console.log("num",numberOfKeys);
        }

        if (numberOfKeys === 0) {
            // console.log("--------------------");
            // console.log("FINE");
            // console.log("--------------------");
            callback(obj, json);
        }
    };
    search(data,json,function(data,json){
        if (Object.keys(json)!=0) {
            console.log("aspetto 120 secondi per eliminare...");
            setTimeout(function () {
                console.log("elimino");
                Object.keys(json).forEach(function (link) {
                    fs.unlinkSync("../public/store_temp/" + link.split("/")[link.split("/").length - 1]);
                });
            }, 120000);
        } else {
            console.log("nulla da eliminare");
        }
    });


}

var proxy_links = function (data, callback) {
    var json = {};
    var numberOfKeys = 0;
    var search = function (obj, json, callback) {
        numberOfKeys += Object.keys(obj).length;
        for (var k in obj) {
            if (typeof obj[k] == "object" && obj[k] !== null) {
                search(obj[k], json,callback);
            } else if (typeof obj[k] == "string" && obj[k].indexOf("http://store") > -1) {
                json[obj[k]] = "";
            }

            numberOfKeys--;
        }

        if (numberOfKeys === 0) {
            // console.log("--------------------");
            // console.log("FINE");
            // console.log("--------------------");
            callback(obj, json);
        }
    };

    var exec = function (data, json, callback) {
        fs.stat(__dirname + "/../public/store_temp", function (err, stats) {
            if (err) {
                fs.mkdirSync(__dirname + "/../public/store_temp");
            }
            var length = Object.keys(json).length;
            var index0 = 0;
            Object.keys(json).forEach(function (elem) {
                request.get(elem).on('response', function (res) {
                    var list = elem.split("/");
                    var index1;
                    for (var index = 0; index < list.length; index++) {
                        if (list[index].indexOf("root") > -1) {
                            index1 = index + 1;
                        }
                    }
                    var filename = new Date().getTime() + "_" + list[index1] + "_" + (list[list.length - 1].indexOf("?") ? list[list.length - 1].split("?")[0] :list[list.length - 1]);
                    console.log("filename: ", filename);
                    // create file write stream
                    var name = "../public/store_temp/" + filename;
                    var fws = fs.createWriteStream(name);
                    res.pipe(fws);
                    res.on('end', function () {
                        console.log('Done downloading!');
                        ///da usare il configuration
                        json[elem] = "http://dev.apio.cloud/store_temp/" + filename;
                        index0++;
                        // console.log(index0, " ", length);
                        if (index0 == length) {
                            callback(data, json);
                        }
                    });
                });
            });
        });
    };
    var numberOfKeys1 = 0;
    var compose = function (obj, json, callback) {
        numberOfKeys1 += Object.keys(obj).length;
        for (var k in obj) {
            if (typeof obj[k] == "object" && obj[k] !== null) {
                compose(obj[k], json, callback);
            } else if (typeof obj[k] == "string" && obj[k].indexOf("http") > -1) {
                for (var store in json) {
                    if (store == obj[k]) {
                        obj[k] = json[store];
                    }
                }
            }
            numberOfKeys1--;
        }
        if (numberOfKeys1 === 0) {
            callback(data);
        }
    };

    search(data, json, function (data, json) {
        if (Object.keys(json)!=0) {
            exec(data, json, function (data, json) {
                compose(data, json, function (data) {
                    callback(data);
                });
            })
        } else {
            callback(data);
        }
    });
};

socketServer.on("connection", function (socket) {
    socket.on("disconnect", function () {
        var keys = Object.keys(boardsConnected);
        for (var k = 0, found = false; !found && k < keys.length; k++) {
            if (boardsConnected[keys[k]].socket.id === socket.id) {
                found = true;
                delete boardsConnected[keys[k]];
            }
        }
    });


    if (socket.handshake.query.hasOwnProperty("associate")) {
        if (socket.handshake.query.associate == "STORE") {
            storeSocketId = socket;
            MongoClient.connect("mongodb://127.0.0.1:27017/apio", function (error, db) {
                if (error) {
                    console.log("Unable to connect to: mongodb://127.0.0.1:27017/apio", error);
                } else if (db) {
                    mongoDBCloud = db;
                    console.log("Connected to: mongodb://127.0.0.1:27017/apio");
                    // console.log("DB", db);
                    storeSocketId.on("queryMongo", function (data) {
                        console.log("la query è ", data);
                        mongoDBCloud.collection(data.collection).findOne(data.query, function (err, result) {
                            if (err) {
                                console.log("error while searching: ", err);
                                storeSocketId.emit("responseMongo", {err: err, apioId: data.apioId});
                            } else if (result) {
                                // console.log("il risultato della ricerca è ", result);
                                storeSocketId.emit("responseMongo", {result: result, apioId: data.apioId});
                            } else {
                                storeSocketId.emit("responseMongo", {result: null, apioId: data.apioId});
                            }
                        });
                    });
                }
            });
        } else {
            console.log("Connessa una board")
            console.log(socket.handshake.query)
            var now = new Date().getTime();
            boardsConnected[socket.handshake.query.associate] = {
                socket: socket,
                timestamp: now
            };
        }
    }

    socket.on("store_to_gateway", function (data) {
        if (socket.handshake.query.hasOwnProperty("associate")) {
            if (socket.handshake.query.associate == "STORE") { // Un giorno si può anche fare il filtro per gli IP
                console.log("Faccio l'emit alla board connessa");
                //console.log(data);
                //console.log(boardsConnected);
                //inserire un controllo sulle board connesse: è online quella a cui si fa l'emit?
                // console.log("data.apioId",data.apioId);
                if (boardsConnected.hasOwnProperty(data.apioId)) {
                    console.log("invio");
                    //console.log(boardsConnected);
                    var apioId = data.apioId;
                    var message = data.message;
                    delete data.message;
                    delete data.apioId;
                    proxy_links(data, function (data) {
                        boardsConnected[apioId].socket.emit(message, data);
                        if (message =="downloadApp"){
                            boardsConnected[apioId].socket.emit("complete_downloadApp", data);
                        }
                        delete_temp(data);
                    });


                }
            }
        }

    });

    // socket.on("delete_temp",function(data){
    //     //aggiungere controllo se board connessa
    //     console.log("arriva da eliminare: ",data.name)
    //     if( typeof data.name == "object"){
    //         data.name.forEach(function(screen){
    //             fs.unlinkSync("../public/store_temp/" + screen);
    //         })
    //     } else {
    //         fs.unlinkSync("../public/store_temp/" + data.name);
    //     }
    // });


    socket.on("send_to_store", function (data) {
        //aggiungere controllo se board connessa
        console.log("arriva socket da gateway");
        var options = {
            body: data.body,
            json: true,
            url: storeUrl + "/" + data.url,
            method: "POST"
        };

        request(options, function (err, res, body) {
            if (err) {
                console.log('error posting json', err);
            } else if (res) {
                console.log("store response", body);
            }
        })
    });


});

app.get('/', function (req, res) {
    res.send(req.hostname);
});

http.listen(port, function () {
    console.log("APIO Store service correctly started on port 8088");
});