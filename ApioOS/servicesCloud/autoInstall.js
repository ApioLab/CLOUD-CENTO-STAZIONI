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
 * GNU General Public License version 2 for more details.s                  *
 *                                                                          *
 * To read the license either open the file COPYING.txt or                  *
 * visit <http://www.gnu.org/licenses/gpl2.txt>                             *
 *                                                                          *
 ****************************************************************************/

module.exports = function (libraries) {
    // var configuration = require("../configuration/default.js");
    var bodyParser = libraries["body-parser"];
    var express = libraries.express;
    var fs = require("fs-extra");
    var app = express();
    var http = libraries.http.Server(app);
    var request = libraries.request;
    var mysql = libraries.mysql;
    var Apio = require("../apio.js")();
    var socket = libraries["socket.io-client"]("http://localhost:" + Apio.Configuration.http.port, {query: "associate=autoInstall&token=" + Apio.Token.getFromText("autoInstall", fs.readFileSync("./" + Apio.Configuration.type + "_key.apio", "utf8"))});
    var socketServer = libraries["socket.io"](http);
    var querystring = require("querystring");

    var port = 8101;

    process.on("uncaughtException", function (err) {
        console.log("Caught exception: ", err);
    });

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

    var finalize = function (data) {

        var createMySQLTable = function (object) {
            if (Object.keys(object.properties).length) {
                var sql_db = mysql.createConnection("mysql://root:root@127.0.0.1/Logs");
                var condition_array = [];
                for (var p in object.properties) {
                    // if (["apiobutton", "apiolink", "asyncdisplay", "autocomplete", "battery", "charts", "collapse", "dynamicview", "graph", "list", "log", "moreinfo", "note", "paint", "property", "ranking", "text", "textbox", "uploadimage"].indexOf(object.properties[p].type) > -1) {
                    //     condition_array.push("`" + p + "` TEXT");
                    // } else if (["number", "trigger", "unclickabletrigger"].indexOf(object.properties[p].type) > -1) {
                    //     condition_array.push("`" + p + "` INT");
                    // } else if (["sensor", "slider", "unlimitedsensor"].indexOf(object.properties[p].type) > -1) {
                    //     condition_array.push("`" + p + "` DOUBLE");
                    // }

                    if (["number", "trigger", "unclickabletrigger"].indexOf(object.properties[p].type) > -1) {
                        condition_array.push("`" + p + "` INT");
                    } else if (["sensor", "slider", "unlimitedsensor"].indexOf(object.properties[p].type) > -1) {
                        condition_array.push("`" + p + "` DOUBLE");
                    } else {
                        condition_array.push("`" + p + "` TEXT");
                    }
                }

                var condition_string = "id INT UNSIGNED NOT NULL AUTO_INCREMENT, " + condition_array.join(", ") + ", timestamp BIGINT UNSIGNED NOT NULL, PRIMARY KEY (id)";

                sql_db.query("DROP TABLE IF EXISTS `" + object.objectId + "_" + object.apioId + "`", function (error_drop) {
                    if (error_drop) {
                        console.log("Error while dropping table: ", error_drop);
                        sql_db.end();
                    } else {
                        sql_db.query("CREATE TABLE `" + object.objectId + "_" + object.apioId + "` (" + condition_string + ")", function (error, result) {
                            if (error) {
                                console.log("Error while creating table: ", error);
                                sql_db.end();
                            } else if (result) {
                                console.log("Created table " + object.objectId + "_" + object.apioId + ", result: ", result);
                                sql_db.query("CREATE INDEX timestamp ON `" + object.objectId + "_" + object.apioId + "` (timestamp)", function (e_i, r_i) {
                                    if (e_i) {
                                        console.log("Error while creating index: ", e_i);
                                    } else {
                                        console.log("Index created: ", r_i);
                                        sql_db.end();
                                    }
                                });
                            } else {
                                console.log("No result");
                                sql_db.end();
                            }
                        });
                    }
                });
            }
        };
        var baseDir = "";
        if (data.hasOwnProperty("path")) {
            if (data.path.indexOf("applications") > -1) {
                data.path = data.path.replace("applications", "boards/" + data.apioId)
            }
            baseDir = data.path;

        } else {
            baseDir = "public/applications/newfile/" + data.eep;
        }


        fs.stat(baseDir, function (err, stats) {
            console.log("nome cartella", __dirname);
            if (err) {
                if (data.hasOwnProperty("path")) {
                    console.log(data.path);
                }
                console.log("Does not exist any template for the eep: ", data.eep);
                console.log("trying to access in store");
                if (data.data) {
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
                    fs.mkdirSync("upload/temp");


                    var name = __dirname + '/../upload/' + String(new Date().getTime()) + ".tar.gz";
                    var stream = fs.createWriteStream(name);

                    request.get(data.data.url)
                        .on('error', function (err) {
                            console.log(err);
                        })
                        .pipe(stream)
                        .on('finish', function () {
                            console.log('Done downloading!');
                            //upload(name);
                            //valutare se spostare in store.js
                            //SCOMMENTARE SE SI VUOLE CHE SI ELIMINI SOLO DOPO CHE CLIENT E CLOUD ABBIANO SCARICATO
                            // fs.unlinkSync("public/store_temp/"+data.data.url.split("/")[data.data.url.split("/").length -1]);
                            var targz = require("tar.gz")
                            var path = __dirname + "/../upload/temp";
                            targz().extract(name, path, function (err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    // Apio.Object.install({path:"upload/temp"},)
                                    console.log("estratto");
                                    setTimeout(function () {
                                        fs.readdir(path, function (error, files) {
                                            if (error) {
                                                console.log("error while reading the temporary directory ", error);
                                            } else if (files) {
                                                console.log("dir: ", files[0]);
                                                path += "/" + files[0];
                                                fs.readdir(path, function (error, files) {
                                                    if (error) {
                                                        console.log("error while reading the temporary directory ", error);
                                                    } else if (files) {
                                                        files.forEach(function (elem, index, ref_array) {
                                                            console.log(elem);
                                                            if (index == ref_array.length - 1) {
                                                                data.path = path;
                                                                finalize(data);
                                                            }
                                                        })
                                                    }
                                                });
                                            }
                                        });
                                    }, 100);
                                }
                            });
                        })
                }
                ;


            } else if (stats && stats.isDirectory()) {
                fs.mkdir("public/boards/" + data.apioId + "/" + data.objectId, function (e_mkdir) {
                    if (e_mkdir) {
                        console.log("Error while creating directory public/boards/" + data.apioId + "/" + data.objectId + ": ", e_mkdir);
                    } else {
                        fs.readFile(baseDir + "/application.mongo", "utf8", function (e_f1, collection) {
                            if (e_f1) {
                                console.log("Error while reading file " + baseDir + "/application.mongo: ", e_f1);
                            } else if (collection) {
                                collection = JSON.parse(collection);
                                collection.objectId = data.objectId;
                                collection.apioId = data.apioId;
                                collection.address = data.address;
                                collection.user = [];
                                var date = new Date();
                                var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
                                var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
                                var year = date.getFullYear() < 10 ? "0" + date.getFullYear() : date.getFullYear();
                                collection.created = year + "-" + month + "-" + day;

                                if (data.parentAddress) {
                                    collection.parentAddress = data.parentAddress;
                                }

                                if (data.db) {
                                    collection.db = data.db;
                                }

                                Apio.Database.db.collection("Objects").insert(collection, function (err_db) {
                                    if (err_db) {
                                        console.log("Error while adding object " + data.objectId + " to the DB: ", err_db);
                                    } else {
                                        console.log("Object " + data.objectId + " successfully inserted to the DB");

                                        socketServer.emit("send_to_client", {
                                            apioId: data.apioId,
                                            data: data.objectId,
                                            message: "apio_server_new"
                                        });

                                        createMySQLTable(collection);
                                    }
                                });
                            }
                        });

                        fs.readFile(baseDir + "/application.html", "utf8", function (e_f1, htmlFile) {
                            if (e_f1) {
                                console.log("Error while reading file " + baseDir + "/application.html: ", e_f1);
                            } else if (htmlFile) {
                                htmlFile = htmlFile.replace(/_TMP_/g, data.objectId);
                                fs.writeFile("public/boards/" + data.apioId + "/" + data.objectId + "/" + data.objectId + ".html", htmlFile, function (e_w) {
                                    if (e_w) {
                                        console.log("Error writing file public/boards/" + data.apioId + "/" + data.objectId + ".html: ", e_w);
                                    } else {
                                        console.log("File public/boards/" + data.apioId + "/" + data.objectId + "/" + data.objectId + ".html succesfully written");
                                    }
                                });
                            }
                        });

                        fs.readFile(baseDir + "/application.js", "utf8", function (e_f2, jsFile) {
                            if (e_f2) {
                                console.log("Error while reading file " + baseDir + "/application.js: ", e_f2);
                            } else if (jsFile) {
                                jsFile = jsFile.replace(/_TMP_/g, data.objectId);
                                fs.writeFile("public/boards/" + data.apioId + "/" + data.objectId + "/" + data.objectId + ".js", jsFile, function (e_w) {
                                    if (e_w) {
                                        console.log("Error writing file public/boards/" + data.apioId + "/" + data.objectId + ".js: ", e_w);
                                    } else {
                                        console.log("File public/boards/" + data.apioId + "/" + data.objectId + "/" + data.objectId + ".js succesfully written");
                                    }
                                });
                            }
                        });

                        fs.readFile(baseDir + "/icon.png", function (e_f2, iconFile) {
                            if (e_f2) {
                                console.log("Error while reading file " + baseDir + "/icon.png: ", e_f2);
                            } else if (iconFile) {
                                fs.writeFile("public/boards/" + data.apioId + "/" + data.objectId + "/icon.png", iconFile, function (e_w) {
                                    if (e_w) {
                                        console.log("Error writing file public/boards/" + data.apioId + "/icon.png: ", e_w);
                                    } else {
                                        console.log("File public/boards/" + data.apioId + "/" + data.objectId + "/icon.png succesfully written");
                                    }
                                });
                            }
                        });

                        fs.stat(baseDir + "/utils", function (err, stats) {
                            if (err) {
                                console.log("Folder " + baseDir + "/utils does not exist");
                            } else if (stats) {
                                fs.copy(baseDir + "/utils", "public/boards/" + data.apioId + "/" + data.objectId + "/utils", function (err) {
                                    if (err) {
                                        console.log("Error while copying from " + source + " to " + destination + ": ", err);
                                    } else {
                                        console.log("done!");
                                    }
                                });
                            } else {
                                console.log("Unable to get stats of folder " + baseDir + "/utils");
                            }
                        });
                        ///VECCHIO
                        // fs.stat(baseDir + "/utils", function (err, stats) {
                        //     if (err) {
                        //         console.log("Folder " + baseDir + "/utils does not exist");
                        //     } else if (stats) {
                        //         fs.readdir(baseDir + "/utils", function (error, utils) {
                        //             if (error) {
                        //                 console.log("Error while reading the folder " + baseDir + "/utils: ", error);
                        //             } else if (utils) {
                        //                 fs.mkdir("public/boards/" + data.apioId + "/" + data.objectId + "/utils", function (e_mkdir) {
                        //                     if (e_mkdir) {
                        //                         console.log("Error while creating directory public/boards/" + data.apioId + "/" + data.objectId + "/utils : ", e_mkdir);
                        //                     } else {
                        //                         utils.forEach(function (util) {
                        //                             fs.readFile(baseDir + "/utils/" + util, "utf8", function (e, content) {
                        //                                 if (e) {
                        //                                     console.log("Error while reading file: ", e);
                        //                                 } else if (content) {
                        //                                     content = content.replace(/_TMP_/g, objectId);
                        //                                     fs.writeFile("public/boards/" + data.apioId + "/" + data.objectId + "/utils/" + util, content, function (e_w) {
                        //                                         if (e_w) {
                        //                                             console.log("Error writing file public/boards/" + data.apioId + "/" + data.objectId + "/utils/" + util, e_w);
                        //                                         } else {
                        //                                             console.log("File public/boards/" + data.apioId + "/" + data.objectId + "/utils/" + util + " succesfully written");
                        //                                         }
                        //                                     });
                        //                                 }
                        //                             });
                        //                         })
                        //                     }
                        //                 })
                        //             } else {
                        //                 console.log("Utils folder is empty, nothing to copy");
                        //             }
                        //         });
                        //     } else {
                        //         console.log("Unable to get stats of folder " + baseDir + "/utils");
                        //     }
                        // });


                        ///DA SCOMMENTARE E MODIFICARE QUANDO CI SARANNO LE LOGICHE IN CLOUD
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
                        //                                                                     ////////mi metto qui per salvare la logica nel MONGO dell'app ad esso correlata//////
                        //                                                                     Apio.Database.db.collection("Objects").update({"objectId": objectId}, {"$addToSet": {"logics" : objectId + "_" + logic}}, function (err, res) {
                        //                                                                         if (err) {
                        //                                                                             console.log("error while iunseritng the logic in the MONGO ",err);
                        //                                                                         } else if (res) {
                        //                                                                             console.log("Logic successfully inserted in the logics array");
                        //                                                                         }
                        //                                                                     });
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

                    }
                });
            } else {
                console.log("Error!! " + baseDir + " is not a directory");
            }
        });
    }

    app.post("/store/downloadApp", function (req, res) {
        console.log("sono nella richiesta http");


        socketServer.emit("send_to_client_service", {
            // apioId: req.body.apioId,
            apioId: req.body.apioId,
            message: "store_downloadApp",
            service: "autoInstall",
            data: req.body
        });

        req.pause();


        var cb = function (data) {
            console.log("torna la socket di downloadApp ",data);
            if (req.body.apioId == data.apioId) {
                if (data.data.hasOwnProperty("error") || data.data.hasOwnProperty("errors")) {
                    res.status(500).send(data.data);
                    socket.removeListener("complete_downloadApp", cb);
                } else {
                    res.status(200).send(data.data);
                    socket.removeListener("complete_downloadApp", cb);

                }
            }
        }

        req.on("close", function () {
            socket.removeListener("complete_downloadApp", cb);
        });

        req.on("end", function () {
            socket.removeListener("complete_downloadApp", cb);
        });

        req.on("timeout", function () {
            socket.removeListener("complete_downloadApp", cb);
        });

        req.on("error", function () {
            socket.removeListener("complete_downloadApp", cb);
        });


        socket.on("complete_downloadApp", cb);

    });

    app.get("/store/compatibility/:id", function (req, res) {
        console.log("sono nella richiesta http");


        socketServer.emit("send_to_client_service", {
            // apioId: req.body.apioId,
            apioId: req.query.apioId,
            message: "store_compatibility",
            service: "autoInstall",
            data: req.params.id
        });

        req.pause();

        var cb = function (data) {
            if (req.query.apioId == data.apioId) {
                res.status(200).send(data.data);
                socket.removeListener("compatibility", cb);
            }

        }

        req.on("close", function () {
            socket.removeListener("compatibility", cb);
        });

        req.on("end", function () {
            socket.removeListener("compatibility", cb);
        });

        req.on("timeout", function () {
            socket.removeListener("compatibility", cb);
        });

        req.on("error", function () {
            socket.removeListener("compatibility", cb);
        });


        socket.on("compatibility", cb);

    });

    app.get("/store/compatibility", function (req, res) {
        console.log("sono nella richiesta http");
        socketServer.emit("send_to_client_service", {
            // apioId: req.body.apioId,
            apioId: req.query.apioId,
            message: "store_compatibilities",
            service: "autoInstall"
        });

        req.pause();

        var cb = function (data) {
            if (req.query.apioId == data.apioId) {
                res.status(200).send(data.data);
                socket.removeListener("compatibilities", cb);
            }

        }

        req.on("close", function () {
            socket.removeListener("compatibilities", cb);
        });

        req.on("end", function () {
            socket.removeListener("compatibilities", cb);
        });

        req.on("timeout", function () {
            socket.removeListener("compatibilities", cb);
        });

        req.on("error", function () {
            socket.removeListener("compatibilities", cb);
        });


        socket.on("compatibilities", cb);

    });

    app.get("/store/app", function (req, res) {
        console.log("sono nella richiesta http");
        socketServer.emit("send_to_client_service", {
            // apioId: req.body.apioId,
            apioId: req.query.apioId,
            message: "store_app",
            service: "autoInstall"
        });

        req.pause();

        var cb = function (data) {
            if (req.query.apioId == data.apioId) {
                res.status(200).send(data.data);
                socket.removeListener("app", cb);
            }

        }

        req.on("close", function () {
            socket.removeListener("app", cb);
        });

        req.on("end", function () {
            socket.removeListener("app", cb);
        });

        req.on("timeout", function () {
            socket.removeListener("app", cb);
        });

        req.on("error", function () {
            socket.removeListener("app", cb);
        });


        socket.on("app", cb);

    });

    app.get("/store/category", function (req, res) {
        console.log("sono nella richiesta http");
        socketServer.emit("send_to_client_service", {
            // apioId: req.body.apioId,
            apioId: req.query.apioId,
            message: "store_categories",
            service: "autoInstall"
        });

        req.pause();

        var cb = function (data) {
            if (req.query.apioId == data.apioId) {
                res.status(200).send(data.data);
                socket.removeListener("categories", cb);
            }
        };

        req.on("close", function () {
            socket.removeListener("categories", cb);
        });

        req.on("end", function () {
            socket.removeListener("categories", cb);
        });

        req.on("timeout", function () {
            socket.removeListener("categories", cb);
        });

        req.on("error", function () {
            socket.removeListener("categories", cb);
        });

        socket.on("categories", cb);
    });

    app.get("/store/category/:id", function (req, res) {
        console.log("sono nella richiesta http");
        socketServer.emit("send_to_client_service", {
            // apioId: req.body.apioId,
            apioId: req.query.apioId,
            message: "store_category",
            service: "autoInstall",
            data: req.params.id
        });

        req.pause();

        var cb = function (data) {
            if (req.query.apioId == data.apioId) {
                console.log("data", data);
                res.status(200).send(data.data);
                socket.removeListener("category", cb);
            }

        }

        req.on("close", function () {
            socket.removeListener("category", cb);
        });

        req.on("end", function () {
            socket.removeListener("category", cb);
        });

        req.on("timeout", function () {
            socket.removeListener("category", cb);
        });

        req.on("error", function () {
            socket.removeListener("category", cb);
        });


        socket.on("category", cb);

    });


    socketServer.on("connection", function (Socket) {
        Socket.on("apio_install_new_object_final", function (data) {
            socketServer.emit("send_to_client_service", {
                apioId: data.apioId,
                data: data,
                message: "apio_install_new_object_final",
                service: "autoInstall"
            });
        });


        Socket.on("apio_install_new_object_final_from_gateway", function (data) {
            finalize(data);
        });

        Socket.on("apio_install_new_object", function (data) {
            socket.emit("send_to_client", {
                message: "auto_install_modal",
                apioId: data.apioId,
                data: data
            });
        });
    });

    http.listen(port, "localhost", function () {
        // http.listen(port, function () {
        console.log("Service autoInstall correctly started on port " + port);
        Apio.Database.connect(function () {
            console.log("Successfully connected to the DB");
        }, false);
    });
};