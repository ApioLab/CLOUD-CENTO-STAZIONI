module.exports = function (logic) {
    var Apio = require("../../apio.js")(false);
    var fs = require("fs");
    var request = require("request");
    var validator = require("validator");

    var id = fs.readFileSync("../Identifier.apio", "utf8").trim();
    var dbReady = false;
    var installation = undefined;
    var lastMonthly = undefined;
    var lastBimonthly = undefined;
    var lastThreeMonthly = undefined;
    var lastBiannual = undefined;
    var lastAnnual = undefined;
    var created = undefined;
    var sendMonthly = false;
    var sendBimonthly = false;
    var sendThreeMonthly = false;
    var sendBiannual = false;
    var sendAnnual = false;
    var monthlyHasBeenSent = false;
    var bimonthlyHasBeenSent = false;
    var threeMonthlyHasBeenSent = false;
    var biannualHasBeenSent = false;
    var annualHasBeenSent = false;
    Apio.Database.connect(function () {
        console.log("Successfully connected to Mongo DB");
        Apio.Database.db.collection("Objects").findOne({objectId: "_TMP_"}, function (err, object) {
            if (err) {
                console.log("Error while getting integratedCommunication protocols: ", err);
            } else if (object) {
                if (object.created) {
                    created = new Date(Number(object.created.split("-")[0]), Number(object.created.split("-")[1]) - 1, Number(object.created.split("-")[2]));
                    console.log("DATA CREAZIONE REPORT", created);

                }
                installation = object;
                if (object.db) {

                    if (object.db.reports) {
                        if (object.db.reports.indexOf("monthly") > -1) {
                            sendMonthly = true;
                        }

                        if (object.db.reports.indexOf("bimonthly") > -1) {
                            sendBimonthly = true;
                        }

                        if (object.db.reports.indexOf("three-monthly") > -1) {
                            sendThreeMonthly = true;
                        }

                        if (object.db.reports.indexOf("biannual") > -1) {
                            sendBiannual = true;
                        }

                        if (object.db.reports.indexOf("annual") > -1) {
                            sendAnnual = true;
                        }



                        // fs.readFile("../Identifier.apio", "utf8", function (err_ai, apioId) {
                        //     if (err_ai) {
                        //         console.log("Error while getting apioId: ", err_ai);
                        //     } else if (apioId) {
                        //         id = apioId.trim();
                        //     } else {
                        //         console.log("apioId is empty");
                        //     }
                        // });

                        // id = fs.readFileSync("../Identifier.apio", "utf8").trim();
                    } else {
                        console.log("reports undefined");
                    }

                    if (object.db.reportsLastSent) {
                        if (object.db.reportsLastSent.monthly) {
                            lastMonthly = new Date(object.db.reportsLastSent.monthly);
                        }

                        if (object.db.reportsLastSent.bimonthly) {
                            lastBimonthly = new Date(object.db.reportsLastSent.bimonthly);
                        }

                        if (object.db.reportsLastSent["three-monthly"]) {
                            lastThreeMonthly = new Date(object.db.reportsLastSent["three-monthly"]);
                        }

                        if (object.db.reportsLastSent.biannual) {
                            lastBiannual = new Date(object.db.reportsLastSent.biannual);
                        }

                        if (object.db.reportsLastSent.annual) {
                            lastAnnual = new Date(object.db.reportsLastSent.annual);
                        }
                    } else {
                        console.log("reportsLastSent undefined");
                    }

                    dbReady = true;
                } else {
                    console.log("db undefined");
                }
            } else {
                console.log("Unable to find any object with objectId _TMP_");
            }
        });
    }, false);
    setInterval(function () {
        if (dbReady) {
            var mutual = true;
            console.log("iterazione : mutual ", mutual);
            var ts = new Date();
            if (mutual && sendMonthly && (((ts.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) >= 28) && (lastMonthly === undefined || (ts.getFullYear() === lastMonthly.getFullYear() && ts.getMonth() - lastMonthly.getMonth() === 1) || (ts.getFullYear() === lastMonthly.getFullYear() - 1 && ts.getMonth() - lastMonthly.getMonth() === -11))) {
                console.log("ENTRO MENSILE ");
                if (ts.getDate() >= 1 && ts.getHours() >= 1) {
                    if (!monthlyHasBeenSent) {
                        mutual = false;
                        console.log("INVIO REPORT MENSILE");
                        lastMonthly = ts;
                        monthlyHasBeenSent = true;
                        Apio.Database.db.collection("Objects").update({objectId: "_TMP_"}, {$set: {"db.reportsLastSent.monthly": ts}}, function (error, result) {
                            if (error) {
                                console.log("Error while updating object with objectId _TMP_: ", error);
                            } else if (result) {
                                console.log("Object with objectId _TMP_ successfully updated");
                                Apio.Database.db.collection("Objects").findOne({objectId: "_TMP_"}, function (errFind, object) {
                                    fs.writeFile('../public/applications/_TMP_/_TMP_.json', JSON.stringify(object), function (errWrite) {
                                        if (errWrite) {
                                            console.log("si è verificato un errore nella scrittura del file: ", errWrite);
                                        } else {
                                            // var route = "http://localhost:_TMP_86/applications/_TMP_//utils/report.client.html?report=1";
                                            //var html5pdf = require("html5-to-pdf");
                                            //// var fs = require("fs");
                                            //
                                            //// fs.createReadStream("/path/to/document.html")
                                            ////     .pipe(html5pdf())
                                            ////     .pipe(fs.createWriteStream("/path/to/document.pdf"));
                                            //
                                            //html5pdf().from.string(data).to("./monthlyReport.pdf", function () {
                                            ///*console.log("Done")
                                            //});
                                            // var exec = require('child_process').exec;
                                            //     exec("phantomjs ../createPDF.js " + route + " ./monthlyReport.pdf",function(){
                                            /*var webshot = require('webshot');

                                             var options = {
                                             //screenSize: {
                                             //    width: 320
                                             //    , height: 4_TMP_
                                             //}
                                             //, shotSize: {
                                             //    width: 320
                                             //    , height: 'all'
                                             //},
                                             renderDelay:10000
                                             //takeShotOnCallback: true
                                             //, userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'
                                             //+ ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g'
                                             };

                                             webshot(route, 'monthlyReport.jpeg', options, function(err) {*/
                                            Apio.Database.db.collection("Users").find({role: "superAdmin"}).toArray(function (error_users, users) {
                                                if (error_users) {
                                                    console.log("Error while getting users: ", error_users);
                                                } else if (users) {
                                                    var to = [];
                                                    var ccn = [];
                                                    var bcc = [];
                                                    for (var u in users) {
                                                        if (validator.isEmail(users[u].email)) {
                                                            if (!to.length) {
                                                                to.push(users[u].email);
                                                            } else {
                                                                ccn.push(users[u].email);
                                                                bcc.push(users[u].email);
                                                            }
                                                        }
                                                    }

                                                    if (to.length) {
                                                        var literalMonth = undefined;
                                                        switch (ts.getMonth()) {
                                                            case 0:
                                                                literalMonth = "dicembre";

                                                                break;
                                                            case 1:
                                                                literalMonth = "gennaio";

                                                                break;
                                                            case 2:
                                                                literalMonth = "febbraio";

                                                                break;
                                                            case 3:
                                                                literalMonth = "marzo";

                                                                break;
                                                            case 4:
                                                                literalMonth = "aprile";

                                                                break;
                                                            case 5:
                                                                literalMonth = "maggio";

                                                                break;
                                                            case 6:
                                                                literalMonth = "giugno";

                                                                break;
                                                            case 7:
                                                                literalMonth = "luglio";

                                                                break;
                                                            case 8:
                                                                literalMonth = "agosto";

                                                                break;
                                                            case 9:
                                                                literalMonth = "settembre";

                                                                break;
                                                            case 10:
                                                                literalMonth = "ottobre";

                                                                break;
                                                            case 11:
                                                                literalMonth = "novembre";
                                                                break;
                                                            default:
                                                                break;
                                                        }
                                                        console.log("");
                                                        console.log("to: ", to);


                                                        fs.readFile("../public/applications/_TMP_/_TMP_.json", "utf8", function (err_js, jsonString) {
                                                            if (err_js) {
                                                                console.log("Error while getting file ./public/applications/_TMP_/_TMP_.json: ", err_js);
                                                            } else if (jsonString) {
                                                                request.post({
                                                                    json: true,
                                                                    uri: "http://dev.apio.cloud/apio/generateAndSendPDF",
                                                                    body: {
                                                                        pdfName: "monthlyReport",
                                                                        route: "http://dev.apio.cloud/boards/" + id + "/_TMP_/utils/report.client.html?report=1",
                                                                        fileContent: jsonString,
                                                                        mail: {
                                                                            to: to,
                                                                            bcc: ccn,
                                                                            subject: "Report Mensile",
                                                                            text: "Buongiorno, di seguito trova il Report dell'installazione " + installation.name + ", relativo " + (literalMonth ? "al mese di " + literalMonth : "al mese appena trascorso")


                                                                        }
                                                                    }
                                                                }, function (err_r, response, body) {
                                                                    if (err_r || !response || Number(response.statusCode) !== 200) {
                                                                        console.log("Error while getting PDF from cloud");
                                                                        console.log(err_r);
                                                                        console.log(response);
                                                                        console.log(body);
                                                                        //faccio rinviare il report in caso di errore
                                                                        monthlyHasBeenSent = false;
                                                                        lastMonthly = undefined;
                                                                    } else {
                                                                        console.log("Mail successfully sent: ", response.body);
                                                                        // fs.unlink("../public/applications/_TMP_/_TMP_.json", function (err_u) {
                                                                        //     if (err_u) {
                                                                        //         console.log("Error while unlinking file: ", err_u);
                                                                        //     } else {
                                                                        //         console.log("File _TMP_.json successfully unlinked");
                                                                        //
                                                                        //     }
                                                                        // });


                                                                    }
                                                                });
                                                            } else {
                                                                console.log("File ./public/applications/_TMP_/_TMP_.json is empty");
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    console.log("No superAdmins found, unable to send mail");
                                                }
                                            });

                                            // });
                                        }
                                    });

                                });
                            } else {
                                console.log("Unable to update object with objectId _TMP_");
                            }
                        });
                    }
                } else {
                    monthlyHasBeenSent = false;
                }
            }

            if (mutual && sendBimonthly && (((ts.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) >= 2 * 28) && ((lastBimonthly === undefined) || (ts.getFullYear() === lastBimonthly.getFullYear() && ts.getMonth() - lastBimonthly.getMonth() === 2) || (ts.getFullYear() === lastBimonthly.getFullYear() - 1 && ts.getMonth() - lastBimonthly.getMonth() === -10))) {
                console.log("ENTRO BIMESTRALE");

                if (ts.getDate() >= 1 && ts.getHours() >= 1) {
                    if (!bimonthlyHasBeenSent) {
                        mutual = false;
                        console.log("INVIO REPORT BIMESTRALE");
                        bimonthlyHasBeenSent = true;
                        Apio.Database.db.collection("Objects").update({objectId: "_TMP_"}, {$set: {"db.reportsLastSent.bimonthly": ts}}, function (error, result) {
                            if (error) {
                                console.log("Error while updating object with objectId _TMP_: ", error);
                            } else if (result) {
                                console.log("Object with objectId _TMP_ successfully updated");
                                Apio.Database.db.collection("Objects").findOne({objectId: "_TMP_"}, function (errFind, object) {
                                    fs.writeFile('../public/applications/_TMP_/_TMP_.json', JSON.stringify(object), function (errWrite) {
                                        if (errWrite) {
                                            console.log("si è verificato un errore nella scrittura del file: ", errWrite);
                                        } else {
                                            Apio.Database.db.collection("Users").find({role: "superAdmin"}).toArray(function (error_users, users) {
                                                if (error_users) {
                                                    console.log("Error while getting users: ", error_users);
                                                } else if (users) {
                                                    var to = [];
                                                    var ccn = [];
                                                    var bcc = [];
                                                    for (var u in users) {
                                                        if (validator.isEmail(users[u].email)) {
                                                            if (!to.length) {
                                                                to.push(users[u].email);
                                                            } else {
                                                                ccn.push(users[u].email);
                                                                bcc.push(users[u].email);
                                                            }
                                                        }
                                                    }

                                                    if (to.length) {
                                                        var literalMonth = undefined;
                                                        var startMonth = undefined;
                                                        switch (ts.getMonth()) {
                                                            case 0:
                                                                literalMonth = "dicembre";
                                                                startMonth = "novembre";
                                                                break;
                                                            case 1:
                                                                literalMonth = "gennaio";
                                                                startMonth = "dicembre";

                                                                break;
                                                            case 2:
                                                                literalMonth = "febbraio";
                                                                startMonth = "gennaio";

                                                                break;
                                                            case 3:
                                                                literalMonth = "marzo";
                                                                startMonth = "febbraio";

                                                                break;
                                                            case 4:
                                                                literalMonth = "aprile";
                                                                startMonth = "marzo";

                                                                break;
                                                            case 5:
                                                                literalMonth = "maggio";
                                                                startMonth = "aprile";

                                                                break;
                                                            case 6:
                                                                literalMonth = "giugno";
                                                                startMonth = "maggio";

                                                                break;
                                                            case 7:
                                                                literalMonth = "luglio";
                                                                startMonth = "giugno";

                                                                break;
                                                            case 8:
                                                                literalMonth = "agosto";
                                                                startMonth = "luglio";

                                                                break;
                                                            case 9:
                                                                literalMonth = "settembre";
                                                                startMonth = "agosto";

                                                                break;
                                                            case 10:
                                                                literalMonth = "ottobre";
                                                                startMonth = "settembre";

                                                                break;
                                                            case 11:
                                                                literalMonth = "novembre";
                                                                startMonth = "ottobre";

                                                                break;
                                                            default:
                                                                break;
                                                        }
                                                        console.log("");
                                                        console.log("to: ", to);

                                                        // var request = require("request");
                                                        // request({
                                                        //     json: true,
                                                        //     method: "POST",
                                                        //     uri: "http://localhost:" + Apio.Configuration.http.port + "/apio/service/notification/route/" + encodeURIComponent("/apio/mail/send") + "/data/" + encodeURIComponent(JSON.stringify({
                                                        //         attachments: [{
                                                        //             filename: "bimonthlyReport.pdf",
                                                        //             content: fs.createReadStream("./bimonthlyReport.pdf")
                                                        //         }],
                                                        //         to: to,
                                                        //         cc: ccn,
                                                        //         subject: "Report Bimestrale",
                                                        //         text: "Buongiorno, di seguito trova il Report dell'installazione " + installation.name + ", relativo " + (literalMonth && startMonth ? "al bimestre " + startMonth + "-" + literalMonth : "al bimestre appena trascorso")
                                                        //     }))
                                                        // }, function (err, response, body) {
                                                        //     if (err || !response || Number(response.statusCode) !== 200) {
                                                        //         console.log("Error while sending mail: ", err);
                                                        //     } else {
                                                        //         console.log("Mail successfully sent: ", response.body);
                                                        //         fs.unlink("./bimonthlyReport.pdf", function (err_u) {
                                                        //             if (err_u) {
                                                        //                 console.log("Error while unlinking file: ", err_u);
                                                        //             } else {
                                                        //                 console.log("File ./_TMP__monthly.png successfully unlinked");
                                                        //                 fs.unlink("../public/applications/_TMP_/_TMP_.json", function (err_u) {
                                                        //                     if (err_u) {
                                                        //                         console.log("Error while unlinking file: ", err_u);
                                                        //                     } else {
                                                        //                         console.log("File _TMP_.json successfully unlinked");
                                                        //
                                                        //                     }
                                                        //                 });
                                                        //             }
                                                        //         });
                                                        //     }
                                                        // });

                                                        fs.readFile("../public/applications/_TMP_/_TMP_.json", "utf8", function (err_js, jsonString) {
                                                            if (err_js) {
                                                                console.log("Error while getting file ./public/applications/_TMP_/_TMP_.json: ", err_js);
                                                            } else if (jsonString) {
                                                                request.post({
                                                                    json: true,
                                                                    uri: "http://dev.apio.cloud/apio/generateAndSendPDF",
                                                                    body: {
                                                                        pdfName: "biMonthlyReport",
                                                                        route: "http://dev.apio.cloud/boards/" + id + "/_TMP_/utils/report.client.html?report=2",
                                                                        fileContent: jsonString,
                                                                        mail: {
                                                                            to: to,
                                                                            cc: ccn,
                                                                            subject: "Report Bimestrale",
                                                                            text: "Buongiorno, di seguito trova il Report dell'installazione " + installation.name + ", relativo " + (literalMonth && startMonth ? "al bimestre " + startMonth + "-" + literalMonth : "al bimestre appena trascorso")

                                                                        }
                                                                    }
                                                                }, function (err_r, response, body) {
                                                                    if (err_r || !response || Number(response.statusCode) !== 200) {
                                                                        console.log("Error while getting PDF from cloud");
                                                                        console.log(err_r);
                                                                        console.log(response);
                                                                        console.log(body);
                                                                        //faccio rinviare il report in caso di errore
                                                                        bimonthlyHasBeenSent = false;
                                                                        lastBimonthly = undefined;
                                                                    } else {
                                                                        console.log("Mail successfully sent: ", response.body);
                                                                        // fs.unlink("../public/applications/_TMP_/_TMP_.json", function (err_u) {
                                                                        //     if (err_u) {
                                                                        //         console.log("Error while unlinking file: ", err_u);
                                                                        //     } else {
                                                                        //         console.log("File _TMP_.json successfully unlinked");
                                                                        //
                                                                        //     }
                                                                        // });


                                                                    }
                                                                });
                                                            } else {
                                                                console.log("File ./public/applications/_TMP_/_TMP_.json is empty");
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    console.log("No superAdmins found, unable to send mail");
                                                }
                                            });


                                        }
                                    });
                                    // .inject("css", "../public/bower_components/bootstrap/dist/css/bootstrap.min.css")
                                    // .inject("css", "../public/applications/_TMP_/utils/report.client.css")


                                });
                            } else {
                                console.log("Unable to update object with objectId _TMP_");
                            }
                        });
                    }
                } else {
                    bimonthlyHasBeenSent = false;
                }
            }

            if (mutual && sendThreeMonthly && ((ts.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) >= 3 * 28) && ((lastThreeMonthly === undefined) || (ts.getFullYear() === lastThreeMonthly.getFullYear() && ts.getMonth() - lastThreeMonthly.getMonth() === 3) || (ts.getFullYear() === lastThreeMonthly.getFullYear() - 1 && ts.getMonth() - lastThreeMonthly.getMonth() === -9))) {
                console.log("ENTRO TRIMESTRALE");
                if (ts.getDate() >= 1 && ts.getHours() >= 1) {
                    if (!threeMonthlyHasBeenSent) {
                        mutual = false;
                        console.log("INVIO REPORT TRIMESTRALE");
                        threeMonthlyHasBeenSent = true;
                        Apio.Database.db.collection("Objects").update({objectId: "_TMP_"}, {$set: {"db.reportsLastSent.three-monthly": ts}}, function (error, result) {
                            if (error) {
                                console.log("Error while updating object with objectId _TMP_: ", error);
                            } else if (result) {
                                console.log("Object with objectId _TMP_ successfully updated");
                                Apio.Database.db.collection("Objects").findOne({objectId: "_TMP_"}, function (errFind, object) {
                                    fs.writeFile('../public/applications/_TMP_/_TMP_.json', JSON.stringify(object), function (errWrite) {
                                        if (errWrite) {
                                            console.log("si è verificato un errore nella scrittura del file: ", errWrite);
                                        } else {

                                            console.log('Done!');
                                            Apio.Database.db.collection("Users").find({role: "superAdmin"}).toArray(function (error_users, users) {
                                                if (error_users) {
                                                    console.log("Error while getting users: ", error_users);
                                                } else if (users) {
                                                    var to = [];
                                                    var ccn = [];
                                                    var bcc = [];
                                                    for (var u in users) {
                                                        if (validator.isEmail(users[u].email)) {
                                                            if (!to.length) {
                                                                to.push(users[u].email);
                                                            } else {
                                                                ccn.push(users[u].email);
                                                                bcc.push(users[u].email);
                                                            }
                                                        }
                                                    }

                                                    if (to.length) {
                                                        var literalMonth = undefined;
                                                        var startMonth = undefined;
                                                        switch (ts.getMonth()) {
                                                            case 0:
                                                                literalMonth = "dicembre";
                                                                startMonth = "ottobre";
                                                                break;
                                                            case 1:
                                                                literalMonth = "gennaio";
                                                                startMonth = "novembre";

                                                                break;
                                                            case 2:
                                                                literalMonth = "febbraio";
                                                                startMonth = "dicembre";
                                                                break;
                                                            case 3:
                                                                literalMonth = "marzo";
                                                                startMonth = "gennaio";

                                                                break;
                                                            case 4:
                                                                literalMonth = "aprile";
                                                                startMonth = "febbraio";

                                                                break;
                                                            case 5:
                                                                literalMonth = "maggio";
                                                                startMonth = "marzo";

                                                                break;
                                                            case 6:
                                                                literalMonth = "giugno";
                                                                startMonth = "aprile";

                                                                break;
                                                            case 7:
                                                                literalMonth = "luglio";
                                                                startMonth = "maggio";

                                                                break;
                                                            case 8:
                                                                literalMonth = "agosto";
                                                                startMonth = "giugno";

                                                                break;
                                                            case 9:
                                                                literalMonth = "settembre";
                                                                startMonth = "luglio";

                                                                break;
                                                            case 10:
                                                                literalMonth = "ottobre";
                                                                startMonth = "agosto";

                                                                break;
                                                            case 11:
                                                                literalMonth = "novembre";
                                                                startMonth = "settembre";

                                                                break;
                                                            default:
                                                                break;
                                                        }
                                                        console.log("");
                                                        console.log("to: ", to);

                                                        // request({
                                                        //     json: true,
                                                        //     method: "POST",
                                                        //     uri: "http://localhost:" + Apio.Configuration.http.port + "/apio/service/notification/route/" + encodeURIComponent("/apio/mail/send") + "/data/" + encodeURIComponent(JSON.stringify({
                                                        //         attachments: [{
                                                        //             filename: "threemonthlyReport.pdf",
                                                        //             content: fs.createReadStream("./threemonthlyReport.pdf")
                                                        //         }],
                                                        //         to: to,
                                                        //         cc: ccn,
                                                        //         subject: "Report Trimestrale",
                                                        //         text: "Buongiorno, di seguito trova il Report dell'installazione " + installation.name + ", relativo " + (literalMonth && startMonth ? "al trimestre " + startMonth + "-" + literalMonth : "al trimestre appena trascorso")
                                                        //     }))
                                                        // }, function (err, response, body) {
                                                        //     if (err || !response || Number(response.statusCode) !== 200) {
                                                        //         console.log("Error while sending mail: ", err);
                                                        //     } else {
                                                        //         console.log("Mail successfully sent: ", response.body);
                                                        //         fs.unlink("./threemonthlyReport.pdf", function (err_u) {
                                                        //             if (err_u) {
                                                        //                 console.log("Error while unlinking file: ", err_u);
                                                        //             } else {
                                                        //                 console.log("File ./_TMP__monthly.png successfully unlinked");
                                                        //                 fs.unlink("../public/applications/_TMP_/_TMP_.json", function (err_u) {
                                                        //                     if (err_u) {
                                                        //                         console.log("Error while unlinking file: ", err_u);
                                                        //                     } else {
                                                        //                         console.log("File _TMP_.json successfully unlinked");
                                                        //
                                                        //                     }
                                                        //                 });
                                                        //             }
                                                        //         });
                                                        //     }
                                                        // });

                                                        fs.readFile("../public/applications/_TMP_/_TMP_.json", "utf8", function (err_js, jsonString) {
                                                            if (err_js) {
                                                                console.log("Error while getting file ./public/applications/_TMP_/_TMP_.json: ", err_js);
                                                            } else if (jsonString) {
                                                                request.post({
                                                                    json: true,
                                                                    uri: "http://dev.apio.cloud/apio/generateAndSendPDF",
                                                                    body: {
                                                                        pdfName: "threeMonthlyReport",
                                                                        route: "http://dev.apio.cloud/boards/" + id + "/_TMP_/utils/report.client.html?report=3",
                                                                        fileContent: jsonString,
                                                                        mail: {
                                                                            to: to,
                                                                            cc: ccn,
                                                                            subject: "Report Trimestrale",
                                                                            text: "Buongiorno, di seguito trova il Report dell'installazione " + installation.name + ", relativo " + (literalMonth && startMonth ? "al trimestre " + startMonth + "-" + literalMonth : "al trimestre appena trascorso")

                                                                        }
                                                                    }
                                                                }, function (err_r, response, body) {
                                                                    if (err_r || !response || Number(response.statusCode) !== 200) {
                                                                        console.log("Error while getting PDF from cloud");
                                                                        console.log(err_r);
                                                                        // console.log(response);
                                                                        // console.log(body);
                                                                        //faccio rinviare il report in caso di errore
                                                                        threeMonthlyHasBeenSent = false;
                                                                        lastThreeMonthly = undefined;
                                                                    } else {
                                                                        console.log("Mail successfully sent: ", response.body);
                                                                        // fs.unlink("../public/applications/_TMP_/_TMP_.json", function (err_u) {
                                                                        //     if (err_u) {
                                                                        //         console.log("Error while unlinking file: ", err_u);
                                                                        //     } else {
                                                                        //         console.log("File _TMP_.json successfully unlinked");
                                                                        //
                                                                        //     }
                                                                        // });


                                                                    }
                                                                });
                                                            } else {
                                                                console.log("File ./public/applications/_TMP_/_TMP_.json is empty");
                                                            }
                                                        });

                                                    }
                                                } else {
                                                    console.log("No superAdmins found, unable to send mail");
                                                }
                                            });
                                        }
                                    });
                                    // .inject("css", "../public/bower_components/bootstrap/dist/css/bootstrap.min.css")
                                    // .inject("css", "../public/applications/_TMP_/utils/report.client.css")


                                });
                            } else {
                                console.log("Unable to update object with objectId _TMP_");
                            }
                        });
                    }
                } else {
                    threeMonthlyHasBeenSent = false;
                }
            }

            if (mutual && sendBiannual && (((ts.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) >= 28 * 6) && ((lastBiannual === undefined) || (ts.getFullYear() === lastBiannual.getFullYear() && ts.getMonth() - lastBiannual.getMonth() === 6) || (ts.getFullYear() === lastBiannual.getFullYear() - 1 && ts.getMonth() - lastBiannual.getMonth() === -6))) {
                console.log("ENTRO BIANNUALE");
                if (ts.getDate() >= 1 && ts.getHours() >= 1) {
                    if (!biannualHasBeenSent) {
                        mutual = false;
                        console.log("INVIO REPORT BIANNUALE");
                        biannualHasBeenSent = true;
                        Apio.Database.db.collection("Objects").update({objectId: "_TMP_"}, {$set: {"db.reportsLastSent.biannual": ts}}, function (error, result) {
                            if (error) {
                                console.log("Error while updating object with objectId _TMP_: ", error);
                            } else if (result) {
                                console.log("Object with objectId _TMP_ successfully updated");
                                Apio.Database.db.collection("Objects").findOne({objectId: "_TMP_"}, function (errFind, object) {
                                    fs.writeFile('../public/applications/_TMP_/_TMP_.json', JSON.stringify(object), function (errWrite) {
                                        if (errWrite) {
                                            console.log("si è verificato un errore nella scrittura del file: ", errWrite);
                                        } else {
                                            console.log('Done!');
                                            Apio.Database.db.collection("Users").find({role: "superAdmin"}).toArray(function (error_users, users) {
                                                if (error_users) {
                                                    console.log("Error while getting users: ", error_users);
                                                } else if (users) {
                                                    var to = [];
                                                    var ccn = [];
                                                    var bcc = [];
                                                    for (var u in users) {
                                                        if (validator.isEmail(users[u].email)) {
                                                            if (!to.length) {
                                                                to.push(users[u].email);
                                                            } else {
                                                                ccn.push(users[u].email);
                                                                bcc.push(users[u].email);
                                                            }
                                                        }
                                                    }

                                                    if (to.length) {
                                                        var literalMonth = undefined;
                                                        var startMonth = undefined;
                                                        switch (ts.getMonth()) {
                                                            case 0:
                                                                literalMonth = "dicembre";
                                                                startMonth = "luglio";
                                                                break;
                                                            case 1:
                                                                literalMonth = "gennaio";
                                                                startMonth = "agosto";

                                                                break;
                                                            case 2:
                                                                literalMonth = "febbraio";
                                                                startMonth = "settembre";

                                                                break;
                                                            case 3:
                                                                literalMonth = "marzo";
                                                                startMonth = "ottobre";

                                                                break;
                                                            case 4:
                                                                literalMonth = "aprile";
                                                                startMonth = "novembre";

                                                                break;
                                                            case 5:
                                                                literalMonth = "maggio";
                                                                startMonth = "dicembre";

                                                                break;
                                                            case 6:
                                                                literalMonth = "giugno";
                                                                startMonth = "gennaio";

                                                                break;
                                                            case 7:
                                                                literalMonth = "luglio";
                                                                startMonth = "febbraio";

                                                                break;
                                                            case 8:
                                                                literalMonth = "agosto";
                                                                startMonth = "marzo";

                                                                break;
                                                            case 9:
                                                                literalMonth = "settembre";
                                                                startMonth = "aprile";

                                                                break;
                                                            case 10:
                                                                literalMonth = "ottobre";
                                                                startMonth = "maggio";

                                                                break;
                                                            case 11:
                                                                literalMonth = "novembre";
                                                                startMonth = "giugno";

                                                                break;
                                                            default:
                                                                break;
                                                        }
                                                        console.log("");
                                                        console.log("to: ", to);


                                                        fs.readFile("../public/applications/_TMP_/_TMP_.json", "utf8", function (err_js, jsonString) {
                                                            if (err_js) {
                                                                console.log("Error while getting file ./public/applications/_TMP_/_TMP_.json: ", err_js);
                                                            } else if (jsonString) {
                                                                request.post({
                                                                    json: true,
                                                                    uri: "http://dev.apio.cloud/apio/generateAndSendPDF",
                                                                    body: {
                                                                        pdfName: "biAnnualReport",
                                                                        route: "http://dev.apio.cloud/boards/" + id + "/_TMP_/utils/report.client.html?report=6",
                                                                        fileContent: jsonString,
                                                                        mail: {
                                                                            to: to,
                                                                            cc: ccn,
                                                                            subject: "Report Semestrale",
                                                                            text: "Buongiorno, di seguito trova il Report dell'installazione " + installation.name + ", relativo " + (literalMonth && startMonth ? "al semestre " + startMonth + "-" + literalMonth : "al semestre appena trascorso")

                                                                        }
                                                                    }
                                                                }, function (err_r, response, body) {
                                                                    if (err_r || !response || Number(response.statusCode) !== 200) {
                                                                        console.log("Error while getting PDF from cloud");
                                                                        console.log(err_r);
                                                                        // console.log(response);
                                                                        // console.log(body);
                                                                        //faccio rinviare il report in caso di errore
                                                                        biannualHasBeenSent = false;
                                                                        lastBiannual = undefined;
                                                                    } else {
                                                                        console.log("Mail successfully sent: ", response.body);
                                                                        // fs.unlink("../public/applications/_TMP_/_TMP_.json", function (err_u) {
                                                                        //     if (err_u) {
                                                                        //         console.log("Error while unlinking file: ", err_u);
                                                                        //     } else {
                                                                        //         console.log("File _TMP_.json successfully unlinked");
                                                                        //
                                                                        //     }
                                                                        // });


                                                                    }
                                                                });
                                                            } else {
                                                                console.log("File ./public/applications/_TMP_/_TMP_.json is empty");
                                                            }
                                                        });
                                                        // request({
                                                        //     json: true,
                                                        //     method: "POST",
                                                        //     uri: "http://localhost:" + Apio.Configuration.http.port + "/apio/service/notification/route/" + encodeURIComponent("/apio/mail/send") + "/data/" + encodeURIComponent(JSON.stringify({
                                                        //         attachments: [{
                                                        //             filename: "biannualReport.pdf",
                                                        //             content: fs.createReadStream("./biannualReport.pdf")
                                                        //         }],
                                                        //         to: to,
                                                        //         cc: ccn,
                                                        //         subject: "Report Semestrale",
                                                        //         text: "Buongiorno, di seguito trova il Report dell'installazione " + installation.name + ", relativo " + (literalMonth && startMonth ? "al semestre " + startMonth + "-" + literalMonth : "al semestre appena trascorso")
                                                        //     }))
                                                        // }, function (err, response, body) {
                                                        //     if (err || !response || Number(response.statusCode) !== 200) {
                                                        //         console.log("Error while sending mail: ", err);
                                                        //     } else {
                                                        //         console.log("Mail successfully sent: ", response.body);
                                                        //         fs.unlink("./biannualReport.pdf", function (err_u) {
                                                        //             if (err_u) {
                                                        //                 console.log("Error while unlinking file: ", err_u);
                                                        //             } else {
                                                        //                 console.log("File ./_TMP__monthly.png successfully unlinked");
                                                        //                 fs.unlink("../public/applications/_TMP_/_TMP_.json", function (err_u) {
                                                        //                     if (err_u) {
                                                        //                         console.log("Error while unlinking file: ", err_u);
                                                        //                     } else {
                                                        //                         console.log("File _TMP_.json successfully unlinked");
                                                        //
                                                        //                     }
                                                        //                 });
                                                        //             }
                                                        //         });
                                                        //     }
                                                        // });
                                                    }
                                                } else {
                                                    console.log("No superAdmins found, unable to send mail");
                                                }
                                            });


                                        }
                                    });
                                    // .inject("css", "../public/bower_components/bootstrap/dist/css/bootstrap.min.css")
                                    // .inject("css", "../public/applications/_TMP_/utils/report.client.css")


                                });
                            } else {
                                console.log("Unable to update object with objectId _TMP_");
                            }
                        });
                    }
                } else {
                    biannualHasBeenSent = false;
                }
            }

            if (mutual && sendAnnual && (((ts.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) >= 365) && ((lastAnnual === undefined) || ts.getMonth() - lastAnnual.getMonth() === 0)) {
                console.log("ENTRO ANNUALE");
                if (ts.getDate() >= 1 && ts.getHours() >= 1) {
                    if (!annualHasBeenSent) {
                        mutual = false;
                        console.log("INVIO REPORT ANNUALE");
                        annualHasBeenSent = true;
                        Apio.Database.db.collection("Objects").update({objectId: "_TMP_"}, {$set: {"db.reportsLastSent.annual": ts}}, function (error, result) {
                            if (error) {
                                console.log("Error while updating object with objectId _TMP_: ", error);
                            } else if (result) {
                                console.log("Object with objectId _TMP_ successfully updated");
                                Apio.Database.db.collection("Objects").findOne({objectId: "_TMP_"}, function (errFind, object) {
                                    fs.writeFile('../public/applications/_TMP_/_TMP_.json', JSON.stringify(object), function (errWrite) {
                                        if (errWrite) {
                                            console.log("si è verificato un errore nella scrittura del file: ", errWrite);
                                        } else {
                                            console.log('Done!');
                                            Apio.Database.db.collection("Users").find({role: "superAdmin"}).toArray(function (error_users, users) {
                                                if (error_users) {
                                                    console.log("Error while getting users: ", error_users);
                                                } else if (users) {
                                                    var to = [];
                                                    var ccn = [];
                                                    var bcc = [];
                                                    for (var u in users) {
                                                        if (validator.isEmail(users[u].email)) {
                                                            if (!to.length) {
                                                                to.push(users[u].email);
                                                            } else {
                                                                ccn.push(users[u].email);
                                                                bcc.push(users[u].email);
                                                            }
                                                        }
                                                    }

                                                    if (to.length) {
                                                        var literalMonth = undefined;
                                                        var startMonth = undefined;
                                                        switch (ts.getMonth()) {
                                                            case 0:
                                                                literalMonth = "dicembre";

                                                                break;
                                                            case 1:
                                                                literalMonth = "gennaio";

                                                                break;
                                                            case 2:
                                                                literalMonth = "febbraio";

                                                                break;
                                                            case 3:
                                                                literalMonth = "marzo";

                                                                break;
                                                            case 4:
                                                                literalMonth = "aprile";

                                                                break;
                                                            case 5:
                                                                literalMonth = "maggio";

                                                                break;
                                                            case 6:
                                                                literalMonth = "giugno";

                                                                break;
                                                            case 7:
                                                                literalMonth = "luglio";

                                                                break;
                                                            case 8:
                                                                literalMonth = "agosto";

                                                                break;
                                                            case 9:
                                                                literalMonth = "settembre";

                                                                break;
                                                            case 10:
                                                                literalMonth = "ottobre";

                                                                break;
                                                            case 11:
                                                                literalMonth = "novembre";
                                                                break;
                                                            default:
                                                                break;
                                                        }
                                                        console.log("");
                                                        console.log("to: ", to);


                                                        fs.readFile("../public/applications/_TMP_/_TMP_.json", "utf8", function (err_js, jsonString) {
                                                            if (err_js) {
                                                                console.log("Error while getting file ./public/applications/_TMP_/_TMP_.json: ", err_js);
                                                            } else if (jsonString) {
                                                                request.post({
                                                                    json: true,
                                                                    uri: "http://dev.apio.cloud/apio/generateAndSendPDF",
                                                                    body: {
                                                                        pdfName: "annualReport",
                                                                        route: "http://dev.apio.cloud/boards/" + id + "/_TMP_/utils/report.client.html?report=12",
                                                                        fileContent: jsonString,
                                                                        mail: {
                                                                            to: to,
                                                                            cc: ccn,
                                                                            subject: "Report Annuale",
                                                                            text: "Buongiorno, di seguito trova il Report dell'installazione " + installation.name + ", relativo " + (literalMonth ? "all'anno da " + literalMonth + " " + String(Number(ts.getFullYear()) - 1) + " a " + literalMonth + " " + ts.getFullYear() : "all'anno appena trascorso")

                                                                        }
                                                                    }
                                                                }, function (err_r, response, body) {
                                                                    if (err_r || !response || Number(response.statusCode) !== 200) {
                                                                        console.log("Error while getting PDF from cloud");
                                                                        console.log(err_r);
                                                                        // console.log(response);
                                                                        // console.log(body);
                                                                        //faccio rinviare il report in caso di errore
                                                                        annualHasBeenSent = false;
                                                                        lastAnnual = undefined;
                                                                    } else {
                                                                        console.log("Mail successfully sent: ", response.body);
                                                                        // fs.unlink("../public/applications/_TMP_/_TMP_.json", function (err_u) {
                                                                        //     if (err_u) {
                                                                        //         console.log("Error while unlinking file: ", err_u);
                                                                        //     } else {
                                                                        //         console.log("File _TMP_.json successfully unlinked");
                                                                        //
                                                                        //     }
                                                                        // });


                                                                    }
                                                                });
                                                            } else {
                                                                console.log("File ./public/applications/_TMP_/_TMP_.json is empty");
                                                            }
                                                        });

                                                        // request({
                                                        //     json: true,
                                                        //     method: "POST",
                                                        //     uri: "http://localhost:" + Apio.Configuration.http.port + "/apio/service/notification/route/" + encodeURIComponent("/apio/mail/send") + "/data/" + encodeURIComponent(JSON.stringify({
                                                        //         attachments: [{
                                                        //             filename: "annualReport.pdf",
                                                        //             content: fs.createReadStream("./annualReport.pdf")
                                                        //         }],
                                                        //         to: to,
                                                        //         cc: ccn,
                                                        //         subject: "Report Annuale",
                                                        //         text: "Buongiorno, di seguito trova il Report dell'installazione " + installation.name + ", relativo " + (literalMonth ? "all'anno da " + literalMonth + " " + String(Number(ts.getFullYear()) - 1) + " a " + literalMonth + " " + ts.getFullYear() : "all'anno appena trascorso")
                                                        //     }))
                                                        // }, function (err, response, body) {
                                                        //     if (err || !response || Number(response.statusCode) !== 200) {
                                                        //         console.log("Error while sending mail: ", err);
                                                        //     } else {
                                                        //         console.log("Mail successfully sent: ", response.body);
                                                        //         fs.unlink("./annualReport.pdf", function (err_u) {
                                                        //             if (err_u) {
                                                        //                 console.log("Error while unlinking file: ", err_u);
                                                        //             } else {
                                                        //                 console.log("File ./_TMP__monthly.png successfully unlinked");
                                                        //                 fs.unlink("../public/applications/_TMP_/_TMP_.json", function (err_u) {
                                                        //                     if (err_u) {
                                                        //                         console.log("Error while unlinking file: ", err_u);
                                                        //                     } else {
                                                        //                         console.log("File _TMP_.json successfully unlinked");
                                                        //
                                                        //                     }
                                                        //                 });
                                                        //             }
                                                        //         });
                                                        //     }
                                                        // });
                                                    }
                                                } else {
                                                    console.log("No superAdmins found, unable to send mail");
                                                }
                                            });


                                        }
                                    });
                                    // .inject("css", "../public/bower_components/bootstrap/dist/css/bootstrap.min.css")
                                    // .inject("css", "../public/applications/_TMP_/utils/report.client.css")


                                });
                            } else {
                                console.log("Unable to update object with objectId _TMP_");
                            }
                        });
                    }
                } else {
                    annualHasBeenSent = false;
                }
            }
        }
    }, 30000);
    var loop = function () {
        }
        ;
    return loop;
}
;
