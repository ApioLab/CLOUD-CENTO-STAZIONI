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
var configuration = require("../apio.js")(false).config.return().file;
var database = undefined;
var express = require("express");
var app = express();
var http = require("http").Server(app);

var mysql = require("mysql");
var sql_db = mysql.createConnection("mysql://root:root@127.0.0.1/centostazioni");

var port = 8082;

app.use(bodyParser.json({
    limit: "50mb"
}));

app.use(bodyParser.urlencoded({
    extended: true,
    limit: "50mb"
}));

app.use(compression());

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
        database.collection("Services").findOne({name: "centostazioni"}, function (err, service) {
            if (err || !service) {
	            if (err) {
	                console.log("Error while getting service log: ", err);
                }
                console.log("Service Log DOESN'T Exists, creating....");
                database.collection("Services").insert({
                    name: "centostazioni",
                    show: "Centostazioni",
                    url: "https://github.com/ApioLab/Apio-Services",
                    username: "",
                    password: "",
                    port: String(port)
                }, function (err) {
                    if (err) {
                        console.log("Error while creating service Log on DB: ", err);
                    } else {
                        console.log("Service Log successfully created");
                    }
                });
            }
        });
        console.log("Database correctly initialized");
    }
});


//query che restituisce la stazione data la mail
app.get("/centostazioni/utentiStazioni", function(req, res){
	var query = "SELECT `Utente`.`id`, `Stazione-Utente`.`idStazione` FROM `Utente` JOIN `Stazione-Utente` ON `Utente`.`id` = `Stazione-Utente`.`idUtente` WHERE `Utente`.`mail` = '" + req.query.mail + "'";
	sql_db.query(query, function(error, result){
		if (error) {
			console.log("Error while executing query: ", error);
			res.status(500).send(error);
		} else if (result) {
			res.status(200).send(result);
		}
	});
}); 


//visualizzazione direttori e operatori relativi alla stazione selezionata
app.get("/centostazioni/direttoriOperatori",function(req, res){
	var query = "SELECT `Utente`.`id`, `Utente`.`nome`, `Utente`.`cognome`, `Utente`.`tipo` FROM `Utente` JOIN `Stazione-Utente` ON `Utente`.`id` = `Stazione-Utente`.`idUtente` WHERE (`Stazione-Utente`.`idStazione` = '" + req.query.idStazione + "' AND (`Utente`.`tipo` = 'direttore' OR `Utente`.`tipo` = 'operatore'))";
	sql_db.query(query, function (error, result) {
		if (error) {
			console.log("Error while executing query: ", error);
			res.status(500).send(error);
		} else if (result) {
			res.status(200).send(result);
		}
	});
});

// visualizzazione stazioni
app.get("/centostazioni/stazioni",function(req, res){
	var query = "SELECT `id`, `nome` FROM `Stazione`";
	sql_db.query(query, function (error, result) {
		if (error) {
			console.log("Error while executing query: ", error);
			res.status(500).send(error);
		} else if (result) {
			res.status(200).send(result);
		}
	});
});


// inserimento tickets completati nel db MySql
app.post("/centostazioni/ticket", function (req, res) {
	var query = "INSERT INTO Ticket (`idTicket`, `idCallCenter`, `idOperatore`, `idDirettore`, `note`, `immagini`, `dataApertura`, `dataInizioLavori`, `dataFineLavori`, `idStazione`, `descrizione`) VALUES ('" + req.body.idTicket + "', '" + req.body.callCenter.id + "', '" + req.body.operatore.id + "', '" + req.body.direttore.id + "', '" + req.body.note + "', '" + req.body.immagini + "', '" + req.body.dataApertura + "', '" + req.body.dataInizioLavori + "', '" + req.body.dataFineLavori + "', '" + req.body.stazione.id + "', '" + req.body.descrizione + "')";
	
	sql_db.query(query, function(error, result) {
		if (error) {
			console.log("Error while executing query: ", error);
			res.status(500).send(error);
		} else if (result) {
			res.status(200).send(result);
		}
	});
});

// visualizzazzione tickets completati presenti nel db MySql
app.get("/centostazioni/ticket/:id?", function (req, res) {
	var query = "SELECT `Ticket`.`id`, `Ticket`.`idTicket`, `Ticket`.`idCallCenter`, `Ticket`.`idOperatore`, `Ticket`.`idDirettore`, `Ticket`.`note`, `Ticket`.`immagini`, `Ticket`.`dataApertura`, `Ticket`.`dataChiusura`, `Ticket`.`dataInizioLavori`, `Ticket`.`dataFineLavori`, `Ticket`.`idStazione`, `Ticket`.`descrizione`, `callCenter`.`nome` AS `nomeCallCenter`, `callCenter`.`cognome` AS `cognomeCallCenter`, `operatore`.`nome` AS `nomeOperatore`, `operatore`.`cognome` AS `cognomeOperatore`, `direttore`.`nome` AS `nomeDirettore`, `direttore`.`cognome` AS `cognomeDirettore`, `Stazione`.`nome` AS `nomeStazione` FROM `Ticket` JOIN `Utente` AS `callCenter` ON `Ticket`.`idCallCenter` = `callCenter`.`id` JOIN `Utente` AS `operatore` ON `Ticket`.`idOperatore` = `operatore`.`id` JOIN `Utente` AS `direttore` ON `Ticket`.`idDirettore` = `direttore`.`id` JOIN `Stazione` ON `Ticket`.`idStazione` = `Stazione`.`id`";
	if (req.params.id) {
		query += " WHERE `Ticket`.`idTicket` = '" + req.params.id + "'";
	}
	
	sql_db.query(query, function (error, result) {
		if (error) {
			console.log("Error while executing query: ", error);
			res.status(500).send(error);
		} else if (result) {
			var temp = [];
			for (var x in result) {
				temp.push({
					id: result[x].id,
					idTicket: result[x].idTicket,
					note: result[x].note,
					immagini: result[x].immagini ? result[x].immagini.split(","): result[x].immagini,
					dataApertura: result[x].dataApertura,
					dataChiusura: result[x].dataChiusura,
					dataInizioLavori: result[x].dataInizioLavori,
					dataFineLavori: result[x].dataFineLavori,
					descrizione: result[x].descrizione,
					callCenter: {
						id: result[x].idCallCenter,
						nome: result[x].nomeCallCenter,
						cognome: result[x].cognomeCallCenter
					},
					operatore: {
						id: result[x].idOperatore,
						nome: result[x].nomeOperatore,
						cognome: result[x].cognomeOperatore
					},
					direttore: {
						id: result[x].idDirettore,
						nome: result[x].nomeDirettore,
						cognome: result[x].cognomeDirettore
					},
					stazione: {
						id: result[x].idStazione,
						nome: result[x].nomeStazione
					},
					stato: "Completato"
				});
			}

			res.status(200).send(temp);
		}
	});
});

http.listen(port, "localhost", function () {
    console.log("APIO Centostazioni Service correctly started on port " + port);
    var gc = require("./garbage_collector.js");
    gc();

    var memwatch = require("memwatch-next");
    memwatch.on("leak", function (info) {
        console.log("§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§");
        console.log("Leak detected: ", info);
        console.log("§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§");
        global.gc();
    });
});