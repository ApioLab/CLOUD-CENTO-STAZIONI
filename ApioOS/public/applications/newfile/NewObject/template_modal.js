//Copyright 2014-2015 Alex Benfaremo, Alessandro Chelli, Lorenzo Di Berardino, Matteo Di Sabatino

/********************************** LICENSE *********************************
 *                                                                          *
 * This file is part of ApioOS.                                             *
 *                                                                          *
 * ApioOS is free software released under the GPLv2 license: you can        *
 * redistribute it and/or modify it under the terms of the GNU General      *
 * Public License version 2 as published by the Free Software Foundation.   *
 *                                                                          *
 * ApioOS is distributed in the hope that it will be useful, but            *
 * WITHOUT ANY WARRANTY; without even the implied warranty of               *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the             *
 * GNU General Public License version 2 for more details.                   *
 *                                                                          *
 * To read the license either open the file COPYING.txt or                  *
 * visit <http://www.gnu.org/licenses/gpl2.txt>                             *
 *                                                                          *
 ****************************************************************************/

angular.module("ApioApplication").controller("modalNewObject", ["$scope", "$http", "$mdDialog", "socket", function ($scope, $http, $mdDialog, socket) {
	$scope.categoria = "";
	$scope.objects = [];
	$scope.asset = "";
	/*$scope.allObjects = {
		"Anti-incendio" : ["Estintori", "Idranti", "Naspi", "Rivelatori Fumi", "Sprinkler"],
		"Anti-intrusione": ["Barriera IR", "Centralina", "PIR", "Sirene", "TVCC"],
		"Elettrico": ["Contattori", "Differenziali", "Interruttori", "Luci", "Magnetotermici", "Quadri" , "Sezionatori"],
		"Idrico-Sanitario": ["Condotte", "Docce", "Filtri", "Sanitari"],
		"Termico": ["Gruppi Termici", "Radiatore", "Termoconvettore"]
	}*/
	$scope.allObjects = {
		"Anti-incendio" : ["Estintori", "Idranti", "Naspi", "Rivelatori Fumi", "Sprinkler"],
		"Anti-intrusione": ["Centralina", "PIR", "Sirene", "TVCC"],
		"Elettrico": ["Luci", "Quadri"],
		"Termico": ["Gruppi Termici", "Radiatore", "Termoconvettore"]
	}
	$scope.$watch("categoria", function (newValue) {
		//alert($scope.categoria)
		$scope.objects = $scope.allObjects[newValue]
		console.log($scope.objects)
		
    });
    
    $scope.$watch("asset", function (newValue) {
		//alert($scope.categoria)
		//$scope.objects = $scope.allObjects[newValue]
		console.log($scope.asset)
		
    });

    socket.on("close_autoInstall_modal", function () {
        $mdDialog.hide();
    });

    $scope.cancel = function () {
        $http.get("/apio/user/getSessionComplete").success(function (session) {
            socket.emit("close_autoInstall_modal", session.apioId);
            $mdDialog.hide();
        });
    };

    $scope.confirm = function () {
    	$mdDialog.hide();
    	/*var s = $scope.$new();
        $mdDialog.show({
            templateUrl: "/applications/newfile/asset/"+$scope.categoria+"/"+$scope.asset+"/template_modal.html",
            controller: "modala5-07-01",
            clickOutsideToClose: false,
            bindToController: true,
            scope: s
        });*/
       
        socket.emit("send_to_service", {
            service: "autoInstall",
            message: "apio_install_new_object",
            data: {
	            protocol: 'apio',
                eep: ("asset/"+$scope.categoria+"/"+$scope.asset).replace(/ /g, "_")
            }
        });
        /*$http.get("/apio/user/getSessionComplete").success(function (session) {
            $scope.modalData.apioId = session.apioId;
            socket.emit("close_autoInstall_modal", session.apioId);
            socket.emit("send_to_service", {
                service: "autoInstall",
                message: "apio_install_new_object_final",
                data: $scope.modalData
            });
            
        });*/
    };
}]);