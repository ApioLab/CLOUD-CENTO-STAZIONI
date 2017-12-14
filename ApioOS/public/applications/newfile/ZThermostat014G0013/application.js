var app = angular.module("ApioApplication_TMP_", ["apioProperty"]);
app.controller("defaultController", ["$scope", "currentObject", function ($scope, currentObject) {
    $scope.object = currentObject.get();
    console.log("Sono il defaultController e l'oggetto è: ", $scope.object);
    setInterval(function () {
        currentObject.update("getBattery", "1", true, true);
    }, 60000)

}]);

setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication_TMP_"), ["ApioApplication_TMP_"]);
}, 10);