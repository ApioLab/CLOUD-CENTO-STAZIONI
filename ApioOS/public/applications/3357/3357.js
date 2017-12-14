var app = angular.module("ApioApplication3357", ["apioProperty"]);
app.controller("defaultController", ["$scope", "$http", "$mdDialog", "currentObject", "socket", "sweet", "$mdSidenav", function ($scope, $http, $mdDialog, currentObject, socket, sweet, $mdSidenav) {
    // set the App into fullscreen mode
    document.getElementById("ApioApplicationContainer").classList.add("fullscreen");
    // get App info
    $scope.object = currentObject.get();
    console.log("Sono il defaultController e l'oggetto è: ", $scope.object);

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

    //PER ULISSE
    socket.on("new_prenotazione", function (data) {
        $scope.changeCalendarDateButtons('reload');
        $scope.$applyAsync();
    });

    socket.on("reload_tesserati", function (data) {
        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/utente")).then(function (response) {
            var today = new Date();

            response.data.forEach(function (x, i, r) {
                $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/utente/" + x.id)).then(function (response) {
                    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                    console.log("/gym/prenotazione/utente/" + x.id, "response.data: ", response.data);
                    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                    response.data.sort(function (a, b) {
                        return a.id - b.id;
                    });

                    x.data_nascitaDate = new Date(x.data_nascita);
                    x.inizio_abbonamentoDate = new Date(x.inizio_abbonamento);
                    x.scadenza_abbonamentoDate = new Date(x.scadenza_abbonamento);
                    x.inizio_assicurazioneDate = new Date(x.inizio_assicurazione);
                    x.scadenza_assicurazioneDate = new Date(x.scadenza_assicurazione);

                    x.data_nascita = formatData(x.data_nascita);
                    x.inizio_abbonamento = formatData(x.inizio_abbonamento);
                    x.scadenza_abbonamento = formatData(x.scadenza_abbonamento);
                    x.inizio_assicurazione = formatData(x.inizio_assicurazione);
                    x.scadenza_assicurazione = formatData(x.scadenza_assicurazione);

                    if (response.data.length) {
                        x.idCorso = response.data[response.data.length - 1].idCorso;
                        x.nomeCorso = response.data[response.data.length - 1].nomeCorso;
                    }

                    x.recuperi = response.data.filter(function (t) {
                        return today.getFullYear() === new Date(t.data).getFullYear();
                    }).length;

                    var user_index = $scope.UtenteCorsi.findIndex(function (t) {
                        return t.id === x.id
                    });

                    if (user_index > -1) {
                        for (var k in x) {
                            $scope.UtenteCorsi[user_index][k] = x[k];
                        }
                    }

                    if (i === r.length - 1) {
                        $scope.UtenteCorsi.sort(function (a, b) {
                            return a.id - b.id;
                        });

                        console.log("++++++++++++++++++++++++++++++++++++++++");
                        console.log("$scope.UtenteCorsi: ", $scope.UtenteCorsi);
                        console.log("++++++++++++++++++++++++++++++++++++++++");
                    }
                });
            });
        });
    });

    socket.on("reload_corsi", function (data) {
        if (data.action === "add") {
            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsoscuolanuoto/" + data.idCorso)).then(function (response) {
                var today = new Date();
                var new_length = $scope.Corsi.push(response.data[0]);
                var c = $scope.Corsi[new_length - 1];
                $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + c.id)).then(function (response) {
                    if (response.data.length) {
                        c.dateBegin = formatData(new Date(response.data.slice(1).reduce(function (a, e) {
                            if (new Date(e.data).getTime() < a) {
                                a = new Date(e.data).getTime();
                            }

                            return a;
                        }, new Date(response.data[0].data).getTime())));

                        c.dateEnd = formatData(new Date(response.data.slice(1).reduce(function (a, e) {
                            if (new Date(e.data).getTime() > a) {
                                a = new Date(e.data).getTime();
                            }

                            return a;
                        }, new Date(response.data[0].data).getTime())));

                        var idCorsia = response.data.sort(function (a, b) {
                            return new Date(b.data).getTime() - new Date(a.data).getTime();
                        })[0].idCorsia;

                        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsia/" + idCorsia)).then(function (response) {
                            c.corsia = response.data[0].nome;
                        });
                    } else {
                        c.dateBegin = formatData(new Date(today.getFullYear(), 0, 1));
                        c.dateEnd = formatData(new Date(today.getFullYear(), 11, 31));
                    }

                    $scope.$applyAsync();
                });
            });
        } else if (data.action === "delete") {
            $scope.Corsi.splice($scope.Corsi.findIndex(function (t) {
                return t.id === data.idCorso;
            }), 1);
            $scope.$applyAsync();
        }
    });

    $scope.selected = [];

    $scope.query = {
        filter: '',
        order: 'nome',
        limit: 10,
        page: 1
    };


    $scope.limitOptions = [5, 10, 15];

    $scope.options = {
        rowSelection: false,
        multiSelect: false,
        autoSelect: true,
        decapitate: false,
        largeEditDialog: false,
        boundaryLinks: true,
        limitSelect: true,
        pageSelect: true
    };


////////////////////////////////

    var bookmark;

    $scope.selected = [];

    $scope.filter = {
        options: {
            debounce: 500
        },
        search: function (item) {
            return item && $scope.query ? (item.nome + " " + item.cognome).toLowerCase().indexOf($scope.query.filter) > -1 : true;
        }
    };

    function success(desserts) {
        $scope.desserts = desserts;
    }


    $scope.getDesserts = function () {
//     $scope.promise = $nutrition.desserts.get($scope.query, success).$promise;
        //$scope.promise = $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/utente"));
        // return $scope.UtenteCorsi ? $scope.UtenteCorsi.filter(function (t) {
        // 	return (t.nome + " " + t.cognome).toLowerCase().indexOf($scope.query.filter) > -1;
        // }) : [];

    };

    $scope.removeFilter = function () {
        $scope.filter.show = false;
        $scope.query.filter = '';

        if ($scope.filter.form.$dirty) {
            $scope.filter.form.$setPristine();
        }
    };

    $scope.$watch('query.filter', function (newValue, oldValue) {
        if (!oldValue) {
            bookmark = $scope.query.page;
        }

        if (newValue !== oldValue) {
            $scope.query.page = 1;
        }

        if (!newValue) {
            $scope.query.page = bookmark;
        }

        $scope.getDesserts();
        $scope.$applyAsync();

    });

////////////////////////////////

    /*
      $scope.editComment = function (event, dessert) {
                event.stopPropagation(); // in case autoselect is enabled

                var editDialog = {
                    modelValue: dessert.comment,
                    placeholder: 'Add a comment',
                    save: function (input) {
                        if(input.$modelValue === 'Donald Trump') {
                            return $q.reject();
                        }
                        if(input.$modelValue === 'Bernie Sanders') {
                            return dessert.comment = 'FEEL THE BERN!';
                        }
                        dessert.comment = input.$modelValue;
                    },
                    targetEvent: event,
                    title: 'Add a comment',
                    validators: {
                        'md-maxlength': 30
                    }
                };

                var promise = $mdEditDialog.small(editDialog);

                promise.then(function (ctrl) {
                    var input = ctrl.getInput();

                    input.$viewChangeListeners.push(function () {
                        input.$setValidity('test', input.$modelValue !== 'test');
                    });
                });
            };

            $scope.getTypes = function () {
                return ['Candy', 'Ice cream', 'Other', 'Pastry'];
            };

    */


//////////////////////

    /*
      $scope.editComment = function (event, dessert) {
        event.stopPropagation(); // in case autoselect is enabled
    */
    /*

        var editDialog = {
          modelValue: dessert.comment,
          placeholder: 'Add a comment',
          save: function (input) {
            if(input.$modelValue === 'Donald Trump') {
              input.$invalid = true;
              return $q.reject();
            }
            if(input.$modelValue === 'Bernie Sanders') {
              return dessert.comment = 'FEEL THE BERN!'
            }
            dessert.comment = input.$modelValue;
          },
          targetEvent: event,
          title: 'Add a comment',
          validators: {
            'md-maxlength': 30
          }
        };
    */

    /*
        if($scope.options.largeEditDialog) {
          promise = $mdEditDialog.large(editDialog);
        } else {
          promise = $mdEditDialog.small(editDialog);
        }
    */
    /*

        promise.then(function (ctrl) {
          var input = ctrl.getInput();

          input.$viewChangeListeners.push(function () {
            input.$setValidity('test', input.$modelValue !== 'test');
          });
        });
    */


    $scope.toggleLimitOptions = function () {
        $scope.limitOptions = $scope.limitOptions ? undefined : [5, 10, 15];
    };

    $scope.getTypes = function () {
        return ['Candy', 'Ice cream', 'Other', 'Pastry'];
    };

    $scope.loadStuff = function () {
        $scope.promise = $timeout(function () {
            // loading
        }, 2000);
    }

    $scope.logItem = function (item) {
        console.log(item.name, 'was selected');
    };

    $scope.logOrder = function (order) {
        console.log('order: ', order);
    };

    $scope.logPagination = function (page, limit) {
        console.log('page: ', page);
        console.log('limit: ', limit);
    };


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
        3: "Tesserati"
//         4: "Piscine - Corsie"
    };

    $scope.selectedSection = $scope.sideMenuItems[1];
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
            return {id: x.id, name: x.nome};
        });
    });


    //Elenco dei corsi - INIZIO
    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsoscuolanuoto")).then(function (response) {
        var today = new Date();
        $scope.Corsi = response.data;
        $scope.Corsi.forEach(function (c) {
            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + c.id)).then(function (response) {
                if (response.data.length) {
                    c.dateBegin = formatData(new Date(response.data.slice(1).reduce(function (a, e) {
                        if (new Date(e.data).getTime() < a) {
                            a = new Date(e.data).getTime();
                        }

                        return a;
                    }, new Date(response.data[0].data).getTime())));

                    c.dateEnd = formatData(new Date(response.data.slice(1).reduce(function (a, e) {
                        if (new Date(e.data).getTime() > a) {
                            a = new Date(e.data).getTime();
                        }

                        return a;
                    }, new Date(response.data[0].data).getTime())));

                    var idCorsia = response.data.sort(function (a, b) {
                        return new Date(b.data).getTime() - new Date(a.data).getTime();
                    })[0].idCorsia;

                    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsia/" + idCorsia)).then(function (response) {
                        c.corsia = response.data[0].nome;
                    });
                } else {
                    c.dateBegin = formatData(new Date(today.getFullYear(), 0, 1));
                    c.dateEnd = formatData(new Date(today.getFullYear(), 11, 31));
                }
            });
        });
    });

    $scope.myData = [
        {
            "firstName": "Cox",
            "lastName": "Carney",
            "company": "Enormo",
            "employed": true
        },
        {
            "firstName": "Lorraine",
            "lastName": "Wise",
            "company": "Comveyer",
            "employed": false
        },
        {
            "firstName": "Nancy",
            "lastName": "Waters",
            "company": "Fuelton",
            "employed": false
        }
    ];
    //Elenco dei corsi - FINE

    //Elenco degli istruttori - INIZIO
    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/istruttore")).then(function (response) {
        var today = new Date();
        $scope.Istruttori = response.data;
        $scope.Istruttori.forEach(function (t) {
            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/istruttore/" + t.id)).then(function (response) {
                t.corsi_mensili = response.data.filter(function (p) {
                    p.data = new Date(p.data);
                    return p.data.getTime() <= today.getTime() && p.data.getFullYear() === today.getFullYear() && p.data.getMonth() === today.getMonth();
                }).length;

                t.corsi_annuali = response.data.filter(function (p) {
                    p.data = new Date(p.data);
                    return p.data.getTime() <= today.getTime() && p.data.getFullYear() === today.getFullYear();
                }).length;
            });
        });
        console.log("--------------------------------");
        console.log("$scope.Istruttori: ", $scope.Istruttori);
        console.log("--------------------------------");
    });
    //Elenco degli istruttori - FINE

    //Elenco degli utenti - INIZIO
    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/utente")).then(function (response) {
        $scope.Utenti = response.data;
        $scope.UtenteCorsi = [];
        console.log("-------------------------------------------");
        console.log("$scope.Utenti (principale): ", $scope.Utenti);
        console.log("-------------------------------------------");

        var today = $scope.today = new Date();

        $scope.Utenti.forEach(function (x, i, r) {
            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/utente/" + x.id)).then(function (response) {
                console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                console.log("/gym/prenotazione/utente/" + x.id, "response.data: ", response.data);
                console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                response.data.sort(function (a, b) {
                    return a.id - b.id;
                });

                x.data_nascitaDate = new Date(x.data_nascita);
                x.inizio_abbonamentoDate = new Date(x.inizio_abbonamento);
                x.scadenza_abbonamentoDate = new Date(x.scadenza_abbonamento);
                x.inizio_assicurazioneDate = new Date(x.inizio_assicurazione);
                x.scadenza_assicurazioneDate = new Date(x.scadenza_assicurazione);

                x.data_nascita = formatData(x.data_nascita);
                x.inizio_abbonamento = formatData(x.inizio_abbonamento);
                x.scadenza_abbonamento = formatData(x.scadenza_abbonamento);
                x.inizio_assicurazione = formatData(x.inizio_assicurazione);
                x.scadenza_assicurazione = formatData(x.scadenza_assicurazione);

                if (response.data.length) {
                    x.idCorso = response.data[response.data.length - 1].idCorso;
                    x.nomeCorso = response.data[response.data.length - 1].nomeCorso;
                }

                x.recuperi = response.data.filter(function (t) {
                    return today.getFullYear() === new Date(t.data).getFullYear();
                }).length;


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
                $scope.orari[i] = {
                    corsi: [undefined, undefined, undefined, undefined, undefined, undefined],
                    start: x.start,
                    end: x.end
                };
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
                            postiPercentage: Number((response2.data.length / x.posti) * 100),
                            recupero: x.recupero
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
                            postiPercentage: Number((response2.data.length / x.posti) * 100),
                            recupero: x.recupero
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
        } else if (action === 'reload') {
            $scope.dateForCalendar = new Date($scope.dateForCalendar.setTime($scope.dateForCalendar.getTime()));
            console.log("$scope.dateForCalendar = ", $scope.dateForCalendar);
            $scope.setCalendarDate();
        }

        $scope.$applyAsync();
    };

    socket.on("reloadCalendar", function (data) {
        $scope.changeCalendarDateButtons('reload');
        $scope.$applyAsync();
    });

    // function that
    $scope.setCalendarDate = function () {
        console.log("DENTRO $scope.setCalendarDate ----------------");
        console.log("$scope.dateForCalendar", $scope.dateForCalendar);
        // inserire comandi che cambino lo schema della tabella del calendario
    };

    $scope.showClass = function (value, time) {
        $mdDialog.show({
            locals: {
                value: value,
                shortCalendarDate: $scope.shortCalendarDate,
                disableModify: $scope.disableModify,
                letteralDay: $scope.letteralDay,
                time: time,
                orari: $scope.orari,
                changeCalendarDateButtons: $scope.changeCalendarDateButtons
            },
            templateUrl: "applications/" + $scope.object.objectId + "/modal/add_corso_on_calendar.html",
            controller: ShowClassController,
            clickOutsideToClose: true,
            bindToController: true,
//             CorsiScuolaNuoto: $scope.CorsiScuolaNuoto,
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

    function ShowClassController($scope, $mdDialog, value, shortCalendarDate, disableModify, letteralDay, time, orari) {
        $scope.letteralDay = letteralDay;
        $scope.value = value;
        $scope.shortCalendarDate = shortCalendarDate;
        $scope.disableModify = disableModify;
        $scope.time = time;
        $scope.today = new Date();
        $scope.isRecupero = false;
//         $scope.CorsiScuolaNuoto = CorsiScuolaNuoto;
        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsoscuolanuoto")).then(function (response) {
            $scope.CorsiScuolaNuoto = response.data;
            console.log("--------------------------------");
            console.log("$scope.CorsiScuolaNuoto: ", $scope.CorsiScuolaNuoto);
            console.log("--------------------------------");

        });
        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
        console.log("$scope.value: ", $scope.value);
        console.log("orari: ", orari);
        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&");

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.delPrenotazione = function () {

            sweet.show({
                title: "Sicuro di voler cancellare?",
                text: "Cosi facendo cancellerai la prenotazione",
                type: "info",
                showCancelButton: true,
                confirmButtonClass: "btn-success",
                cancelButtonClass: "btn-info",
                confirmButtonText: "Cancella",
                cancelButtonText: "Annulla",
                closeOnConfirm: false,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    console.log("ulisse");
                    console.log($scope.value.idPrenotazione);
                    $http.delete("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify({
                        id: $scope.value.idPrenotazione
                    }))).then(function (response) {
                        console.log("Prenotazione eliminata con successp, response: ", response);
                    }, function (error) {
                        console.log("Errore nella query di delete, error: ", error);
                    });
                    $scope.hide();
                    socket.emit("send_to_client", {data: {}, message: "reloadCalendar"});

                    //changeCalendarDateButtons('reload');
                    //console.log("$scope.dateForCalendar = ", $scope.dateForCalendar);
                    sweet.show({
                        title: 'Cancellato!',
                        text: 'Puoi creare una nuova prenotazione',
                        type: 'success'
                    }, function () {
                    });
                }
            });
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
                            response2.data[0].data_nascita = new Date(response2.data[0].data_nascita);
                            response2.data[0].inizio_abbonamento = new Date(response2.data[0].inizio_abbonamento);
                            response2.data[0].scadenza_abbonamento = new Date(response2.data[0].scadenza_abbonamento);
                            response2.data[0].inizio_assicurazione = new Date(response2.data[0].inizio_assicurazione);
                            response2.data[0].scadenza_assicurazione = new Date(response2.data[0].scadenza_assicurazione);
                            $scope.Users.push(response2.data[0]);

                            if (i === r.length - 1) {
                                $scope.Users.sort(function (a, b) {
                                    return a.id - b.id;
                                });

                                // $scope.$watch("Users", function (newValue, oldValue) {
                                //     newValue.forEach(function (n, i) {
                                //         if (!oldValue[i] || n.presente !== oldValue[i].presente) {
                                //             var iscrizione = response.data.find(function (x) {
                                //                 return x.idUtente === n.id;
                                //             });
                                //
                                //             if (iscrizione) {
                                //                 $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/" + iscrizione.id) + "/data/" + encodeURIComponent(JSON.stringify({
                                //                     presente: Number(n.presente)
                                //                 }))).then(function (response) {
                                //                     console.log("Successfully modified Iscrizione with id " + iscrizione.id + " presente set to " + Number(n.presente));
                                //                 });
                                //             }
                                //         }
                                //     });
                                // }, true);

                                $scope.$watch("Users", function (newValue, oldValue) {
                                    if (newValue) {
                                        newValue.forEach(function (n, i) {
                                            if (n.presente && (!oldValue[i] || !oldValue[i].presente)) {
                                                var iscrizione = response.data.find(function (x) {
                                                    return x.idUtente === n.id;
                                                });

                                                if (iscrizione) {
                                                    $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/" + iscrizione.id) + "/data/" + encodeURIComponent(JSON.stringify({
                                                        presente: Number(n.presente)
                                                    }))).then(function (response) {
                                                        console.log("Successfully modified Iscrizione with id " + iscrizione.id + " presente set to " + Number(n.presente));
                                                    });

                                                    if ($scope.value.recupero) {
                                                        var recuperiArr = [];
                                                        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + $scope.selectedCorso)).then(function (response) {
                                                            response.data.forEach(function (p, i, a) {
                                                                $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/prenotazione/" + p.id)).then(function (response) {
                                                                    recuperiArr = recuperiArr.concat(response.data.filter(function (t) {
                                                                        return t.idUtente === n.id && t.presente === 0 && t.idRecupero === null && t.idPrenotazione !== $scope.value.idPrenotazione;
                                                                    }));

                                                                    if (i === a.length - 1) {
                                                                        recuperiArr.sort(function (a, b) {
                                                                            return a.id - b.id;
                                                                        });

                                                                        $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/" + recuperiArr[0].id) + "/data/" + encodeURIComponent(JSON.stringify({
                                                                            idRecupero: $scope.value.idPrenotazione
                                                                        }))).then(function (response) {
                                                                            console.log("Successfully modified Iscrizione with id " + recuperiArr[0].id + " idRecupero set to " + $scope.value.idPrenotazione);
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    }
                                                }
                                            } else if (!n.presente && (!oldValue[i] || oldValue[i].presente)) {
                                                var iscrizione = response.data.find(function (x) {
                                                    return x.idUtente === n.id;
                                                });

                                                if (iscrizione) {
                                                    $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/" + iscrizione.id) + "/data/" + encodeURIComponent(JSON.stringify({
                                                        presente: Number(n.presente)
                                                    }))).then(function (response) {
                                                        console.log("Successfully modified Iscrizione with id " + iscrizione.id + " presente set to " + Number(n.presente));
                                                    });

                                                    if ($scope.value.recupero) {
                                                        var recuperiArr = [];
                                                        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + $scope.selectedCorso)).then(function (response) {
                                                            response.data.forEach(function (p, i, a) {
                                                                $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/prenotazione/" + p.id)).then(function (response) {
                                                                    recuperiArr = recuperiArr.concat(response.data.filter(function (t) {
                                                                        return t.idUtente === n.id && t.presente === 0 && t.idRecupero !== null && t.idPrenotazione !== $scope.value.idPrenotazione;
                                                                    }));

                                                                    if (i === a.length - 1) {
                                                                        recuperiArr.sort(function (a, b) {
                                                                            return a.id - b.id;
                                                                        });

                                                                        $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/" + recuperiArr[0].id) + "/data/" + encodeURIComponent(JSON.stringify({
                                                                            idRecupero: null
                                                                        }))).then(function (response) {
                                                                            console.log("Successfully modified Iscrizione with id " + recuperiArr[0].id + " idRecupero set to " + $scope.value.idPrenotazione);
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                    }
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
            var finalIsRecuperoAndSelectedCorso = function (corso) {
                var usersId = [];
                $scope.Users = [];
                $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + corso)).then(function (response) {
                    response.data.forEach(function (t, i, r) {
                        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/prenotazione/" + t.id)).then(function (response) {
                            if (response.data[0] && response.data[0].presente === 0 && usersId.indexOf(response.data[0].idUtente) === -1) {
                                usersId.push(response.data[0].idUtente);
                            }

                            if (i === r.length - 1) {
                                usersId.forEach(function (t) {
                                    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/utente/" + t)).then(function (response) {
                                        response.data[0].data_nascita = new Date(response.data[0].data_nascita);
                                        response.data[0].inizio_abbonamento = new Date(response.data[0].inizio_abbonamento);
                                        response.data[0].scadenza_abbonamento = new Date(response.data[0].scadenza_abbonamento);
                                        response.data[0].inizio_assicurazione = new Date(response.data[0].inizio_assicurazione);
                                        response.data[0].scadenza_assicurazione = new Date(response.data[0].scadenza_assicurazione);
                                        $scope.Users.push(response.data[0]);
                                    });
                                });
                            }
                        });
                    });
                });
            };

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

            $scope.$watch("isRecupero", function (newValue) {
                if (newValue && $scope.selectedCorso) {
                    finalIsRecuperoAndSelectedCorso($scope.selectedCorso);
                } else if (!newValue) {
                    $scope.Users = [];
                }
            });

            $scope.$watch("selectedCorso", function (newValue) {
                if (newValue && $scope.isRecupero) {
                    finalIsRecuperoAndSelectedCorso(newValue);
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

                // idCorso: 7
                // idPrenotazione: 1505
                // istruttore: "Alex 4"
                // name: "Ambientamento"
                // posti: "0/23"
                // postiPercentage: 0

                if (!errors) {
                    $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify({
                        idCorso: $scope.selectedCorso,
                        data: dbDate,
                        idIstruttore: $scope.selectedIstruttore,
                        ora_inizio: time.start,
                        ora_fine: time.end,
                        idCorsia: $scope.selectedCorsia,
                        recupero: Number($scope.isRecupero)
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

                        var index = orari.findIndex(function (x) {
                            return x.start === time.start && x.end === time.end;
                        });

                        var i = $scope.Istruttori.find(function (x) {
                            return x.id === $scope.selectedIstruttore;
                        });

                        var c = $scope.Corsi.find(function (x) {
                            return x.id === $scope.selectedCorso;
                        });

                        var obj = {
                            idCorso: $scope.selectedCorso,
                            idPrenotazione: response.data.insertId,
                            istruttore: i.nome + " " + i.cognome,
                            name: c.nome,
                            posti: $scope.Users ? $scope.Users.length + "/" + $scope.selectedPosti : "0/" + $scope.selectedPosti,
                            postiPercentage: $scope.Users ? $scope.Users.length / $scope.selectedPosti * 100 : 0
                        };

                        orari[index].corsi[$scope.selectedCorsia - 1] = obj;

                        //PER ULISSE
                        socket.emit("send_to_client", {
//                             apioId: $scope.session.apioId,
                            data: {
                                /*
                                                                corsia: $scope.selectedCorsia,
                                                                data: obj,
                                                                time: time
                                */
                            },
                            message: "new_prenotazione"
                        });

                        $scope.hide();
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
            templateUrl: "applications/" + $scope.object.objectId + "/modal/add_new_corso.html",
            controller: addClassInfoController,
            clickOutsideToClose: true,
            bindToController: true,
//             Corsie: $scope.Corsie,

            // scope: $scope,
            // preserveScope: true,
            //parent: angular.element(document.getElementById("targetBody")),
            fullscreen: true
        }).then(function () {
            console.log("dentro al THEN della modal dell'evento");
//             console.log(Corsie);
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
        $http.get("/apio/user/getSessionComplete").then(function (r) {
            $scope.session = r.data;
        }, function (e) {
            console.log("Error while getting complete session: ", e)
        });

        // $scope.checkBoxModel = [];
        // for (var i in $scope.time) {
        //     $scope.checkBoxModel[i] = [];
        //     for (var j in $scope.time[i]) {
        //         $scope.checkBoxModel[i][j] = false;
        //     }
        // }

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

            // if (!$scope.newClass.time0.length && !$scope.newClass.time1.length && !$scope.newClass.time2.length && !$scope.newClass.time3.length && !$scope.newClass.time4.length && !$scope.newClass.time5.length && !$scope.newClass.time6.length) {
            //     errors = true;
            //     alert("Selezionare almeno una fascia oraria");
            // }

            if (!$scope.checkBoxModel.some(function (lane) {
                    return lane.some(function (day) {
                        return day.some(function (t) {
                            return t;
                        });
                    })
                })) {
                errors = true;
                alert("Selezionare almeno una fascia oraria");
            }

            if ($scope.newClass.posti === "" || $scope.newClass.posti == null) {
                errors = true;
                alert("Inserire il numero massimo di posti");
            }

            /*
                        if ($scope.newClass.corsia === "" || $scope.newClass.corsia == null) {
                            errors = true;
                            alert("Selezionare la corsia");
                        }
            */

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
                        // var hours = getHours(date);

                        // var hours = $scope.newClass["time" + date.getDay()];
                        //
                        // if (hours && hours.length) {
                        //     hours.forEach(function (h) {
                        //         $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify({
                        //             idCorso: idCorso,
                        //             data: sqlDate,
                        //             idIstruttore: $scope.newClass.istruttore,
                        //             ora_inizio: h.start,
                        //             ora_fine: h.end,
                        //             idCorsia: $scope.newClass.corsia
                        //         }))).then(function (response) {
                        //             console.log("Inserita la seguente prenotazione: ", {
                        //                 idCorso: idCorso,
                        //                 data: sqlDate,
                        //                 idIstruttore: $scope.newClass.istruttore,
                        //                 ora_inizio: h.start,
                        //                 ora_fine: h.end,
                        //                 idCorsia: $scope.newClass.corsia
                        //             }, "response: ", response.data);
                        //         });
                        //     });
                        // }

                        $scope.checkBoxModel.forEach(function (lane, l) {
                            lane[date.getDay()].forEach(function (t, pos) {
                                if (t) {
                                    var sqlDate = date.getFullYear() + "-" + ("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + date.getDate()).slice(-2);
                                    var h = $scope.time[date.getDay()][pos];
                                    $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify({
                                        idCorso: idCorso,
                                        data: sqlDate,
                                        idIstruttore: $scope.newClass.istruttore,
                                        ora_inizio: h.start,
                                        ora_fine: h.end,
                                        idCorsia: $scope.Corsie[l].id
                                    }))).then(function (response) {
                                        console.log("Inserita la seguente prenotazione: ", {
                                            idCorso: idCorso,
                                            data: sqlDate,
                                            idIstruttore: $scope.newClass.istruttore,
                                            ora_inizio: h.start,
                                            ora_fine: h.end,
                                            idCorsia: $scope.Corsie[l].id
                                        }, "response: ", response.data);
                                    });
                                }
                            });
                        })
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
                        posti: $scope.newClass.posti,
                        durata: $scope.newClass.durata,
                        tipo: "nuoto"
                    }))).then(function (response) {
                        final(response.data.insertId);
                        socket.emit("send_to_client", {
                            apioId: $scope.session.apioId,
                            data: {
                                action: "add",
                                idCorso: response.data.insertId
                            },
                            message: "reload_corsi"
                        });
                    });
                } else {
                    final($scope.newClass.corsoEsistente);
                    socket.emit("send_to_client", {
                        apioId: $scope.session.apioId,
                        data: {
                            action: "add",
                            idCorso: $scope.newClass.corsoEsistente
                        },
                        message: "reload_corsi"
                    });
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
            $scope.checkBoxModel = [];
            for (var k in $scope.Corsie) {
                $scope.checkBoxModel[k] = [];
                for (var i in $scope.time) {
                    $scope.checkBoxModel[k][i] = [];
                    for (var j in $scope.time[i]) {
                        $scope.checkBoxModel[k][i][j] = false;
                    }
                }
            }
        });

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/istruttore")).then(function (response) {
            $scope.Istruttori = response.data;
            console.log("--------------------------------");
            console.log("$scope.Istruttori: ", $scope.Istruttori);
            console.log("--------------------------------");
        });
    }

    // function that launch the Show Class modal
    $scope.showClassInfo = function (value) {
        $mdDialog.show({
            locals: {
                time: $scope.object.db.week.time,
                value: value
            },
            templateUrl: "applications/" + $scope.object.objectId + "/modal/corso_full_detail.html",
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

    function ShowClassInfoController($scope, $http, $window, $mdDialog, $mdSelect, value, time) {
        var today = new Date();
        $scope.value = value;
        $scope.time = time;
        console.log("$scope.value = ", $scope.value);
        console.log("$scope.time = ", $scope.time);

        $window.addEventListener("click", function () {
            $mdSelect.hide();
        });

        var toMySQLData = function (date) {
            return date.getFullYear() + "-" + ("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + date.getDate()).slice(-2);
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

        $http.get("/apio/user/getSessionComplete").then(function (r) {
            $scope.session = r.data;
        }, function (e) {
            console.log("Error while getting complete session: ", e)
        });

        $scope.delCorso = function () {
            $http.delete("/apio/service/gym/route/" + encodeURIComponent("/gym/corso") + "/data/" + encodeURIComponent(JSON.stringify({
                id: $scope.value.id
            }))).then(function (response) {
                $scope.hide();
                socket.emit("send_to_client", {
                    apioId: $scope.session.apioId,
                    data: {
                        action: "delete",
                        idCorso: $scope.value.id
                    },
                    message: "reload_corsi"
                });
            });
        };

        $scope.newClass = {
            time0: [],
            time1: [],
            time2: [],
            time3: [],
            time4: [],
            time5: [],
            time6: []
        };

        $scope.newClass.nome = $scope.value.nome;
        $scope.newClass.durata = String($scope.value.durata);
        $scope.newClass.posti = $scope.value.posti;

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsia")).then(function (response) {
            $scope.Corsie = response.data;

            $scope.checkBoxModel = [];
            $scope.disblaedCheckBox = [];
            for (var k in $scope.Corsie) {
                $scope.checkBoxModel[k] = [];
                $scope.disblaedCheckBox[k] = [];
                for (var i in $scope.time) {
                    $scope.checkBoxModel[k][i] = [];
                    $scope.disblaedCheckBox[k][i] = [];
                    for (var j in $scope.time[i]) {
                        $scope.checkBoxModel[k][i][j] = false;
                        $scope.disblaedCheckBox[k][i][j] = false;
                    }
                }
            }

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione")).then(function (response) {
                var filtered = response.data.filter(function (t) {
                    return new Date(t.data).getTime() >= today.getTime();
                });

                filtered.forEach(function (t) {
                    $scope.disblaedCheckBox[$scope.Corsie.findIndex(function (x) {
                        return x.id === t.idCorsia
                    })][new Date(t.data).getDay()][$scope.time[(new Date(t.data).getDay())].findIndex(function (x) {
                        return t.ora_inizio.substr(0, 5) === x.start && t.ora_fine.substr(0, 5) === x.end;
                    })] = true;
                });
            });

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + value.id)).then(function (response) {
                var filtered = response.data.filter(function (t) {
                    return new Date(t.data).getFullYear() === today.getFullYear();
                }).sort(function (a, b) {
                    return new Date(b.data).getTime() - new Date(a.data).getTime();
                });

                if (filtered.length) {
                    $scope.newClass.dateBegin = new Date(filtered.slice(1).reduce(function (a, e) {
                        if (new Date(e.data).getTime() < a) {
                            a = new Date(e.data).getTime();
                        }

                        return a;
                    }, new Date(filtered[0].data).getTime()));

                    $scope.newClass.dateEnd = new Date(filtered.slice(1).reduce(function (a, e) {
                        if (new Date(e.data).getTime() > a) {
                            a = new Date(e.data).getTime();
                        }

                        return a;
                    }, new Date(filtered[0].data).getTime()));

                    $scope.newClass.corsia = filtered[0].idCorsia;
                    $scope.newClass.istruttore = filtered[0].idIstruttore;

                    filtered = filtered.filter(function (t) {
                        return new Date(t.data).getTime() >= today.getTime();
                    });

                    filtered.forEach(function (t) {
                        if ($scope.newClass["time" + (new Date(t.data).getDay())].findIndex(function (x) {
                                return t.ora_inizio.substr(0, 5) === x.start && t.ora_fine.substr(0, 5) === x.end;
                            }) === -1) {
                            $scope.newClass["time" + (new Date(t.data).getDay())].push($scope.time[(new Date(t.data).getDay())].find(function (x) {
                                return t.ora_inizio.substr(0, 5) === x.start && t.ora_fine.substr(0, 5) === x.end;
                            }));

                            $scope.checkBoxModel[$scope.Corsie.findIndex(function (x) {
                                return t.idCorsia === x.id;
                            })][new Date(t.data).getDay()][$scope.time[(new Date(t.data).getDay())].findIndex(function (x) {
                                return t.ora_inizio.substr(0, 5) === x.start && t.ora_fine.substr(0, 5) === x.end;
                            })] = true;
                        }
                    });

                    $scope.$watch("checkBoxModel", function (newValue, oldValue) {
                        newValue.forEach(function (corsia, k) {
                            corsia.forEach(function (giorno, i) {
                                giorno.forEach(function (val, j) {
                                    if (val !== oldValue[k][i][j]) {
                                        if (val) {
                                            var daysNumber = parseInt(($scope.newClass.dateEnd.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
                                            var newDate = [];
                                            for (var x = 0; x <= daysNumber + 1; x++) {
                                                var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + x);
                                                if (d.getDay() === i) {
                                                    newDate.push(d);
                                                }
                                            }

                                            newDate.forEach(function (t, index, ref) {
                                                $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify({
                                                    idCorso: value.id,
                                                    data: toMySQLData(t),
                                                    idIstruttore: $scope.newClass.istruttore,
                                                    ora_inizio: $scope.time[i][j].start,
                                                    ora_fine: $scope.time[i][j].end,
                                                    idCorsia: $scope.Corsie[k].id
                                                }))).then(function (response) {
                                                    console.log("Nuova prenotazione aggiunta con successo con id " + response.data.insertId + ", response: ", response);
                                                    if (index === ref.length - 1) {
                                                        socket.emit("send_to_client", {
                                                            data: {},
                                                            message: "reloadCalendar"
                                                        });
                                                    }
                                                }, function (error) {
                                                    console.log("Error durante l'aggiunta della nuova prenotazione: ", error);
                                                });
                                            });
                                        } else {
                                            console.log("Sono dentro al else if");
                                            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + value.id)).then(function (response) {
                                                var filtered = response.data.filter(function (t) {
                                                    t.data = new Date(t.data);
                                                    // console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");
                                                    // console.log("t.data: ", t.data);
                                                    // console.log("t.data.getTime(): ", t.data.getTime(), "today.getTime(): ", today.getTime(), t.data.getTime() >= today.getTime());
                                                    // console.log("t.data.getTime(): ", t.data.getTime(), "$scope.newClass.dateEnd.getTime(): ", $scope.newClass.dateEnd.getTime(), t.data.getTime() <= $scope.newClass.dateEnd.getTime());
                                                    // console.log("t.data.getDay(): ", t.data.getDay(), "i: ", i, t.data.getDay() === i);
                                                    // console.log("t.ora_inizio.substr(0, 5): ", t.ora_inizio.substr(0, 5), "$scope.time[i][j].start: ", $scope.time[i][j].start, t.ora_inizio.substr(0, 5) === $scope.time[i][j].start);
                                                    // console.log("t.ora_fine.substr(0, 5): ", t.ora_fine.substr(0, 5), "$scope.time[i][j].end: ", $scope.time[i][j].end, t.ora_fine.substr(0, 5) === $scope.time[i][j].end);
                                                    // console.log("t.idCorsia: ", t.idCorsia, "$scope.Corsie[k].id: ", $scope.Corsie[k].id, t.idCorsia === $scope.Corsie[k].id);
                                                    // console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");
                                                    return t.data.getTime() >= today.getTime() &&
                                                        t.data.getTime() <= $scope.newClass.dateEnd.getTime() &&
                                                        t.data.getDay() === i &&
                                                        t.ora_inizio.substr(0, 5) === $scope.time[i][j].start &&
                                                        t.ora_fine.substr(0, 5) === $scope.time[i][j].end &&
                                                        t.idCorsia === $scope.Corsie[k].id;
                                                });
                                                filtered.forEach(function (t, index, ref) {
                                                    $http.delete("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify({id: t.id}))).then(function (response) {
                                                        console.log("Prenotazione eliminata con successo, response: ", response);
                                                        if (index === ref.length - 1) {
                                                            socket.emit("send_to_client", {
                                                                data: {},
                                                                message: "reloadCalendar"
                                                            });
                                                        }
                                                    }, function (error) {
                                                        console.log("Errore durante l'eliminazione della prenotazione: ", error);
                                                    });
                                                });
                                            }, function (error) {
                                                console.log("Errore Richietsa rotta : ", error);
                                            });
                                        }
                                    }
                                });
                            });
                        });
                    }, true);
                } else {
                    $scope.newClass.dateBegin = new Date(today.getFullYear(), 0, 1);
                    $scope.newClass.dateEnd = new Date(today.getFullYear(), 11, 31);
                }
            });
        });

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/istruttore")).then(function (response) {
            $scope.Istruttori = response.data;
        });

        // $scope.$watch("newClass.dateEnd", function (newValue, oldValue) {
        //     if (newValue) {
        //         if (!oldValue || newValue.getTime() > oldValue.getTime()) {
        //             $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + value.id)).then(function (response) {
        //                 response.data = response.data.filter(function (t) {
        //                     t.data = new Date(t.data);
        //                     return t.data.getTime() >= $scope.newClass.dateBegin.getTime() && t.data.getTime() <= $scope.newClass.dateEnd.getTime();
        //                 });
        //
        //                 var sundayData = response.data.filter(function (t) {
        //                     return t.data.getDay() === 0;
        //                 });
        //                 var mondayData = response.data.filter(function (t) {
        //                     return t.data.getDay() === 1;
        //                 });
        //                 var tuesdayData = response.data.filter(function (t) {
        //                     return t.data.getDay() === 2;
        //                 });
        //                 var wednesdayData = response.data.filter(function (t) {
        //                     return t.data.getDay() === 3;
        //                 });
        //                 var thursdayData = response.data.filter(function (t) {
        //                     return t.data.getDay() === 4;
        //                 });
        //                 var fridayData = response.data.filter(function (t) {
        //                     return t.data.getDay() === 5;
        //                 });
        //                 var saturdayData = response.data.filter(function (t) {
        //                     return t.data.getDay() === 6;
        //                 });
        //
        //                 var time_data = {
        //                     0: sundayData[sundayData.length - 1],
        //                     1: mondayData[mondayData.length - 1],
        //                     2: tuesdayData[tuesdayData.length - 1],
        //                     3: wednesdayData[wednesdayData.length - 1],
        //                     4: thursdayData[thursdayData.length - 1],
        //                     5: fridayData[fridayData.length - 1],
        //                     6: saturdayData[saturdayData.length - 1]
        //                 };
        //
        //                 var daysNumber = parseInt((newValue.getTime() - oldValue.getTime()) / (24 * 60 * 60 * 1000));
        //                 var storeData = [];
        //
        //                 for (var i = 1; i <= daysNumber; i++) {
        //                     var d = new Date(oldValue.getTime());
        //                     d.setDate(oldValue.getDate() + i);
        //
        //                     if (time_data[d.getDay()]) {
        //                         var toPush = JSON.parse(JSON.stringify(time_data[d.getDay()]));
        //                         toPush.data = toMySQLData(d);
        //                         delete toPush.id;
        //                         delete toPush.cognomeIstruttore;
        //                         delete toPush.durataCorso;
        //                         delete toPush.idPiscina;
        //                         delete toPush.livelloCorso;
        //                         delete toPush.nomeCorsia;
        //                         delete toPush.nomeCorso;
        //                         delete toPush.nomeIstruttore;
        //                         delete toPush.nomePiscina;
        //
        //                         storeData.push(toPush);
        //                     }
        //                 }
        //
        //                 storeData.forEach(function (t) {
        //                     $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify(t))).then(function (response) {
        //                         console.log("Nuova prenotazione aggiunta con successo, response: ", response);
        //                     }, function (error) {
        //                         console.log("Errore durante l'aggiunta della nuova prenotazione: ", error);
        //                     });
        //                 });
        //             });
        //         } else if (!oldValue || newValue.getTime() < oldValue.getTime()) {
        //             $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + value.id)).then(function (response) {
        //                 var toDelete = response.data.filter(function (t) {
        //                     t.data = new Date(t.data);
        //                     return t.data.getTime() >= newValue.getTime();
        //                 });
        //
        //                 toDelete.forEach(function (t) {
        //                     $http.delete("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify({
        //                         id: t.id
        //                     }))).then(function (response) {
        //                         console.log("Prenotazione eliminata con successo, response: ", response);
        //                     }, function (error) {
        //                         console.log("Errore durante l'eliminazione della prenotazione: ", error);
        //                     });
        //                 });
        //             });
        //         }
        //     }
        // });

        //PROVA
        $scope.$watch("newClass", function (newValue, oldValue) {
            Object.keys(newValue).forEach(function (x) {
                if (newValue[x] !== oldValue[x]) {
                    if (x === "dateEnd" && oldValue[x] !== undefined) {
                        if (newValue[x].getTime() > oldValue[x].getTime()) {
                            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + value.id)).then(function (response) {
                                response.data = response.data.filter(function (t) {
                                    t.data = new Date(t.data);
                                    return t.data.getTime() >= newValue.dateBegin.getTime() && t.data.getTime() <= newValue.dateEnd.getTime();
                                });

                                var sundayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 0;
                                });

                                var mondayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 1;
                                });

                                var tuesdayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 2;
                                });

                                var wednesdayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 3;
                                });

                                var thursdayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 4;
                                });

                                var fridayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 5;
                                });

                                var saturdayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 6;
                                });

                                var time_data = {
                                    0: sundayData[sundayData.length - 1],
                                    1: mondayData[mondayData.length - 1],
                                    2: tuesdayData[tuesdayData.length - 1],
                                    3: wednesdayData[wednesdayData.length - 1],
                                    4: thursdayData[thursdayData.length - 1],
                                    5: fridayData[fridayData.length - 1],
                                    6: saturdayData[saturdayData.length - 1]
                                };

                                var daysNumber = parseInt((newValue[x].getTime() - oldValue[x].getTime()) / (24 * 60 * 60 * 1000));
                                var storeData = [];

                                for (var i = 1; i <= daysNumber; i++) {
                                    var d = new Date(oldValue[x].getTime());
                                    d.setDate(oldValue[x].getDate() + i);

                                    if (time_data[d.getDay()]) {
                                        var toPush = JSON.parse(JSON.stringify(time_data[d.getDay()]));
                                        toPush.data = toMySQLData(d);
                                        delete toPush.id;
                                        delete toPush.cognomeIstruttore;
                                        delete toPush.durataCorso;
                                        delete toPush.idPiscina;
                                        delete toPush.livelloCorso;
                                        delete toPush.nomeCorsia;
                                        delete toPush.nomeCorso;
                                        delete toPush.nomeIstruttore;
                                        delete toPush.nomePiscina;

                                        storeData.push(toPush);
                                    }
                                }

                                storeData.forEach(function (t) {
                                    $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify(t))).then(function (response) {
                                        console.log("Nuova prenotazione aggiunta con successo, response: ", response);
                                    }, function (error) {
                                        console.log("Errore durante l'aggiunta della nuova prenotazione: ", error);
                                    });
                                });
                            });
                        } else if (newValue[x].getTime() < oldValue[x].getTime()) {
                            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + value.id)).then(function (response) {
                                var toDelete = response.data.filter(function (t) {
                                    t.data = new Date(t.data);
                                    return t.data.getTime() >= newValue[x].getTime();
                                });

                                toDelete.forEach(function (t) {
                                    $http.delete("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify({
                                        id: t.id
                                    }))).then(function (response) {
                                        console.log("Prenotazione eliminata con successo, response: ", response);
                                    }, function (error) {
                                        console.log("Errore durante l'eliminazione della prenotazione: ", error);
                                    });
                                });
                            });
                        }
                    } else if (x === "dateBegin" && oldValue[x] !== undefined) {
                        if (newValue[x].getTime() > oldValue[x].getTime()) {
                            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + value.id)).then(function (response) {
                                var toDelete = response.data.filter(function (t) {
                                    t.data = new Date(t.data);
                                    return t.data.getTime() < newValue[x].getTime();
                                });

                                toDelete.forEach(function (t) {
                                    $http.delete("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify({
                                        id: t.id
                                    }))).then(function (response) {
                                        console.log("Prenotazione eliminata con successo, response: ", response);
                                    }, function (error) {
                                        console.log("Errore durante l'eliminazione della prenotazione: ", error);
                                    });
                                });
                            });
                        } else if (newValue[x].getTime() < oldValue[x].getTime()) {
                            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + value.id)).then(function (response) {
                                response.data = response.data.filter(function (t) {
                                    t.data = new Date(t.data);
                                    return t.data.getTime() >= oldValue.dateBegin.getTime() && t.data.getTime() <= oldValue.dateEnd.getTime();
                                });

                                var sundayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 0;
                                });

                                var mondayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 1;
                                });

                                var tuesdayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 2;
                                });

                                var wednesdayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 3;
                                });

                                var thursdayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 4;
                                });

                                var fridayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 5;
                                });

                                var saturdayData = response.data.filter(function (t) {
                                    return t.data.getDay() === 6;
                                });

                                var time_data = {
                                    0: sundayData[sundayData.length - 1],
                                    1: mondayData[mondayData.length - 1],
                                    2: tuesdayData[tuesdayData.length - 1],
                                    3: wednesdayData[wednesdayData.length - 1],
                                    4: thursdayData[thursdayData.length - 1],
                                    5: fridayData[fridayData.length - 1],
                                    6: saturdayData[saturdayData.length - 1]
                                };

                                var daysNumber = parseInt((oldValue[x].getTime() - newValue[x].getTime()) / (24 * 60 * 60 * 1000));
                                var storeData = [];

                                for (var i = 1; i <= daysNumber; i++) {
                                    var d = new Date(oldValue[x].getTime());
                                    d.setDate(oldValue[x].getDate() - i);

                                    if (time_data[d.getDay()]) {
                                        var toPush = JSON.parse(JSON.stringify(time_data[d.getDay()]));
                                        toPush.data = toMySQLData(d);
                                        delete toPush.id;
                                        delete toPush.cognomeIstruttore;
                                        delete toPush.durataCorso;
                                        delete toPush.idPiscina;
                                        delete toPush.livelloCorso;
                                        delete toPush.nomeCorsia;
                                        delete toPush.nomeCorso;
                                        delete toPush.nomeIstruttore;
                                        delete toPush.nomePiscina;

                                        storeData.push(toPush);
                                    }
                                }

                                storeData.forEach(function (t) {
                                    $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione") + "/data/" + encodeURIComponent(JSON.stringify(t))).then(function (response) {
                                        console.log("Nuova prenotazione aggiunta con successo, response: ", response);
                                    }, function (error) {
                                        console.log("Errore durante l'aggiunta della nuova prenotazione: ", error);
                                    });
                                });
                            });
                        }
                    } else if (x === "durata" || x === "nome" || x === "posti") {
                        $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/corso/" + value.id) + "/data/" + encodeURIComponent(JSON.stringify({
                            durata: newValue.durata,
                            nome: newValue.nome,
                            posti: newValue.posti
                        }))).then(function (response) {
                            console.log("Successfully modified corso with id " + value.id + ", response: ", response);
                        });
                    } else if (x === "istruttore") {
                        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/corso/" + value.id)).then(function (response) {
                            var toUpdate = response.data.filter(function (t) {
                                t.data = new Date(t.data);
                                return t.data.getTime() >= newValue.dateBegin.getTime() && t.data.getTime() <= newValue.dateEnd.getTime();
                            });

                            toUpdate.forEach(function (t) {
                                $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/" + t.id) + "/data/" + encodeURIComponent(JSON.stringify({
                                    idIstruttore: newValue[x]
                                }))).then(function (response) {
                                    console.log("Prenotazione con id " + t.id + " aggiornata con successo, response: ", response);
                                }, function (error) {
                                    console.log("Errore durante l'aggiornamento della prenotazione con id " + t.id + ": ", error);
                                });
                            });
                        });
                    }
                }
            });
        }, true);
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
            locals: {
                mydata: $scope.mydata
            },
            templateUrl: "applications/" + $scope.object.objectId + "/modal/add_customer.html",
            controller: addCustomerController,
            clickOutsideToClose: true,
            bindToController: true,
            Corsi: $scope.Corsi,
            Corsie: $scope.Corsie,
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

    function addCustomerController($scope, $mdDialog, mydata, Corsi, Corsie) {
        $scope.mydata = mydata;
        //console.log("$scope.value = ", $scope.value);
        $scope.Corsie = Corsie;
        console.log("Corsie in modal = ", $scope.Corsie);
        $scope.Corsi = Corsi;
        console.log("Corsi in modal = ", $scope.Corsi);
        $scope.esistenzaSettimanale = [];
        $scope.redBorder = [];
        $scope.checkBoxModel = [];
        for (var i in $scope.mydata.time) {
            $scope.esistenzaSettimanale[i] = [];
            $scope.redBorder[i] = [];
            $scope.checkBoxModel[i] = [];
            for (var j in $scope.mydata[i]) {
                $scope.esistenzaSettimanale[i][j] = false;
                $scope.redBorder[i][j] = false;
                $scope.checkBoxModel[i][j] = false;
            }
        }

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

        //FINIRE DOPO

        // $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corso/get-prenotazione-and-posti/" + value.idCorso)).then(function (response) {
        //     $scope.prenotazioneAndPosti = response.data;
        //     $scope.prenotazioneAndPosti.forEach(function (e) {
        //         e.forEach(function (t) {
        //             var g = new Date(t.data).getDay();
        //             var index = $scope.mydata.time[g].findIndex(function (x) {
        //                 return t.ora_inizio.substr(0, 5) === x.start && t.ora_fine.substr(0, 5) === x.end;
        //             });
        //
        //             if (index > -1) {
        //                 $scope.esistenzaSettimanale[g][index] = true;
        //                 $scope.redBorder[g][index] = t.iscritti === t.posti;
        //             }
        //         });
        //     });
        // });
    }

    // function that launch the Show Instructor modal
    $scope.showCustomerInfo = function (value) {
        $mdDialog.show({
            locals: {
                value: value,
                mydata: $scope.mydata,
                Corsie: $scope.Corsie
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

    function ShowCustomerInfoController($scope, $window, $mdDialog, $mdSelect, value, mydata, Corsie) {
        var reverseDate = function (d) {
            return d.split("/").reverse().join("-");
        };

        $window.addEventListener("click", function () {
            $mdSelect.hide();
        });

        $scope.Corsie = Corsie;
        console.log("$scope.Corsie: ", $scope.Corsie);
        $scope.value = value;
        $scope.mydata = mydata;
        console.log("$scope.value = ", $scope.value);
        console.log("$scope.mydata = ", $scope.mydata);
        var idCorso = $scope.value.idCorso, idCorsoOld = $scope.value.idCorso;

        $scope.esistenzaSettimanale = [];
        $scope.redBorder = [];
        $scope.checkBoxModel = [];
        for (var k in $scope.Corsie) {
            $scope.esistenzaSettimanale[k] = [];
            $scope.redBorder[k] = [];
            $scope.checkBoxModel[k] = [];
            for (var i in $scope.mydata.time) {
                $scope.esistenzaSettimanale[k][i] = [];
                $scope.redBorder[k][i] = [];
                $scope.checkBoxModel[k][i] = [];
                for (var j in $scope.mydata.time[i]) {
                    $scope.esistenzaSettimanale[k][i][j] = false;
                    $scope.redBorder[k][i][j] = false;
                    $scope.checkBoxModel[k][i][j] = false;
                }
            }
        }

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corso/get-prenotazione-and-posti/" + value.idCorso)).then(function (response) {
            $scope.prenotazioneAndPosti = response.data;
            $scope.prenotazioneAndPosti.forEach(function (e) {
                e.forEach(function (t) {
                    var g = new Date(t.data).getDay();
                    var index = $scope.mydata.time[g].findIndex(function (x) {
                        return t.ora_inizio.substr(0, 5) === x.start && t.ora_fine.substr(0, 5) === x.end;
                    });

                    var indexCorsia = $scope.Corsie.findIndex(function (x) {
                        return x.id === t.idCorsia;
                    });

                    if (index > -1) {
                        $scope.esistenzaSettimanale[indexCorsia][g][index] = true;
                        $scope.redBorder[indexCorsia][g][index] = t.iscritti === t.posti;
                    }
                });
            });

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/utente/" + value.id)).then(function (response) {
                response.data.filter(function (t) {
                    return $scope.prenotazioneAndPosti.reduce(function (a, x) {
                        return a.concat(x);
                    }, []).findIndex(function (x) {
                        return t.idPrenotazione === x.id;
                    }) > -1;
                }).forEach(function (p) {
                    var t = $scope.prenotazioneAndPosti.reduce(function (a, x) {
                        return a.concat(x);
                    }, []).find(function (x) {
                        return x.id === p.idPrenotazione;
                    });

                    if (t) {
                        var g = new Date(t.data).getDay();
                        var index = $scope.mydata.time[g].findIndex(function (x) {
                            return t.ora_inizio.substr(0, 5) === x.start && t.ora_fine.substr(0, 5) === x.end;
                        });

                        var indexCorsia = $scope.Corsie.findIndex(function (x) {
                            return x.id === t.idCorsia;
                        });

                        if (index > -1) {
                            $scope.checkBoxModel[indexCorsia][g][index] = true;
                        }
                    }
                });
            });
        });

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };

        $http.get("/apio/user/getSessionComplete").then(function (r) {
            $scope.session = r.data;
        }, function (e) {
            console.log("Error while getting complete session: ", e)
        });

        $scope.modifyCustomer = function () {
            var copy = JSON.parse(JSON.stringify($scope.value));
            copy.data_nascita = reverseDate(copy.data_nascita);
            copy.inizio_abbonamento = reverseDate(copy.inizio_abbonamento);
            copy.scadenza_abbonamento = reverseDate(copy.scadenza_abbonamento);
            copy.inizio_assicurazione = reverseDate(copy.inizio_assicurazione);
            copy.scadenza_assicurazione = reverseDate(copy.scadenza_assicurazione);

            delete copy.data_nascitaDate;
            delete copy.inizio_abbonamentoDate;
            delete copy.scadenza_abbonamentoDate;
            delete copy.inizio_assicurazioneDate;
            delete copy.scadenza_assicurazioneDate;
            delete copy.recuperi;

            delete copy.$$hashKey;
            delete copy.idCorso;
            delete copy.nomeCorso;
            $http.put("/apio/service/gym/route/" + encodeURIComponent("/gym/utente/" + copy.id) + "/data/" + encodeURIComponent(JSON.stringify(copy))).then(function (response) {
                console.log("Utente con id " + copy.id + " modificato con successo");

                socket.emit("send_to_client", {
                    apioId: $scope.session.apioId,
                    data: copy,
                    message: "reload_tesserati"
                });
            }, function (error) {
                console.log("Error durante la modifica dell'utente con id " + copy.id + ": ", error);
            });

            if (idCorso !== idCorsoOld) {
                $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione/new") + "/data/" + encodeURIComponent(JSON.stringify({
                    idCorsoOld: idCorsoOld,
                    idCorso: idCorso,
                    idUtente: copy.id
                }))).then(function (response) {
                    console.log("Utente con id " + copy.id + " iscritto con successo al corso con id " + copy.idCorso + ", response: ", response);
                }, function (error) {
                    console.log("Error durante l'iscrizione dell'utente con id " + copy.id + "al corso con id " + copy.idCorso + ": ", error);
                });
            }

            $scope.hide();
            /*
                        socket.emit("send_to_client", {
                                apioId: $scope.session.apioId,
                                data: copy,
                                message: "reloadCalendar"
                            });
                         $scope.changeCalendarDateButtons('reload');
            */
//             socket.emit("send_to_client", {data: {}, message: "reloadCalendar"});
//             console.log("Socket inviata --reloadCalendar--");
        };

        $scope.register = function (event, corsiaIndex, weekDay, index) {
            if (!$scope.redBorder[corsiaIndex][weekDay][index]) {
                var x = $scope.mydata.time[weekDay][index];
                var p = $scope.prenotazioneAndPosti.reduce(function (a, x) {
                    return a.concat(x);
                }, []).find(function (t) {
                    return t.ora_inizio.substr(0, 5) === x.start && t.ora_fine.substr(0, 5) === x.end;
                });

                if (!$scope.checkBoxModel[corsiaIndex][weekDay][index]) { // --> TRUE
                    $http.post("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione") + "/data/" + encodeURIComponent(JSON.stringify({
                        idPrenotazione: p.id,
                        idUtente: value.id
                    }))).then(function (response) {
                        console.log("Utente con id " + value.id + " iscritto con successo alla prenotazione con id " + p.id + ", response: ", response);
                        socket.emit("send_to_client", {data: {}, message: "reloadCalendar"});
                    }, function (error) {
                        console.log("Error durante l'iscrizione dell'utente con id " + value.id + "alla prenotazione con id " + p.id + ": ", error);
                    });
                } else {
                    $http.delete("/apio/service/gym/route/" + encodeURIComponent("/gym/iscrizione") + "/data/" + encodeURIComponent(JSON.stringify({
                        idPrenotazione: p.id,
                        idUtente: value.id
                    }))).then(function (response) {
                        console.log("Utente con id " + value.id + " eliminato con successo alla prenotazione con id " + p.id + ", response: ", response);
                        socket.emit("send_to_client", {data: {}, message: "reloadCalendar"});
                    }, function (error) {
                        console.log("Error durante l'eliminazione dell'utente con id " + value.id + "alla prenotazione con id " + p.id + ": ", error);
                    });
                }
            } else {
                $scope.checkBoxModel[corsiaIndex][weekDay][index] = !$scope.checkBoxModel[corsiaIndex][weekDay][index];
                alert("Posti esauriti");
            }
        };

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione/utente/" + value.id)).then(function (response) {
            response.data = response.data.filter(function (x) {
                x.data = new Date(x.data);
                return x.idCorso === value.idCorso;
            });

            $scope.recupero = response.data.filter(function (x) {
                return x.presente === 0 && x.idRecupero === null;
            }).length;

            var today = new Date(), weekDates = [];
            for (var i = 1; i <= 7; i++) {
                weekDates.push(new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + i));
            }

            $scope.assenze_settimanali = response.data.filter(function (x) {
                return weekDates.findIndex(function (a) {
                    return a.getTime() === x.data.getTime();
                }) > -1 && x.presente === 0 && x.idRecupero === null;
            }).length;

            var firstDayDate = new Date(today.getFullYear(), today.getMonth(), 1), monthDate = [];
            while (firstDayDate.getMonth() === today.getMonth()) {
                monthDate.push(new Date(firstDayDate.getTime()));
                firstDayDate.setDate(firstDayDate.getDate() + 1);
            }

            $scope.assenze_mensili = response.data.filter(function (x) {
                return monthDate.findIndex(function (a) {
                    return a.getTime() === x.data.getTime();
                }) > -1 && x.presente === 0 && x.idRecupero === null;
            }).length;

            $scope.assenze_annuali = response.data.filter(function (x) {
                return today.getFullYear() === x.data.getFullYear() && x.idRecupero === null;
            }).length;
        });

        $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corsoscuolanuoto")).then(function (response) {
            $scope.CorsiScuolaNuoto = response.data;
            console.log("--------------------------------------------------");
            console.log("$scope.CorsiScuolaNuoto: ", $scope.CorsiScuolaNuoto);
            console.log("--------------------------------------------------");
        });

        $scope.$watch("value.idCorso", function (newValue, oldValue) {
            idCorso = newValue;
            idCorsoOld = oldValue;

            for (var k in $scope.Corsie) {
                for (var i in $scope.mydata.time) {
                    for (var j in $scope.mydata.time[i]) {
                        $scope.esistenzaSettimanale[k][i][j] = false;
                        $scope.redBorder[k][i][j] = false;
                        $scope.checkBoxModel[k][i][j] = false;
                    }
                }
            }

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/corso/get-prenotazione-and-posti/" + idCorso)).then(function (response) {
                $scope.prenotazioneAndPosti = response.data;
                $scope.prenotazioneAndPosti.forEach(function (e) {
                    e.forEach(function (t) {
                        var g = new Date(t.data).getDay();
                        var index = $scope.mydata.time[g].findIndex(function (x) {
                            return t.ora_inizio.substr(0, 5) === x.start && t.ora_fine.substr(0, 5) === x.end;
                        });

                        var indexCorsia = $scope.Corsie.findIndex(function (x) {
                            return x.id === t.idCorsia;
                        });

                        if (index > -1) {
                            $scope.esistenzaSettimanale[indexCorsia][g][index] = true;
                            $scope.redBorder[indexCorsia][g][index] = t.iscritti === t.posti;
                        }
                    });
                });
            });
        });
    }
}]);

setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication3357"), ["ApioApplication3357"]);
}, 10);
