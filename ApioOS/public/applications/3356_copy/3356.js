var app = angular.module("ApioApplication3356", ["apioProperty"]);
app.controller("defaultController", ["$scope", "$mdDialog", "currentObject", "$http", "socket", function ($scope, $mdDialog, currentObject, $http, socket) {
    $scope.object = currentObject.get();
    console.log("Sono il defaultController e l'oggetto è: ", $scope.object);

    document.getElementById("ApioApplicationContainer").classList.add("fullscreen");

    socket.on("centostazioni_ticket_change", function (data) {
        for (var f = 0, found = false; !found && f < $scope.tickets.length; f++) {
            if ($scope.tickets[f].idTicket === data.idTicket) {
                for (var j in data) {
                    $scope.tickets[f][j] = data[j];
                }
                found = true;
            }
        }

        for (var f = 0, found = false; !found && f < $scope.object.db.tickets.length; f++) {
            if ($scope.object.db.tickets[f].idTicket === data.idTicket) {
                if (data.stato === "Completato") {
                    $scope.object.db.tickets.slice(f, 1);
                } else {
                    for (var j in data) {
                        $scope.object.db.tickets[f][j] = data[j];
                    }
                }

                found = true;
            }
        }

        if (!$scope.$$phase) {
            $scope.$apply();
        }
    });

    socket.on("centostazioni_new_ticket", function (prova) {
        var index = -1;
        for (var i = 0; index === -1 && i < $scope.object.db.tickets.length; i++) {
            if ($scope.object.db.tickets[i].idTicket === prova.idTicket) {
                index = i;
            }
        }

        if (index === -1) {
            $scope.tickets.push(prova);
            $scope.object.db.tickets.push(prova);
        }

        if (!$scope.$$phase) {
            $scope.$apply();
        }
    });

    $scope.tickets = JSON.parse(JSON.stringify($scope.object.db.tickets));
    
     $http.get("/apio/user/getSessionComplete").then(function (r) {
        $scope.session = r.data;
         console.log("SESSION----> ", $scope.session);
        $scope.role = $scope.session.priviligies;
        $scope.subrole = $scope.session.subrole.type;   
        $scope.mail = $scope.session.email;
        
         //mail-stazioni
	    $http.get("/apio/service/centostazioni/route/" + encodeURIComponent ("/centostazioni/utentiStazioni?mail=" + $scope.mail)).then(function(response){
		    $scope.stazioneUtente = response.data[0];
		    $scope.stazioneID = $scope.stazioneUtente.idStazione;
		    console.log("stazioniUtente: ", $scope.stazioneID);
	    }, function (error) {
		    console.log("error: ", error);
	    });
    }, function (e) {
          console.log("Error while getting complete session: ", e)
    });

    $scope.newTicket = function (ev, value) {
        $mdDialog.show({
            locals: {
                value: value,
                object: $scope.object,
                stazioni: $scope.stazioni,
                direttoriOperatori: $scope.direttoriOperatori,
                tickets: $scope.tickets
            },
            controllerAs: defaultController,
            bindToController: true,
            controller: TicketControllerNew,
            templateUrl: "/applications/3356/template/new_ticket.html",
            parent: angular.element(document.getElementById("ApioApplication3356")),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true
        }).then(function (answer) {
            $scope.status = "You said the information was '" + answer + "'.";
        }, function () {
            $scope.status = "You cancelled the dialog.";
        });
    };

    function TicketControllerNew($scope, $mdDialog, object, stazioni, direttoriOperatori, tickets) {
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.all_info_ok = false;

        $scope.answer = function (answer) {
            if ($scope.new_ticket_id && $scope.new_ticket_description && $scope.new_ticket_station && $scope.new_ticket_dir && $scope.new_ticket_op) {
                $scope.nuovoTicket();
                $mdDialog.hide(answer);
            } else {
                $scope.all_info_ok = true;
            }
        };

        $scope.stazioni = stazioni;
        $scope.direttoriOperatori = direttoriOperatori;
        $scope.disable_before_station = true;

        $scope.change = function () {
            $scope.disable_before_station = true;

            $http.get("/apio/service/centostazioni/route/" + encodeURIComponent("/centostazioni/direttoriOperatori?idStazione=" + $scope.new_ticket_station)).then(function (response) {
                $scope.direttoriOperatori = response.data;
                $scope.disable_before_station = false;
                console.log("Response Operatori: ", $scope.direttoriOperatori);
            }, function (error) {
                console.log("Errore Operatori: ", error);
            });
        };

        //funzione per invio nuovo ticket sul Mongo
        $scope.nuovoTicket = function () {
            for (var x = 0, found = false; !found && x < stazioni.length; x++) {
                if (stazioni[x].id === $scope.new_ticket_station) {
                    var station = stazioni[x].nome;
                    found = true;
                }
            }

            for (var t = 0, found = false; !found && t < $scope.direttoriOperatori.length; t++) {
                if ($scope.direttoriOperatori[t].id === $scope.new_ticket_dir) {
                    var direttoriNome = $scope.direttoriOperatori[t].nome;
                    var direttoriCognome = $scope.direttoriOperatori[t].cognome;
                    found = true;
                }
            }

            for (var n = 0, found = false; !found && n < $scope.direttoriOperatori.length; n++) {
                if ($scope.direttoriOperatori[n].id === $scope.new_ticket_op) {
                    var operatoriNome = $scope.direttoriOperatori[n].nome;
                    var operatoriCognome = $scope.direttoriOperatori[n].cognome;
                    found = true;
                }
            }

            var prova = {
                idTicket: $scope.new_ticket_id,
                note: "",
                immagini: [],
                dataApertura: new Date(),
                dataChiusura: "",
                dataInizioLavori: "",
                dataFineLavori: "",
                descrizione: $scope.new_ticket_description,
                callCenter: {
                    id: "1",
                    nome: "Mario",
                    cognome: "Rossi"
                },
                operatore: {
                    id: $scope.new_ticket_op,
                    nome: operatoriNome,
                    cognome: operatoriCognome
                },
                direttore: {
                    id: $scope.new_ticket_dir,
                    nome: direttoriNome,
                    cognome: direttoriCognome
                },
                stazione: {
                    id: $scope.new_ticket_station,
                    nome: station
                },
                stato: "Aperto"
            };

            tickets.push(prova);
            object.db.tickets.push(prova);

            $http.put("/apio/modifyObject/" + object.objectId, {
                object: {
                    "db.tickets": object.db.tickets
                }
            }).then(function (response) {
                console.log("/apio/modifyObject response: ", response);
                $http.get("/apio/user/getSessionComplete").then(function (r) {
                    socket.emit("send_to_client", {
                        apioId: r.data.apioId,
                        data: prova,
                        message: "centostazioni_new_ticket"
                    });
                }, function (e) {
                    console.log("Error while getting complete session: ", e)
                });
            }, function (error) {
                console.log("/apio/modifyObject error: ", error);
            });
        }
    }

    $scope.openTicket = function (ev, value) {
        $mdDialog.show({
            locals: {
                value: value,
                object: $scope.object,
                tickets: $scope.tickets,
                role: $scope.role,
                subrole: $scope.subrole,
                mail: $scope.mail,
                stazioneUtente: $scope.stazioneUtente,
                stazioneID: $scope.stazioneID
            },
            controllerAs: defaultController,
            controller: TicketControllerView,
            bindToController: true,
            templateUrl: "/applications/3356/template/view_ticket.html",
            parent: angular.element(document.getElementById("ApioApplication3356")),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true
        }).then(function (answer) {
            console.log("answer = ", answer);
            $scope.status = "You said the information was '" + answer + "'.";

        }, function () {
            $scope.status = "You cancelled the dialog.";
        });
    };

    function TicketControllerView($scope, $mdDialog, value, object, tickets, role, subrole, mail, stazioneUtente, stazioneID) {
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };
        
        $scope.value = value;
        $scope.role = role;
        $scope.subrole = subrole;
        

        //$scope.imgArr = [];
        $scope.object = object;
        /*$scope.$watch("imgArr", function (newValue) {
            value.immagini.push.apply(value.immagini, newValue);
            for (var z = 0, found = false; !found && z < tickets.length; z++) {
                if (value.idTicket === tickets[z].idTicket) {
                    tickets[z] = value;
                    found = true;
                }
            }

            for (var x = 0, found = false; !found && x < object.db.tickets.length; x++) {
                if (value.idTicket === object.db.tickets[x].idTicket) {
                    object.db.tickets[x] = value;
                    found = true;
                }
            }

            $http.put("/apio/modifyObject/" + object.objectId, {
                object: {
                    "db.tickets": object.db.tickets
                }
            }).then(function (response) {
                console.log("/apio/modifyObject response: ", response);
                $http.get("/apio/user/getSessionComplete").then(function (r) {
                    socket.emit("send_to_client", {
                        apioId: r.data.apioId,
                        data: value,
                        message: "centostazioni_ticket_change"
                    });
                }, function (e) {
                    console.log("Error while getting complete session: ", e)
                });
            }, function (error) {
                console.log("/apio/modifyObject error: ", error);
            });
        }, true);*/
        
        $scope.newImage = "";
        $scope.$watch("newImage", function (newValue) {
	        if (newValue) {
	            value.immagini.push(newValue);
	            for (var z = 0, found = false; !found && z < tickets.length; z++) {
	                if (value.idTicket === tickets[z].idTicket) {
	                    tickets[z] = value;
	                    found = true;
	                }
	            }
	
	            for (var x = 0, found = false; !found && x < object.db.tickets.length; x++) {
	                if (value.idTicket === object.db.tickets[x].idTicket) {
	                    object.db.tickets[x] = value;
	                    found = true;
	                }
	            }
	
	            $http.put("/apio/modifyObject/" + object.objectId, {
	                object: {
	                    "db.tickets": object.db.tickets
	                }
	            }).then(function (response) {
	                console.log("/apio/modifyObject response: ", response);
	                $http.get("/apio/user/getSessionComplete").then(function (r) {
	                    socket.emit("send_to_client", {
	                        apioId: r.data.apioId,
	                        data: value,
	                        message: "centostazioni_ticket_change"
	                    });
	                }, function (e) {
	                    console.log("Error while getting complete session: ", e)
	                });
	            }, function (error) {
	                console.log("/apio/modifyObject error: ", error);
	            });
            }
        });

        $scope.saveNote = function () {
            for (var h = 0, found = false; !found && h < object.db.tickets.length; h++) {
                if (object.db.tickets[h].idTicket === value.idTicket) {
                    object.db.tickets[h] = value;
                    found = true;
                }
            }

            $http.put("/apio/modifyObject/" + object.objectId, {
                object: {
                    "db.tickets": object.db.tickets
                }
            }).then(function (response) {
                console.log("/apio/modifyObject response: ", response);
                $http.get("/apio/user/getSessionComplete").then(function (r) {
                    socket.emit("send_to_client", {
                        apioId: r.data.apioId,
                        data: value,
                        message: "centostazioni_ticket_change"
                    });
                }, function (e) {
                    console.log("Error while getting complete session: ", e)
                });
            }, function (error) {
                console.log("/apio/modifyObject error: ", error);
            });
        };

        //funzione che cancella la collection sul mongo e aggiunge il ticket completato nel MySql
        $scope.completedWork = function () {
            //aggiornamento valori data chiusura ticket e stato prima di mandare i dati al MySql

            value.dataChiusura = new Date();
            value.stato = "Completato";
            for (var x = 0, found = false; !found && x < tickets.length; x++) {
                if (tickets[x].idTicket === value.idTicket) {
                    tickets[x] = value;
                    found = true;
                }
            }
            //cancellazione collection dal Mongo
            for (var x = 0, found = false; !found && x < object.db.tickets.length; x++) {
                if (object.db.tickets[x].idTicket === value.idTicket) {
                    object.db.tickets.splice(x, 1);
                    found = true;
                }
            }
            //rotta per inserire dati sul MySql
            $http.post("/apio/service/centostazioni/route/" + encodeURIComponent("/centostazioni/ticket") + "/data/" + encodeURIComponent(JSON.stringify(value))).then(function (response) {
                console.log("response: ", response);
            }, function (error) {
                console.log("error: ", error);
            });

            $http.put("/apio/modifyObject/" + object.objectId, {
                object: {
                    "db.tickets": object.db.tickets
                }
            }).then(function (response) {
                console.log("/apio/modifyObject response: ", response);
                $http.get("/apio/user/getSessionComplete").then(function (r) {
                    socket.emit("send_to_client", {
                        apioId: r.data.apioId,
                        data: value,
                        message: "centostazioni_ticket_change"
                    });
                }, function (e) {
                    console.log("Error while getting complete session: ", e)
                });
            }, function (error) {
                console.log("/apio/modifyObject error: ", error);
            });
        };

        //funzione update dati fine lavori
        $scope.stopWork = function () {
            value.dataFineLavori = new Date();
            value.stato = "In Attesa";
            for (var x = 0, found = false; !found && x < object.db.tickets.length; x++) {
                if (object.db.tickets[x].idTicket === value.idTicket) {
                    object.db.tickets[x] = value;
                    found = true;
                }
            }

            $http.put("/apio/modifyObject/" + object.objectId, {
                object: {
                    "db.tickets": object.db.tickets
                }
            }).then(function (response) {
                console.log("/apio/modifyObject response: ", response);
                $http.get("/apio/user/getSessionComplete").then(function (r) {
                    socket.emit("send_to_client", {
                        apioId: r.data.apioId,
                        data: value,
                        message: "centostazioni_ticket_change"
                    });
                }, function (e) {
                    console.log("Error while getting complete session: ", e)
                });
            }, function (error) {
                console.log("/apio/modifyObject error: ", error);
            });
        };

        //funzione update dati inizio lavori
        $scope.startWork = function () {
            value.dataInizioLavori = new Date();
            value.stato = "In Corso";
            for (var x = 0, found = false; !found && x < object.db.tickets.length; x++) {
                if (object.db.tickets[x].idTicket === value.idTicket) {
                    object.db.tickets[x] = value;
                    found = true;
                }
            }
            $http.put("/apio/modifyObject/" + object.objectId, {
                object: {
                    "db.tickets": object.db.tickets
                }
            }).then(function (response) {
                console.log("/apio/modifyObject response: ", response);
                $http.get("/apio/user/getSessionComplete").then(function (r) {
                    socket.emit("send_to_client", {
                        apioId: r.data.apioId,
                        data: value,
                        message: "centostazioni_ticket_change"
                    });
                }, function (e) {
                    console.log("Error while getting complete session: ", e)
                });
            }, function (error) {
                console.log("/apio/modifyObject error: ", error);
            });
        };

        //funzione update stato eliminato del ticket
        $scope.deleteTicket = function () {
            value.stato = "Eliminato";
            for (var x = 0, found = false; !found && x < object.db.tickets.length; x++) {
                if (object.db.tickets[x].idTicket === value.idTicket) {
                    object.db.tickets[x] = value;
                    found = true;
                }
            }
            $http.put("/apio/modifyObject/" + object.objectId, {
                object: {
                    "db.tickets": object.db.tickets
                }
            }).then(function (response) {
                console.log("/apio/modifyObject response: ", response);
                $http.get("/apio/user/getSessionComplete").then(function (r) {
                    socket.emit("send_to_client", {
                        apioId: r.data.apioId,
                        data: value,
                        message: "centostazioni_ticket_change"
                    });
                }, function (e) {
                    console.log("Error while getting complete session: ", e)
                });
            }, function (error) {
                console.log("/apio/modifyObject error: ", error);
            });
        };
    }

    $scope.itemText = function (x) {
        return x.descrizione;
    };
    $scope.searchText = "";
    $scope.itemChanged = function (x) {
        //console.log("item changed, x vale: ", x);
        if (!x) {
            console.log("item changed è undefined");
        } else {
            $scope.openTicket(event, x);
            console.log("item changed, x vale: ", x);
        }
    };

    $scope.query = function (searchText) {
        var matched = [];
        for (var i in $scope.tickets) {
            if (($scope.tickets[i].idTicket && $scope.tickets[i].idTicket.toLowerCase().indexOf(searchText) > -1) || ($scope.tickets[i].descrizione && $scope.tickets[i].descrizione.toLowerCase().indexOf(searchText) > -1)) {
                matched.push($scope.tickets[i]);
            }
        }

        return matched;
    };

    /* Dialog NEW ticket Javascript */
//    $scope.selected_station = "-1";
 //   $scope.stations = {"-1": "No object"};
 

//restituisce tutte le stazioni presenti nel MySql
    $http.get("/apio/service/centostazioni/route/" + encodeURIComponent("/centostazioni/stazioni")).then(function (response) {
        $scope.stazioni = response.data;
        console.log("stazioni: ", $scope.stazioni);
    }, function (error) {
        console.log("error: ", error);
    });

//restituisce tutti i ticket completati
    $http.get("/apio/service/centostazioni/route/" + encodeURIComponent("/centostazioni/ticket")).then(function (response) {
        console.log("response: ", response);
        for (var x in response.data) {
            response.data[x].dataApertura = response.data[x].dataApertura ? new Date(response.data[x].dataApertura) : response.data[x].dataApertura;
            response.data[x].dataChiusura = response.data[x].dataChiusura ? new Date(response.data[x].dataChiusura) : response.data[x].dataChiusura;
            response.data[x].dataInizioLavori = response.data[x].dataInizioLavori ? new Date(response.data[x].dataInizioLavori) : response.data[x].dataInizioLavori;
            response.data[x].dataFineLavori = response.data[x].dataFineLavori ? new Date(response.data[x].dataFineLavori) : response.data[x].dataFineLavori;
        }

        $scope.tickets.push.apply($scope.tickets, response.data);
    }, function (error) {
        console.log("error: ", error);
    });
}]);

app.directive("chooseFile", ["FileUploader", function (FileUploader) {
    return {
        restrict: "E",
        scope: true,
        compile: function () {
            return {
                pre: function (scope, elem, attrs) {
                    scope.uploader = new FileUploader({
                        url: "/apio/manage/file",
                        autoUpload: true,
                        removeAfterUpload: true,
                    });

                    scope.uploader.onAfterAddingFile = function (item) {
                        //FARE L'IF PER IL CLOUD, CAMBIARE IL PERCORSO
                        item.formData.push({
                            uploadPath: "applications/" + scope.object.objectId + "/images/" + scope.value.idTicket,
                            imageName: scope.fileName
                        });
                    };

                    scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
                        //ROBA PER LA PREVIEW
                        scope.fileName = null;
                        scope.$parent.newImage = fileItem.file.name;
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    };

                    var button = elem.find("button");
                    var input = angular.element(elem[0].querySelector("input#imgInput"));
                    button.bind("click", function () {
                        input[0].click();
                    });
                    input.bind("change", function (e) {
                        var files = e.target.files;
                        if (files[0]) {
                            var nameComponents = files[0].name.split(".");
                            scope.fileName = nameComponents[0];
                            for (var i = 1; i < nameComponents.length - 1; i++) {
                                scope.fileName += "." + nameComponents[i];
                            }
                        //} else {
                        //    scope.fileName = null;
                        }

                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    });
                },
                // link
                post: function (scope, elem, attrs) {}
            };
        }
    };
}]);


setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication3356"), ["ApioApplication3356"]);
}, 10);
