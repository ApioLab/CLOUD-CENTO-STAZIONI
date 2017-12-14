var app = angular.module("ApioApplication3357", ["apioProperty"]);
app.controller("defaultController", ["$scope", "$http", "$mdDialog", "currentObject", "socket", "$mdSidenav", function ($scope, $http, $mdDialog, currentObject, socket, $mdSidenav) {
    // set the App into fullscreen mode
    document.getElementById("ApioApplicationContainer").classList.add("fullscreen");
    // get App info
    $scope.object = currentObject.get();
    console.log("Sono il defaultController e l'oggetto è: ", $scope.object);

    /* get the session (e-mail, cookie and so on) */
    $http.get("/apio/user/getSessionComplete").then(function (r) {
        $scope.session = r.data;
    }, function (e) {
        console.log("Error while getting complete session: ", e)
    });

    // Call the function that close the App
    $scope.closeApp = function () {
        angular.element(document.getElementsByClassName("topAppApplication")[0]).scope().goBackToHome();
    };

    // function that toggle the sidenav
    $scope.toggleLeft = buildToggler("left");
    function buildToggler(navID) {
        return function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    console.log("Left sidenav opened");
                });
        };
    }

    // function that close the sidenav
    $scope.close = function () {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav("left").close()
            .then(function () {
                console.log("Left sidenav closed");
            });
    };

    // variable that store the sidenav menu items
    $scope.sideMenuItems = {
        0: "Calendario",
        1: "Corsi",
        2: "Istruttori",
        3: "Tesserati"
    };

    $scope.selectedSection = $scope.sideMenuItems[0];
    // Function that change the App section
    $scope.changeMenuSection = function (selectedSection) {
        $scope.selectedSection = selectedSection;
        console.log("$scope.selectedSection = ", $scope.selectedSection);
        $scope.toggleLeft();
    };


    // variable that contain the week times of the classes
    $scope.mydata = $scope.object.db.week;
    console.log("$scope.mydata = ", $scope.mydata);

    // $scope.Corsie = [
    //     {name: "Corsia 1"},
    //     {name: "Corsia 2"},
    //     {name: "Corsia 3"},
    //     {name: "Corsia 4"},
    //     {name: "Vasca Piccola 1"},
    //     {name: "Vasca Piccola 2"}
    // ];
    // variable that cantain the name of the pools
    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsia")).then(function (response) {
        $scope.Corsie = response.data.sort(function (a, b) {
            return a.id - b.id;
        }).map(function (x) {
            return {name: x.nome};
        });
    });

    // $scope.orari = [
    //     {
    //         start: "10:30",
    //         end: "11:15",
    //         corsi: [{name: "AcquaGym", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaBike", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSpecial", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaCircuit", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaTabata", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSurfit", posti: "1/10", istruttore: "Gaetano"}
    //         ]
    //     },
    //     {
    //         start: "16:00",
    //         end: "16:45",
    //         corsi: [{name: "AcquaGym", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaBike", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSpecial", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaCircuit", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaTabata", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSurfit", posti: "1/10", istruttore: "Gaetano"}
    //         ]
    //     },
    //     {
    //         start: "16:45",
    //         end: "17:30",
    //         corsi: [{name: "AcquaGym", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaBike", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSpecial", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaCircuit", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaTabata", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSurfit", posti: "1/10", istruttore: "Gaetano"}
    //         ]
    //     },
    //     {
    //         start: "17:30",
    //         end: "18:15",
    //         corsi: [{name: "AcquaGym", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaBike", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSpecial", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaCircuit", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaTabata", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSurfit", posti: "1/10", istruttore: "Gaetano"}
    //         ]
    //     },
    //     {
    //         start: "18:15",
    //         end: "19:00",
    //         corsi: [{name: "AcquaGym", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaBike", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSpecial", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaCircuit", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaTabata", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSurfit", posti: "1/10", istruttore: "Gaetano"}
    //         ]
    //     },
    //     {
    //         start: "19:00",
    //         end: "19:45",
    //         corsi: [{name: "AcquaGym", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaBike", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSpecial", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaCircuit", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaTabata", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSurfit", posti: "1/10", istruttore: "Gaetano"}
    //         ]
    //     },
    //     {
    //         start: "19:45",
    //         end: "20:30",
    //         corsi: [{name: "AcquaGym", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaBike", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSpecial", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaCircuit", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaTabata", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSurfit", posti: "1/10", istruttore: "Gaetano"}
    //         ]
    //     },
    //     {
    //         start: "20:30",
    //         end: "21:15",
    //         corsi: [{name: "AcquaGym", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaBike", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSpecial", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaCircuit", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaTabata", posti: "1/10", istruttore: "Gaetano"},
    //             {name: "AcquaSurfit", posti: "1/10", istruttore: "Gaetano"}
    //         ]
    //     }
    // ];
    // function that create the variables orari with the classes details

    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/by-data/" + (new Date(2017, 5, 27).toISOString()))).then(function (response) {
        $scope.orari = [];
        response.data.forEach(function (x, i, r) {
            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/utente/prenotazione/" + x.id)).then(function (response2) {
                var search_end = x.ora_fine.substr(0, 5);
                var search_start = x.ora_inizio.substr(0, 5);

                var index = $scope.orari.findIndex(function (e) {
                    return e.start === search_start && e.end === search_end;
                });

                if (index > -1) {
                    $scope.orari[index].corsi[x.idCorsia - 1] = {
                        idCorso: x.idCorso,
                        idPrenotazione: x.id,
                        name: x.nomeCorso,
                        istruttore: x.nomeIstruttore + " " + x.cognomeIstruttore,
                        posti: response2.data.length + "/" + x.posti
                    };
                } else {
                    var j = {
                        start: search_start,
                        end: search_end,
                        corsi: []
                    };

                    j.corsi[x.idCorsia - 1] = {
                        idCorso: x.idCorso,
                        idPrenotazione: x.id,
                        name: x.nomeCorso,
                        istruttore: x.nomeIstruttore + " " + x.cognomeIstruttore,
                        posti: response2.data.length + "/" + x.posti
                    };

                    $scope.orari.push(j);
                }

                if (i === r.length - 1) {
                    $scope.orari.sort(function (a, b) {
                        var aStartHours = Number(a.start.substr(0, 2));
                        var bStartHours = Number(b.start.substr(0, 2));
                        var aStartMinutes = Number(a.start.substr(3, 2));
                        var bStartMinutes = Number(b.start.substr(3, 2));

                        return aStartHours - bStartHours || aStartMinutes - bStartMinutes;
                    });

                    console.log("--------------------------------");
                    console.log("$scope.orari: ", $scope.orari);
                    console.log("--------------------------------");
                }
            });
        });
    });

    //Elenco dei corsi - INIZIO
    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corso")).then(function (response) {
        $scope.Corsi = response.data;
        console.log("--------------------------------");
        console.log("$scope.Corsi: ", $scope.Corsi);
        console.log("--------------------------------");
    });
    //Elenco dei corsi - FINE

    //Elenco degli istruttori - INIZIO
    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/istruttore")).then(function (response) {
        $scope.Istruttori = response.data;
        console.log("--------------------------------");
        console.log("$scope.Istruttori: ", $scope.Istruttori);
        console.log("--------------------------------");
    });
    //Elenco degli istruttori - FINE

    //Elenco degli utenti - INIZIO
    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/utente")).then(function (response) {
        $scope.Utenti = response.data;
        console.log("--------------------------------");
        console.log("$scope.Utenti (principale): ", $scope.Utenti);
        console.log("--------------------------------");
    });
    //Elenco degli utenti - FINE

    // Class Calendar variables & functions ---------------------------
    // function that open the settings of the calendar section
    $scope.classCalendarSettings = function () {
        console.log("dentro $scope.classCalendarSettings");
    };

    // variable and functions for datepicker
    var weekDays = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
    var todayObj = new Date();
    todayObj.setSeconds(0);
    todayObj.setMilliseconds(0);
    var tomorrow = new Date(todayObj.getTime() + 24 * 60 * 60 * 1000);
    console.log("todayObj: ", todayObj, "tomorrow: ", tomorrow);
    var dd = todayObj.getDate();
    var mm = todayObj.getMonth() + 1; //January is 0!
    var yyyy = todayObj.getFullYear();
    var hh = todayObj.getHours();
    //var hh1 = undefined;
    //if (hh === 23) {
    //    hh1 = 0;
    //} else {
    //    hh1 = hh + 1;
    //}
    var mn = todayObj.getMinutes();
    if (dd < 10) {
        dd = "0" + dd;
    }
    if (mm < 10) {
        mm = "0" + mm;
    }
    if (hh < 10) {
        hh = "0" + hh;
    }
    if (mn < 10) {
        mn = "0" + mn;
    }
    var today = mm + "/" + dd + "/" + yyyy;
    var todayHour = hh + ":" + mn;
    //var TodayHour1 = hh1 + ":" + mn;
    console.log("today = ", today);
    console.log("todayHour = ", todayHour);

    // vartiables for Calendar Date Picker
    $scope.dateForCalendar = new Date(todayObj.getTime());
    $scope.$watch("dateForCalendar", function (newValue) {
        console.log("$scope.dateForCalendar newValue = ", newValue);
        var dayOfCalendar = newValue.getDate();
        if (dayOfCalendar < 10) {
            dayOfCalendar = "0" + dayOfCalendar;
        }
        var monthOfCalendar = newValue.getMonth() + 1; //January is 0!
        if (monthOfCalendar < 10) {
            monthOfCalendar = "0" + monthOfCalendar;
        }
        var yearOfCalendar = newValue.getFullYear();
        $scope.shortCalendarDate = dayOfCalendar + "/" + monthOfCalendar + "/" + yearOfCalendar;
        console.log("$scope.shortCalendarDate = ", $scope.shortCalendarDate);

        $scope.weekDayForCalendar = newValue.getDay();
        console.log("$scope.weekDayForCalendar = ", $scope.weekDayForCalendar);

    });


    console.log("$scope.dateForCalendar", $scope.dateForCalendar);
    // function that change the calendar date after the user click back of forward
    $scope.changeCalendarDateButtons = function (action) {
        console.log("action = ", action);
        if (action === 'forward') {
            $scope.dateForCalendar = new Date($scope.dateForCalendar.setTime($scope.dateForCalendar.getTime() + 86400000));
            console.log("$scope.dateForCalendar = ", $scope.dateForCalendar);
            $scope.setCalendarDate();
        } else if (action === 'back') {
            $scope.dateForCalendar = new Date($scope.dateForCalendar.setTime($scope.dateForCalendar.getTime() - 86400000));
            console.log("$scope.dateForCalendar = ", $scope.dateForCalendar);
            $scope.setCalendarDate();
        }
    };
    // function that
    $scope.setCalendarDate = function () {
        console.log("DENTRO $scope.setCalendarDate ----------------");
        console.log("$scope.dateForCalendar", $scope.dateForCalendar);
        // inserire comandi che cambino lo schema della tabella del calendario
    };

    $scope.showClass = function (value) {
        $mdDialog.show({
            locals: {
                value: value,
                shortCalendarDate: $scope.shortCalendarDate
            },
            templateUrl: "applications/" + $scope.object.objectId + "/modal/class_detail.html",
            controller: ShowClassController,
            clickOutsideToClose: true,
            bindToController: true,
            // scope: $scope,
            // preserveScope: true,
            //parent: angular.element(document.getElementById("targetBody")),
            fullscreen: true
        }).then(function () {
            console.log("dentro al THEN della modal dell'evento");
        }, function () {
            console.log("dentro al FUNCTION della modal dell'evento");
        });
    };

    function ShowClassController($scope, $mdDialog, value, shortCalendarDate) {
        $scope.value = value;
        $scope.shortCalendarDate = shortCalendarDate;
        console.log("$scope.value = ", $scope.value);

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };

        $scope.deleteParticipant = function (id) {
            var index = $scope.Users.findIndex(function (c) {
                return id === c.id;
            });

            $scope.Users.splice(index, 1);

            $http.delete("/apio/service/gym/route/" + encodeURIComponent("/gym/utente") + "/data/" + encodeURIComponent(JSON.stringify({
                    id: id
                }))).then(function (response) {
                console.log("Utente eliminato dalla prenotazione, response: ", response);
            }, function (error) {
                console.log("Errore nella query di delete, error: ", error);
            });
        };

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/" + $scope.value.idPrenotazione)).then(function (response) {
            $scope.selectedIstruttore = response.data[0].idIstruttore;
            $scope.selectedCorsia = response.data[0].idCorsia;
            $scope.selectedCorso = response.data[0].idCorso;

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/istruttore")).then(function (response2) {
                $scope.Istruttori = response2.data;
                console.log("--------------------------------");
                console.log("$scope.Istruttori (modal): ", $scope.Istruttori);
                console.log("--------------------------------");
            });

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsia")).then(function (response2) {
                $scope.Corsie = response2.data;
                $scope.selectedPiscine = $scope.Corsie.find(function (x) {
                    return x.id === $scope.selectedCorsia;
                }).idPiscina;

                for (var i = 0; i < $scope.Corsie.length; i++) {
                    if ($scope.Corsie[i].idPiscina !== $scope.selectedPiscine) {
                        $scope.Corsie.splice(i--, 1);
                    }
                }

                console.log("--------------------------------");
                console.log("$scope.Corsie (modal): ", $scope.Corsie);
                console.log("--------------------------------");

                $scope.$watch("selectedPiscine", function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsia/piscina/" + newValue)).then(function (response3) {
                            $scope.Corsie = response3.data;
                            $scope.selectedCorsia = "";
                        });
                    }
                });
            });

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/piscina")).then(function (response2) {
                $scope.Piscine = response2.data;
                console.log("--------------------------------");
                console.log("$scope.Piscine (modal): ", $scope.Piscine);
                console.log("--------------------------------");
            });

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corso")).then(function (response2) {
                $scope.Corsi = response2.data;
                console.log("--------------------------------");
                console.log("$scope.Corsi (modal): ", $scope.Corsi);
                console.log("--------------------------------");
            });

            $scope.$watch("selectedIstruttore", function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    var istr = $scope.Istruttori.find(function (x) {
                        return x.id === newValue;
                    });

                    $scope.value.istruttore = istr.nome + " " + istr.cognome;
                    $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/" + $scope.value.idPrenotazione) + "/data/" + encodeURIComponent(JSON.stringify({
                            idIstruttore: newValue
                        }))).then(function () {
                        console.log("Istruttore modificato con successo per prenotazione " + $scope.value.idPrenotazione);
                    });
                }
            });

            $scope.$watch("selectedCorsia", function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/" + $scope.value.idPrenotazione) + "/data/" + encodeURIComponent(JSON.stringify({
                            idCorsia: newValue
                        }))).then(function () {
                        console.log("Corsi modificata con successo per prenotazione " + $scope.value.idPrenotazione);
                    });
                }
            });

            $scope.$watch("selectedCorso", function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.value.name = $scope.Corsi.find(function (x) {
                        return x.id === newValue;
                    }).nome;
                    $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/" + $scope.value.idPrenotazione) + "/data/" + encodeURIComponent(JSON.stringify({
                            idCorso: newValue
                        }))).then(function () {
                        console.log("Corsi modificata con successo per prenotazione " + $scope.value.idPrenotazione);
                    });
                }
            });
        });

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/utente")).then(function (response) {
            $scope.Users = response.data;
            $scope.Users.forEach(function (x) {
                $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/utente/" + x.id)).then(function (response2) {
                    x.iscritto = response2.data.findIndex(function (c) {
                            return $scope.value.idPrenotazione === c.idPrenotazione;
                        }) > -1;
                });
            });

            $scope.$watch("Users", function (newValue, oldValue) {
                newValue.forEach(function (n, i) {
                    if (oldValue[i].iscritto !== undefined && n.iscritto !== oldValue[i].iscritto) {
                        if (n.iscritto) {
                            var postiComponents = $scope.value.posti.split("/");
                            postiComponents[0] = String(Number(postiComponents[0]) + 1);
                            $scope.value.posti = postiComponents[0] + "/" + postiComponents[1];
                            $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione") + "/data/" + encodeURIComponent(JSON.stringify({
                                    idPrenotazione: $scope.value.idPrenotazione,
                                    idUtente: n.id
                                }))).then(function (response) {
                                console.log("Utente aggiunto alla prenotazione, response: ", response);
                            }, function (error) {
                                console.log("Errore nella query di post, error: ", error);
                            });
                        } else {
                            var postiComponents = $scope.value.posti.split("/");
                            postiComponents[0] = String(Number(postiComponents[0]) - 1);
                            $scope.value.posti = postiComponents[0] + "/" + postiComponents[1];
                            $http.delete("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione") + "/data/" + encodeURIComponent(JSON.stringify({
                                    idPrenotazione: $scope.value.idPrenotazione,
                                    idUtente: n.id
                                }))).then(function (response) {
                                console.log("Utente eliminato dalla prenotazione, response: ", response);
                            }, function (error) {
                                console.log("Errore nella query di delete, error: ", error);
                            });
                        }
                    }
                });
            }, true);
        });
    }

    // Da capire
    var originatorEv;
    this.openMenu = function ($mdMenu, ev) {
        originatorEv = ev;
        $mdMenu.open(ev);
    };
    this.notificationsEnabled = true;
    this.toggleNotifications = function () {
        this.notificationsEnabled = !this.notificationsEnabled;
    };
    this.redial = function () {
        $mdDialog.show(
            $mdDialog.alert()
                .targetEvent(originatorEv)
                .clickOutsideToClose(true)
                .parent("body")
                .title("Suddenly, a redial")
                .textContent("You just called a friend; who told you the most amazing story. Have a cookie!")
                .ok("That was easy")
        );

        originatorEv = null;
    };
    this.checkVoicemail = function () {
        // This never happens.
    };


    // function that launch the Add Class modal
    $scope.addClass = function () {
        console.log("DENTRO $scope.addClass --------------------------------")
    };

    // function that launch the Add Instructor modal
    $scope.addInstructor = function () {
        console.log("DENTRO $scope.addInstructor --------------------------------")
    };

    // function that launch the Add Customer modal
    $scope.addCustomer = function () {
        console.log("DENTRO $scope.addCustomer --------------------------------")
    };


}]);

setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication3357"), ["ApioApplication3357"]);
}, 10);
