var app = angular.module("ApioApplication3357", ["apioProperty"]);
app.controller("defaultController", ["$scope", "$http", "$mdDialog", "currentObject", "socket", function ($scope, $http, $mdDialog, currentObject, socket) {

    /* set the App into fullscreen mode */
    document.getElementById("ApioApplicationContainer").classList.add("fullscreen");

    /* get App info */
    $scope.object = currentObject.get();
    console.log("Sono il defaultController e l'oggetto è: ", $scope.object);

    /* get the session (e-mail, cookie and so on) */
    $http.get("/apio/user/getSessionComplete").then(function (r) {
        $scope.session = r.data;
    }, function (e) {
        console.log("Error while getting complete session: ", e)
    });


    /*$scope.onFocus = function () {
        document.querySelector(".md-datepicker-calendar-pane").style.zIndex = "2000";
    };*/




}]);

setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication3357"), ["ApioApplication3357"]);
}, 10);
