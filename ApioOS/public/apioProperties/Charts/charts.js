//Copyright 2014-2015 Alex Benfaremo, Alessandro Chelli, Lorenzo Di Berardino, Matteo Di Sabatino

/********************************** LICENSE **********************************
 *                                                                           *
 * This file is part of ApioOS.                                              *
 *                                                                           *
 * ApioOS is free software released under the GPLv2 license: you can         *
 * redistribute it and/or modify it under the terms of the GNU General       *
 * Public License version 2 as published by the Free Software Foundation.    *
 *                                                                           *
 * ApioOS is distributed in the hope that it will be useful, but             *
 * WITHOUT ANY WARRANTY; without even the implied warranty of                *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the              *
 * GNU General Public License version 2 for more details.                    *
 *                                                                           *
 * To read the license either open the file COPYING.txt or                   *
 * visit <http://www.gnu.org/licenses/gpl2.txt>                              *
 *                                                                           *
 *****************************************************************************/

angular.module("apioProperty").directive("charts", ["currentObject", "$http", "socket", "$q", function (currentObject, $http, socket, $q) {
    return {
        restrict: "E",
        replace: true,
        scope: {},
        templateUrl: "apioProperties/Charts/charts.html",
        link: function (scope, elem, attrs) {
            var deferredAbort = $q.defer();
            scope.$on("$destroy", function () {
                deferredAbort.resolve();
                socket.off("apio_server_update");
            });

            scope.currentObject = currentObject;
            scope.object = currentObject.get();
            scope.propertyname = attrs.propertyname;
            var dt = new Date();
            scope.ready = false;
            scope.notReady = true;
            var Months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
            //var data_chart;
            var arrayValues;
            var labels;
            var chart;
            scope.flag0 = true;
            scope.flagNeg = true;
            if (typeof attrs.title != 'undefined' && attrs.title != "") {
                scope.title = attrs.title;
            }
            var redraw_first = false;
            google.charts.load('current', {packages: ['corechart', 'bar']});
            if (attrs.type == "bar") {
                function drawChart() {
                    // console.log("valore del chart", scope.object.properties[attrs.propertyname]);
                    // console.log(Months[dt.getMonth() - 1]);
                    // console.log("arrayValues: ", arrayValues);
                    //attrs.labels=[['Mese', 'Energia Attesa[kWh]', 'Energia Reale[kWh]'],[label1,label2,label3...]]
                    if (typeof labels == "undefined" || labels == "") {
                        var table = [
                            ['Mese', 'Energia Prima Intervento[kWh]', 'Energia Attesa[kWh]', 'Energia Reale[kWh]'],
                            [String(Months[dt.getMonth() - 1]), arrayValues[0][0], arrayValues[0][1]],
                            [String(Months[dt.getMonth()]), arrayValues[1][0], arrayValues[1][1]]
                        ];
                    } else {
                        var table = [[]];
                        table[0] = labels[0];
                        for (var j in arrayValues) {
                            if (arrayValues[j] instanceof Array) {
                                var aux = [];
                                // console.log(labels[1][j]);
                                aux[0] = labels[1][j];
                                for (var k in arrayValues[j]) {
                                    aux[Number(k) + 1] = arrayValues[j][k];
                                    if (k == arrayValues[j].length - 1) {
                                        table[Number(j) + 1] = aux;
                                    }
                                }
                            } else {
                                table[Number(j) + 1] = [labels[1][j], arrayValues[j]];
                            }
                        }
                    }
                    // console.log("table: ", table)
                    var data_chart = new google.visualization.arrayToDataTable(table);
                    // console.log("table: ", table);
                    var options = {
                        //title: "Default Title, change it using the 'title' attribute",
                        legend: {position: 'none'},
                        bar: {groupWidth: '95%'}
                    };
                    /*if (typeof attrs.title != 'undefined' && attrs.title!="") {
                     options.title=attrs.title;
                     }
                     if (typeof attrs.legend != 'undefined' && attrs.legend!="") {
                     options.legend={position: attrs.legend};
                     }*/


                    var chart = new google.charts.Bar(document.getElementById(scope.propertyname));

                    google.visualization.events.addListener(chart, "ready", function () {
                        console.log("redraw_first: ", redraw_first, " attrs.draw: ", attrs.draw);
                        if (redraw_first == true && attrs.draw == "true") {
                            // setTimeout(function () {
                            scope.ready = true;
                            scope.notReady = false;
                            document.getElementById("loader" + scope.propertyname).style.display = "none";
                            if (!scope.$$phase) {
                                scope.$apply();
                                // console.log("1: ready = ", scope.ready);
                            }
                            // }, 50);
                        }
                        if (redraw_first == false && attrs.draw === undefined) {
                            // setTimeout(function () {
                            scope.ready = true;
                            scope.notReady = false;
                            document.getElementById("loader" + scope.propertyname).style.display = "none";
                            attrs.$set('draw', "true");
                            if (!scope.$$phase) {
                                scope.$apply();
                                // console.log("1: ready = ", scope.ready);
                            }
                            // }, 50);
                        }
                    });

                    chart.draw(data_chart, google.charts.Bar.convertOptions(options));
                }
            } else if (attrs.type == "pie") {
                function drawChart() {
                    //attrs.labels="[['Task', 'Hours per Day'],[label1,label2,label3...]]"
                    var table = [];
                    table[0] = labels[0];
                    for (var j in arrayValues) {
                        //da togliere il valore assoluto!!!
                        table[Number(j) + 1] = [labels[1][j], Math.abs(Number(arrayValues[j]))];

                    }
                    // console.log("table: ", table);
                    var data_chart = new google.visualization.arrayToDataTable(table);
                    var options = {
                        legend: {position: 'none'},
                        chartArea: {width: '100%', height: '100%'},
                        pieHole: 0.5
                    };

                    var chart = new google.visualization.PieChart(document.getElementById(scope.propertyname));

                    google.visualization.events.addListener(chart, "ready", function () {
                        console.log("redraw_first: ", redraw_first, " attrs.draw: ", attrs.draw);
                        if (redraw_first == false && attrs.draw == "true") {
                            scope.ready = true;
                            if (!scope.$$phase) {
                                scope.$apply();
                                // console.log("1: ready = ", scope.ready);
                            }
                            document.getElementById("loader" + scope.propertyname).style.display = "none";
                            scope.notReady = false;

                        }
                        if (redraw_first == false && attrs.draw === undefined) {
                            // setTimeout(function () {
                            scope.ready = true;
                            if (!scope.$$phase) {
                                scope.$apply();
                                // console.log("1: ready = ", scope.ready);
                            }
                            scope.notReady = false;
                            attrs.$set('draw', "true");
                            document.getElementById("loader" + scope.propertyname).style.display = "none";
                            // }, 50);
                        }
                        if (!scope.$$phase) {
                            scope.$apply();
                            // console.log("1: ready = ", scope.ready);
                        }


                    });
                    chart.draw(data_chart, options);
                }
            }
            setTimeout(function () {

                if (scope.object.properties.hasOwnProperty(attrs.propertyname) && scope.object.properties[attrs.propertyname] != "") {
                    //checks values
                    try {
                        arrayValues = JSON.parse(scope.object.properties[attrs.propertyname].replace(/'/g, "\""));
                        // console.log("arrayValues (1): ", arrayValues);
                        // console.log("attrs.labels: ", attrs.labels);
                        if (typeof attrs.labels != 'undefined' && attrs.labels != "") {
                            labels = JSON.parse(attrs.labels.replace(/'/g, "\""));
                        }
                        var recursive = function (array, fun, flag) {
                            if (array instanceof Array) {
                                for (var i = 0; i < array.length; i++) {
                                    flag = flag && recursive(array[i], fun, flag);
                                }
                                return flag;
                            } else {
                                return fun(array);
                            }
                        };
                        // console.log("labels (1): ", labels);
                        scope.flagNeg = recursive(arrayValues, function (i) {
                            return i >= 0
                        }, true);
                        // console.log("flag-1: ", scope.flagNeg);
                        scope.flag0 = !recursive(arrayValues, function (i) {
                            return i <= 0
                        }, true);
                        // console.log("flag0: ", scope.flag0);
                        if (scope.flag0 === false || scope.flagNeg === false) {
                            throw er = "valori negativi e/o tutti nulli";
                        }
                    } catch (er) {
                        // console.log("-----------");
                        // console.log("er: ", er);
                        var error = "tipo di dato sbagliato per i valori"
                    }

                    if (typeof error == 'undefined') {
                        //redraw_first = true;
                        google.charts.setOnLoadCallback(drawChart);
                    }
                }
            }, 10);
            /*scope.$watch("object.properties." + scope.propertyname, function (newValue, oldValue) {
             scope.object.properties[attrs.propertyname] = newValue;
             if(!scope.$$phase) {
             scope.$apply();
             }

             });*/
            socket.on("apio_server_update", function (data) {
                if (data.apioId === scope.object.apioId && data.objectId === scope.object.objectId) {
                    if (data.properties.hasOwnProperty(scope.propertyname)) {
                        scope.$parent.object.properties[scope.propertyname] = data.properties[scope.propertyname];
                        //scope.ready = false;
                        setTimeout(function () {
                            if (scope.object.properties.hasOwnProperty(attrs.propertyname) && scope.object.properties[attrs.propertyname] != "") {
                                //checks values
                                try {
                                    arrayValues = JSON.parse(scope.object.properties[attrs.propertyname].replace(/'/g, "\""));
                                    // console.log("arrayValues (1): ", arrayValues);
                                    // console.log("attrs.labels: ", attrs.labels);
                                    if (typeof attrs.labels != 'undefined' && attrs.labels != "") {
                                        labels = JSON.parse(attrs.labels.replace(/'/g, "\""));
                                    }
                                    var recursive = function (array, fun, flag) {
                                        if (array instanceof Array) {
                                            for (var i = 0; i < array.length; i++) {
                                                flag = flag && recursive(array[i], fun, flag);
                                            }
                                            return flag;
                                        } else {
                                            return fun(array);
                                        }
                                    };
                                    // console.log("labels (1): ", labels);
                                    scope.flagNeg = recursive(arrayValues, function (i) {
                                        return i >= 0
                                    }, true);
                                    // console.log("flag-1: ", scope.flagNeg);
                                    scope.flag0 = !recursive(arrayValues, function (i) {
                                        return i <= 0
                                    }, true);
                                    // console.log("flag0: ", scope.flag0);
                                    if (scope.flag0 === false || scope.flagNeg === false) {
                                        throw er = "valori negativi e/o tutti nulli";
                                    }
                                    //console.log("labels (1): ", labels);
                                } catch (er) {
                                    // console.log("-----------");
                                    // console.log("er: ", er);
                                    var error = "tipo di dato sbagliato per i valori"
                                }

                                if (typeof error == 'undefined' && document.getElementById(scope.propertyname)) {
                                    drawChart();
                                }
                            }
                        }, 10);


                        //Se è stata definita una funzione di push viene chiama questa altrimenti vengono fatti i settaggi predefiniti
                        if (attrs["push"]) {
                            scope.$parent.$eval(attrs["push"]);
                            $property = {
                                name: scope.propertyname,
                                value: data.properties[scope.propertyname]
                            };
                            var fn = scope.$parent[attrs["push"]];
                            if (typeof fn === "function") {
                                var params = [$property];
                                fn.apply(scope.$parent, params);
                            } else {
                                throw new Error("The Push attribute must be a function name present in scope")
                            }
                        } else {
                            scope.object.properties[scope.propertyname] = data.properties[scope.propertyname];
                        }
                        //In particolare questa parte aggiorna il cloud nel caso siano state definite delle correlazioni
                        /*if(attrs["correlation"]){
                         scope.$parent.$eval(attrs["correlation"]);
                         }*/
                        //
                    }
                }
            });
            socket.on("apio_server_update_", function (data) {
                if (data.objectId === scope.object.objectId) {
                    //scope.label = parseInt(data.properties[scope.propertyname]) === parseInt(scope.valueoff) ? attrs["labeloff"] : attrs["labelon"];
                    scope.object.properties[scope.propertyname] = data.properties[scope.propertyname];
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                }
            });
            attrs.$observe("draw", function (newValue) {
                //scope.ready = false;
                console.log("cambia il valore: ", newValue);
                if (newValue == "true" && redraw_first === true) {
                    setTimeout(function () {
                        console.log('redraw');
                        drawChart();

                    }, 100);
                } else if (newValue == "true" && redraw_first == false) {
                    setTimeout(function () {
                        console.log('redraw iniziale');
                        drawChart();
                        redraw_first = true;
                        setTimeout(function () {
                            console.log("redraw iniziale ulteriore");
                            drawChart();
                        }, 100);
                    }, 1000);
                }

            });

            // scope.$watch("ready", function(newValue,oldValue){
            //     if(newValue === true /*&& oldValue === false*/) {
            //         setTimeout(function () {
            //             console.log('redraw iniziale');
            //             drawChart();
            //             redraw_first = true;
            //         }, 2000);
            //     }
            // })
        }
    }
}]);