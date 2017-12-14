var app = angular.module("ApioApplication_TMP_", ["apioProperty"]);
app.controller("defaultController", ["$scope", "currentObject", function ($scope, currentObject) {
    $scope.object = currentObject.get();
    console.log("Sono il defaultController e l'oggetto è: ", $scope.object);
    $scope.selectedValue =""
    $scope.viewConfirmList = false;
    $scope.sensorType = "";
    $scope.selectSensorTypes = function(){
     	 if ($scope.object.properties.sensorTypes !== "1") {
            $scope.selectedValue = $scope.object.db.sensorTypes[$scope.object.properties.sensorTypes];
            $scope.viewConfirmList = true;
        } else {
            $scope.viewConfirmList = false;
        }
    }
    
    $scope.discard = function(){
	    $scope.object.properties.sensorTypes == "1"
	    $scope.viewConfirmList = false;
    }
    
    $scope.save = function(){
	    
		currentObject.update("sensorType", $scope.selectedValue, true, true);
    }
}]);

setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication_TMP_"), ["ApioApplication_TMP_"]);
}, 10);