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

angular.module("ApioApplication").controller("modalasset/Anti-intrusione/TVCC", ["$scope", "$http", "$mdDialog", "socket", function ($scope, $http, $mdDialog, socket) {
        var d = new Date();
    var n = d.toDateString();
    $scope.date = n;
    $scope.manutentore = "";
    $scope.personaSorveglianza = "";
    $scope.personaCompetente = "";
    $scope.installation_date = "";
    $scope.produttore = "";
    $scope.matricola = "";
    $scope.peso = ""
    $scope.step=1;
    $scope.type = ""
    
    socket.on("close_autoInstall_modal", function () {
        $mdDialog.hide();
    });

    $scope.cancel = function () {
        if($scope.step == 2){
    		$scope.step = 1
    	} else if($scope.step==1){
	    	$scope.step = 0;
    	} else if ($scope.step== 0){
	    	$http.get("/apio/user/getSessionComplete").success(function (session) {
	            socket.emit("close_autoInstall_modal", session.apioId);
	            $mdDialog.hide();
	        });	
    	} 
    };

    $scope.confirm = function () {
    	if($scope.step==0){
	    	$scope.step=1;
    	}else if($scope.step==1){
    		$scope.step=2;
    	} else if($scope.step==2){
    		console.log("QUIIIIII")
	    	$http.get("/apio/user/getSessionComplete").success(function (session) {
	            $scope.modalData.apioId = session.apioId;
	            var today = new Date();
	            var month = today.getMonth() + 1;
	            var day = today.getDate();
	            day = today.getDate() + "/" + month + "/" + today.getFullYear();
	            $scope.responsabile = $scope.personaCompetente;
	            $scope.modalData.extraData = {
	        		manutentore: $scope.manutentore,
	                manutenzione: [{
	                    date: day,
	                    manutentore: $scope.manutentore
	
	                }],
	                installation_date: $scope.installation_date,
	                type: $scope.type,
	                responsabile: $scope.responsabile,
	                produttore: $scope.produttore,
	                matricola: $scope.matricola,
	                peso: $scope.peso,
	                category: "Anti-intrusione",
	                objectType: "TVCC"
		            
	            }
	            $scope.modalData.address = 	"";
	            console.log("MODAL DATA: ", $scope.modalData)
	            socket.emit("close_autoInstall_modal", session.apioId);
	            socket.emit("send_to_service", {
	                service: "autoInstall",
	                message: "apio_install_new_object_final",
	                data: $scope.modalData
	            });
                $mdDialog.hide();
            });
	    	
    	}
    };
}]);