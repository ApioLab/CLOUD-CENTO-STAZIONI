var aesjs = require("aes-js");
var appRoot = require("app-root-path");
var exec = require("child_process").exec;
var formidable = require("formidable");
var fs = require("fs-extra");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var targz = require("tar.gz");
//var transporter = nodemailer.createTransport(smtpTransport({
//    host: "smtp.gmail.com",
//    port: 465,
//    secure: true,
//    auth: {
//        user: "apioassistance@gmail.com",
//        pass: "Apio22232425."
//    }
//}));

var transporter = nodemailer.createTransport(smtpTransport({
    host: "smtps.aruba.it",
    port: 465,
    secure: true,
    auth: {
        user: "info@apio.cc",
        pass: "@Pio22232425"
    }
}));

module.exports = function (Apio) {
    return {
        // sync: function (req, res) {
        //     console.log("TOGLIERE uuid da questo handler e metterlom nel body della request");
        //     console.log("Il sistema apio con id " + req.params.uuid + " mi sta mandando dei file");
        //     //Devo rifiutare ogni chiamata che non mi manda l'auth
        //     //QUi mi arriva un tar.gz contenente tutte le app
        //     var form = new formidable.IncomingForm();
        //     form.uploadDir = "uploads";
        //     form.keepExtensions = true;
        //
        //     form.on("file", function (name, file) {
        //         Apio.Util.log("Received file " + file.name + " as " + file.path);
        //
        //         fs.rename(file.path, "uploads/" + file.name);
        //         Apio.Util.log("File moved to uploads/" + file.name);
        //
        //         if (!fs.existsSync("uploads/temp")) {
        //             fs.existsSync("uploads/temp");
        //         }
        //
        //         //if (!fs.existsSync("uploads/temp/temp")) {
        //         //    fs.mkdirSync("uploads/temp/temp");
        //         //}
        //
        //         var compress = targz().extract("./uploads/" + file.name, "./uploads/temp", function (err) {
        //             if (err) {
        //                 Apio.Util.log("Error while extracting file" + file.name);
        //                 console.log(err);
        //                 res.send({
        //                     status: false
        //                 });
        //             } else {
        //                 Apio.Util.log("The extraction has ended!");
        //                 //if (!fs.existsSync("public/boards/" + req.params.uuid)) {
        //                 //    Apio.Util.log("Creating directory " + "public/boards/" + req.params.uuid + " ...");
        //                 //    fs.mkdirSync("public/boards/" + req.params.uuid);
        //                 //}
        //
        //                 Apio.Util.log("Moving applications to public/boards/" + req.params.uuid + " ...");
        //                 //fs.rename("uploads/temp/applications", "public/boards/" + req.params.uuid);
        //                 //Files moving
        //                 //if (fs.existsSync("uploads/temp/temp")) {
        //                 var basePath = "uploads/temp/" + req.params.uuid;
        //                 if (!fs.existsSync("public/boards")) {
        //                     fs.mkdirSync("public/boards");
        //                 }
        //
        //                 if (!fs.existsSync("public/boards/" + req.params.uuid)) {
        //                     fs.mkdirSync("public/boards/" + req.params.uuid);
        //                 }
        //
        //                 if (fs.existsSync(basePath)) {
        //                     //fs.renameSync("uploads/temp/temp", "uploads/temp/" + req.params.uuid);
        //                     //var basePath = "uploads/temp";
        //                     var moveFiles = function (dir) {
        //                         var files = fs.readdirSync(dir);
        //                         for (var i in files) {
        //                             var stats = fs.statSync(dir + "/" + files[i]);
        //                             var newPath = ("public/boards/" + req.params.uuid + "/" + dir + "/" + files[i]).replace(basePath + "/", "");
        //                             console.log("newPath: ", newPath);
        //                             if (stats.isDirectory()) {
        //                                 if (!fs.existsSync(newPath)) {
        //                                     fs.mkdirSync(newPath);
        //                                 }
        //                                 moveFiles(dir + "/" + files[i]);
        //                             } else {
        //                                 fs.renameSync(dir + "/" + files[i], newPath);
        //                             }
        //                         }
        //                     };
        //
        //                     moveFiles(basePath);
        //                     Apio.System.deleteFolderRecursive(basePath);
        //                 }
        //
        //                 Apio.Util.log("Deleting uploads/applications.tar.gz ...");
        //                 fs.unlinkSync("uploads/applications.tar.gz");
        //                 res.send({
        //                     status: true
        //                 });
        //
        //                 Apio.Database.db.collection("systems").findOne({apioId: req.params.uuid}, function (err, board) {
        //                     if (err) {
        //                         console.log("Error while getting board with apioId " + req.params.uuid + ": ", err);
        //                     } else if (board) {
        //                         var text = "";
        //                         if (board.name) {
        //                             text += "La board " + board.name + " (apioId: " + req.params.uuid + ")";
        //                         } else {
        //                             text += "La board con apioId " + req.params.uuid;
        //                         }
        //
        //                         text += " ha terminato la sincronizzazione alle " + (new Date());
        //
        //                         transporter.sendMail({
        //                             to: "info@apio.cc",
        //                             //from: "Apio <apioassistance@gmail.com>",
        //                             from: "Apio <info@apio.cc>",
        //                             subject: "Sincronizzazione terminata",
        //                             text: text
        //                         }, function (err, info) {
        //                             if (err) {
        //                                 console.log("Error while sending mail: ", err);
        //                             } else if (info) {
        //                                 console.log("Mail successfully sent: ", info);
        //                             }
        //                         });
        //                     }
        //                 });
        //
        //                 Apio.Util.log("Sync operation completed!");
        //             }
        //         });
        //     });
        //
        //     form.parse(req, function (err, fields, files) {
        //         console.log("form.parse");
        //     });
        // },
        sync: function (req, res) {
            console.log("TOGLIERE uuid da questo handler e metterlom nel body della request");
            console.log("Il sistema apio con id " + req.params.uuid + " mi sta mandando dei file");
            //Devo rifiutare ogni chiamata che non mi manda l'auth
            //QUi mi arriva un tar.gz contenente tutte le app
            var form = new formidable.IncomingForm();
            form.uploadDir = "uploads";
            form.keepExtensions = true;

            form.parse(req, function (err, fields, files) {
                console.log("form.parse");
            });

            form.on("file", function (name, file) {
                Apio.Util.log("Received file " + file.name + "_" + req.params.uuid + " as " + file.path);
                fs.move(file.path, "uploads/" + file.name + "_" + req.params.uuid, {clobber: true}, function (err_r) {
                    if (err_r) {
                        console.log("Rename error: ", err_r);
                        res.send({
                            status: false
                        });
                    } else {
                        Apio.Util.log("File moved to uploads/" + file.name + "_" + req.params.uuid);
                        fs.mkdirs("uploads/temp", function (err_mk1) {
                            if (err_mk1) {
                                console.log("Mkdirs error: ", err_mk1);
                                res.send({
                                    status: false
                                });
                            } else {
                                targz().extract("./uploads/" + file.name + "_" + req.params.uuid, "./uploads/temp", function (err) {
                                    if (err) {
                                        Apio.Util.log("Error while extracting file" + file.name + "_" + req.params.uuid);
                                        console.log(err);
                                        res.send({
                                            status: false
                                        });
                                    } else {
                                        Apio.Util.log("The extraction has ended!");
                                        Apio.Util.log("Moving applications to public/boards/" + req.params.uuid + " ...");

                                        var basePath = "uploads/temp/" + req.params.uuid;
                                        fs.stat(basePath, function (err_s, stats) {
                                            if (err_s) {
                                                console.log("Stats error: ", err_s);
                                                res.send({
                                                    status: false
                                                });
                                            } else if (stats) {
                                                fs.copy(basePath, "public/boards/" + req.params.uuid, {clobber: true}, function (err_cp) {
                                                    if (err_cp) {
                                                        console.log("Error while copying directory: ", err_cp);
                                                        res.send({
                                                            status: false
                                                        });
                                                    } else {
                                                        fs.remove(basePath, function (err_rm) {
                                                            if (err_rm) {
                                                                console.log("Error while removing directory: ", err_rm);
                                                                res.send({
                                                                    status: false
                                                                });
                                                            } else {
                                                                console.log("New files installed");
                                                                Apio.Database.db.collection("systems").findOne({apioId: req.params.uuid}, function (err, board) {
                                                                    if (err) {
                                                                        console.log("Error while getting board with apioId " + req.params.uuid + ": ", err);
                                                                    } else if (board) {
                                                                        var text = "";
                                                                        if (board.name) {
                                                                            text += "La board " + board.name + " (apioId: " + req.params.uuid + ")";
                                                                        } else {
                                                                            text += "La board con apioId " + req.params.uuid;
                                                                        }

                                                                        text += " ha terminato la sincronizzazione alle " + (new Date());

                                                                        transporter.sendMail({
                                                                            to: "info@apio.cc",
                                                                            //from: "Apio <apioassistance@gmail.com>",
                                                                            from: "Apio <info@apio.cc>",
                                                                            subject: "Sincronizzazione terminata",
                                                                            text: text
                                                                        }, function (err, info) {
                                                                            if (err) {
                                                                                console.log("Error while sending mail: ", err);
                                                                            } else if (info) {
                                                                                console.log("Mail successfully sent: ", info);
                                                                            }
                                                                        });
                                                                    }
                                                                });

                                                                Apio.Util.log("Deleting ./uploads/" + file.name + "_" + req.params.uuid + "...");
                                                                fs.unlink("./uploads/" + file.name + "_" + req.params.uuid, function (e_u) {
                                                                    if (e_u) {
                                                                        res.send({
                                                                            status: false
                                                                        });

                                                                        console.log("Error while unlinking file: ", e_u);
                                                                    } else {
                                                                        res.send({
                                                                            status: true
                                                                        });

                                                                        Apio.Util.log("Sync operation completed!");
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        },
        syncLogics: function (req, res) {
            var form = new formidable.IncomingForm();
            form.uploadDir = "servicesCloud";
            form.keepExtensions = true;

            form.parse(req, function (err, fields, files) {
                console.log("form.parse");
            });

            form.on("file", function (name, file) {
                targz().extract(file.path, "./servicesCloud/apio_logic", function (err) {
                    if (err) {
                        console.log("Error while extracting file: ", err);
                    } else {
                        console.log("Extraction OK");
                        fs.unlinkSync(file.path);
                        res.sendStatus(200);
                    }
                });
            });
        },
        allowCloud: function (req, res) {
            if (req.body.permission) {
                Apio.Database.db.collection("systems").insert({apioId: req.body.boardId, test: ""}, function (err) {
                    if (err) {
                        console.log("An error occured while inserting the board " + req.body.boardId, err);
                        res.status(500).send();
                    } else {
                        console.log("The board " + req.body.boardId + " as been correctly inserted");
                        //Apio.io.to(req.body.boardId).emit("apio_board_enabled");
                        Apio.io.emit("apio_board_enabled", req.body.boardId);
                        res.status(200).send();
                    }
                });
            } else {
                Apio.Database.db.collection("systems").findAndRemove({apioId: req.body.boardId}, function (err, removedBoard) {
                    if (err) {
                        console.log("An error occured while removing the board " + req.body.boardId, err);
                        res.status(500).send();
                    } else if (removedBoard) {
                        console.log("The board " + req.body.boardId + " as been correctly removed");
                        res.status(200).send();
                    } else {
                        console.log("Unable to find the board " + req.body.boardId);
                        res.status(404).send();
                    }
                });
            }
        },
        //enableSync: function (req, res) {
        //    //Apio.Database.db.collection("systems").findOne({apioId: req.params.apioId}, function (error, board) {
        //    //    if (error) {
        //    //        console.log("Error while finding board with apioId " + req.params.apioId + ": ", error);
        //    //        res.status(500).error(error);
        //    //    } else if (board) {
        //    //        res.sendStatus(200);
        //    //    } else {
        //    //        res.sendStatus(404);
        //    //    }
        //    //});
        //    var isUUIDGood = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        //    if (isUUIDGood.test(req.params.apioId)) {
        //        if (Apio.boardsToSync.hasOwnProperty(req.params.apioId)) {
        //            res.sendFile("board_name.html", {root: appRoot.path + "/public/html"}, function (err) {
        //                if (err) {
        //                    console.log("Error while getting file " + appRoot.path + "/public/html/board_name.html: ", err);
        //                    res.status(500).end(err);
        //                } else {
        //                    console.log("Sent:", appRoot.path + "/public/html/board_name.html");
        //                }
        //            });
        //        } else {
        //            res.status(500).send("Board already registered");
        //        }
        //    } else {
        //        res.status(500).send("apioId not well formed");
        //    }
        //},
        enableSync: function (req, res) {
            var isUUIDGood = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (isUUIDGood.test(req.params.apioId)) {
                req.pause();
                Apio.servicesSocket.boardSync.emit("apio_ask_boards_to_sync");
                Apio.servicesSocket.boardSync.on("apio_get_boards_to_sync", function (data) {
                    req.resume();
                    if (data.hasOwnProperty(req.params.apioId)) {
                        res.sendFile("board_name.html", {root: appRoot.path + "/public/html"}, function (err) {
                            if (err) {
                                console.log("Error while getting file " + appRoot.path + "/public/html/board_name.html: ", err);
                                res.status(500).end(err);
                            } else {
                                console.log("Sent:", appRoot.path + "/public/html/board_name.html");
                                res.sendStatus(200);
                            }
                            Apio.servicesSocket.boardSync.off("apio_get_boards_to_sync");
                        });
                    } else {
                        res.status(500).send("Board already registered");
                        Apio.servicesSocket.boardSync.off("apio_get_boards_to_sync");
                    }
                });
            } else {
                res.status(500).send("apioId not well formed");
            }
        },
        //VECCHIO
        //assignToken: function (req, res) {
        //    var isUUIDGood = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        //    if (isUUIDGood.test(req.body.apioId)) {
        //        if (Apio.boardsToSync.hasOwnProperty(req.body.apioId)) {
        //            //var key = aesjs.util.convertStringToBytes(fs.readFileSync("./cloud_key.apio", "utf8"));
        //            //var string = req.body.apioId;
        //            //var stringBytes = aesjs.util.convertStringToBytes(string);
        //            //
        //            //var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        //            //var encryptedBytes = aesCtr.encrypt(stringBytes);
        //            //
        //            //var byteArray = new Uint32Array(encryptedBytes);
        //            //var bytes = "";
        //            //for (var i in byteArray) {
        //            //    var hex = byteArray[i].toString(16);
        //            //    if (hex.length === 1) {
        //            //        hex = "0" + hex;
        //            //    }
        //            //    bytes += hex;
        //            //}
        //
        //            var bytes = Apio.Token.getFromText(req.body.apioId, fs.readFileSync("./cloud_key.apio", "utf8"));
        //
        //            Apio.Database.db.collection("systems").insert(req.body, function (err) {
        //                if (err) {
        //                    console.log("Error while inserting data of the new system: ", err);
        //                    res.status(500).send(err);
        //                } else {
        //                    if (!Apio.hasOwnProperty("connectedSockets")) {
        //                        Apio.connectedSockets = {};
        //                    }
        //
        //                    if (!Apio.connectedSockets.hasOwnProperty(req.body.apioId)) {
        //                        Apio.connectedSockets[req.body.apioId] = [];
        //                    }
        //
        //                    if (Apio.connectedSockets[req.body.apioId].indexOf(Apio.boardsToSync[req.body.apioId].socket.id) === -1) {
        //                        Apio.connectedSockets[req.body.apioId].push(Apio.boardsToSync[req.body.apioId].socket.id);
        //                    }
        //
        //                    Apio.boardsToSync[req.body.apioId].socket.emit("get_apio_token", bytes);
        //                    Apio.boardsToSync[req.body.apioId].socket.emit("apio.remote.sync.request", req.body);
        //                    delete Apio.boardsToSync[req.body.apioId];
        //                    res.sendStatus(200);
        //                }
        //            });
        //        } else {
        //            res.status(500).send("Board already registered");
        //        }
        //    } else {
        //        res.status(500).send("apioId not well formed");
        //    }
        //}
        assignToken: function (req, res) {
            var isUUIDGood = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (isUUIDGood.test(req.body.apioId)) {
                req.pause();
                Apio.servicesSocket.boardSync.emit("apio_ask_boards_to_sync");
                Apio.servicesSocket.boardSync.on("apio_get_boards_to_sync", function (data) {
                    console.log("apio_get_boards_to_sync: ", data);
                    req.resume();
                    if (data.hasOwnProperty(req.body.apioId)) {
                        var bytes = Apio.Token.getFromText(req.body.apioId, fs.readFileSync("./cloud_key.apio", "utf8"));

                        Apio.Database.db.collection("systems").insert(req.body, function (err) {
                            if (err) {
                                console.log("Error while inserting data of the new system: ", err);
                                res.status(500).send(err);
                            } else {
                                Apio.servicesSocket.boardSync.emit("apio_board_has_been_enabled", {
                                    body: req.body,
                                    bytes: bytes
                                });
                                res.sendStatus(200);
                            }
                        });
                    } else {
                        res.status(500).send("Board already registered");
                    }

                    Apio.servicesSocket.boardSync.off("apio_get_boards_to_sync");
                });
            } else {
                res.status(500).send("apioId not well formed");
            }
        },
        generateAndSendPDF: function (req, res) {
            var routeComponents = req.body.route.split("/");
            var pdf_name = undefined;
            var objectId = undefined;
            for (var i = 0; pdf_name === undefined && i < routeComponents.length; i++) {
                if (routeComponents[i] === "boards") {
                    objectId = routeComponents[i + 2];
                    pdf_name = objectId + "_" + routeComponents[i + 1];
                }
            }

            if (pdf_name) {
                pdf_name += ".pdf";
            }

            if (objectId) {
                fs.mkdirs("./public/applications/" + objectId, function (err_md) {
                    if (err_md) {
                        console.log("Error while creating directory ./public/applications/" + objectId + ": ", err_md);
                        res.status(500).send(err_md);
                    } else {
                        fs.writeFile("./public/applications/" + objectId + "/" + objectId + ".json", req.body.fileContent, function (err_w) {
                            if (err_w) {
                                console.log("Error while writing file ./public/applications/" + objectId + "/" + objectId + ".json: ", err_w);
                                res.status(500).send(err_w);
                            } else {
                                exec("phantomjs ./createPDF.js " + req.body.route + " ./" + pdf_name, function (error_ph) {
                                    if (error_ph) {
                                        console.log("Error while creating PDF: ", error_ph);
                                        res.status(500).send(error_ph);
                                    } else {
                                        fs.remove("./public/applications/" + objectId, function (err_rm) {
                                            if (err_rm) {
                                                console.log("Error while removing directory ./public/applications/" + objectId + ": ", err_rm);
                                            } else {
                                                transporter.sendMail({
                                                    attachments: [{
                                                        filename: req.body.pdfName ? req.body.pdfName + ".pdf" : "document.pdf",
                                                        content: fs.createReadStream("./" + pdf_name)
                                                    }],
                                                    bcc: req.body.mail.bcc,
                                                    cc: req.body.mail.cc,
                                                    from: "Apio <info@apio.cc>",
                                                    html: req.body.mail.html,
                                                    subject: req.body.mail.subject,
                                                    text: req.body.mail.text,
                                                    to: req.body.mail.to
                                                }, function (err, info) {
                                                    fs.unlink("./" + pdf_name, function (err_u) {
                                                        if (err_u) {
                                                            console.log("Error while unlinking file: ", err_u);
                                                            res.status(500).send(err_u);
                                                        } else {
                                                            if (err) {
                                                                console.log("Error while sending mail: ", err);
                                                                res.status(500).send(err);
                                                            } else if (info) {
                                                                console.log("Mail successfully sent: ", info);
                                                                res.status(200).send(info);
                                                            }
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.sendStatus(500);
            }
        }
    }
};