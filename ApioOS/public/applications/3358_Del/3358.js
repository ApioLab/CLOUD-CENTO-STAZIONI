var app = angular.module("ApioApplication3358", ["apioProperty"]);

app.controller("defaultController", ["$scope", "$http", "$mdDialog", "currentObject", "socket", "$mdSidenav", "$location", function ($scope, $http, $mdDialog, currentObject, socket, $mdSidenav, $location) {
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

    // watch the width of the viewport used to lock the sidenav
    //$scope.windowWidth = window.innerWidth;
    //$scope.$watch("windowWidth", function (newValue) {
    //    $scope.leftSidenavLocked = newValue >= 960;
    //    console.log("$scope.windowWidth = ", newValue);
    //    console.log("$scope.leftSidenavLocked = ", $scope.leftSidenavLocked);
    //});

    // Sidenav function and variables -----------------------------------
    //if ($scope.windowWidth > 960) {
    //    $scope.leftSidenavLocked = true;
    //}
    //$scope.toggleLeftSidenavWithLock = function () {
    //    if ($scope.windowWidth > 960) {
    //        $scope.leftSidenavLocked = !$scope.leftSidenavLocked;
    //    } else {
    //        $scope.toggleLeft();
    //    }
    //};
    $scope.toggleLeft = buildToggler('left');
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
        $mdSidenav('left').close()
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


}]);

setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication3358"), ["ApioApplication3358"]);
}, 10);
