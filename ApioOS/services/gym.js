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
var async = require("async");
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

//MODIFICARE TUTTE LE DELETE

app.delete("/gym/corsia", function (req, res) {
    if (req.body.id) {
        var query = "UPDATE `Corsia` SET `active` = '0' WHERE `id` = '" + req.body.id + "'";

        sql_db.query(query, function (error, result) {
            if (error) {
                res.status(500).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } else {
        res.sendStatus(400);
    }
});

app.delete("/gym/corso", function (req, res) {
    if (req.body.id) {
        // var query = "UPDATE `Corso` SET `active` = '0' WHERE `id` = '" + req.body.id + "'";
        var query = "DELETE FROM `Corso` WHERE `id` = '" + req.body.id + "'";

        sql_db.query(query, function (error, result) {
            if (error) {
                res.status(500).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } else {
        res.sendStatus(400);
    }
});

app.delete("/gym/corsoscuolanuoto", function (req, res) {
    if (req.body.id) {
        // var query = "UPDATE `CorsoScuolaNuoto` SET `active` = '0' WHERE `id` = '" + req.body.id + "'";
        var query = "UPDATE `Corso` SET `active` = '0' WHERE `id` = '" + req.body.id + "'";

        sql_db.query(query, function (error, result) {
            if (error) {
                res.status(500).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } else {
        res.sendStatus(400);
    }
});

app.delete("/gym/esistenza", function (req, res) {
    if (req.body.id) {
        var query = "DELETE FROM `Esistenza` WHERE `id` = '" + req.body.id + "'";

        sql_db.query(query, function (error, result) {
            if (error) {
                res.status(500).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } else {
        res.sendStatus(400);
    }
});

app.delete("/gym/iscrizione", function (req, res) {
    if (req.body.id || (req.body.idUtente && req.body.idPrenotazione)) {
        var query = "DELETE FROM `Iscrizione`";
        if (req.body.id) {
            query += " WHERE `id` = '" + req.body.id + "'";
        } else if (req.body.idUtente && req.body.idPrenotazione) {
            query += " WHERE (`idUtente` = '" + req.body.idUtente + "' AND `idPrenotazione` = '" + req.body.idPrenotazione + "')";
        }

        sql_db.query(query, function (error, result) {
            if (error) {
                res.status(500).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } else {
        res.sendStatus(400);
    }
});

app.delete("/gym/istruttore", function (req, res) {
    if (req.body.id) {
        var query = "UPDATE `Istruttore` SET `active` = '0' WHERE `id` = '" + req.body.id + "'";

        sql_db.query(query, function (error, result) {
            if (error) {
                res.status(500).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } else {
        res.sendStatus(400);
    }
});

app.delete("/gym/piscina", function (req, res) {
    if (req.body.id) {
        var query = "UPDATE `Piscina` SET `active` = '0' WHERE `id` = '" + req.body.id + "'";

        sql_db.query(query, function (error, result) {
            if (error) {
                res.status(500).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } else {
        res.sendStatus(400);
    }
});




app.delete("/gym/prenotazione", function (req, res) { /// Ho modificato perchè non cancellava Ulisse
    if (req.body.id) {
	    var query = "DELETE FROM `Prenotazione` WHERE `id` = '" + req.body.id + "'";
	    
//         var query = "UPDATE `Prenotazione` SET `active` = '0' WHERE `id` = '" + req.body.id + "'";

        sql_db.query(query, function (error, result) {
            if (error) {
                res.status(500).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } else {
        res.sendStatus(400);
    }
    
});

app.delete("/gym/utente", function (req, res) {
    if (req.body.id) {
        var query = "UPDATE `Utente` SET `active` = '0' WHERE `id` = '" + req.body.id + "'";

        sql_db.query(query, function (error, result) {
            if (error) {
                res.status(500).send(error);
            } else {
                res.status(200).send(result);
            }
        });
    } else {
        res.sendStatus(400);
    }
});

//:id significa che alla rotta verrà passato un parametro che noi al suo interno identifichiamo come req.params.id (tutti parametri di una rotta, se ci sono, si trovano nel JSON req.params). Il punto interrogativo alla fine sta ad indicare che è opzionale, cioè è libera scelta del chiamante se inserirlo o meno
app.get("/gym/corsia/:id?", function (req, res) {
    //Nella query cerco di dare più informazioni possibili, non mi limito alle solo informazioni presenti nella tabella Corsia. Per fare questo sfrutto l'operatore JOIN, questa è una cosa un po' complicata da capire per chi non conosce MySQL, nel caso te lo spiego a voce che si fa prima
    var query = "SELECT `Corsia`.`id`, `Corsia`.`nome`, `Corsia`.`idPiscina`, `Piscina`.`nome` AS `nomePiscina` FROM `Corsia` JOIN `Piscina` ON `Corsia`.`idPiscina` = `Piscina`.`id`";
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

app.get("/gym/corsia/piscina/:id", function (req, res) {
    var query = "SELECT `Corsia`.`id`, `Corsia`.`nome`, `Corsia`.`idPiscina`, `Piscina`.`nome` AS `nomePiscina` FROM `Corsia` JOIN `Piscina` ON `Corsia`.`idPiscina` = `Piscina`.`id`";
    if (req.params.id) {
        query += " WHERE `Corsia`.`idPiscina` = '" + req.params.id + "'";
    }

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/corso/get-prenotazione-and-posti/:id", function (req, res) {
    delete req.body.apioId;

    var today = new Date(), dateArr = [], dateArrSQL = [];
    for (var i = 0; i < 7; i++) {
        dateArr.push(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
    }

    dateArr.forEach(function (t) {
        dateArrSQL.push(t.getFullYear() + "-" + ("00" + (t.getMonth() + 1)).slice(-2) + "-" + ("00" + t.getDate()).slice(-2));
    });

    async.parallel(dateArrSQL.map(function (x) {
        return function (callback) {
            sql_db.query("SELECT * FROM `Prenotazione` WHERE `Prenotazione`.`idCorso` = '" + req.params.id + "' AND `Prenotazione`.`data` = '" + x + "'", function (queryError, queryResult) {
                callback(queryError, queryResult);
            });
        };
    }), function (err, results) {
        if (err) {
            res.status(500).send(err);
        } else {
            async.each(results, function (r, callbackEach) {
                if (r.length) {
                    async.each(r, function (x, callbackEachInner) {
                        sql_db.query("SELECT COUNT(*) AS `iscritti` FROM `Iscrizione` WHERE `Iscrizione`.`idPrenotazione` = '" + x.id + "'", function (queryError, queryResult) {
                            if (queryError) {
                                callbackEachInner(queryError);
                            } else {
                                x.iscritti = queryResult[0].iscritti;
                                callbackEachInner();
                            }
                        });
                    }, function (err) {
                        if (err) {
                            callbackEach(err);
                        } else {
                            callbackEach();
                        }
                    });
                } else {
                    callbackEach();
                }
            }, function (err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send(results);
                }
            });
        }
    });
});

app.get("/gym/corso/:id?", function (req, res) {
    // var query = "SELECT `Corso`.`id`, `Corso`.`nome`, `Corso`.`durata`, `Corso`.`livello`, `Esistenza`.`idPeriodo`, `Periodo`.`inizio`, `Periodo`.`fine` FROM `Corso` JOIN `Esistenza` ON `Corso`.`id` = `Esistenza`.`idCorso` JOIN `Periodo` ON `Esistenza`.`idPeriodo` = `Periodo`.`id`";
    var query = "SELECT * FROM `Corso`";
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

app.get("/gym/corsoscuolanuoto/:id?", function (req, res) {
    // var query = "SELECT `Corso`.`id`, `Corso`.`nome`, `Corso`.`durata`, `Corso`.`livello`, `Esistenza`.`idPeriodo`, `Periodo`.`inizio`, `Periodo`.`fine` FROM `Corso` JOIN `Esistenza` ON `Corso`.`id` = `Esistenza`.`idCorso` JOIN `Periodo` ON `Esistenza`.`idPeriodo` = `Periodo`.`id`";
    // var query = "SELECT * FROM `CorsoScuolaNuoto`";
    var query = "SELECT * FROM `Corso` WHERE `Corso`.`tipo` = 'nuoto'";
    if (req.params.id) {
        // query += " WHERE `CorsoScuolaNuoto`.`id` = '" + req.params.id + "'";
        query += " AND `Corso`.`id` = '" + req.params.id + "'";
    }

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/corso/periodo/:id", function (req, res) {
    var query = "SELECT `Corso`.`id`, `Corso`.`nome`, `Corso`.`durata`, `Corso`.`livello`, `Corso`.`posti`, `Esistenza`.`idPeriodo`, `Periodo`.`inizio`, `Periodo`.`fine` FROM `Corso` JOIN `Esistenza` ON `Corso`.`id` = `Esistenza`.`idCorso` JOIN `Periodo` ON `Esistenza`.`idPeriodo` = `Periodo`.`id` WHERE `Periodo`.`id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/corsoscuolanuoto/periodo/:id", function (req, res) {
    // var query = "SELECT `CorsoScuolaNuoto`.`id`, `CorsoScuolaNuoto`.`nome`, `CorsoScuolaNuoto`.`durata`, `CorsoScuolaNuoto`.`livello`, `Esistenza`.`idPeriodo`, `Periodo`.`inizio`, `Periodo`.`fine` FROM `CorsoScuolaNuoto` JOIN `Esistenza` ON `CorsoScuolaNuoto`.`id` = `Esistenza`.`idCorso` JOIN `Periodo` ON `Esistenza`.`idPeriodo` = `Periodo`.`id` WHERE `Periodo`.`id` = '" + req.params.id + "'";
    var query = "SELECT `Corso`.`id`, `Corso`.`nome`, `Corso`.`durata`, `Corso`.`livello`, `Corso`.`posti`, `Esistenza`.`idPeriodo`, `Periodo`.`inizio`, `Periodo`.`fine` FROM `Corso` JOIN `Esistenza` ON `Corso`.`id` = `Esistenza`.`idCorso` JOIN `Periodo` ON `Esistenza`.`idPeriodo` = `Periodo`.`id` WHERE `Corso`.`tipo` = 'nuoto' AND `Periodo`.`id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/iscrizione/:id", function (req, res) {
    var query = "SELECT * FROM `Iscrizione` WHERE `id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/iscrizione/prenotazione/:id", function (req, res) {
    var query = "SELECT * FROM `Iscrizione` WHERE `idPrenotazione` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/iscrizione/utente/:id", function (req, res) {
    var query = "SELECT * FROM `Iscrizione` WHERE `idUtente` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/piscina/:id?", function (req, res) {
    var query = "SELECT * FROM `Piscina`";
    if (req.params.id) {
        query += " WHERE `Piscina`.`id` = '" + req.params.id + "'";
    }

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/prenotazione/:id?", function (req, res) {
    var query = "SELECT `Prenotazione`.`id`, `Prenotazione`.`data`, `Prenotazione`.`ora_inizio`, `Prenotazione`.`ora_fine`, `Prenotazione`.`recupero`, `Prenotazione`.`idCorsia`, `Corsia`.`nome` AS `nomeCorsia`, `Corsia`.`idPiscina`, `Piscina`.`nome` AS `nomePiscina`, `Prenotazione`.`idIstruttore`, `Istruttore`.`nome` AS `nomeIstruttore`, `Istruttore`.`cognome` AS `cognomeIstruttore`, `Prenotazione`.`idCorso`, `Corso`.`nome` AS `nomeCorso`, `Corso`.`livello` AS `livelloCorso`, `Corso`.`durata` AS `durataCorso`, `Corso`.`posti` FROM `Prenotazione` JOIN `Corsia` ON `Prenotazione`.`idCorsia` = `Corsia`.`id` JOIN `Piscina` ON `Corsia`.`idPiscina` = `Piscina`.`id` JOIN `Istruttore` ON `Prenotazione`.`idIstruttore` = `Istruttore`.`id` JOIN `Corso` ON `Prenotazione`.`idCorso` = `Corso`.`id`";
    if (req.params.id) {
        query += " WHERE `Prenotazione`.`id` = '" + req.params.id + "'";
    }

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/prenotazione/by-data/:d?", function (req, res) {
    var query = "SELECT `Prenotazione`.`id`, `Prenotazione`.`data`, `Prenotazione`.`ora_inizio`, `Prenotazione`.`ora_fine`, `Prenotazione`.`recupero`, `Prenotazione`.`idCorsia`, `Corsia`.`nome` AS `nomeCorsia`, `Corsia`.`idPiscina`, `Piscina`.`nome` AS `nomePiscina`, `Prenotazione`.`idIstruttore`, `Istruttore`.`nome` AS `nomeIstruttore`, `Istruttore`.`cognome` AS `cognomeIstruttore`, `Prenotazione`.`idCorso`, `Corso`.`nome` AS `nomeCorso`, `Corso`.`livello` AS `livelloCorso`, `Corso`.`durata` AS `durataCorso`, `Corso`.`posti` FROM `Prenotazione` JOIN `Corsia` ON `Prenotazione`.`idCorsia` = `Corsia`.`id` JOIN `Piscina` ON `Corsia`.`idPiscina` = `Piscina`.`id` JOIN `Istruttore` ON `Prenotazione`.`idIstruttore` = `Istruttore`.`id` JOIN `Corso` ON `Prenotazione`.`idCorso` = `Corso`.`id`";
    if (req.params.d) {
        var d = new Date(req.params.d);
    } else {
        var d = new Date();
    }

    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    if (m < 10) {
        m = "0" + m;
    }
    var dd = d.getDate();
    if (dd < 10) {
        d = "0" + d;
    }

    query += " WHERE `Prenotazione`.`data` = '" + y + "-" + m + "-" + dd + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/prenotazione/corsia/:id", function (req, res) {
    var query = "SELECT `Prenotazione`.`id`, `Prenotazione`.`data`, `Prenotazione`.`ora_inizio`, `Prenotazione`.`ora_fine`, `Prenotazione`.`recupero`, `Prenotazione`.`idCorsia`, `Corsia`.`nome` AS `nomeCorsia`, `Corsia`.`idPiscina`, `Piscina`.`nome` AS `nomePiscina`, `Prenotazione`.`idIstruttore`, `Istruttore`.`nome` AS `nomeIstruttore`, `Istruttore`.`cognome` AS `cognomeIstruttore`, `Prenotazione`.`idCorso`, `Corso`.`nome` AS `nomeCorso`, `Corso`.`livello` AS `livelloCorso`, `Corso`.`durata` AS `durataCorso` FROM `Prenotazione` JOIN `Corsia` ON `Prenotazione`.`idCorsia` = `Corsia`.`id` JOIN `Piscina` ON `Corsia`.`idPiscina` = `Piscina`.`id` JOIN `Istruttore` ON `Prenotazione`.`idIstruttore` = `Istruttore`.`id` JOIN `Corso` ON `Prenotazione`.`idCorso` = `Corso`.`id` WHERE `Corsia`.`id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/prenotazione/corso/:id", function (req, res) {
    var query = "SELECT `Prenotazione`.`id`, `Prenotazione`.`data`, `Prenotazione`.`ora_inizio`, `Prenotazione`.`ora_fine`, `Prenotazione`.`recupero`, `Prenotazione`.`idCorsia`, `Corsia`.`nome` AS `nomeCorsia`, `Corsia`.`idPiscina`, `Piscina`.`nome` AS `nomePiscina`, `Prenotazione`.`idIstruttore`, `Istruttore`.`nome` AS `nomeIstruttore`, `Istruttore`.`cognome` AS `cognomeIstruttore`, `Prenotazione`.`idCorso`, `Corso`.`nome` AS `nomeCorso`, `Corso`.`livello` AS `livelloCorso`, `Corso`.`durata` AS `durataCorso` FROM `Prenotazione` JOIN `Corsia` ON `Prenotazione`.`idCorsia` = `Corsia`.`id` JOIN `Piscina` ON `Corsia`.`idPiscina` = `Piscina`.`id` JOIN `Istruttore` ON `Prenotazione`.`idIstruttore` = `Istruttore`.`id` JOIN `Corso` ON `Prenotazione`.`idCorso` = `Corso`.`id` WHERE `Corso`.`id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/prenotazione/istruttore/:id", function (req, res) {
    var query = "SELECT `Prenotazione`.`id`, `Prenotazione`.`data`, `Prenotazione`.`ora_inizio`, `Prenotazione`.`ora_fine`, `Prenotazione`.`recupero`, `Prenotazione`.`idCorsia`, `Corsia`.`nome` AS `nomeCorsia`, `Corsia`.`idPiscina`, `Piscina`.`nome` AS `nomePiscina`, `Prenotazione`.`idIstruttore`, `Istruttore`.`nome` AS `nomeIstruttore`, `Istruttore`.`cognome` AS `cognomeIstruttore`, `Prenotazione`.`idCorso`, `Corso`.`nome` AS `nomeCorso`, `Corso`.`livello` AS `livelloCorso`, `Corso`.`durata` AS `durataCorso` FROM `Prenotazione` JOIN `Corsia` ON `Prenotazione`.`idCorsia` = `Corsia`.`id` JOIN `Piscina` ON `Corsia`.`idPiscina` = `Piscina`.`id` JOIN `Istruttore` ON `Prenotazione`.`idIstruttore` = `Istruttore`.`id` JOIN `Corso` ON `Prenotazione`.`idCorso` = `Corso`.`id` WHERE `Istruttore`.`id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/prenotazione/utente/:id", function (req, res) {
    var query = "SELECT `Prenotazione`.`id`, `Prenotazione`.`data`, `Prenotazione`.`ora_inizio`, `Prenotazione`.`ora_fine`, `Prenotazione`.`recupero`, `Prenotazione`.`idCorsia`, `Corsia`.`nome` AS `nomeCorsia`, `Corsia`.`idPiscina`, `Piscina`.`nome` AS `nomePiscina`, `Prenotazione`.`idIstruttore`, `Istruttore`.`nome` AS `nomeIstruttore`, `Istruttore`.`cognome` AS `cognomeIstruttore`, `Prenotazione`.`idCorso`, `Corso`.`nome` AS `nomeCorso`, `Corso`.`livello` AS `livelloCorso`, `Corso`.`durata` AS `durataCorso`, `Iscrizione`.`presente`, `Iscrizione`.`idRecupero` FROM `Prenotazione` JOIN `Corsia` ON `Prenotazione`.`idCorsia` = `Corsia`.`id` JOIN `Piscina` ON `Corsia`.`idPiscina` = `Piscina`.`id` JOIN `Istruttore` ON `Prenotazione`.`idIstruttore` = `Istruttore`.`id` JOIN `Corso` ON `Prenotazione`.`idCorso` = `Corso`.`id` JOIN `Iscrizione` ON `Prenotazione`.`id` = `Iscrizione`.`idPrenotazione` JOIN `Utente` ON `Utente`.`id` = `Iscrizione`.`idUtente` WHERE `Utente`.`id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/istruttore/:id?", function (req, res) {
    var query = "SELECT * FROM `Istruttore`";
    if (req.params.id) {
        query += " WHERE `Istruttore`.`id` = '" + req.params.id + "'";
    }

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/utente/:id?", function (req, res) {
    var query = "SELECT * FROM `Utente` WHERE `active` = '1'";
    if (req.params.id) {
        query += " AND `Utente`.`id` = '" + req.params.id + "'";
    }

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.get("/gym/utente/prenotazione/:id", function (req, res) {
    var query = "SELECT `Utente`.`id`, `Utente`.`nome`, `Utente`.`cognome`, `Utente`.`photo`, `Iscrizione`.`id` AS `idIscrizione`, `Iscrizione`.`idPrenotazione` FROM `Utente` JOIN `Iscrizione` ON `Iscrizione`.`idUtente` = `Utente`.`id` JOIN `Prenotazione` ON `Iscrizione`.`idPrenotazione` = `Prenotazione`.`id` WHERE `Prenotazione`.`id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.post("/gym/corsia", function (req, res) {
    delete req.body.apioId;

    var query = "INSERT INTO `Corsia` (" + Object.keys(req.body).map(function (x) {
        return "`" + x + "`";
    }).join() + ") VALUES (";

    Object.keys(req.body).forEach(function (k, i, r) {
        query += "'" + req.body[k] + "'";
        if (i !== r.length - 1) {
            query += ",";
        }
    });

    query += ")";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.post("/gym/corso", function (req, res) {
    var idPeriodo = req.body.idPeriodo;
    delete req.body.idPeriodo;
    delete req.body.apioId;

    var query = "INSERT INTO `Corso` (" + Object.keys(req.body).map(function (x) {
        return "`" + x + "`";
    }).join() + ") VALUES (";

    Object.keys(req.body).forEach(function (k, i, r) {
        query += "'" + req.body[k] + "'";
        if (i !== r.length - 1) {
            query += ",";
        }
    });

    query += ")";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            // var idCorso = result.insertId;
            // sql_db.query("INSERT INTO `Esistenza` (`idCorso`, `idPeriodo`) VALUES ('" + idCorso + "', '" + idPeriodo + "')", function (error, result) {
            //     if (error) {
            //         res.status(500).send(error);
            //     } else {
            //         var idEsistenza = result.insertId;
            //         result.insertId = {
            //             idCorso: idCorso,
            //             idEsistenza: idEsistenza
            //         };
            res.status(200).send(result);
            // }
            // });
        }
    });
});

app.post("/gym/corsoscuolanuoto", function (req, res) {
    var idPeriodo = req.body.idPeriodo;
    delete req.body.idPeriodo;
    delete req.body.apioId;

    // var query = "INSERT INTO `CorsoScuolaNuoto` (" + Object.keys(req.body).map(function (x) {
    var query = "INSERT INTO `Corso` (" + Object.keys(req.body).map(function (x) {
        return "`" + x + "`";
    }).join() + ") VALUES (";

    Object.keys(req.body).forEach(function (k, i, r) {
        query += "'" + req.body[k] + "'";
        if (i !== r.length - 1) {
            query += ",";
        }
    });

    query += ")";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            // var idCorso = result.insertId;
            // sql_db.query("INSERT INTO `Esistenza` (`idCorso`, `idPeriodo`) VALUES ('" + idCorso + "', '" + idPeriodo + "')", function (error, result) {
            //     if (error) {
            //         res.status(500).send(error);
            //     } else {
            //         var idEsistenza = result.insertId;
            //         result.insertId = {
            //             idCorso: idCorso,
            //             idEsistenza: idEsistenza
            //         };
            res.status(200).send(result);
            // }
            // });
        }
    });
});

app.post("/gym/esistenza", function (req, res) {
    delete req.body.apioId;

    var query = "INSERT INTO `Esistenza` (" + Object.keys(req.body).map(function (x) {
        return "`" + x + "`";
    }).join() + ") VALUES (";

    Object.keys(req.body).forEach(function (k, i, r) {
        query += "'" + req.body[k] + "'";
        if (i !== r.length - 1) {
            query += ",";
        }
    });

    query += ")";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.post("/gym/iscrizione", function (req, res) {
    delete req.body.apioId;

    var query = "INSERT INTO `Iscrizione` (" + Object.keys(req.body).map(function (x) {
        return "`" + x + "`";
    }).join() + ") VALUES (";

    Object.keys(req.body).forEach(function (k, i, r) {
        query += "'" + req.body[k] + "'";
        if (i !== r.length - 1) {
            query += ",";
        }
    });

    query += ")";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.post("/gym/iscrizione/new", function (req, res) {
    delete req.body.apioId;

    var today = new Date();
    var todaySQL = today.getFullYear() + "-" + ("00" + (today.getMonth() + 1)).slice(-2) + "-" + ("00" + today.getDate()).slice(-2);
    var getPeriodo = "SELECT * FROM `Periodo` WHERE `Periodo`.`inizio` <= '" + todaySQL + "' AND `Periodo`.`fine` >= '" + todaySQL + "'";

    sql_db.query(getPeriodo, function (errorPeriodo, resultPeriodo) {
        if (errorPeriodo) {
            res.status(500).send(errorPeriodo);
        } else {
            if (resultPeriodo[0]) {
                var finePeriodoSQL = resultPeriodo[0].fine.getFullYear() + "-" + ("00" + (resultPeriodo[0].fine.getMonth() + 1)).slice(-2) + "-" + ("00" + resultPeriodo[0].fine.getDate()).slice(-2);
                var queryPrenotazioneOld = "SELECT * FROM `Prenotazione` WHERE  `Prenotazione`.`idCorso` = '" + req.body.idCorsoOld + "' AND `Prenotazione`.`data` > '" + todaySQL + "' AND `Prenotazione`.`data` <= '" + finePeriodoSQL + "'";
                sql_db.query(queryPrenotazioneOld, function (errorPrenotazioneOld, resultPrenotazioneOld) {
                    if (errorPrenotazioneOld) {
                        res.status(500).send(errorPrenotazioneOld);
                    } else {
                        var queryDeleteIscrizione = "DELETE FROM `Iscrizione` WHERE  `Iscrizione`.`idUtente` = '" + req.body.idUtente + "' AND `Iscrizione`.`idPrenotazione` IN (" + resultPrenotazioneOld.map(function (x) {
                            return "'" + x.id + "'";
                        }).join() + ")";
                        sql_db.query(queryDeleteIscrizione, function (errorDeleteIscrizione) {
                            if (errorDeleteIscrizione) {
                                res.status(500).send(errorDeleteIscrizione);
                            } else {
                                var queryPrenotazione = "SELECT * FROM `Prenotazione` WHERE  `Prenotazione`.`idCorso` = '" + req.body.idCorso + "' AND `Prenotazione`.`data` > '" + todaySQL + "' AND `Prenotazione`.`data` <= '" + finePeriodoSQL + "'";
                                sql_db.query(queryPrenotazione, function (errorPrenotazione, resultPrenotazione) {
                                    if (errorPrenotazione) {
                                        res.status(500).send(errorPrenotazione);
                                    } else {
                                        async.parallel(resultPrenotazione.map(function (x) {
                                            return function (callback) {
                                                sql_db.query("INSERT INTO `Iscrizione` (`idPrenotazione`, `idUtente`) VALUES ('" + x.id + "', '" + req.body.idUtente + "')", callback);
                                            };
                                        }), function (err, results) {
                                            if (err) {
                                                res.status(500).send(err);
                                            } else {
                                                res.status(200).send(results);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.status(200).send([]);
            }
        }
    });
});

app.post("/gym/istruttore", function (req, res) {
    delete req.body.apioId;

    var query = "INSERT INTO `Istruttore` (" + Object.keys(req.body).map(function (x) {
        return "`" + x + "`";
    }).join() + ") VALUES (";

    Object.keys(req.body).forEach(function (k, i, r) {
        query += "'" + req.body[k] + "'";
        if (i !== r.length - 1) {
            query += ",";
        }
    });

    query += ")";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.post("/gym/piscina", function (req, res) {
    delete req.body.apioId;

    var query = "INSERT INTO `Piscina` (" + Object.keys(req.body).map(function (x) {
        return "`" + x + "`";
    }).join() + ") VALUES (";

    Object.keys(req.body).forEach(function (k, i, r) {
        query += "'" + req.body[k] + "'";
        if (i !== r.length - 1) {
            query += ",";
        }
    });

    query += ")";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.post("/gym/prenotazione", function (req, res) {
    delete req.body.apioId;

    var query = "INSERT INTO `Prenotazione` (" + Object.keys(req.body).map(function (x) {
        return "`" + x + "`";
    }).join() + ") VALUES (";

    Object.keys(req.body).forEach(function (k, i, r) {
        query += "'" + req.body[k] + "'";
        if (i !== r.length - 1) {
            query += ",";
        }
    });

    query += ")";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.post("/gym/utente", function (req, res) {
    delete req.body.apioId;

    var query = "INSERT INTO `Utente` (" + Object.keys(req.body).map(function (x) {
        return "`" + x + "`";
    }).join() + ") VALUES (";

    Object.keys(req.body).forEach(function (k, i, r) {
        query += "'" + req.body[k] + "'";
        if (i !== r.length - 1) {
            query += ",";
        }
    });

    query += ")";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.put("/gym/corsia/:id", function (req, res) {
    delete req.body.apioId;

    var query = "UPDATE `Corsia` SET ";
    Object.keys(req.body).forEach(function (x, i, r) {
        query += "`" + x + "` = ";
        query += req.body[x] == null ? req.body[x] : "'" + req.body[x] + "'";
        if (i !== r.length - 1) {
            query += ", ";
        }
    });

    query += " WHERE `id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.put("/gym/corso/:id", function (req, res) {
    delete req.body.apioId;

    var query = "UPDATE `Corso` SET ";
    Object.keys(req.body).forEach(function (x, i, r) {
        query += "`" + x + "` = ";
        query += req.body[x] == null ? req.body[x] : "'" + req.body[x] + "'";
        if (i !== r.length - 1) {
            query += ", ";
        }
    });

    query += " WHERE `id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.put("/gym/corsoscuolanuoto/:id", function (req, res) {
    delete req.body.apioId;

    // var query = "UPDATE `CorsoScuolaNuoto` SET ";
    var query = "UPDATE `Corso` SET ";
    Object.keys(req.body).forEach(function (x, i, r) {
        query += "`" + x + "` = ";
        query += req.body[x] == null ? req.body[x] : "'" + req.body[x] + "'";
        if (i !== r.length - 1) {
            query += ", ";
        }
    });

    query += " WHERE `id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.put("/gym/esistenza/:id", function (req, res) {
    delete req.body.apioId;

    var query = "UPDATE `Esistenza` SET ";
    Object.keys(req.body).forEach(function (x, i, r) {
        query += "`" + x + "` = ";
        query += req.body[x] == null ? req.body[x] : "'" + req.body[x] + "'";
        if (i !== r.length - 1) {
            query += ", ";
        }
    });

    query += " WHERE `id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.put("/gym/iscrizione/:id", function (req, res) {
    delete req.body.apioId;

    var query = "UPDATE `Iscrizione` SET ";
    Object.keys(req.body).forEach(function (x, i, r) {
        query += "`" + x + "` = ";
        query += req.body[x] == null ? req.body[x] : "'" + req.body[x] + "'";
        if (i !== r.length - 1) {
            query += ", ";
        }
    });

    query += " WHERE `id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            console.log("error: ", error);
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.put("/gym/istruttore/:id", function (req, res) {
    delete req.body.apioId;

    var query = "UPDATE `Istruttore` SET ";
    Object.keys(req.body).forEach(function (x, i, r) {
        query += "`" + x + "` = ";
        query += req.body[x] == null ? req.body[x] : "'" + req.body[x] + "'";
        if (i !== r.length - 1) {
            query += ", ";
        }
    });

    query += " WHERE `id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.put("/gym/piscina/:id", function (req, res) {
    delete req.body.apioId;

    var query = "UPDATE `Piscina` SET ";
    Object.keys(req.body).forEach(function (x, i, r) {
        query += "`" + x + "` = ";
        query += req.body[x] == null ? req.body[x] : "'" + req.body[x] + "'";
        if (i !== r.length - 1) {
            query += ", ";
        }
    });

    query += " WHERE `id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.put("/gym/prenotazione/:id", function (req, res) {
    delete req.body.apioId;

    var query = "UPDATE `Prenotazione` SET ";
    Object.keys(req.body).forEach(function (x, i, r) {
        query += "`" + x + "` = ";
        query += req.body[x] == null ? req.body[x] : "'" + req.body[x] + "'";
        if (i !== r.length - 1) {
            query += ", ";
        }
    });

    query += " WHERE `id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send(result);
        }
    });
});

app.put("/gym/utente/:id", function (req, res) {
    delete req.body.apioId;

    var query = "UPDATE `Utente` SET ";
    Object.keys(req.body).forEach(function (x, i, r) {
        query += "`" + x + "` = ";
        query += req.body[x] == null ? req.body[x] : "'" + req.body[x] + "'";
        if (i !== r.length - 1) {
            query += ", ";
        }
    });

    query += " WHERE `id` = '" + req.params.id + "'";

    sql_db.query(query, function (error, result) {
        if (error) {
	        console.log("QUERY ERROR: ", error);
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
