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
//Richiamo il file di configurazione di apio (custom.js o default.js a seconda che ci sia l'uno o l'altro), mi serve perché ci sono dei parametri importanti
var configuration = require("../apio.js")(false).config.return().file;
var database = undefined;
var express = require("express");
var app = express();
var http = require("http").Server(app);

var mysql = require("mysql");
//Creo la connessio al DB Palestra
var sql_db = mysql.createConnection("mysql://root:root@127.0.0.1/Palestra");

var port = 8222;

//Uso il modulo bodyParser per dire a express che se nel body della richiesta mi arrivano stringhe JSON me li deve automaticamente convertire in oggetti
app.use(bodyParser.json({
    limit: "50mb"
}));

//Stessa cosa di sopra ma per i dati in querystring (questo cercalo sul google ;) ) passati, ad esempio, dai form
app.use(bodyParser.urlencoded({
    extended: true,
    limit: "50mb"
}));

//Abilito il modulo compression, serve per fare in modo che i dati trasferiti al client siano più leggeri
app.use(compression());

//Istanzio la connessione al DB MySQL
sql_db.connect(function (err) {
    if (err) {
        console.error("Error while connecting to MySQL: ", err);
    } else {
        console.log("Successfully connected to MySQL, connection id: " + sql_db.threadId);
    }
});

//Istazio la connessione a MongoDB e controllo che nel database alcuni parametri siano corretti, altrimenti li sovrascrivo
MongoClient.connect("mongodb://" + configuration.database.hostname + ":" + configuration.database.port + "/" + configuration.database.database, function (error, db) {
    if (error) {
        console.log("Unable to get database");
    } else if (db) {
        database = db;
        database.collection("Services").findOne({name: "gym"}, function (err, service) {
            if (err) {
                console.log("Error while getting service gym: ", err);
            } else if (service) {
                console.log("Service Gym exists");
                database.collection("Services").update({name: "gym"}, {$set: {data: {}}}, function (err1, result) {
                    if (err1) {
                        console.log("Error while updating service gym: ", err1);
                    } else if (result) {
                        console.log("Service Gym successfully updated, result: ", result);
                    }
                });
            } else {
                console.log("Unable to find service Gym, creating...");
                database.collection("Services").insert({
                    data: {},
                    name: "gym",
                    show: "Gym",
                    url: "https://github.com/ApioLab/Apio-Services",
                    username: "",
                    password: "",
                    port: String(port)
                }, function (err) {
                    if (err) {
                        console.log("Error while creating service Gym on DB: ", err);
                    } else {
                        console.log("Service Gym successfully created");
                    }
                });
            }
        });
        console.log("Database correctly initialized");
    }
});

//:id significa che alla rotta verrà passato un parametro che noi al suo interno identifichiamo come req.params.id (tutti parametri di una rotta, se ci sono, si trovano nel JSON req.params). Il punto interrogativo alla fine sta ad indicare che è opzionale, cioè è libera scelta del chiamante se inserirlo o meno
app.get("/gym/corsia/:id?", function (req, res) {
    //Nella query cerco di dare più informazioni possibili, non mi limito alle solo informazioni presenti nella tabella Corsia. Per fare questo sfrutto l'operatore JOIN, questa è una cosa un po' complicata da capire per chi non conosce MySQL, nel caso te lo spiego a voce che si fa prima
    var query = "SELECT `Corsia`.`id`, `Corsia`.`name`, `Corsia`.`idPiscina`, `Piscina`.`name` AS `namePiscina` FROM `Corsia` JOIN `Piscina` ON `Corsia`.`idPiscina` = `Piscina`.`id`";
    //Il fatto che il parametro sia opzionale lo sfrutto per raffinare la query, cioè dico se il parametro non c'è dammi tutte le informazioni di tutti i corsi, se invece c'è dammi solo le informazioni relative al corso con l'id specificato
    if (req.params.id) {
        query += " WHERE `Corsia`.`id` = '" + req.params.id + "'";
    }

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            //Se tutto è andato a buon fine, per come è fatto il modulo node che sto usando mi verrà restituito in Array di JSON, in ogni singolo JSON la chiave sarà il nome della colonna (o per meglio dire campo della tabella) ed il valore associato il valore che quel campo ha in quel record. Un record è una riga della tabella MySQL che contiene informazioni, quindi non si parla della struttura della tabella ma di dati veri e propri.
            res.status(200).send(result);
        }
    });
});

app.get("/gym/corso/:id?", function (req, res) {
    var query = "SELECT `Corso`.`id`, `Corso`.`name`, `Corso`.`timing`, `CorsiaCorso`.`idCorsia`, `Corsia`.`name` AS `nameCorsia`, `Corsia`.`idPiscina`, `Piscina`.`name` AS `namePiscina`, `Insegnamento`.`idIstruttore`, `Istruttore`.`name` AS `nameIstruttore`, `Istruttore`.`surname` AS `surnameIstruttore`, `Istruttore`.`born_date` AS `born_dateIstruttore`, `Istruttore`.`photo` AS `photoIstruttore`, `Prenotazione`.`idTempo`, `Prenotazione`.`date` AS `datePrenotazione`, `Tempo`.`start_time` AS `start_timeTempo`, `Tempo`.`end_time` AS `end_timeTempo`, `Prenotazione`.`idLivello`, `Livello`.`name` AS `nameLivello` FROM `Corso` JOIN `CorsiaCorso` ON `Corso`.`id` = `CorsiaCorso`.`idCorso` JOIN `Corsia` ON `Corsia`.`id` = `CorsiaCorso`.`idCorsia` JOIN `Piscina` ON `Corsia`.`idPiscina` = `Piscina`.`id` JOIN `Insegnamento` ON `Corso`.`id` = `Insegnamento`.`idCorso` JOIN `Istruttore` ON `Insegnamento`.`idIstruttore` = `Istruttore`.`id` JOIN `Prenotazione` ON `Prenotazione`.`idCorso` = `Corso`.`id` JOIN `Tempo` ON `Tempo`.`id` = `Prenotazione`.`idTempo` JOIN `Livello` ON `Livello`.`id` = `Prenotazione`.`idLivello`";
    if (req.params.id) {
        query += " WHERE `Corso`.`id` = '" + req.params.id + "'";
    }

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/istruttore/:id?", function (req, res) {
    var query = "SELECT `Istruttore`.`id`, `Istruttore`.`name`, `Istruttore`.`surname`, `Istruttore`.`born_date`, `Istruttore`.`photo`, `Insegnamento`.`idCorso`, `Corso`.`name` AS `nameCorso`, `Corso`.`timing` AS `timingCorso`, `Prenotazione`.`idTempo`, `Prenotazione`.`date`, `Prenotazione`.`idLivello`, `Livello`.`name` AS `nameLivello` FROM `Istruttore` JOIN `Insegnamento` ON `Insegnamento`.`idIstruttore` = `Istruttore`.`id` JOIN `Corso` ON `Corso`.`id` = `Insegnamento`.`idCorso` JOIN `Prenotazione` ON `Prenotazione`.`idCorso` = `Corso`.`id` JOIN `Livello` ON `Livello`.`id` = `Prenotazione`.`idLivello`";
    if (req.params.id) {
        query += " WHERE `Corso`.`id` = '" + req.params.id + "'";
    }

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

//Assegno a questo service la porta TCP specificata nella varibile port e dico che questo service sarà accessibile solo in localhost, cioè al difuori di questo domino il service sarà inaccessibile
http.listen(port, "localhost", function () {
    console.log("APIO Gym Service correctly started on port " + port);
    //Richiamo e faccio partire il service garbage_collector, un service nostro che ogni 60 secondi richiama forzatamente il garbage collector
    var gc = require("./garbage_collector.js");
    gc();

    //Richiamo e attivo memwatch-next un modulo che serve per monitorare i consumi di RAM, in caso di memory leak (memoria allocata ma senza riferimenti) richiamo il garbage collector per svuotarla
    var memwatch = require("memwatch-next");
    memwatch.on("leak", function () {
        global.gc();
    });
});
