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
apioProperty.directive("simplegraph", ["currentObject", "socket", "$http","$timeout","$q", function (currentObject, socket, $http,$timeout,$q) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            //model: "=propertyname"
        },
        templateUrl: "apioProperties/simpleGraph/simplegraph.html",
        link: function (scope, elem, attrs) {
	        
	        
	        
	        var deferredAbort = $q.defer();
            scope.object = currentObject.get();
            //Inizializzo la proprietà con i dati memorizzati nel DB
            scope.plot = attrs["plot"];
            scope.label = attrs["label"];
            if(attrs["middle"]){
	            scope.middle = attrs["middle"];
            } else {
	            scope.middle = "60";
            }
            scope.backGroundBlur = attrs["backGroundBlur"];
            console.log("attrs: ", attrs);
            console.log("scope.backGroundBlur: ", scope.backGroundBlur);
            scope.propertyname = attrs.propertyname;
            scope.model = scope.object.properties[scope.propertyname];
            scope.show_sensor = false;
            //
            
            
            /*var data = 
            {
			    labels: ["00.00", "01.00", "02.00", "03.00", "04.00", "05.00", "06.00","07.00","08.00","09.00","10.00","11.00","12.00","13.00","14.00","15.00","16.00","17.00","18.00","19.00","20.00","21.00","22.00","23.00"],
			    datasets: [
			        {
			            label: "Import",
			            backgroundColor: [
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
			                'rgba(255, 99, 132, 0.2)'
			                
			            ],
			            borderColor: [
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                'rgba(255,99,132,1)',
			                
			            ],
			            borderWidth: 1,
			            data: [65, 59, 80, 81, 56, 55, 40,65, 59, 80, 81, 56, 55, 40,65, 59, 80, 81, 56, 55, 40,65, 59,80],
			        },
			        {
			            label: "Export",
			            backgroundColor: [
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)',
			                'rgba(54, 162, 235, 0.2)'
			            ],
			            borderColor: [
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)'
			            ],
			            borderWidth: 1,
			            data: [60, 50, 70, 71, 50, 45, 30,60, 50, 70, 71, 50, 45, 30,60, 50, 70, 71, 50, 45, 30,60, 50, 70],
			        }

			    ]
			};*/
            
            var data = 
            {
			    labels: [],
			    datasets: []
			};
			
			function getRandomColor() {
			    var letters = '0123456789ABCDEF';
			    var color = '#';
			    for (var i = 0; i < 6; i++ ) {
			        color += letters[Math.floor(Math.random() * 16)];
			    }
			    return color;
			}
            var colorArray = ["#F44336","#9C27B0","#3F51B5" ,"#E91E63","#673AB7","#2196F3", "#03A9F4","#00BCD4","#009688", "#4CAF50","#8BC34A" ,"#CDDC39","#FF9800"]
            console.log("attrs.propertyname;", attrs.propertyname+"simpleGraph")
            $timeout(function(){
	            
	            document.getElementById(scope.propertyname).style.opacity = 1;
           
            
	            
	            var plotArray = scope.plot.split(",");
	            var newDataset = [];
	            var propertyDate = {};
	            for(var l in plotArray){
		            var randomColor;
		            
		            if(l>13){
			            randomColor = getRandomColor();
		            } else {
			            randomColor = colorArray[l];
		            }
		            
		            newDataset.push(
		            	{
			            label: plotArray[l] ,
			            backgroundColor: [randomColor], 
			            borderColor : [randomColor] ,
			            data : []
			            })
					}
					
					
	             $http.get("/apio/user/getSession", {timeout: deferredAbort.promise}).success(function (session) {
		            scope.loggedUser = session;
		            var dt = new Date();
		            var query;
		            var arrayDate = [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()];
		            
		            query = "/apio/service/log/route/" + encodeURIComponent("/apio/log/getSumFileByRange/objectId/" + scope.object.objectId + "/from/" + arrayDate[0] + "-" + arrayDate[1] + "-" + arrayDate[2] + "/daysNumber/" + 0 + "/properties/" + JSON.stringify(plotArray) + "/type/" + "avg" + "/timing/" + scope.middle);
		            
		            console.log("query",query);
		            console.log("arrayDate",arrayDate);
		            console.log("plotArray",plotArray);
		            
		            $http.get(query, {timeout: deferredAbort.promise}).success(function (file) {
			            console.log("FILE",file);
			            
			            var n = 0;
			            for(var s in file){
				            n=1;
				            console.log("file[s]",file[s]);
				            data.labels.push(file[s].date);
				            for(var x in newDataset){
					            newDataset[x].data.push(file[s][newDataset[x].label].toFixed(2))
					            if(n!=0){
						            
						            newDataset[x].backgroundColor.push(newDataset[x].backgroundColor[0])
				            		newDataset[x].borderColor.push(newDataset[x].borderColor[0])
				            	}
							}
			            }
			            
			            
			            data.datasets = newDataset;
					    console.log("newDataset",newDataset);    
				       
			            
			            var ctx = document.getElementById(scope.propertyname+"simpleGraph");
						var myChart = new Chart(ctx, {
						    type: 'bar',
						    data: data ,
						    options: {
						        legend: {
						            display: true,
						            position : 'bottom',
						            labels: {
						                fontSize: 16,
						                padding : 20,
						                fontColor: '#000',
						                borderWidth: 10
						            }
						        },
						    scales:{
							    yAxes:[{
								    display:true,
								    ticks: {
						                   fontColor: "#000"
						                }
							        }],
								xAxes:[{
								    display:false
							        }]
								}    
						    }
						});
					});
				});
            });
            
            $http.get("/apio/getPlatform").success(function (data) {
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

            
            scope.isRecorded = function () {
                return scope.currentObject.record(scope.propertyname);
            };
            scope.addPropertyToRecording = function () {
                scope.currentObject.record(scope.propertyname, scope.model);
            };
            scope.removePropertyFromRecording = function () {
                scope.currentObject.removeFromRecord(scope.propertyname);
            };
            //Serve per il cloud: aggiorna in tempo reale il valore di una proprietà che è stata modificata da un"altro utente
            socket.on("apio_server_update", function (data) {});
            //
            socket.on("apio_server_update_", function (data) {
                if (data.objectId === scope.object.objectId && !scope.currentObject.isRecording()) {
                    scope.model = data.properties[scope.propertyname];
                }
            });

            //Se il controller modifica l'oggetto allora modifico il model;
            scope.$watch("object.properties." + scope.propertyname, function (newValue, oldValue) {
                scope.model = newValue;
            });
            //

            scope.$on("propertyUpdate", function () {
                scope.object = currentObject.get();
            });
            //
        }
    };
}]);
