var app = angular.module("ApioApplication_TMP_", ["apioProperty"]);
app.controller("defaultController", ["$scope", "currentObject", "objectService", function ($scope, currentObject, objectService) {

    $scope.object = currentObject.get();
    $scope.dt = new Date();
    $scope.Months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

    console.log("Sono il defaultController e l'oggetto è: ", $scope.object);
    $scope.flagProd = true;
    $scope.flagCons = true;
    $scope.flagPie = true;

    var interval2 = setInterval(function () {
        $scope.flagSlots = $scope.object.properties.eneSlots ? JSON.parse($scope.object.properties.eneSlots).length > 0 : false;
        if ($scope.flagSlots) {
            clearInterval(interval2);
            if ($scope.object.db.amount) {
                $scope.keys = Object.keys($scope.object.db.amount);
                console.log("keys: ", $scope.keys);
                $scope.keys.sort(function (a, b) {
                    var aComponents = a.split("-"), bComponents = b.split("-");
                    return Number(aComponents[0]) - Number(bComponents[0]) || Number(aComponents[1]) - Number(bComponents[1]);
                });
                $scope.label1 = $scope.keys.length == 1 ? "F0" : "F1";
                $scope.label2 = $scope.keys.length == 2 ? "F23" : "F2";
                $scope.label3 = $scope.keys.length > 2 ? "F3" : "";
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        }
    }, 2000);

    $scope.drawProd = function () {
        setTimeout(function () {
            console.log("flagProd");
            $scope.flagProd = !$scope.flagProd;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }, 10);
    };

    $scope.drawCons = function () {
        setTimeout(function () {
            console.log("flagCons", $scope.flagCons);
            $scope.flagCons = !$scope.flagCons;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }, 10);

    };
    $scope.drawPie = function () {
        setTimeout(function () {
            console.log("flagPie", $scope.flagPie);
            $scope.flagPie = !$scope.flagPie;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }, 10);

    };

    var interval = setInterval(function () {
        var elem = document.getElementById("registra_statoinput");
        if (elem) {
            elem.parentNode.removeChild(elem);
            clearInterval(interval);
        }
    }, 0);

    $scope.allObjects = {};

    objectService.list().then(function (data) {
        $scope.allObjects = data.data;
    });

    // Background-color function for production/consumptiopn Current Month & Autoconsumption
    var interval_currentMonth = setInterval(function () {
        if ($scope.object.db.type === "VAZ") {
            var eneProdNew = document.getElementById("eneProdNewvalue");
            var eneConsNew = document.getElementById("eneConsNewvalue");
            var eneAuto = document.getElementById("eneAutovalue");
            if (eneProdNew && eneProdNew && eneAuto) {
                clearInterval(interval_currentMonth);
                // Produced Energy
                // current month
                var eneProdNew_html = eneProdNew.innerHTML;
                var eneProdNew_number = Number(eneProdNew_html.replace(",", "."));
                // last month
                var eneProdOld = document.getElementById("eneProdOldvalue");
                var eneProdOld_html = eneProdOld.innerHTML;
                var eneProdOld_number = Number(eneProdOld_html.replace(",", "."));
                // subtraction
                var eneProdNewSubOld = eneProdNew_number - eneProdOld_number;
                if (eneProdNewSubOld > 0) {
                    $scope.bkColorProd = "1";
                } else if (eneProdNewSubOld < 0) {
                    $scope.bkColorProd = "-1";
                } else {
                    $scope.bkColorProd = "0";
                }
                // Consumed energy
                // current month
                var eneConsNew_html = eneConsNew.innerHTML;
                var eneConsNew_number = Number(eneConsNew_html.replace(",", "."));
                // last month
                var eneConsOld = document.getElementById("eneConsOldvalue");
                var eneConsOld_html = eneConsOld.innerHTML;
                var eneConsOld_number = Number(eneConsOld_html.replace(",", "."));
                // subtraction
                var eneConsNewSubOld = eneConsNew_number - eneConsOld_number;
                if (eneProdNewSubOld > 0) {
                    $scope.bkColorCons = "-1";
                } else if (eneProdNewSubOld < 0) {
                    $scope.bkColorCons = "1";
                } else {
                    $scope.bkColorCons = "0";
                }
                // Autoconsumed energy
                var eneAuto_html = eneAuto.innerHTML;
                var eneAuto_number = Number(eneAuto_html.replace(",", "."));
                // subtraction
                var eneAutoSubCons = eneAuto_number - eneConsNew_number;
                if (eneAutoSubCons > 0) {
                    $scope.bkColorAutocons = "0";
                } else if (eneAutoSubCons < 0) {
                    $scope.bkColorAutocons = "-1";
                } else {
                    $scope.bkColorAutocons = "1";
                }
            }
        } else if ($scope.object.db.type === "VEF") {
            var eneConsNew = document.getElementById("eneConsNewvalue");
            if (eneConsNew) {
                clearInterval(interval_currentMonth);
                // Consumed energy
                // current month
                var eneConsNew_html = eneConsNew.innerHTML;
                var eneConsNew_number = Number(eneConsNew_html.replace(",", "."));
                // last month
                var eneConsOld = document.getElementById("eneConsOldvalue");
                var eneConsOld_html = eneConsOld.innerHTML;
                var eneConsOld_number = Number(eneConsOld_html.replace(",", "."));
                // subtraction
                var eneConsNewSubOld = eneConsNew_number - eneConsOld_number;
                if (eneProdNewSubOld > 0) {
                    $scope.bkColorCons = "-1";
                } else if (eneProdNewSubOld < 0) {
                    $scope.bkColorCons = "1";
                } else {
                    $scope.bkColorCons = "0";
                }
            }
        } else {
            clearInterval(interval_currentMonth);
        }
    }, 0);
    // End
}]);


setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication_TMP_"), ["ApioApplication_TMP_"]);
}, 10);