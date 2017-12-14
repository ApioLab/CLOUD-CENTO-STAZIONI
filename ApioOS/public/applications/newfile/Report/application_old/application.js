var app = angular.module("ApioApplication_TMP_", ["apioProperty"]);
app.controller("defaultController", ["$scope", "currentObject", "objectService", function ($scope, currentObject, objectService) {
     $scope.object = currentObject.get();
	$scope.dt= new Date();
	$scope.Months=['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
	
    console.log("Sono il defaultController e l'oggetto è: ", $scope.object);
    $scope.flagProd = false;
    $scope.flagCons = false;
    $scope.flagPie= false;
    $scope.flagSlots= $scope.object.properties.eneSlots ? JSON.parse($scope.object.properties.eneSlots).length > 1 : false;
	if ($scope.object.db.amount) {
		var keys = Object.keys($scope.object.db.amount);
		console.log("keys: ",keys);
		keys.sort(function (a, b) {
			var aComponents = a.split("-"), bComponents = b.split("-");
			return Number(aComponents[0]) - Number(bComponents[0]) || Number(aComponents[1]) - Number(bComponents[1]);
		});
		$scope.label1 = keys.length > 0 ? keys[0] : "F1";
		$scope.label2 = keys.length > 1 ? keys[1] : "F2";
		$scope.label3 = keys.length > 2 ? keys[2] : "F3";
	}
	
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
}]);


setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication_TMP_"), ["ApioApplication_TMP_"]);
}, 10);