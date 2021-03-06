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

var apioProperty = angular.module("apioProperty");
apioProperty.directive("threebutton", ["currentObject", "socket", "$http", function (currentObject, socket, $http) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            //model: "=propertyname"
        },
        templateUrl: "apioProperties/ThreeButton/threebutton.html",
        link: function (scope, elem, attrs) {
            scope.object = currentObject.get();

            //Inizializzo la proprietà con i dati memorizzati nel DB
            scope.propertyname = attrs.propertyname;
            scope.buttonsCurrentState = scope.object.properties[scope.propertyname];
            console.log("buttonsCurrentState", scope.buttonsCurrentState);
            scope.innertext = attrs["innertext"];
            scope.labelleft = attrs["labelleft"];
            scope.labelright = attrs["labelright"];
            scope.labelcenter = attrs["labelcenter"];
            scope.label = attrs["label"];
            //
            $http.get('/apio/getPlatform').success(function (data) {
                //console.log(data);
                //alert(data.apioId);
                //alert(data.apioId);


                if (data.type == "gateway") {
                    scope.object.apioId = data.apioId;
                    //return obj;

                    //scope.continueToCloud = true;
                    //$scope.currentUserEmail();
                }
                if (data.type == "cloud") {
                    //$scope.cloudShowBoard = true;
                    //$scope.currentUserEmail();
                }

            });
            scope.currentObject = currentObject;
            scope.model = attrs["value"] ? attrs["value"] : 1;
            scope.isRecorded = function () {
                return scope.currentObject.record(scope.propertyname);
            }
            scope.addPropertyToRecording = function () {
                scope.currentObject.record(scope.propertyname, scope.model);
            }
            scope.removePropertyFromRecording = function () {
                scope.currentObject.removeFromRecord(scope.propertyname);
            }

            scope.click = function (el) {
                console.log("el", el)
                //document.getElementById(el).classList.add("clicked")
                var writeToSerial = false;
                if (attrs.writetoserial === "true") {
                    writeToSerial = true;
                }
                currentObject.update(scope.propertyname, String(el), true, writeToSerial);
                scope.buttonsCurrentState = scope.object.properties[scope.propertyname];
            }
            //Serve per il cloud: aggiorna in tempo reale il valore di una proprietà che è stata modificata da un"altro utente
            socket.on("apio_server_update", function (data) {
                if (data.apioId === scope.object.apioId && data.objectId === scope.object.objectId && !currentObject.isRecording()) {
                    if (data.properties.hasOwnProperty(scope.propertyname)) {
                        scope.$parent.object.properties[scope.propertyname] = data.properties[scope.propertyname];
                        scope.model = data.properties[scope.propertyname];
                        //In particolare questa parte aggiorna il cloud nel caso siano state definite delle correlazioni
                        /*if(attrs["correlation"]){
                         scope.$parent.$eval(attrs["correlation"]);
                         }*/
                        //
                    }
                }
            });
            //
            socket.on("apio_server_update_", function (data) {
                if (data.objectId === scope.object.objectId && !scope.currentObject.isRecording()) {
                    scope.model = data.properties[scope.propertyname];
                }
            });

            scope.$on('propertyUpdate', function () {
                scope.object = currentObject.get();
            });

            // var event = attrs["event"] ? attrs["event"] : "mouseup touchend";
            // elem.on(event, function () {
            //     if (!currentObject.isRecording()) {
            //         //Aggiorna lo scope globale con il valore che è stato modificato nel template
            //         scope.object.properties[scope.propertyname] = scope.model;
            //         //
            //
            //         //Se è stato definito un listener da parte dell'utente lo eseguo altrimenti richiamo currentObject.update che invia i dati al DB e alla seriale
            //         if (attrs["listener"]) {
            //             scope.$parent.$eval(attrs["listener"]);
            //         } else {
            //             var writeToSerial = true;
            //             if (attrs.writetoserial === "false") {
            //                 writeToSerial = false;
            //             }
            //             currentObject.update(scope.propertyname, scope.model, true, writeToSerial);
            //         }
            //         //
            //
            //         //Se è stata definita una correlazione da parte dell'utente la eseguo
            //         if (attrs["correlation"]) {
            //             scope.$parent.$eval(attrs["correlation"]);
            //         }
            //         //
            //
            //         //Esegue codice javascript contenuto nei tag angular
            //         scope.$apply();
            //         //
            //     }
            // });


            //
        }
    };
}]);
