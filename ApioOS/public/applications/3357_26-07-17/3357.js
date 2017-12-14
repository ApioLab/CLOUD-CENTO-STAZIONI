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
        $scope.disableModify = $scope.session.priviligies === "guest";
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
            $mdSidenav(navID).toggle().then(function () {
                console.log("Left sidenav opened");
            });
        };
    }

    // function that close the sidenav
    $scope.close = function () {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav("left").close().then(function () {
            console.log("Left sidenav closed");
        });
    };

    // variable that store the sidenav menu items
    $scope.sideMenuItems = {
        0: "Calendario",
        1: "Corsi",
        2: "Istruttori",
        3: "Tesserati",
        4: "Piscine - Corsie"
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

    // $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/by-data/" + (new Date(2017, 5, 27).toISOString()))).then(function (response) {
    //     $scope.orari = [];
    //     response.data.forEach(function (x, i, r) {
    //         $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/utente/prenotazione/" + x.id)).then(function (response2) {
    //             var search_end = x.ora_fine.substr(0, 5);
    //             var search_start = x.ora_inizio.substr(0, 5);
    //
    //             var index = $scope.orari.findIndex(function (e) {
    //                 return e.start === search_start && e.end === search_end;
    //             });
    //
    //             if (index > -1) {
    //                 $scope.orari[index].corsi[x.idCorsia - 1] = {
    //                     idCorso: x.idCorso,
    //                     idPrenotazione: x.id,
    //                     name: x.nomeCorso,
    //                     istruttore: x.nomeIstruttore + " " + x.cognomeIstruttore,
    //                     posti: response2.data.length + "/" + x.posti,
    //                     postiPercentage: Number((response2.data.length / x.posti) * 100)
    //                 };
    //                 //console.log("$scope.orari[index].corsi[x.idCorsia - 1] = ", $scope.orari[index].corsi[x.idCorsia - 1])
    //             } else {
    //                 var j = {
    //                     start: search_start,
    //                     end: search_end,
    //                     corsi: []
    //                 };
    //
    //                 j.corsi[x.idCorsia - 1] = {
    //                     idCorso: x.idCorso,
    //                     idPrenotazione: x.id,
    //                     name: x.nomeCorso,
    //                     istruttore: x.nomeIstruttore + " " + x.cognomeIstruttore,
    //                     posti: response2.data.length + "/" + x.posti,
    //                     postiPercentage: Number((response2.data.length / x.posti) * 100)
    //                 };
    //
    //                 $scope.orari.push(j);
    //             }
    //
    //             if (i === r.length - 1) {
    //                 $scope.orari.sort(function (a, b) {
    //                     var aStartHours = Number(a.start.substr(0, 2));
    //                     var bStartHours = Number(b.start.substr(0, 2));
    //                     var aStartMinutes = Number(a.start.substr(3, 2));
    //                     var bStartMinutes = Number(b.start.substr(3, 2));
    //
    //                     return aStartHours - bStartHours || aStartMinutes - bStartMinutes;
    //                 });
    //
    //                 console.log("--------------------------------");
    //                 console.log("$scope.orari: ", $scope.orari);
    //                 console.log("--------------------------------");
    //             }
    //         });
    //     });
    // });

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
        var formatData = function (d) {
            var ret = "";
            d = new Date(d);
            ret += d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
            ret += "/";
            ret += d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
            ret += "/";
            ret += d.getFullYear();
            return ret;
        };

        $scope.Utenti = response.data;
        $scope.UtenteCorsi = [];
        console.log("-------------------------------------------");
        console.log("$scope.Utenti (principale): ", $scope.Utenti);
        console.log("-------------------------------------------");

        $scope.Utenti.forEach(function (x, i, r) {
            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/utente/" + x.id)).then(function (response) {
                console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                console.log("/gym/prenotazione/utente/" + x.id, "response.data: ", response.data);
                console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                response.data.sort(function (a, b) {
                    return a.id - b.id;
                });

                x.data_nascita = formatData(x.data_nascita);
                x.inizio_abbonamento = formatData(x.inizio_abbonamento);
                x.scadenza_abbonamento = formatData(x.scadenza_abbonamento);
                x.inizio_assicurazione = formatData(x.inizio_assicurazione);
                x.scadenza_assicurazione = formatData(x.scadenza_assicurazione);

                if (response.data.length) {
                    x.idCorso = response.data[response.data.length - 1].idCorso;
                    x.nomeCorso = response.data[response.data.length - 1].nomeCorso;
                }

                $scope.UtenteCorsi.push(x);

                if (i === r.length - 1) {
                    $scope.UtenteCorsi.sort(function (a, b) {
                        return a.id - b.id;
                    });

                    console.log("++++++++++++++++++++++++++++++++++++++++");
                    console.log("$scope.UtenteCorsi: ", $scope.UtenteCorsi);
                    console.log("++++++++++++++++++++++++++++++++++++++++");
                }

                // response.data.forEach(function (c) {
                //     var index = $scope.UtenteCorsi.findIndex(function (k) {
                //         return k.idCorso === c.idCorso && k.id === c.id;
                //     });
                //
                //     if (index === -1) {
                //         for (var j in x) {
                //             if (j === "id") {
                //                 c.idUtente = x[j];
                //             } else {
                //                 c[j] = x[j];
                //             }
                //         }
                //
                //         c.data_nascita = formatData(c.data_nascita);
                //         c.inizio_abbonamento = formatData(c.inizio_abbonamento);
                //         c.scadenza_abbonamento = formatData(c.scadenza_abbonamento);
                //         c.inizio_assicurazione = formatData(c.inizio_assicurazione);
                //         c.scadenza_assicurazione = formatData(c.scadenza_assicurazione);
                //         $scope.UtenteCorsi.push(c);
                //     }
                // });
            });
        });
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
        if (newValue.getDay() === 0) {
            $scope.letteralDay = "Domenica";
        } else if (newValue.getDay() === 1) {
            $scope.letteralDay = "Lunedì";
        } else if (newValue.getDay() === 2) {
            $scope.letteralDay = "Martedì";
        } else if (newValue.getDay() === 3) {
            $scope.letteralDay = "Mercoledì";
        } else if (newValue.getDay() === 4) {
            $scope.letteralDay = "Giovedì";
        } else if (newValue.getDay() === 5) {
            $scope.letteralDay = "Venerdì";
        } else if (newValue.getDay() === 6) {
            $scope.letteralDay = "Sabato";
        }
        console.log($scope.daynumber);
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

        //RICHIEDO DATI
        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/by-data/" + (newValue.toISOString()))).then(function (response) {
            $scope.orari = [];
            $scope.object.db.week.time[newValue.getDay()].forEach(function (x, i) {
                $scope.orari[i] = {corsi: [], start: x.start, end: x.end};
            });

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
                            posti: response2.data.length + "/" + x.posti,
                            postiPercentage: Number((response2.data.length / x.posti) * 100)
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
                            posti: response2.data.length + "/" + x.posti,
                            postiPercentage: Number((response2.data.length / x.posti) * 100)
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

    $scope.showClass = function (value, time, index) {
        $mdDialog.show({
            locals: {
                value: value,
                shortCalendarDate: $scope.shortCalendarDate,
                disableModify: $scope.disableModify,
                letteralDay: $scope.letteralDay,
                time: time,
                index: index
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

    function ShowClassController($scope, $mdDialog, value, shortCalendarDate, disableModify, letteralDay, time, index) {
        $scope.letteralDay = letteralDay;
        $scope.value = value;
        $scope.shortCalendarDate = shortCalendarDate;
        $scope.disableModify = disableModify;
        $scope.time = time;

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

            if ($scope.value) {
                var postiComponents = $scope.value.posti.split("/");
                postiComponents[0] = String(Number(postiComponents[0]) - 1);
                $scope.value.posti = postiComponents[0] + "/" + postiComponents[1];
                $scope.value.postiPercentage = Number((postiComponents[0] / postiComponents[1]) * 100);

                $http.delete("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione") + "/data/" + encodeURIComponent(JSON.stringify({
                    idUtente: id,
                    idPrenotazione: $scope.value.idPrenotazione
                }))).then(function (response) {
                    console.log("Utente eliminato dalla prenotazione, response: ", response);
                }, function (error) {
                    console.log("Errore nella query di delete, error: ", error);
                });
            }
        };

        if ($scope.value) {
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

                    $scope.Corsie = $scope.Corsie.filter(function (x) {
                        return x.idPiscina === $scope.selectedPiscine;
                    });

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

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/prenotazione/" + $scope.value.idPrenotazione)).then(function (response) {
                var userSearch = function () {
                    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/utente")).then(function (response) {
                        var users = response.data.filter(function (u) {
                            return $scope.Users.findIndex(function (x) {
                                return x.id === u.id;
                            }) === -1;
                        });

                        $scope.searchText = "";
                        $scope.query = function (searchText) {
                            var matched = [];
                            users.forEach(function (u) {
                                if (u.nome.toLowerCase().indexOf(searchText) > -1 || u.cognome.toLowerCase().indexOf(searchText) > -1) {
                                    matched.push(u);
                                }
                            });

                            return matched;
                        };

                        $scope.itemText = function (x) {
                            return x.nome + " " + x.cognome;
                        };

                        $scope.itemChanged = function (x) {
                            if (x) {
                                var postiComponents = $scope.value.posti.split("/");
                                postiComponents[0] = String(Number(postiComponents[0]) + 1);
                                $scope.value.posti = postiComponents[0] + "/" + postiComponents[1];
                                $scope.value.postiPercentage = Number((postiComponents[0] / postiComponents[1]) * 100);

                                var userIndex = users.findIndex(function (u) {
                                    return x.id === u.id;
                                });

                                users.splice(userIndex, 1);
                                console.log("users: ", users);

                                $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione") + "/data/" + encodeURIComponent(JSON.stringify({
                                    idPrenotazione: $scope.value.idPrenotazione,
                                    idUtente: x.id
                                }))).then(function (response) {
                                    x.presente = false;
                                    $scope.Users.push(x);
                                    console.log("Inserita una nuova iscrizione: ", response);
                                });
                            }
                        };
                    });
                };

                $scope.Users = [];
                if (response.data.length) {
                    response.data.forEach(function (x, i, r) {
                        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/utente/" + x.idUtente)).then(function (response2) {
                            response2.data[0].presente = x.presente === 1;
                            $scope.Users.push(response2.data[0]);

                            if (i === r.length - 1) {
                                $scope.Users.sort(function (a, b) {
                                    return a.id - b.id;
                                });

                                $scope.$watch("Users", function (newValue, oldValue) {
                                    newValue.forEach(function (n, i) {
                                        if (!oldValue[i] || n.presente !== oldValue[i].presente) {
                                            var iscrizione = response.data.find(function (x) {
                                                return x.idUtente === n.id;
                                            });

                                            if (iscrizione) {
                                                $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/" + iscrizione.id) + "/data/" + encodeURIComponent(JSON.stringify({
                                                    presente: Number(n.presente)
                                                }))).then(function (response) {
                                                    console.log("Successfully modified Iscrizione with id " + iscrizione.id + " presente set to " + Number(n.presente));
                                                });
                                            }
                                        }
                                    });
                                }, true);

                                userSearch();
                            }
                        });
                    });
                } else {
                    userSearch();
                }
            });
        } else {
            // CREO PRENOTAZIONE
            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corso")).then(function (response) {
                $scope.Corsi = response.data;
            });

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/istruttore")).then(function (response) {
                $scope.Istruttori = response.data;
            });

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/piscina")).then(function (response) {
                $scope.Piscine = response.data;
            });

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/utente")).then(function (response) {
                $scope.searchText = "";
                $scope.Users = [];
                $scope.query = function (searchText) {
                    var matched = [];
                    response.data.forEach(function (u) {
                        if (u.nome.toLowerCase().indexOf(searchText) > -1 || u.cognome.toLowerCase().indexOf(searchText) > -1) {
                            matched.push(u);
                        }
                    });

                    return matched;
                };

                $scope.itemText = function (x) {
                    return x.nome + " " + x.cognome;
                };

                $scope.itemChanged = function (x) {
                    if (x) {
                        if ($scope.Users.findIndex(function (a) {
                                return a.id === x.id;
                            }) === -1) {
                            $scope.Users.push(x);
                        }
                    }
                };
            });

            $scope.$watch("selectedPiscine", function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsia/piscina/" + newValue)).then(function (response3) {
                        $scope.Corsie = response3.data.sort(function (a, b) {
                            return a.id - b.id;
                        });
                        $scope.selectedCorsia = "";
                    });
                }
            });

            $scope.addPrenotazione = function () {
                var shortCalendarDateComponents = $scope.shortCalendarDate.split("/");
                var dbDate = shortCalendarDateComponents[2] + "-" + shortCalendarDateComponents[1] + "-" + shortCalendarDateComponents[0];
                var errors = false;
                if ($scope.selectedCorso == null || $scope.selectedCorso === "") {
                    errors = true;
                    alert("Devi selezionare un corso prima di procedere");
                }

                if ($scope.selectedIstruttore == null || $scope.selectedIstruttore === "") {
                    errors = true;
                    alert("Devi selezionare un istruttore prima di procedere");
                }

                if ($scope.selectedCorsia == null || $scope.selectedCorsia === "") {
                    errors = true;
                    alert("Devi selezionare una corsia prima di procedere");
                }

                if ($scope.selectedPosti == null || $scope.selectedPosti === "") {
                    errors = true;
                    alert("Devi inserire il numero massimo di posti prima di procedere");
                }

                if (!errors) {
                    $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify({
                        idCorso: $scope.selectedCorso,
                        data: dbDate,
                        idIstruttore: $scope.selectedIstruttore,
                        ora_inizio: time.start,
                        ora_fine: time.end,
                        idCorsia: $scope.selectedCorsia,
                        posti: $scope.selectedPosti
                    }))).then(function (response) {
                        if ($scope.Users && $scope.Users.length) {
                            $scope.Users.forEach(function (u) {
                                $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione") + "/data/" + encodeURIComponent(JSON.stringify({
                                    idPrenotazione: response.data.insertId,
                                    idUtente: u.id
                                }))).then(function (response2) {
                                    console.log("Inserita iscrizione: ", {
                                        idPrenotazione: response.data.insertId,
                                        idUtente: u.id
                                    }, "response: ", response2);
                                });
                            });
                        }
                    });
                }
            };
        }
    }

    // function that launch the Add Class modal
    $scope.addClass = function () {
        //console.log("DENTRO $scope.addClass --------------------------------")
        $mdDialog.show({
            locals: {
                time: $scope.object.db.week.time
            },
            templateUrl: "applications/" + $scope.object.objectId + "/modal/add_class.html",
            controller: addClassInfoController,
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

    function addClassInfoController($scope, $mdDialog, $window, $mdSelect, time) {
        $window.addEventListener("click", function () {
            $mdSelect.hide();
        });

        $scope.time = time;
        console.log("$scope.time = ", $scope.time);

        $scope.newClass = {
            time0: [],
            time1: [],
            time2: [],
            time3: [],
            time4: [],
            time5: [],
            time6: []
        };

        $scope.saveNewClass = function () {
            var errors = false;
            if ($scope.newClass.corsoEsistente === "" || $scope.newClass.corsoEsistente == null) {
                if ($scope.newClass.nome === "" || $scope.newClass.nome == null) {
                    errors = true;
                    alert("Selezionare un corso esistente oppure inserire il nome di un nuovo corso");
                }
            }

            if ($scope.newClass.nome === "" || $scope.newClass.nome == null) {
                if ($scope.newClass.corsoEsistente === "" || $scope.newClass.corsoEsistente == null) {
                    errors = true;
                    alert("Selezionare un corso esistente oppure inserire il nome di un nuovo corso");
                }
            }

            if ($scope.newClass.durata === "" || $scope.newClass.durata == null) {
                errors = true;
                alert("Selezionare la durata del corso");
            }

            if ($scope.newClass.dateBegin === "" || $scope.newClass.dateBegin == null) {
                errors = true;
                alert("Selezionare la data di inizio del periodo");
            }

            if ($scope.newClass.dateEnd === "" || $scope.newClass.dateEnd == null) {
                errors = true;
                alert("Selezionare la data di fine del periodo");
            }

            if ($scope.newClass.dateBegin && $scope.newClass.dateEnd && $scope.newClass.dateBegin.getTime() > $scope.newClass.dateEnd.getTime()) {
                errors = true;
                alert("La data di inizio deve minore della data di fine");
            }

            // if (($scope.newClass.time0 === "" || $scope.newClass.time0 == null) && ($scope.newClass.time1 === "" || $scope.newClass.time1 == null) && ($scope.newClass.time2 === "" || $scope.newClass.time2 == null) && ($scope.newClass.time3 === "" || $scope.newClass.time3 == null) && ($scope.newClass.time4 === "" || $scope.newClass.time4 == null) && ($scope.newClass.time5 === "" || $scope.newClass.time5 == null) && ($scope.newClass.time6 === "" || $scope.newClass.time6 == null)) {
            //     errors = true;
            //     alert("Selezionare almeno una fascia oraria");
            // }

            if (!$scope.newClass.time0.length && !$scope.newClass.time1.length && !$scope.newClass.time2.length && !$scope.newClass.time3.length && !$scope.newClass.time4.length && !$scope.newClass.time5.length && !$scope.newClass.time6.length) {
                errors = true;
                alert("Selezionare almeno una fascia oraria");
            }

            if ($scope.newClass.posti === "" || $scope.newClass.posti == null) {
                errors = true;
                alert("Inserire il numero massimo di posti");
            }

            if ($scope.newClass.corsia === "" || $scope.newClass.corsia == null) {
                errors = true;
                alert("Selezionare la corsia");
            }

            if ($scope.newClass.istruttore === "" || $scope.newClass.istruttore == null) {
                errors = true;
                alert("Selezionare un istruttore");
            }

            if (!errors) {
                var final = function (idCorso) {
                    // var getHours = function (date) {
                    //     var json = [];
                    //     if (date.getDay() === 0) {
                    //         json = $scope.time["0"].filter(function (x, i) {
                    //             return $scope.newClass.time0[i];
                    //         });
                    //     } else if (date.getDay() === 1) {
                    //         json = $scope.time["1"].filter(function (x, i) {
                    //             return $scope.newClass.time1[i];
                    //         });
                    //     } else if (date.getDay() === 2) {
                    //         json = $scope.time["2"].filter(function (x, i) {
                    //             return $scope.newClass.time2[i];
                    //         });
                    //     } else if (date.getDay() === 3) {
                    //         json = $scope.time["3"].filter(function (x, i) {
                    //             return $scope.newClass.time3[i];
                    //         });
                    //     } else if (date.getDay() === 4) {
                    //         json = $scope.time["4"].filter(function (x, i) {
                    //             return $scope.newClass.time4[i];
                    //         });
                    //     } else if (date.getDay() === 5) {
                    //         json = $scope.time["5"].filter(function (x, i) {
                    //             return $scope.newClass.time5[i];
                    //         });
                    //     } else if (date.getDay() === 6) {
                    //         json = $scope.time["6"].filter(function (x, i) {
                    //             return $scope.newClass.time6[i];
                    //         });
                    //     }
                    //
                    //     return json;
                    // };

                    var sendRequest = function (date) {
                        var sqlDate = date.getFullYear() + "-";
                        sqlDate += (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-";
                        sqlDate += (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());

                        // var hours = getHours(date);
                        var hours = $scope.newClass["time" + date.getDay()];

                        if (hours && hours.length) {
                            hours.forEach(function (h) {
                                $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify({
                                    idCorso: idCorso,
                                    data: sqlDate,
                                    idIstruttore: $scope.newClass.istruttore,
                                    ora_inizio: h.start,
                                    ora_fine: h.end,
                                    idCorsia: $scope.newClass.corsia,
                                    posti: $scope.newClass.posti
                                }))).then(function (response) {
                                    console.log("Inserita la seguente prenotazione: ", {
                                        idCorso: idCorso,
                                        data: sqlDate,
                                        idIstruttore: $scope.newClass.istruttore,
                                        ora_inizio: h.start,
                                        ora_fine: h.end,
                                        idCorsia: $scope.newClass.corsia,
                                        posti: $scope.newClass.posti
                                    }, "response: ", response.data);
                                });
                            });
                        }
                    };

                    for (var i = $scope.newClass.dateBegin.getDate(), d = new Date($scope.newClass.dateBegin.getFullYear(), $scope.newClass.dateBegin.getMonth(), i); d.getTime() !== $scope.newClass.dateEnd.getTime(); i++) {
                        d = new Date($scope.newClass.dateBegin.getFullYear(), $scope.newClass.dateBegin.getMonth(), i);
                        sendRequest(d);
                        $scope.hide();
                    }
                };

                if ($scope.newClass.nome) {
                    $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/corso") + "/data/" + encodeURIComponent(JSON.stringify({
                        nome: $scope.newClass.nome,
                        durata: $scope.newClass.durata
                    }))).then(function (response) {
                        final(response.data.insertId);
                    });
                } else {
                    final($scope.newClass.corsoEsistente);
                }
            }
        };

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corso")).then(function (response) {
            $scope.Corsi = response.data;
        });

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsia")).then(function (response) {
            $scope.Corsie = response.data;
        });

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/istruttore")).then(function (response) {
            $scope.Istruttori = response.data;
            console.log("--------------------------------");
            console.log("$scope.Istruttori: ", $scope.Istruttori);
            console.log("--------------------------------");
        });

        $scope.$watch("newClass", function (newValue, oldValue) {
            console.log("@@@@@@@@@@@@@@@@@@@@@@");
            console.log("newClass");
            console.log("newValue: ", newValue, "oldValue: ", oldValue);
            console.log("@@@@@@@@@@@@@@@@@@@@@@");
        }, true);
    }

    // function that launch the Show Class modal
    $scope.showClassInfo = function (value) {
        $mdDialog.show({
            locals: {
                value: value
            },
            templateUrl: "applications/" + $scope.object.objectId + "/modal/class_full_detail.html",
            controller: ShowClassInfoController,
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

    function ShowClassInfoController($scope, $mdDialog, value) {
        $scope.value = value;
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
    }

    // function that launch the Add Instructor modal
    $scope.addInstructor = function () {
        //console.log("DENTRO $scope.addInstructor --------------------------------")
        $mdDialog.show({
            //locals: {
            //    value: value
            //},
            templateUrl: "applications/" + $scope.object.objectId + "/modal/add_instructor.html",
            controller: addInstructorController,
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

    function addInstructorController($scope, $mdDialog) {
        //$scope.value = value;
        //console.log("$scope.value = ", $scope.value);

        $scope.newInstructor = {};

        $scope.saveNewInstructor = function () {
            console.log("DENTRO $scope.saveNewClass -----------");
            // calcolare l'ID in automatico
            $scope.newInstructor.id = 100;
            $scope.newInstructor.active = 1;
            console.log("$scope.newInstructor = ", $scope.newInstructor);
        };


        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };

        //Elenco dei corsiscuolanuoto - INIZIO
        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsoscuolanuoto")).then(function (response) {
            $scope.CorsiScuolaNuoto = response.data;
            console.log("--------------------------------");
            console.log("$scope.CorsiScuolaNuoto: ", $scope.CorsiScuolaNuoto);
            console.log("--------------------------------");
        });
        //Elenco dei corsiscuolanuoto - FINE
    }

    // function that launch the Show Instructor modal
    $scope.showInstructorInfo = function (value) {
        $mdDialog.show({
            locals: {
                value: value
            },
            templateUrl: "applications/" + $scope.object.objectId + "/modal/instructor_full_detail.html",
            controller: ShowInstructorInfoController,
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

    function ShowInstructorInfoController($scope, $mdDialog, value) {
        $scope.value = value;
        var data_nascitaObj = new Date($scope.value.data_nascita);
        var data_nascitaDay = data_nascitaObj.getDate();
        var data_nascitaMonth = data_nascitaObj.getMonth();
        var data_nascitaYear = data_nascitaObj.getFullYear();
        $scope.value.data_nascitaString = data_nascitaDay + "/" + data_nascitaMonth + "/" + data_nascitaYear;
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
    }

    // function that launch the Add Customer modal
    $scope.addCustomer = function () {
        // console.log("DENTRO $scope.addCustomer --------------------------------")
        $mdDialog.show({
            //locals: {
            //    value: value
            //},
            templateUrl: "applications/" + $scope.object.objectId + "/modal/add_customer.html",
            controller: addCustomerController,
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

    function addCustomerController($scope, $mdDialog) {
        //$scope.value = value;
        //console.log("$scope.value = ", $scope.value);

        $scope.newCustomer = {};

        $scope.saveNewCustomer = function () {
            console.log("DENTRO $scope.saveNewClass -----------");
            // calcolare l'ID in automatico
            $scope.newCustomer.id = 100;
            $scope.newCustomer.active = 1;
            console.log("$scope.newCustomer = ", $scope.newCustomer);
        };


        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };
    }

    // function that launch the Show Instructor modal
    $scope.showCustomerInfo = function (value) {
        $mdDialog.show({
            locals: {
                value: value,
                mydata: $scope.mydata
            },
            templateUrl: "applications/" + $scope.object.objectId + "/modal/customer_full_detail.html",
            controller: ShowCustomerInfoController,
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

    function ShowCustomerInfoController($scope, $window, $mdDialog, $mdSelect, value, mydata) {
        var reverseDate = function (d) {
            return d.split("/").reverse().join("-");
        };

        $window.addEventListener("click", function () {
            $mdSelect.hide();
        });

        $scope.value = value;
        $scope.mydata = mydata;
        console.log("$scope.value = ", $scope.value);
        console.log("$scope.mydata = ", $scope.mydata);

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/utente/" + value.id)).then(function (response) {
            response.data = response.data.filter(function (x) {
                x.data = new Date(x.data);
                return x.idCorso === value.idCorso;
            });

            $scope.recupero = response.data.filter(function (x) {
                return x.presente === 0;
            }).length;

            var today = new Date(), weekDates = [];
            for (var i = 1; i <= 7; i++) {
                weekDates.push(new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + i));
            }

            $scope.assenze_settimanali = response.data.filter(function (x) {
                return weekDates.findIndex(function (a) {
                    return a.getTime() === x.data.getTime();
                }) > -1 && x.presente === 0;
            }).length;

            var firstDayDate = new Date(today.getFullYear(), today.getMonth(), 1), monthDate = [];
            while (firstDayDate.getMonth() === today.getMonth()) {
                monthDate.push(new Date(firstDayDate.getTime()));
                firstDayDate.setDate(firstDayDate.getDate() + 1);
            }

            $scope.assenze_mensili = response.data.filter(function (x) {
                return monthDate.findIndex(function (a) {
                    return a.getTime() === x.data.getTime();
                }) > -1 && x.presente === 0;
            }).length;
        });

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsoscuolanuoto")).then(function (response) {
            $scope.CorsiScuolaNuoto = response.data;
            console.log("--------------------------------------------------");
            console.log("$scope.CorsiScuolaNuoto: ", $scope.CorsiScuolaNuoto);
            console.log("--------------------------------------------------");
        });

        $scope.$watch("value", function (newValue, oldValue) {
            var copy = JSON.parse(JSON.stringify(newValue)), changeUser = true;
            for (var x in newValue) {
                if (newValue[x] !== oldValue[x]) {
                    if (x === "idCorso") {
                        changeUser = false;
                    }

                    copy.data_nascita = reverseDate(copy.data_nascita);
                    copy.inizio_abbonamento = reverseDate(copy.inizio_abbonamento);
                    copy.scadenza_abbonamento = reverseDate(copy.scadenza_abbonamento);
                    copy.inizio_assicurazione = reverseDate(copy.inizio_assicurazione);
                    copy.scadenza_assicurazione = reverseDate(copy.scadenza_assicurazione);

                    console.log("------------");
                    console.log("copy: ", copy);
                    console.log("------------");

                    if (changeUser) {
                        delete copy.$$hashKey;
                        delete copy.idCorso;
                        delete copy.nomeCorso;
                        $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/utente/" + copy.id) + "/data/" + encodeURIComponent(JSON.stringify(copy))).then(function (response) {
                            console.log("Utente con id " + copy.id + " modificato con successo");
                        }, function (error) {
                            console.log("Error durante la modifica dell'utente con id " + copy.id + ": ", error);
                        });
                    } else {
                        $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/new") + "/data/" + encodeURIComponent(JSON.stringify({
                            idCorsoOld: oldValue.idCorso,
                            idCorso: copy.idCorso,
                            idUtente: copy.id
                        }))).then(function (response) {
                            console.log("Utente con id " + copy.id + " iscritto con successo al corso con id " + copy.idCorso);
                        }, function (error) {
                            console.log("Error durante l'iscrizione dell'utente con id " + copy.id + "al corso con id " + copy.idCorso + ": ", error);
                        });
                    }
                }
            }
        }, true);
    }
}]);

setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication3357"), ["ApioApplication3357"]);
}, 10);
