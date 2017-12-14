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

    $scope.mydata = $scope.object.db.week;

    // $scope.Corsie = [
    //     {name: "Corsia 1"},
    //     {name: "Corsia 2"},
    //     {name: "Corsia 3"},
    //     {name: "Corsia 4"},
    //     {name: "Vasca Piccola 1"},
    //     {name: "Vasca Piccola 2"}
    // ];
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
    $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/prenotazione")).then(function (response) {
        $scope.orari = [];

        response.data.forEach(function (x) {
            var search_end = x.ora_fine.substr(0, 5);
            var search_start = x.ora_inizio.substr(0, 5);

            var index = $scope.orari.findIndex(function (e) {
                return e.start === search_start && e.end === search_end;
            });

            $http.get("/apio/service/gym/route/" + encodeURIComponent("/gym/utente/prenotazione/" + x.id)).then(function (response2) {
                if (index > -1) {
                    $scope.orari[index].corsi[x.idCorsia] = {name: x.nomeCorso, istruttore: x.nomeIstruttore + " " + x.cognomeIstruttore, posti: response2.data.length + "/" + x.posti};
                } else {
                    var j = {
                        start: search_start,
                        end: search_end,
                        corsi: []
                    };

                    j.corsi[x.idCorsia] = {name: x.nomeCorso, istruttore: x.nomeIstruttore + " " + x.cognomeIstruttore, posti: response2.data.length + "/" + x.posti};

                    $scope.orari.push(j);
                }
            });
        });

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
    });

    // watch the width of the viewport used to lock the sidenav
    //$scope.windowWidth = window.innerWidth;
    //$scope.$watch("windowWidth", function (newValue) {
    //    $scope.leftSidenavLocked = newValue >= 960;
    //    console.log("$scope.windowWidth = ", newValue);
    //    console.log("$scope.leftSidenavLocked = ", $scope.leftSidenavLocked);
    //});

    // Sidenav function and variables -----------------------------------
    //$scope.toggleLeftSidenavWithLock = function () {
    //    if ($scope.windowWidth > 960) {
    //        $scope.leftSidenavLocked = !$scope.leftSidenavLocked;
    //    } else {
    //        $scope.toggleLeft();
    //    }
    //};
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

    $scope.close = function () {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav("left").close()
            .then(function () {
                console.log("Left sidenav closed");
            });
    };

    // Function that change the App section
    $scope.changeMenuSection = function (sectionName) {
        console.log("sectionName = ", sectionName);
    };


    // Class Calendar variables & functions ---------------------------
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

    $scope.dateForCalendar = new Date(todayObj.getTime());
    console.log("$scope.dateForCalendar", $scope.dateForCalendar);

    $scope.changeClassCalendarDate = function (action) {
        console.log("action = ", action);
    };

    $scope.deleteParticipant = function () {
        console.log("dentro  $scope.deleteParticipant");
    };

    $scope.showEvent = function () {
        $mdDialog.show({
            //locals: {
            //    value: value
            //},
            templateUrl: "applications/" + $scope.object.objectId + "/modal/event_detail.html",
            controller: ShowEventController,
            clickOutsideToClose: true,
            bindToController: true,
            scope: $scope,
            preserveScope: true,
            //parent: angular.element(document.getElementById("targetBody")),
            fullscreen: true
        }).then(function () {
            console.log("dentro al THEN della modal dell'evento");
        }, function () {
            console.log("dentro al FUNCTION della modal dell'evento");
        });
    };

    function ShowEventController($scope, $mdDialog) {
        //$scope.value = value;

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
}]);

setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication3357"), ["ApioApplication3357"]);
}, 10);
