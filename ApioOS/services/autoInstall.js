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
module.exports = function (libraries) {
    var Apio = require("../apio.js")();
    var MongoClient = require("mongodb").MongoClient;
    var bodyParser = libraries["body-parser"];
    var express = libraries.express;
    var fs = libraries.fs;
    var mysql = libraries.mysql;
    var request = libraries.request;
    var querystring = require("querystring");


    var app = express();
    var http = libraries.http.Server(app);
    var socketServer = libraries["socket.io"](http);

    app.use(bodyParser.json({
        limit: "50mb"
    }));

    app.use(bodyParser.urlencoded({
        limit: "50mb",
        extended: true
    }));

    process.on("SIGINT", function () {
        console.log("About to exit");
        Apio.Database.db.close();
        process.exit();
    });

    var port = 8101;

    if (process.argv.indexOf("--http-port") > -1) {
        port = Number(process.argv[process.argv.indexOf("--http-port") + 1]);
    }

    var socketStore_Service = require("socket.io-client")(Apio.Configuration.remote.uri+":8088", {query: querystring.stringify({associate: Apio.System.getApioIdentifier()})});

    MongoClient.connect("mongodb://" + Apio.Configuration.database.hostname + ":" + Apio.Configuration.database.port + "/" + Apio.Configuration.database.database, function (error, db) {
        if (error) {
            console.log("Unable to get database");
        } else if (db) {
            db.collection("Services").findOne({name: "autoInstall"}, function (err, service) {
                if (err) {
                    console.log("Error while getting service autoInstall: ", err);
                    console.log("Unable to find service autoInstall");
                    db.collection("Services").insert({
                        name: "autoInstall",
                        show: "AutoInstall",
                        url: "https://github.com/ApioLab/Apio-Services",
                        username: "",
                        password: "",
                        port: String(port)
                    }, function (err) {
                        if (err) {
                            console.log("Error while creating service Notification on DB: ", err);
                        } else {
                            console.log("Service Notification successfully created");
                        }
                    });
                } else if (service) {
                    console.log("Service autoInstll exists");
                } else {
                    console.log("Unable to find service Notification");
                    db.collection("Services").insert({
                        name: "autoInstall",
                        show: "AutoInstall",
                        url: "https://github.com/ApioLab/Apio-Services",
                        username: "",
                        password: "",
                        port: String(port)
                    }, function (err) {
                        if (err) {
                            console.log("Error while creating service Notification on DB: ", err);
                        } else {
                            console.log("Service Notification successfully created");
                        }
                    });
                }
            });
            console.log("Database correctly initialized");
        }
    });

    Apio.io = libraries["socket.io-client"]("http://localhost:" + Apio.Configuration.http.port, {query: "associate=autoInstall&token=" + Apio.Token.getFromText("autoInstall", fs.readFileSync("./" + Apio.Configuration.type + "_key.apio", "utf8"))});

    app.post("/installNew", function (req, res) {
        console.log("-------------SERVICE AUTOINSTALL ROUTE INSTALLNEW---------");
        if (Apio.Configuration.autoinstall.default == false) {

            Apio.Database.getMaximumObjectId(function (error, data) {
                if (error) {
                    console.log('error: ' + error);
                }
                else if (data) {
                    console.log('data is: ' + data);
                    var dummy = (parseInt(data) + 1).toString();

                    //qui rinomino i cazzetti nell'id attuale

                    var id = '*_TMP_*';
                    var path = 'public/applications/newfile/' + req.body.appId + '/' + id;
                    //var path = '../public/applications/newfile/' + req.body.appId + '/' + id;
                    var object = {};
                    var jsonObject = {};
                    if (fs.existsSync(path + '/adapter.js')) {
                        object.adapter = fs.readFileSync(path + '/adapter.js')
                    }
                    object.icon = fs.readFileSync(path + '/icon.png');
                    object.js = fs.readFileSync(path + '/' + id + '.js', {encoding: 'utf8'});
                    object.html = fs.readFileSync(path + '/' + id + '.html', {encoding: 'utf8'});
                    //object.json = fs.readFileSync(path+'.json', {encoding: 'utf8'});
                    object.mongo = fs.readFileSync(path + '/' + id + '.mongo', {encoding: 'utf8'});
                    console.log("percorso: ", path + '/' + id + '.mongo');
                    jsonObject = JSON.parse(object.mongo);
                    console.log("JSONOBJECT", jsonObject)
                    if (jsonObject.hasOwnProperty('subapps')) {
                        if (jsonObject.subapps.hasOwnProperty('log')) {
                            object.subapps = {
                                log: {}
                            };
                            console.log("primoIF")
                            object.subapps.log.html = fs.readFileSync(path + '/subapps/log.html', {encoding: 'utf8'});
                            object.subapps.log.js = fs.readFileSync(path + '/subapps/log.js', {encoding: 'utf8'});
                        }
                    }


                    path = path + '/_' + id;
                    object.ino = fs.readFileSync(path + '/_' + id + '.ino', {encoding: 'utf8'});
                    object.makefile = fs.readFileSync(path + '/Makefile', {encoding: 'utf8'});
                    var numberName = ""
                    //jsonObject = JSON.parse(object.json);

                    console.log(jsonObject._id);
                    jsonObject._id = "";
                    //Per contare i numeri
                    jsonObject.type = req.body.appId;
                    Apio.Database.db.collection('Objects').find({appId: req.body.appId}).toArray(function (err, result) {
                        if (err) {
                            console.log("Error")
                        } else {

                            var dummy = (parseInt(data) + 1).toString();
                            console.log('new dummy is: ' + dummy)


                            object.js = object.js.replace('ApioApplication' + id, 'ApioApplication' + dummy + '');
                            object.js = object.js.replace('ApioApplication' + id, 'ApioApplication' + dummy + '');
                            object.js = object.js.replace('ApioApplication' + id, 'ApioApplication' + dummy + '');

                            object.html = object.html.replace('ApioApplication' + id, 'ApioApplication' + dummy + '');
                            object.html = object.html.replace('ApioApplication' + id, 'ApioApplication' + dummy + '');
                            object.html = object.html.replace('applications/' + id + '/' + id + '.js', 'applications/' + dummy + '/' + dummy + '.js');
                            if (object.hasOwnProperty('subapps')) {
                                if (object.subapps.hasOwnProperty('log')) {
                                    object.subapps.log.html = object.subapps.log.html.replace(id, dummy);
                                }
                            }


                            //object.json=object.json.replace('"objectId":"'+id+'"','"objectId":"'+dummy+'"');
                            //object.mongo=object.mongo.replace('"objectId":"'+id+'"','"objectId":"'+dummy+'"')
                            object.mongo = JSON.parse(object.mongo);
                            console.log('"objectId before":"' + object.mongo.objectId + '"')
                            object.mongo.objectId = dummy;
                            console.log("Result: ");
                            console.log(result.length.toString())
                            console.log('object.mongo.name prima: ' + object.mongo.name);

                            object.mongo.name = req.body.appId + " " + parseInt(result.length + 1).toString();

                            console.log('object.mongo.name dopo: ' + object.mongo.name);

                            var date = new Date();
                            var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
                            var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
                            var year = date.getFullYear() < 10 ? "0" + date.getFullYear() : date.getFullYear();

                            object.mongo.address = dummy;
                            var theAddress = dummy;
                            object.mongo.type = "object";
                            object.mongo.installation = "autoinstalled";
                            object.mongo.created = year + "-" + month + "-" + day;
                            object.mongo.data = req.body.data
                            if (req.hasOwnProperty('session')) {
                                if (req.session.hasOwnProperty('email')) object.mongo.user = [{email: req.session.email}];
                            }

                            object.mongo.appId = req.body.appId;
                            object.mongo.user = [{email: "admin"}]
                            //object.mongo.user.push("admin")
                            object.mongo.apioId = Apio.System.getApioIdentifier();
                            delete object.mongo._id;
                            console.log('"objectId after":"' + object.mongo.objectId + '"')


                            Apio.Database.db.collection('Objects').insert(object.mongo, function (err, data) {
                                if (err)
                                    console.log(err);
                                else {
                                    //var path = '../public/applications/';
                                    var path = 'public/applications/';
                                    console.log('path + dummy:' + path + dummy);

                                    fs.mkdirSync(path + '/' + dummy);
                                    fs.mkdirSync(path + '/' + dummy + '/_' + dummy);
                                    fs.mkdirSync(path + '/' + dummy + '/subapps');
                                    if (object.hasOwnProperty('adapter')) {
                                        fs.writeFileSync(path + '/' + dummy + '/adapter.js', object.adapter);
                                    }
                                    fs.writeFileSync(path + '/' + dummy + '/icon.png', object.icon);
                                    fs.writeFileSync(path + '/' + dummy + '/' + dummy + '.html', object.html);
                                    fs.writeFileSync(path + '/' + dummy + '/' + dummy + '.js', object.js);
                                    fs.writeFileSync(path + '/' + dummy + '/' + dummy + '.mongo', JSON.stringify(object.mongo));
                                    fs.writeFileSync(path + '/' + dummy + '/_' + dummy + '/_' + dummy + '.ino', object.ino);
                                    fs.writeFileSync(path + '/' + dummy + '/_' + dummy + '/Makefile', object.makefile);
                                    for (var i in object.subapps) {
                                        fs.writeFileSync(path + '/' + dummy + '/subapps/' + i + ".html", object.subapps[i].html);
                                        fs.writeFileSync(path + '/' + dummy + '/subapps/' + i + ".js", object.subapps[i].js);
                                    }
                                    //fs.writeFileSync(path+'/'+dummy+'/' + dummy + '.json',object.json);
                                    //
                                    //deleteFolderRecursive('newfile');
                                    //fs.unlinkSync('newfile.tar.gz');
                                    var o = {}
                                    o.name = "apio_server_new"
                                    o.data = dummy
                                    Apio.io.emit("socket_service", o);

                                    var cloudNewData = {
                                        apioId: Apio.System.getApioIdentifier(),
                                        html: object.html,
                                        icon: "data:image/png;base64," + fs.readFileSync("public/applications/newfile/" + req.body.appId + "/*_TMP_*/icon.png", {encoding: "base64"}),
                                        ino: object.ino,
                                        js: object.js,
                                        makefile: object.makefile,
                                        mongo: JSON.stringify(object.mongo),
                                        obj: object.mongo
                                    };

                                    if (object.subapps) {
                                        cloudNewData.subapps = {};
                                        for (var i in object.subapps) {
                                            cloudNewData.subapps[i] = {
                                                html: object.subapps[i].html,
                                                js: object.subapps[i].js
                                            };
                                        }
                                    }

                                    if (Apio.Configuration.type === "gateway" && Apio.Configuration.remote.enabled) {
                                        Apio.Remote.socket.emit("apio.create.new.app", cloudNewData);
                                    }
                                    console.log('SET-MESH1');
                                    if (theAddress < 10) {
                                        theAddress = "000" + theAddress + "01";
                                    }
                                    else if (theAddress > 9 && theAddress < 100) {
                                        theAddress = "00" + theAddress + "01";

                                    } else if (theAddress > 99 && theAddress < 1000) {
                                        theAddress = "0" + theAddress + "01";

                                    } else {
                                        theAddress = theAddress + "01";
                                    }

                                    var c = {}
                                    c.name = "apio_serial_send"
                                    c.data = "l9999:setmesh:" + theAddress + "-"
                                    console.log('SET-MESH2', c);
                                    Apio.io.emit("socket_service", c);
                                    console.log('SET-MESH3 LANCIATO SOCKET SERVICE');
                                    res.send({id: dummy});
                                }
                            });

                        }
                    })
                }
            });
        }
    });

    app.post("/store/downloadApp", function (req, res) {
        console.log("sono nella richiesta http");
        socketStore_Service.emit("send_to_store", {
            //da modificare quando sarà usata nell'app
            body: {
                appId: req.body.appId,
                username: req.body.username,
                password: req.body.password,
                apioId: Apio.System.getApioIdentifier(),
                data: req.body.data
            },
            url: "downloadApp"
        });

        req.pause();

        var cb = function (data) {
            console.log("torna la socket di downloadApp ",data);
            if (data.hasOwnProperty("error") || data.hasOwnProperty("errors")) {
                res.status(500).send(data);
                socketStore_Service.removeListener("complete_downloadApp", cb);
            } else {
                res.status(200).send(data);
                socketStore_Service.removeListener("complete_downloadApp", cb);
            }

        }

        req.on("close", function () {
            // socketStore_Service.emit("delete_temp", {
            //     name:req.body.screenshot
            // });
            socketStore_Service.removeListener("complete_downloadApp", cb);
        });

        req.on("end", function () {
            // socketStore_Service.emit("delete_temp", {
            //     name:req.body.screenshot
            // });
            socketStore_Service.removeListener("complete_downloadApp", cb);
        });

        req.on("timeout", function () {
            // socketStore_Service.emit("delete_temp", {
            //     name:req.body.screenshot
            // });
            socketStore_Service.removeListener("complete_downloadApp", cb);
        });

        req.on("error", function () {
            // socketStore_Service.emit("delete_temp", {
            //     name:req.body.screenshot
            // });
            socketStore_Service.removeListener("complete_downloadApp", cb);
        });


        socketStore_Service.on("complete_downloadApp", cb);

    });

    app.get("/store/compatibility/:id", function (req, res) {
        console.log("sono nella richiesta http");
        socketStore_Service.emit("send_to_store", {
            //da modificare quando sarà usata nell'app
            body: {
                apioId: Apio.System.getApioIdentifier()
            },
            url: "compatibility/" + req.params.id
        });

        req.pause();

        var cb = function (data) {
            res.status(200).send(data);
            socketStore_Service.removeListener("compatibility", cb);

        }

        req.on("close", function () {
            socketStore_Service.removeListener("compatibility", cb);
        });

        req.on("end", function () {
            socketStore_Service.removeListener("compatibility", cb);
        });

        req.on("timeout", function () {
            socketStore_Service.removeListener("compatibility", cb);
        });

        req.on("error", function () {
            socketStore_Service.removeListener("compatibility", cb);
        });


        socketStore_Service.on("compatibility", cb);

    });

    app.get("/store/compatibility", function (req, res) {
        console.log("sono nella richiesta http");
        socketStore_Service.emit("send_to_store", {
            //da modificare quando sarà usata nell'app
            body: {
                apioId: Apio.System.getApioIdentifier()
            },
            url: "compatibility"
        });

        req.pause();

        var cb = function (data) {
            res.status(200).send(data);
            socketStore_Service.removeListener("compatibilities", cb);

        }

        req.on("close", function () {
            socketStore_Service.removeListener("compatibilities", cb);
        });

        req.on("end", function () {
            socketStore_Service.removeListener("compatibilities", cb);
        });

        req.on("timeout", function () {
            socketStore_Service.removeListener("compatibilities", cb);
        });

        req.on("error", function () {
            socketStore_Service.removeListener("compatibilities", cb);
        });


        socketStore_Service.on("compatibilities", cb);

    });

    app.get("/store/app", function (req, res) {
        console.log("sono nella richiesta http");
        socketStore_Service.emit("send_to_store", {
            //da modificare quando sarà usata nell'app
            body: {
                apioId: Apio.System.getApioIdentifier()
            },
            url: "app",
        });

        req.pause();

        var cb = function (data) {
            console.log("data", data);
            res.status(200).send(data);
            socketStore_Service.removeListener("app", cb);

        }

        req.on("close", function () {
            socketStore_Service.removeListener("app", cb);
        });

        req.on("end", function () {
            socketStore_Service.removeListener("app", cb);
        });

        req.on("timeout", function () {
            socketStore_Service.removeListener("app", cb);
        });

        req.on("error", function () {
            socketStore_Service.removeListener("app", cb);
        });


        socketStore_Service.on("app", cb);

    });

    app.get("/store/category", function (req, res) {
        console.log("sono nella richiesta http");
        socketStore_Service.emit("send_to_store", {
            body: {
                apioId: Apio.System.getApioIdentifier()
            },
            url: "category"
        });

        req.pause();

        var cb = function (data) {
            console.log("data", data);
            res.status(200).send(data);
            socketStore_Service.removeListener("categories", cb);
        };

        req.on("close", function () {
            socketStore_Service.removeListener("categories", cb);
        });

        req.on("end", function () {
            socketStore_Service.removeListener("categories", cb);
        });

        req.on("timeout", function () {
            socketStore_Service.removeListener("categories", cb);
        });

        req.on("error", function () {
            socketStore_Service.removeListener("categories", cb);
        });

        socketStore_Service.on("categories", cb);
    });

    app.get("/store/category/:id", function (req, res) {
        console.log("sono nella richiesta http");
        socketStore_Service.emit("send_to_store", {
            body: {
                apioId: Apio.System.getApioIdentifier()
            },
            url: "category/" + req.params.id
        });

        req.pause();

        var cb = function (data) {
            console.log("data", data);
            res.status(200).send(data);
            socketStore_Service.removeListener("category", cb);

        }

        req.on("close", function () {
            socketStore_Service.removeListener("category", cb);
        });

        req.on("end", function () {
            socketStore_Service.removeListener("category", cb);
        });

        req.on("timeout", function () {
            socketStore_Service.removeListener("category", cb);
        });

        req.on("error", function () {
            socketStore_Service.removeListener("category", cb);
        });


        socketStore_Service.on("category", cb);

    });


    var log = function (data) {
        console.log(data);
        //socketServer.emit("autoinstall_update", data);
        socketServer.emit("send_to_client", {
            message: "autoinstall_update",
            data: data
        });
    };


    Apio.io.on("apio_autoinstall_service", function (data) {
        //var host = $location.host();
        //log("SONO DENTRO ALL'EVENTO SULLA SOCKET APIO_AUTOINSTALL_SERVICE");
        if (data) {
            var appId = data;
            //log("-------------AUTO-INSTALLAZIONE-----------------");
            Apio.Database.getMaximumObjectId(function (error, objectId) {
                if (error) {
                    //log("error: " + error);
                } else if (objectId) {
                    var flagAddressOk = 0;
                    objectId = Number(objectId) + 1;
                    //log(objectId);
                    Apio.Database.db.collection("Objects").findOne({address: objectId}, function (err, res) {
                        if (res == null) {
                            log("Address OK!")
                            flagAddressOk = 1;
                            var address = objectId;
                            var o = {}
                            o.name = "apio_new_object";
                            o.data = {}
                            o.data.address = address;
                            o.data.appId = appId;
                            //var path = '../public/applications/newfile/' + appId;
                            var path = 'public/applications/newfile/' + appId;
                            console.log('appID', appId)
                            fs.readFile(path + '/autoInstall.html', function (err, result) {
                                if (err) {
                                    console.log("ERRORE")
                                    //o.data.autoInstall = fs.readFileSync('../public/applications/newfile/defaultAutoinstall.html', {encoding: 'utf8');
                                    o.data.autoInstall = "false";
                                    Apio.io.emit("socket_service", o);
                                } else {
                                    o.data.autoInstall = fs.readFileSync(path + '/autoInstall.html', {encoding: 'utf8'});
                                    Apio.io.emit("socket_service", o);
                                }
                            });
                        } else {
                            log("Address Not OK");
                            flagAddressOk = 0;
                        }
                    });
                }
            });
        }
    });

    socketStore_Service.on('connect', function (socket) {
        console.log('Connected!');
    });


    socketServer.on("connection", function (socket) {
        console.log("client connected");
        socket.on("apio_install_new_object_final", function (data) {
            // var finalize = function (data, objectId) {
            //     var baseDir = "";
            //     if (data.hasOwnProperty("path")) {
            //         baseDir = data.path;
            //     } else {
            //         baseDir = "public/applications/newfile/" + data.eep;
            //     }
            //
            //     fs.stat(baseDir, function (err, stats) {
            //         if (err) {
            //             console.log("Does not exist any template for the eep: ", data.eep);
            //         } else if (stats && stats.isDirectory()) {
            //             fs.mkdir("public/applications/" + objectId, function (e_mkdir) {
            //                 if (e_mkdir) {
            //                     console.log("Error while creating directory public/applications/" + objectId + ": ", e_mkdir);
            //                 } else {
            //                     fs.readFile(baseDir + "/application.mongo", "utf8", function (e_f1, collection) {
            //                         if (e_f1) {
            //                             console.log("Error while reading file " + baseDir + "/application.mongo: ", e_f1);
            //                         } else if (collection) {
            //                             collection = JSON.parse(collection);
            //                             collection.objectId = objectId;
            //                             collection.apioId = Apio.System.getApioIdentifier();
            //                             collection.address = data.address;
            //                             collection.user = [];
            //                             var date = new Date();
            //                             var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
            //                             var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
            //                             var year = date.getFullYear() < 10 ? "0" + date.getFullYear() : date.getFullYear();
            //                             collection.created = year + "-" + month + "-" + day;
            //
            //                             if (data.parentAddress) {
            //                                 collection.parentAddress = data.parentAddress;
            //                             }
            //
            //                             if (data.db) {
            //                                 collection.db = data.db;
            //                             }
            //
            //                             Apio.Database.db.collection("Objects").insert(collection, function (err_db) {
            //                                 if (err_db) {
            //                                     console.log("Error while adding object " + objectId + " to the DB: ", err_db);
            //                                 } else {
            //                                     console.log("Object " + objectId + " successfully inserted to the DB");
            //
            //                                     Apio.io.emit("socket_service", {
            //                                         name: "apio_server_new",
            //                                         data: objectId
            //                                     });
            //
            //                                     data.objectId = objectId;
            //                                     data.apioId = Apio.System.getApioIdentifier();
            //                                     socketServer.emit("send_to_cloud_service", {
            //                                         data: data,
            //                                         message: "apio_install_new_object_final_from_gateway",
            //                                         service: "autoInstall"
            //                                     });
            //
            //                                     createMySQLTable(collection);
            //                                 }
            //                             });
            //
            //                             var to_add = {};
            //                             to_add[data.protocol + "." + data.address] = {
            //                                 type: data.eep,
            //                                 objectId: objectId
            //                             };
            //
            //                             for (var prop in collection.properties) {
            //                                 to_add[data.protocol + "." + data.address][prop] = {};
            //                             }
            //
            //                             if (collection.hasOwnProperty("sleepTime") && collection.sleepTime === true) {
            //                                 to_add[data.protocol + "." + data.address].sleep = true;
            //                             }
            //
            //                             Apio.Database.db.collection("Communication").update({name: "addressBindToProperty"}, {$set: to_add}, function (err_comm_updt) {
            //                                 if (err_comm_updt) {
            //                                     console.log("Error while updating communication addressBindToProperty: ", err_comm_updt);
            //                                 } else {
            //                                     console.log("Successfully added data to communication addressBindToProperty");
            //                                     Apio.io.emit("update_collections");
            //                                 }
            //                             });
            //                         }
            //                     });
            //
            //                     fs.readFile(baseDir + "/application.html", "utf8", function (e_f1, htmlFile) {
            //                         if (e_f1) {
            //                             console.log("Error while reading file " + baseDir + "/application.html: ", e_f1);
            //                         } else if (htmlFile) {
            //                             htmlFile = htmlFile.replace(/_TMP_/g, objectId);
            //                             fs.writeFile("public/applications/" + objectId + "/" + objectId + ".html", htmlFile, function (e_w) {
            //                                 if (e_w) {
            //                                     console.log("Error writing file public/applications/" + objectId + ".html: ", e_w);
            //                                 } else {
            //                                     console.log("File public/applications/" + objectId + "/" + objectId + ".html succesfully written");
            //                                 }
            //                             });
            //                         }
            //                     });
            //
            //                     fs.readFile(baseDir + "/application.js", "utf8", function (e_f2, jsFile) {
            //                         if (e_f2) {
            //                             console.log("Error while reading file " + baseDir + "/application.js: ", e_f2);
            //                         } else if (jsFile) {
            //                             jsFile = jsFile.replace(/_TMP_/g, objectId);
            //                             fs.writeFile("public/applications/" + objectId + "/" + objectId + ".js", jsFile, function (e_w) {
            //                                 if (e_w) {
            //                                     console.log("Error writing file public/applications/" + objectId + ".js: ", e_w);
            //                                 } else {
            //                                     console.log("File public/applications/" + objectId + "/" + objectId + ".js succesfully written");
            //                                 }
            //                             });
            //                         }
            //                     });
            //
            //                     fs.readFile(baseDir + "/icon.png", function (e_f2, iconFile) {
            //                         if (e_f2) {
            //                             console.log("Error while reading file " + baseDir + "/icon.png: ", e_f2);
            //                         } else if (iconFile) {
            //                             fs.writeFile("public/applications/" + objectId + "/icon.png", iconFile, function (e_w) {
            //                                 if (e_w) {
            //                                     console.log("Error writing file public/applications/icon.png: ", e_w);
            //                                 } else {
            //                                     console.log("File public/applications/" + objectId + "/icon.png succesfully written");
            //                                 }
            //                             });
            //                         }
            //                     });
            //
            //                     fs.stat(baseDir + "/utils", function (err, stats) {
            //                         if (err) {
            //                             console.log("Folder " + baseDir + "/utils does not exist");
            //                         } else if (stats) {
            //                             fs.readdir(baseDir + "/utils", function (error, utils) {
            //                                 if (error) {
            //                                     console.log("Error while reading the folder " + baseDir + "/utils: ", error);
            //                                 } else if (utils) {
            //                                     fs.mkdir("public/applications/" + objectId + "/utils", function (e_mkdir) {
            //                                         if (e_mkdir) {
            //                                             console.log("Error while creating directory public/applications/" + objectId + "/utils : ", e_mkdir);
            //                                         } else {
            //                                             utils.forEach(function (util) {
            //                                                 fs.readFile(baseDir + "/utils/" + util, "utf8", function (e, content) {
            //                                                     if (e) {
            //                                                         console.log("Error while reading file: ", e);
            //                                                     } else if (content) {
            //                                                         content = content.replace(/_TMP_/g, objectId);
            //                                                         fs.writeFile("public/applications/" + objectId + "/utils/" + util, content, function (e_w) {
            //                                                             if (e_w) {
            //                                                                 console.log("Error writing file public/applications/" + objectId + "/utils/" + util, e_w);
            //                                                             } else {
            //                                                                 console.log("File public/applications/" + objectId + "/utils/" + util + " succesfully written");
            //                                                             }
            //                                                         });
            //                                                     }
            //                                                 });
            //                                             })
            //                                         }
            //                                     })
            //                                 } else {
            //                                     console.log("Utils folder is empty, nothing to copy");
            //                                 }
            //                             });
            //                         } else {
            //                             console.log("Unable to get stats of folder " + baseDir + "/utils");
            //                         }
            //                     });
            //
            //                     fs.stat(baseDir + "/apio_logic", function (err, stats) {
            //                         if (err) {
            //                             console.log("Folder " + baseDir + "/apio_logic does not exist");
            //                         } else if (stats) {
            //                             fs.readdir(baseDir + "/apio_logic", function (error, logics) {
            //                                 if (error) {
            //                                     console.log("Error while reading the folder " + baseDir + "/apio_logic: ", error);
            //                                 } else if (logics) {
            //                                     Apio.Database.db.collection("Services").findOne({name: "logic"}, function (err_service, service) {
            //                                         if (err_service) {
            //                                             console.log("Error while getting service logic: ", err_service);
            //                                         } else if (service) {
            //                                             logics.forEach(function (logic) {
            //                                                 if (logic.indexOf(".js") > -1) {
            //                                                     fs.readFile(baseDir + "/apio_logic/" + logic, "utf8", function (e, content) {
            //                                                         if (e) {
            //                                                             console.log("Error while reading file: ", e);
            //                                                         } else if (content) {
            //                                                             content = content.replace(/_TMP_/g, objectId);
            //                                                             request.post("http://localhost:" + service.port + "/apio/logic/newFile", {
            //                                                                 json: true,
            //                                                                 body: {
            //                                                                     newName: objectId + "_" + logic,
            //                                                                     file: content
            //                                                                 }
            //                                                             }, function (err, response) {
            //                                                                 if (err) {
            //                                                                     console.log("Error while creting new logic: ", err);
            //                                                                 } else if (response && Number(response.statusCode) === 200) {
            //                                                                     console.log("Logic " + objectId + "_" + logic + " successfully created");
            //                                                                 } else {
            //                                                                     console.log("Either no response or an error occurred");
            //                                                                 }
            //                                                             });
            //                                                         } else {
            //                                                             console.log("The file is empty, nothing to copy");
            //                                                         }
            //                                                     });
            //                                                 }
            //                                             });
            //                                         } else {
            //                                             console.log("Unable to find service logic");
            //                                         }
            //                                     });
            //                                 } else {
            //                                     console.log("Logics folder is empty, nothing to copy");
            //                                 }
            //                             });
            //                         } else {
            //                             console.log("Unable to get stats of folder " + baseDir + "/apio_logic");
            //                         }
            //                     });
            //                 }
            //             });
            //         } else {
            //             console.log("Error!! " + baseDir + " is not a directory");
            //         }
            //     });
            // };

            console.log("final, data: ", data);
            if (data.hasOwnProperty("protocol") && data.protocol !== "" && data.hasOwnProperty("eep") && data.eep !== "") {
                if (data.protocol === "enocean" && data.hasOwnProperty("address") && data.address !== "") {
                    Apio.Database.getMaximumObjectId(function (error, objectId) {
                        if (error) {
                            console.log("Error while getting maximum objectId: ", error);
                        } else if (objectId) {
                            Apio.Object.install(data, String(Number(objectId) + 1));
                        }
                    });
                } else if ((data.protocol === "zwave" || data.protocol === "z") && data.hasOwnProperty("address") && data.address !== "") {
                    //In case of "z" the protocol have always to be "zwave" for the database
                    data.protocol = "zwave";
                    Apio.Database.getMaximumObjectId(function (error, objectId) {
                        if (error) {
                            console.log("Error while getting maximum objectId: ", error);
                        } else if (objectId) {
                            Apio.Object.install(data, String(Number(objectId) + 1));
                        }
                    });
                } else if ((data.protocol === "apio" || data.protocol === "l") && data.hasOwnProperty("address")) {
                    //In case of "l" the protocol have always to be "apio" for the database
                    data.protocol = "apio";
                    if (data.address) {
                        console.log("********MODBUS*******");
                        Apio.Object.install(data, data.address);
                    } else {
                        console.log("Entrato");
                        Apio.Database.getMaximumObjectId(function (error, objectId) {
                            if (error) {
                                console.log("Error while getting maximum objectId: ", error);
                            } else if (objectId) {
                                //assegno l'address al nuovo oggetto apio, per comodità l'address è pari al objectId del nuovo oggetto, l'object id viene calcolato da getMaximumObjectId aumentato di 1 in modo da rispettare l'unicità
                                data.address = String(Number(objectId) + 1);
                                //rispondo all'oggetto Apio con il nuovo address calcolato e da quel momento in poi l'oggetto avrà l'address assegnatoli
                                //spostare l'algoritmo di accoppiamento di apio nel service dongle_apio da qui far partire solo una socket che
                                //notifica in generale qualsiasi service del click sul pulsante di conferma
                                var c = {
                                    name: "apio_serial_send",
                                    data: "l9999:" + data.serialNumber + ":" + data.address + "-"
                                };
                                console.log("SET-MESH2", c);
                                Apio.io.emit("socket_service", c);
                                console.log("SET-MESH3 LANCIATO SOCKET SERVICE");

                                console.log("Prima della final");
                                Apio.Object.install(data, String(Number(objectId) + 1));
                            }
                        });
                    }
                }
            }
        });

        socket.on("apio_install_new_object", function (data) {
            console.log();
            console.log("RICEVUTA RICHIESTA DI INSTALLAZIONE: ", data);
            console.log("send_to_client");
            console.log();
            Apio.io.emit("send_to_client", {
                message: "auto_install_modal",
                data: data
            });

            socketServer.emit("send_to_cloud_service", {
                data: data,
                message: "apio_install_new_object",
                service: "autoInstall"
            });
        });

        socket.on("store_compatibility", function (data) {
            console.log("sono nella richiesta http");
            var cb = function (data) {
                Apio.Remote.socket.emit("send_to_client", {
                    who: "autoInstall",
                    data: {
                        apioId: Apio.System.getApioIdentifier(),
                        data: data
                    },
                    message: "compatibility"
                });

                socketStore_Service.removeListener("compatibility", cb);

            }


            socketStore_Service.on("compatibility", cb);

            socketStore_Service.emit("send_to_store", {
                body: {

                    apioId: Apio.System.getApioIdentifier()
                },
                url: "compatibility/" + data
            });


        });

        socket.on("store_compatibilities", function (data) {
            console.log("sono nella richiesta http");
            var cb = function (data) {
                Apio.Remote.socket.emit("send_to_client", {
                    who: "autoInstall",
                    data: {
                        apioId: Apio.System.getApioIdentifier(),
                        data: data
                    },
                    message: "compatibilities"
                });

                socketStore_Service.removeListener("compatibilities", cb);

            }


            socketStore_Service.on("compatibilities", cb);

            socketStore_Service.emit("send_to_store", {
                body: {

                    apioId: Apio.System.getApioIdentifier()
                },
                url: "compatibility"
            });


        });

        socket.on("store_category", function (data) {
            console.log("sono nella richiesta http");
            var cb = function (data) {
                Apio.Remote.socket.emit("send_to_client", {
                    who: "autoInstall",
                    data: {
                        apioId: Apio.System.getApioIdentifier(),
                        data: data
                    },
                    message: "category"
                });

                socketStore_Service.removeListener("category", cb);

            }


            socketStore_Service.on("category", cb);

            socketStore_Service.emit("send_to_store", {
                body: {
                    apioId: Apio.System.getApioIdentifier()
                },
                url: "category/" + data
            });


        });
        socket.on("store_categories", function (data) {
            console.log("sono nella richiesta http");
            var cb = function (data) {
                Apio.Remote.socket.emit("send_to_client", {
                    who: "autoInstall",
                    data: {
                        apioId: Apio.System.getApioIdentifier(),
                        data: data
                    },
                    message: "categories"
                });

                socketStore_Service.removeListener("categories", cb);

            }


            socketStore_Service.on("categories", cb);

            socketStore_Service.emit("send_to_store", {
                body: {
                    apioId: Apio.System.getApioIdentifier()
                },
                url: "category"
            });


        });

        socket.on("store_app", function (data) {
            console.log("sono nella richiesta http");
            var cb = function (data) {
                Apio.Remote.socket.emit("send_to_client", {
                    who: "autoInstall",
                    data: {
                        apioId: Apio.System.getApioIdentifier(),
                        data: data
                    },
                    message: "app"
                });
                socketStore_Service.removeListener("app", cb);
            }


            socketStore_Service.on("app", cb);

            socketStore_Service.emit("send_to_store", {
                body: {
                    apioId: Apio.System.getApioIdentifier()
                },
                url: "app"
            });


        });

        socket.on("store_downloadApp", function (data) {
            var u_data = data;
            console.log("sono nella richiesta http");
            // console.log(data);
/////////////VECCHIO
//             var cb = function (data) {
//
//                 var s_data = data;
//                 console.log("arriva tramite socket", data);
//                 if (data.hasOwnProperty("error")) {
//                     Apio.Remote.socket.emit("send_to_client", {
//                         who: "autoInstall",
//                         data: {
//                             apioId: Apio.System.getApioIdentifier(),
//                             data: data
//                         },
//                         message: "complete_downloadApp"
//                     });
//                     socketStore_Service.removeListener("complete_downloadApp", cb);
//
//                 }
//
//                 var deleteFolderRecursive = function (path) {
//                     console.log("deleting the directory " + path);
//                     if (fs.existsSync(path)) {
//                         fs.readdirSync(path).forEach(function (file, index) {
//                             var curPath = path + "/" + file;
//                             if (fs.lstatSync(curPath).isDirectory()) {
//                                 deleteFolderRecursive(curPath);
//                             } else {
//                                 if (fs.existsSync(curPath)) {
//                                     fs.unlinkSync(curPath);
//                                 }
//                             }
//                         });
//                         fs.rmdirSync(path);
//                     }
//                 };
//
//                 deleteFolderRecursive("upload");
//                 fs.mkdirSync("upload");
//
//
//                 var name = 'upload/' + String(new Date().getTime()) + ".tar.gz";
//                 var stream = fs.createWriteStream(name);
//
//                 request.get(data.url)
//                     .on('error', function (err) {
//                         console.log(err);
//                         Apio.Remote.socket.emit("send_to_client", {
//                             who: "autoInstall",
//                             data: {
//                                 apioId: Apio.System.getApioIdentifier(),
//                                 data: {error: "error while downloading"}
//                             },
//                             message: "downloadApp"
//                         });
//
//                         socketStore_Service.removeListener("downloadApp", cb);
//                     })
//                     .pipe(stream)
//                     .on('finish', function () {
//                         console.log('Done downloading!');
//                         //upload(name);
//                         var targz = require("tar.gz")
//                         var path = "upload/temp";
//                         new targz().extract(name, path, function (err) {
//                             if (err) {
//                                 console.log(err);
//                                 Apio.Remote.socket.emit("send_to_client", {
//                                     who: "autoInstall",
//                                     data: {
//                                         apioId: Apio.System.getApioIdentifier(),
//                                         data: {error: "error while extractiong"}
//                                     },
//                                     message: "downloadApp"
//                                 });
//                                 socketStore_Service.removeListener("downloadApp", cb);
//                             } else {
//                                 // Apio.Object.install({path:"upload/temp"},)
//                                 console.log("estratto");
//                                 // socketStore_Service.emit("delete_temp", {
//                                 //     name:data.url.split("/")[data.url.split("/").length -1]
//                                 // });
//                                 Apio.Database.getMaximumObjectId(function (error, objectId) {
//                                     if (error) {
//                                         console.log("Error while getting maximum objectId: ", error);
//                                         Apio.Remote.socket.emit("send_to_client", {
//                                             who: "autoInstall",
//                                             data: {
//                                                 apioId: Apio.System.getApioIdentifier(),
//                                                 data: {error: "error while creating app identifier"}
//                                             },
//                                             message: "downloadApp"
//                                         });
//                                         socketStore_Service.removeListener("downloadApp", cb);
//                                     } else if (objectId) {
//                                         fs.readdir(path, function (error, files) {
//                                             if (error) {
//                                                 console.log("error while reading the temporary directory ", error);
//                                                 Apio.Remote.socket.emit("send_to_client", {
//                                                     who: "autoInstall",
//                                                     data: {
//                                                         apioId: Apio.System.getApioIdentifier(),
//                                                         data: {error: "error while creating app directory"}
//                                                     },
//                                                     message: "downloadApp"
//                                                 });
//                                                 socketStore_Service.removeListener("downloadApp", cb);
//                                             } else if (files) {
//                                                 console.log("dir: ", files[0]);
//                                                 path += "/" + files[0];
//                                                 var data = u_data.data;
//                                                 data.data = s_data;
//                                                 data.apioId = Apio.System.getApioIdentifier();
//                                                 data.path = path;
//                                                 console.log("data install: ", data);
//                                                 if (data.hasOwnProperty("protocol") && data.protocol !== "" && data.hasOwnProperty("eep") && data.eep !== "") {
//                                                     if (data.protocol === "enocean" && data.hasOwnProperty("address") && data.address !== "") {
//                                                         Apio.Object.install(data, String(Number(objectId) + 1));
//                                                         Apio.Remote.socket.emit("send_to_client", {
//                                                             who: "autoInstall",
//                                                             data: {
//                                                                 apioId: Apio.System.getApioIdentifier(),
//                                                                 data: s_data
//                                                             },
//                                                             message: "downloadApp"
//                                                         });
//                                                         socketStore_Service.removeListener("downloadApp", cb);
//                                                     } else if ((data.protocol === "zwave" || data.protocol === "z") && data.hasOwnProperty("address") && data.address !== "") {
//                                                         //In case of "z" the protocol have always to be "zwave" for the database
//                                                         data.protocol = "zwave";
//                                                         Apio.Object.install(data, String(Number(objectId) + 1));
//                                                         Apio.Remote.socket.emit("send_to_client", {
//                                                             who: "autoInstall",
//                                                             data: {
//                                                                 apioId: Apio.System.getApioIdentifier(),
//                                                                 data: s_data
//                                                             },
//                                                             message: "downloadApp"
//                                                         });
//                                                         socketStore_Service.removeListener("downloadApp", cb);
//                                                     } else if ((data.protocol === "apio" || data.protocol === "l") && data.hasOwnProperty("address")) {
//                                                         //In case of "l" the protocol have always to be "apio" for the database
//                                                         data.protocol = "apio";
//                                                         if (data.address) {
//                                                             console.log("********MODBUS*******");
//                                                             Apio.Object.install(data, data.address);
//                                                             Apio.Remote.socket.emit("send_to_client", {
//                                                                 who: "autoInstall",
//                                                                 data: {
//                                                                     apioId: Apio.System.getApioIdentifier(),
//                                                                     data: s_data
//                                                                 },
//                                                                 message: "downloadApp"
//                                                             });
//                                                             socketStore_Service.removeListener("downloadApp", cb);
//                                                         } else {
//                                                             console.log("Entrato");
//                                                             //assegno l'address al nuovo oggetto apio, per comodità l'address è pari al objectId del nuovo oggetto, l'object id viene calcolato da getMaximumObjectId aumentato di 1 in modo da rispettare l'unicità
//                                                             data.address = String(Number(objectId) + 1);
//                                                             //rispondo all'oggetto Apio con il nuovo address calcolato e da quel momento in poi l'oggetto avrà l'address assegnatoli
//                                                             //spostare l'algoritmo di accoppiamento di apio nel service dongle_apio da qui far partire solo una socket che
//                                                             //notifica in generale qualsiasi service del click sul pulsante di conferma
//                                                             var c = {
//                                                                 name: "apio_serial_send",
//                                                                 data: "l9999:" + data.serialNumber + ":" + data.address + "-"
//                                                             };
//                                                             console.log("SET-MESH2", c);
//                                                             Apio.io.emit("socket_service", c);
//                                                             console.log("SET-MESH3 LANCIATO SOCKET SERVICE");
//
//                                                             console.log("Prima della final");
//                                                             Apio.Object.install(data, String(Number(objectId) + 1));
//                                                             Apio.Remote.socket.emit("send_to_client", {
//                                                                 who: "autoInstall",
//                                                                 data: {
//                                                                     apioId: Apio.System.getApioIdentifier(),
//                                                                     data: s_data
//                                                                 },
//                                                                 message: "downloadApp"
//                                                             });
//                                                             socketStore_Service.removeListener("downloadApp", cb);
//                                                         }
//                                                     }
//                                                 }
//                                             }
//                                         })
//                                     }
//                                 });
//
//                             }
//                         });
//                     })
//             }

            // var cb = function (data) {
            //     Apio.Remote.socket.emit("send_to_client", {
            //         who: "autoInstall",
            //         data: {
            //             apioId: Apio.System.getApioIdentifier(),
            //             data: data
            //         },
            //         message: "complete_downloadApp"
            //     });
            //     socketStore_Service.removeListener("complete_downloadApp", cb);
            // }
            //
            //
            // socketStore_Service.on("complete_downloadApp", cb);

            socketStore_Service.emit("send_to_store", {
                body: {
                    appId: data.appId,
                    username: data.username,
                    password: data.password,
                    apioId: Apio.System.getApioIdentifier(),
                    data: data.data
                },
                url: "downloadApp"
            });


        });

    });

    socketStore_Service.on("downloadApp", function (data) {
        // socketStore_Service.emit("delete_temp", {
        //     name:req.body.screenshot
        // });
        var s_data = data;
        if (data.hasOwnProperty("error") || data.hasOwnProperty("errors")) {
            console.log("errore");
            Apio.Remote.socket.emit("send_to_client", {
                who: "autoInstall",
                data: {
                    apioId: Apio.System.getApioIdentifier(),
                    data: data
                },
                message: "complete_downloadApp"
            });

        } else {


            var deleteFolderRecursive = function (path) {
                console.log("deleting the directory " + path);
                if (fs.existsSync(path)) {
                    fs.readdirSync(path).forEach(function (file, index) {
                        var curPath = path + "/" + file;
                        if (fs.lstatSync(curPath).isDirectory()) {
                            deleteFolderRecursive(curPath);
                        } else {
                            if (fs.existsSync(curPath)) {
                                fs.unlinkSync(curPath);
                            }
                        }
                    });
                    fs.rmdirSync(path);
                }
            };

            deleteFolderRecursive("upload");
            fs.mkdirSync("upload");


            var name = 'upload/' + String(new Date().getTime()) + ".tar.gz";
            var stream = fs.createWriteStream(name);

            request.get(data.url)
                .on('error', function (err) {
                    console.log(err);
                    Apio.Remote.socket.emit("send_to_client", {
                        who: "autoInstall",
                        data: {
                            apioId: Apio.System.getApioIdentifier(),
                            data: {error: "error while downloading"}
                        },
                        message: "complete_downloadApp"
                    });

                })
                .pipe(stream)
                .on('finish', function () {
                    console.log('Done downloading!');
                    //upload(name);
                    var targz = require("tar.gz")
                    var path = "upload/temp";
                    new targz().extract(name, path, function (err) {
                        if (err) {
                            console.log(err);
                            Apio.Remote.socket.emit("send_to_client", {
                                who: "autoInstall",
                                data: {
                                    apioId: Apio.System.getApioIdentifier(),
                                    data: {error: "error while extracting"}
                                },
                                message: "complete_downloadApp"
                            });
                        } else {
                            // Apio.Object.install({path:"upload/temp"},)
                            console.log("estratto");
                            // socketStore_Service.emit("delete_temp", {
                            //     name:data.url.split("/")[data.url.split("/").length -1]
                            // });
                            Apio.Database.getMaximumObjectId(function (error, objectId) {
                                if (error) {
                                    console.log("Error while getting maximum objectId: ", error);
                                    Apio.Remote.socket.emit("send_to_client", {
                                        who: "autoInstall",
                                        data: {
                                            apioId: Apio.System.getApioIdentifier(),
                                            data: {error: "error while creating app identifier"}
                                        },
                                        message: "complete_downloadApp"
                                    });
                                } else if (objectId) {
                                    fs.readdir(path, function (error, files) {
                                        if (error) {
                                            console.log("error while reading the temporary directory ", error);
                                            Apio.Remote.socket.emit("send_to_client", {
                                                who: "autoInstall",
                                                data: {
                                                    apioId: Apio.System.getApioIdentifier(),
                                                    data: {error: "error while creating app directory"}
                                                },
                                                message: "complete_downloadApp"
                                            });
                                        } else if (files) {
                                            console.log("dir: ", files[0]);
                                            path += "/" + files[0];
                                            var data = {};
                                            data = s_data.data;
                                            data.data = {
                                                protocol: s_data.data.protocol,
                                                eep: s_data.data.eep,
                                                url: s_data.url
                                            };
                                            //vedere come migliorare soprattutto il fatto di app che si installano direttamente da store e devono comunicare con un tipo di rete
                                            if (s_data.data.hasOwnProperty("address")) {
                                                data.data.address = s_data.data.address;
                                            } else {
                                                data.address = String(Number(objectId) + 1);
                                            }
                                            data.apioId = Apio.System.getApioIdentifier();
                                            data.path = path;
                                            // console.log("data install: ", data);
                                            if (data.hasOwnProperty("protocol") && data.protocol !== "" && data.hasOwnProperty("eep") && data.eep !== "") {
                                                if (data.protocol === "enocean" && data.hasOwnProperty("address") && data.address !== "") {
                                                    Apio.Object.install(data, String(Number(objectId) + 1));
                                                    Apio.Remote.socket.emit("send_to_client", {
                                                        who: "autoInstall",
                                                        data: {
                                                            apioId: Apio.System.getApioIdentifier(),
                                                            data: s_data
                                                        },
                                                        message: "complete_downloadApp"
                                                    });
                                                } else if ((data.protocol === "zwave" || data.protocol === "z") && data.hasOwnProperty("address") && data.address !== "") {
                                                    //In case of "z" the protocol have always to be "zwave" for the database
                                                    data.protocol = "zwave";
                                                    Apio.Object.install(data, String(Number(objectId) + 1));
                                                    Apio.Remote.socket.emit("send_to_client", {
                                                        who: "autoInstall",
                                                        data: {
                                                            apioId: Apio.System.getApioIdentifier(),
                                                            data: s_data
                                                        },
                                                        message: "complete_downloadApp"
                                                    });
                                                } else if ((data.protocol === "apio" || data.protocol === "l") && data.hasOwnProperty("address")) {
                                                    //In case of "l" the protocol have always to be "apio" for the database
                                                    data.protocol = "apio";
                                                    if (data.address) {
                                                        console.log("********MODBUS*******");
                                                        Apio.Object.install(data, data.address);
                                                        Apio.Remote.socket.emit("send_to_client", {
                                                            who: "autoInstall",
                                                            data: {
                                                                apioId: Apio.System.getApioIdentifier(),
                                                                data: s_data
                                                            },
                                                            message: "complete_downloadApp"
                                                        });
                                                    } else {
                                                        console.log("Entrato");
                                                        //assegno l'address al nuovo oggetto apio, per comodità l'address è pari al objectId del nuovo oggetto, l'object id viene calcolato da getMaximumObjectId aumentato di 1 in modo da rispettare l'unicità
                                                        data.address = String(Number(objectId) + 1);
                                                        //rispondo all'oggetto Apio con il nuovo address calcolato e da quel momento in poi l'oggetto avrà l'address assegnatoli
                                                        //spostare l'algoritmo di accoppiamento di apio nel service dongle_apio da qui far partire solo una socket che
                                                        //notifica in generale qualsiasi service del click sul pulsante di conferma
                                                        var c = {
                                                            name: "apio_serial_send",
                                                            data: "l9999:" + data.serialNumber + ":" + data.address + "-"
                                                        };
                                                        console.log("SET-MESH2", c);
                                                        Apio.io.emit("socket_service", c);
                                                        console.log("SET-MESH3 LANCIATO SOCKET SERVICE");

                                                        console.log("Prima della final");
                                                        Apio.Object.install(data, String(Number(objectId) + 1));
                                                        Apio.Remote.socket.emit("send_to_client", {
                                                            who: "autoInstall",
                                                            data: {
                                                                apioId: Apio.System.getApioIdentifier(),
                                                                data: s_data
                                                            },
                                                            message: "complete_downloadApp"
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    })
                                }
                            });

                        }
                    });
                })
        }
    });

    http.listen(port, "localhost", function () {
        // http.listen(port, function () {
        Apio.Database.connect(function () {
        }, false);

        var gc = require("./garbage_collector.js");
        gc();
    });
};