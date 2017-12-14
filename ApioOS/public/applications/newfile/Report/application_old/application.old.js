var app = angular.module("ApioApplication_TMP_", ["apioProperty"]);
app.controller("defaultController", ["$scope", "currentObject", "objectService", function ($scope, currentObject, objectService) {
    $scope.object = currentObject.get();
    console.log("Sono il defaultController e l'oggetto è: ", $scope.object);
    $scope.flagProd = false;
    $scope.flagCons = false;
    $scope.drawProd = function () {
        setTimeout(function () {
            console.log("flagProd");
            $scope.flagProd = !$scope.flagProd;
        }, 10);
    };

    $scope.drawCons = function () {
        setTimeout(function () {
            console.log("flagCons", $scope.flagCons);
            $scope.flagCons = !$scope.flagCons;
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
}]);

setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication_TMP_"), ["ApioApplication_TMP_"]);
}, 10);