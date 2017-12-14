var app = angular.module("ApioApplication10", ["apioProperty"]);
app.controller("defaultController", ["$scope", "currentObject", "$http", "sharedProperties", function ($scope, currentObject, $http, sharedProperties) {
    $scope.object = currentObject.get();
    console.log("Sono il defaultController e l'oggetto è: ", $scope.object);

    document.getElementById("ApioApplicationContainer").classList.add("fullscreen");

    var toPlot = {}, toPlotPunctual = {}, openEvents = [];
    // $scope.graphDate = new Date().getFullYear() + "-" + (new Date().getMonth() +1) + "-" +  (new Date().getDate() +1);

    $scope.app = {};
    var interval = setInterval(function () {
        var elem = document.getElementById("registra_statoinput");
        if (elem) {
            elem.parentNode.removeChild(elem);
            clearInterval(interval);
        }
    }, 0);

    $("#propertyTab a").click(function (e) {
        e.preventDefault();
        $(this).tab("show");
        var id = e.target.getAttribute("data-idTab");
        if (id === "proprieta") {
            document.getElementById("puntuali").classList.remove("active");
            document.getElementById("riferimenti").classList.remove("active");
            document.getElementById(id).classList.add("active");
        } else if (id === "puntuali") {
            document.getElementById("proprieta").classList.remove("active");
            document.getElementById("riferimenti").classList.remove("active");
            document.getElementById(id).classList.add("active");
        } else if (id === "riferimenti") {
            document.getElementById("proprieta").classList.remove("active");
            document.getElementById("puntuali").classList.remove("active");
            document.getElementById(id).classList.add("active");
        }
    });

    $scope.calendar = [];
    $scope.checked = false;
    $scope.app.installation = "-1";
    // $scope.installation = "10";
    $scope.installations = {"-1": "No object"};
    $scope.isPropertySelected = {};
    $scope.installationsProperties = {};
    $scope.installationsPunctualProperties = {};
    $scope.selectedProperties = "variables";
    $scope.showPunctual = false;
    $scope.myStyle = {};
    // $scope.toPlot = "timestamp";
    // $scope.toPlotPunctual = "timestamp";

    $http.get("/apio/database/getObjects").success(function (objects) {
        objects.sort(function (a, b) {
            return Number(a.objectId) - Number(b.objectId);
        });

        for (var i in objects) {
            if (objects[i].type === "object") {
                $scope.installations[objects[i].objectId] = objects[i].name;
                $scope.installationsProperties[objects[i].objectId] = objects[i].properties;
                $scope.myStyle[objects[i].objectId] = {};

                delete $scope.installationsProperties[objects[i].objectId].date;
                var keys = Object.keys($scope.installationsProperties[objects[i].objectId]);
                for (var j in keys) {
                    if ($scope.installationsProperties[objects[i].objectId][keys[j]].type === "apiolink" || $scope.installationsProperties[objects[i].objectId][keys[j]].type === "dynamicview" || $scope.installationsProperties[objects[i].objectId][keys[j]].type === "textbox") {
                        delete $scope.installationsProperties[objects[i].objectId][keys[j]];
                    } else if ($scope.installationsProperties[objects[i].objectId][keys[j]].hasOwnProperty("graph") && $scope.installationsProperties[objects[i].objectId][keys[j]].graph === "punctual") {
                        if (!$scope.installationsPunctualProperties.hasOwnProperty(objects[i].objectId)) {
                            $scope.installationsPunctualProperties[objects[i].objectId] = {};
                        }

                        $scope.installationsPunctualProperties[objects[i].objectId][keys[j]] = $scope.installationsProperties[objects[i].objectId][keys[j]];
                        delete $scope.installationsProperties[objects[i].objectId][keys[j]];
                    }
                    $scope.myStyle[objects[i].objectId][keys[j]] ={};
                }
                keys = undefined;
            }
        }
    }).error(function (error) {
        console.log("Unable to get objects, error: ", error);
    });

    $scope.$on("$destroy", function () {
        $("#calendar").off("changeDate");
        $("#first_range").off("changeDate");
        $("#second_range").off("changeDate");

        for (var i in openEvents) {
            openEvents[i]();
        }
    });

    openEvents.push($scope.$on("installationRenderFinishedEmit", function () {
        if (Object.keys($scope.installations).length > 1 && sharedProperties.get("objectId") !== undefined && sharedProperties.get("objectId") !== null) {
            $scope.app.installation = sharedProperties.get("objectId");
            // $scope.installation = sharedProperties.get("objectId");
            // while (Object.keys(JSON.parse($scope.app.toPlot)).length == 0){
            //     console.log("ciclo");
            // }
            // $scope.toPlot = $scope.app.toPlot;
             var toPlot1 = {};
            var toPlotPunctual1 = {};

            if (Number($scope.app.installation) > -1) {
                var keys = Object.keys($scope.installationsProperties[$scope.app.installation]);
                toPlot1[keys[0]] = $scope.installationsProperties[$scope.app.installation][keys[0]].label ? $scope.installationsProperties[$scope.app.installation][keys[0]].label : $scope.installationsProperties[$scope.app.installation][keys[0]].labelon + " / " + $scope.installationsProperties[$scope.app.installation][keys[0]].labeloff;
                $scope.isPropertySelected[keys[0]] = true;

                for (var j in $scope.installationsPunctualProperties[$scope.app.installation]) {
                    toPlotPunctual1[j] = $scope.installationsPunctualProperties[$scope.app.installation][j].label ? $scope.installationsPunctualProperties[$scope.app.installation][j].label : $scope.installationsPunctualProperties[$scope.app.installation][j].labelon + " / " + $scope.installationsPunctualProperties[$scope.app.installation][j].labeloff;
                    $scope.isPropertySelected[j] = false;
                }
            }
            $scope.startGraph();
            var d = new Date();
            $scope.app.graphDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
            $scope.app.toPlot = JSON.stringify(toPlot1);

            setTimeout(function(){$scope.startGraph();},5000);
            sharedProperties.set("objectId", undefined);
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
    }));

    openEvents.push($scope.$on("apio_graph_draw_end", function () {
        var plot = JSON.parse($scope.toPlot);
        console.log("plot: ", plot);
    }));

    $scope.$watch("checked", function (newValue) {
        if (Number($scope.app.installation) > -1) {
            if (newValue === "" || newValue === false) {
                var d = new Date();
                $scope.app.graphDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

                $("#calendar").datepicker({
                    format: "dd-mm-yyyy",
                    multidate: 2
                }).off("changeDate").on("changeDate", function (e) {
                    if (e.dates.length === 1) {
                        $scope.app.graphDate = e.date.getFullYear() + "-" + (e.date.getMonth() + 1) + "-" + e.date.getDate();
                    } else if (e.dates.length === 2) {
                        if (e.dates[0].getTime() < e.dates[1].getTime()) {
                            $scope.app.graphDate = [e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate(), e.dates[1].getFullYear() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getDate()];
                        } else {
                            $scope.app.graphDate = [e.dates[1].getFullYear() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getDate(), e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate()];
                            $("#calendar").datepicker('update', e.dates[1].getDate() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getFullYear(),e.dates[0].getDate() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getFullYear());
                        }
                    }

                    console.log("calendar, $scope.app.graphDate: ", $scope.app.graphDate);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });

                $("#calendar").datepicker('update', d.getDate()+"-"+(d.getMonth() +1)+"-"+d.getFullYear());

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            } else if (newValue === true) {
                var d = new Date();
                var d_y = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
                var d_string = d.getDate() +"-" + (d.getMonth()+1)+"-"+d.getFullYear();
                var d_y_string = (d.getDate() -1) +"-" + (d.getMonth()+1)+"-"+d.getFullYear();
                $scope.firstPeriodFirstDate = d_y.getFullYear() + "-" + (d_y.getMonth() + 1) + "-" + d_y.getDate();
                $scope.firstPeriodSecondDate = d_y.getFullYear() + "-" + (d_y.getMonth() + 1) + "-" + d_y.getDate();
                $scope.secondPeriodFirstDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
                $scope.secondPeriodSecondDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
                $scope.app.graphDate = [$scope.firstPeriodFirstDate, $scope.firstPeriodSecondDate, $scope.secondPeriodFirstDate, $scope.secondPeriodSecondDate];

                $("#first_range").datepicker({
                    format: "dd-mm-yyyy",
                    multidate: 2
                }).off("changeDate").on("changeDate", function (e) {
                    if (e.dates.hasOwnProperty(0)) {
                        if (e.dates.hasOwnProperty(1)) {
                            if (e.dates[0].getTime() < e.dates[1].getTime()) {
                                $scope.firstPeriodFirstDate = e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate();
                                $scope.firstPeriodSecondDate = e.dates[1].getFullYear() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getDate();
                            } else {
                                $scope.firstPeriodFirstDate = e.dates[1].getFullYear() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getDate();
                                $scope.firstPeriodSecondDate = e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate();
                                $("#first_range").datepicker('update', e.dates[1].getDate() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getFullYear(),e.dates[0].getDate() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getFullYear());

                            }
                        } else {
                            $scope.firstPeriodFirstDate = $scope.firstPeriodSecondDate = e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate();
                        }

                        console.log("$scope.firstPeriodFirstDate: ", $scope.firstPeriodFirstDate);
                        console.log("$scope.firstPeriodSecondDate: ", $scope.firstPeriodSecondDate);

                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }
                });

                $("#second_range").datepicker({
                    format: "dd-mm-yyyy",
                    multidate: 2
                }).off("changeDate").on("changeDate", function (e) {
                    if (e.dates.hasOwnProperty(0)) {
                        if (e.dates.hasOwnProperty(1)) {
                            if (e.dates[0].getTime() < e.dates[1].getTime()) {
                                $scope.secondPeriodFirstDate = e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate();
                                $scope.secondPeriodSecondDate = e.dates[1].getFullYear() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getDate();
                            } else {
                                $scope.secondPeriodFirstDate = e.dates[1].getFullYear() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getDate();
                                $scope.secondPeriodSecondDate = e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate();
                                $("#second_range").datepicker('update', e.dates[1].getDate() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getFullYear(),e.dates[0].getDate() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getFullYear());
                            }
                        } else {
                            $scope.secondPeriodFirstDate = $scope.secondPeriodSecondDate = e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate();
                        }
                        //
                        // console.log("$scope.secondPeriodFirstDate: ", $scope.secondPeriodFirstDate);
                        // console.log("$scope.secondPeriodSecondDate: ", $scope.secondPeriodSecondDate);

                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }
                });

                $("#first_range").datepicker("update", d_y_string);
                $("#second_range").datepicker("update", d_string);

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        }
    });

    $scope.$watch("app.installation", function (newValue) {
        if (newValue) {
            console.log("app.installation", $scope.app.installation);
            $scope.showPunctual = false;
            // $("div#analytics").empty();
            // $("div#analytics_punctual").empty();

            $scope.calendar = [];

            toPlot = {};
            toPlotPunctual = {};
            $scope.isPropertySelected = {};
            if (Number(newValue) > -1) {
                var keys = Object.keys($scope.installationsProperties[newValue]);
                toPlot[keys[0]] = $scope.installationsProperties[newValue][keys[0]].label ? $scope.installationsProperties[newValue][keys[0]].label : $scope.installationsProperties[newValue][keys[0]].labelon + " / " + $scope.installationsProperties[newValue][keys[0]].labeloff;
                $scope.isPropertySelected[keys[0]] = true;

                for (var j in $scope.installationsPunctualProperties[newValue]) {
                    toPlotPunctual[j] = $scope.installationsPunctualProperties[newValue][j].label ? $scope.installationsPunctualProperties[newValue][j].label : $scope.installationsPunctualProperties[newValue][j].labelon + " / " + $scope.installationsPunctualProperties[newValue][j].labeloff;
                    $scope.isPropertySelected[j] = false;
                }
            }
            $scope.app.toPlot = JSON.stringify(toPlot);
            $scope.app.toPlotPunctual = "{}";
            // $scope.app.toPlotPunctual = JSON.stringify(toPlotPunctual);


            console.log("toPlot: ", toPlot);
            console.log("toPlotPunctual: ", toPlotPunctual);

            $http.get("/apio/getService/log").success(function (service) {
                $scope.service = service;
                if ($scope.checked === "" || $scope.checked === false) {
                    if (Number(newValue) > -1) {
                        $("#calendar").datepicker({
                            format: "dd-mm-yyyy",
                            multidate: 2
                        }).off("changeDate").on("changeDate", function (e) {
                            if (e.dates.length === 1) {
                                $scope.app.graphDate = e.date.getFullYear() + "-" + (e.date.getMonth() + 1) + "-" + e.date.getDate();
                            } else if (e.dates.length === 2) {
                                if (e.dates[0].getTime() < e.dates[1].getTime()) {
                                    $scope.app.graphDate = [e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate(), e.dates[1].getFullYear() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getDate()];
                                } else {
                                    $scope.app.graphDate = [e.dates[1].getFullYear() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getDate(), e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate()];
                                    $("#calendar").datepicker('update', e.dates[1].getDate() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getFullYear(), e.dates[0].getDate() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getFullYear());

                                }
                            }

                            console.log("calendar, $scope.app.graphDate: ", $scope.app.graphDate);
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                        });

                        if ($scope.app.graphDate === undefined || $scope.app.graphDate instanceof Array) {
                            var d = new Date();
                            $scope.app.graphDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
                            $("#calendar").datepicker('update', d.getDate()+"-"+(d.getMonth() +1)+"-"+d.getFullYear());
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                        }
                    }
                } else if ($scope.checked === true) {
                    if (Number(newValue) > -1) {
                        $("#first_range").datepicker({
                            format: "dd-mm-yyyy",
                            multidate: 2
                        }).off("changeDate").on("changeDate", function (e) {
                            if (e.dates.hasOwnProperty(0)) {
                                if (e.dates.hasOwnProperty(1)) {
                                    if (e.dates[0].getTime() < e.dates[1].getTime()) {
                                        $scope.firstPeriodFirstDate = e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate();
                                        $scope.firstPeriodSecondDate = e.dates[1].getFullYear() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getDate();
                                    } else {
                                        $scope.firstPeriodFirstDate = e.dates[1].getFullYear() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getDate();
                                        $scope.firstPeriodSecondDate = e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate();
                                        $("#first_range").datepicker('update', e.dates[1].getDate() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getFullYear(), e.dates[0].getDate() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getFullYear());
                                    }
                                } else {
                                    $scope.firstPeriodFirstDate = $scope.firstPeriodSecondDate = e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate();
                                }

                                console.log("$scope.firstPeriodFirstDate: ", $scope.firstPeriodFirstDate);
                                console.log("$scope.firstPeriodSecondDate: ", $scope.firstPeriodSecondDate);

                                if (!$scope.$$phase) {
                                    $scope.$apply();
                                }
                            }
                        });

                        $("#second_range").datepicker({
                            format: "dd-mm-yyyy",
                            multidate: 2
                        }).off("changeDate").on("changeDate", function (e) {
                            if (e.dates.hasOwnProperty(0)) {
                                if (e.dates.hasOwnProperty(1)) {
                                    if (e.dates[0].getTime() < e.dates[1].getTime()) {
                                        $scope.secondPeriodFirstDate = e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate();
                                        $scope.secondPeriodSecondDate = e.dates[1].getFullYear() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getDate();
                                    } else {
                                        $scope.secondPeriodFirstDate = e.dates[1].getFullYear() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getDate();
                                        $scope.secondPeriodSecondDate = e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate();
                                        $("#second_range").datepicker('update', e.dates[1].getDate() + "-" + (e.dates[1].getMonth() + 1) + "-" + e.dates[1].getFullYear(), e.dates[0].getDate() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getFullYear());
                                    }
                                } else {
                                    $scope.secondPeriodFirstDate = $scope.secondPeriodSecondDate = e.dates[0].getFullYear() + "-" + (e.dates[0].getMonth() + 1) + "-" + e.dates[0].getDate();
                                }

                                console.log("$scope.secondPeriodFirstDate: ", $scope.secondPeriodFirstDate);
                                console.log("$scope.secondPeriodSecondDate: ", $scope.secondPeriodSecondDate);

                                if (!$scope.$$phase) {
                                    $scope.$apply();
                                }
                            }
                        });

                        if ($scope.app.graphDate === undefined || !($scope.app.graphDate instanceof Array)) {
                            var d = new Date();
                            var d_y = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
                            var d_string = d.getDate() +"-" + (d.getMonth()+1)+"-"+d.getFullYear();
                            var d_y_string = (d.getDate() -1) +"-" + (d.getMonth()+1)+"-"+d.getFullYear();
                            $scope.firstPeriodFirstDate = d_y.getFullYear() + "-" + (d_y.getMonth() + 1) + "-" + d_y.getDate();
                            $scope.firstPeriodSecondDate = d_y.getFullYear() + "-" + (d_y.getMonth() + 1) + "-" + d_y.getDate();
                            $scope.secondPeriodFirstDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
                            $scope.secondPeriodSecondDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
                            $scope.app.graphDate = [$scope.firstPeriodFirstDate, $scope.firstPeriodSecondDate, $scope.secondPeriodFirstDate, $scope.secondPeriodSecondDate];
                            $("#first_range").datepicker("update", d_y_string);
                            $("#second_range").datepicker("update",d_string);

                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                        }
                    }
                }
            }).error(function (error) {
                console.log("Error while getting service log: ", error);
            });
        }
    });

    $scope.$watch("firstPeriodFirstDate", function (newValue, oldValue) {
        //if (newValue && $scope.firstPeriodSecondDate) {
        //    var firstDateComponents = newValue.split("-");
        //    var secondDateComponents = $scope.firstPeriodSecondDate.split("-");
        //    if (Number(secondDateComponents[0]) < Number(firstDateComponents[0]) || Number(secondDateComponents[1]) < Number(firstDateComponents[1]) || Number(secondDateComponents[2]) < Number(firstDateComponents[2])) {
        //        //$("#range1 input").each(function (index) {
        //        //    if (index === 0) {
        //        //        var oldValueComponents = oldValue.split("-");
        //        //        var d = new Date(Number(oldValueComponents[0]), Number(oldValueComponents[1]) - 1, Number(oldValueComponents[2]));
        //        //        $(this).datepicker("setDate", d);
        //        //    }
        //        //});
        //        $scope.firstPeriodFirstDate = oldValue;
        //        alert("La prima data deve essere minore");
        //    } else {
        //        if ($scope.firstPeriodFirstDate && $scope.firstPeriodSecondDate && $scope.secondPeriodFirstDate && $scope.secondPeriodSecondDate) {
        //            $scope.graphDate = [$scope.firstPeriodFirstDate, $scope.firstPeriodSecondDate, $scope.secondPeriodFirstDate, $scope.secondPeriodSecondDate];
        //            if (!$scope.$$phase) {
        //                $scope.$apply();
        //            }
        //        }
        //    }
        //}

        if ($scope.firstPeriodFirstDate && $scope.firstPeriodSecondDate && $scope.secondPeriodFirstDate && $scope.secondPeriodSecondDate) {
            $scope.app.graphDate = [$scope.firstPeriodFirstDate, $scope.firstPeriodSecondDate, $scope.secondPeriodFirstDate, $scope.secondPeriodSecondDate];
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
    });

    $scope.$watch("firstPeriodSecondDate", function (newValue, oldValue) {
        //if (newValue && $scope.firstPeriodFirstDate) {
        //    var firstDateComponents = $scope.firstPeriodFirstDate.split("-");
        //    var secondDateComponents = newValue.split("-");
        //    if (Number(secondDateComponents[0]) < Number(firstDateComponents[0]) || Number(secondDateComponents[1]) < Number(firstDateComponents[1]) || Number(secondDateComponents[2]) < Number(firstDateComponents[2])) {
        //        //$("#range1 input").each(function (index) {
        //        //    if (index === 1) {
        //        //        var oldValueComponents = oldValue.split("-");
        //        //        var d = new Date(Number(oldValueComponents[0]), Number(oldValueComponents[1]) - 1, Number(oldValueComponents[2]));
        //        //        $(this).datepicker("setDate", d);
        //        //    }
        //        //});
        //        $scope.firstPeriodSecondDate = oldValue;
        //        alert("La seconda data deve essere maggiore");
        //    } else {
        //        if ($scope.firstPeriodFirstDate && $scope.firstPeriodSecondDate && $scope.secondPeriodFirstDate && $scope.secondPeriodSecondDate) {
        //            $scope.graphDate = [$scope.firstPeriodFirstDate, $scope.firstPeriodSecondDate, $scope.secondPeriodFirstDate, $scope.secondPeriodSecondDate];
        //            if (!$scope.$$phase) {
        //                $scope.$apply();
        //            }
        //        }
        //    }
        //}

        if ($scope.firstPeriodFirstDate && $scope.firstPeriodSecondDate && $scope.secondPeriodFirstDate && $scope.secondPeriodSecondDate) {
            $scope.app.graphDate = [$scope.firstPeriodFirstDate, $scope.firstPeriodSecondDate, $scope.secondPeriodFirstDate, $scope.secondPeriodSecondDate];
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
    });

    $scope.$watch("secondPeriodFirstDate", function (newValue, oldValue) {
        //if (newValue && $scope.firstPeriodSecondDate && $scope.secondPeriodSecondDate) {
        //    var firstDateComponents = newValue.split("-");
        //    var secondDateComponents = $scope.secondPeriodSecondDate.split("-");
        //    var firstPeriodSecondDateComponents = $scope.firstPeriodSecondDate.split("-");
        //    console.log("firstDateComponents: ", firstDateComponents, "secondDateComponents: ", secondDateComponents, "firstPeriodSecondDateComponents: ", firstPeriodSecondDateComponents);
        //    if (Number(secondDateComponents[0]) < Number(firstDateComponents[0]) || Number(secondDateComponents[1]) < Number(firstDateComponents[1]) || Number(secondDateComponents[2]) < Number(firstDateComponents[2])) {
        //        //$("#range2 input").each(function (index) {
        //        //    if (index === 0) {
        //        //        var oldValueComponents = oldValue.split("-");
        //        //        var d = new Date(Number(oldValueComponents[0]), Number(oldValueComponents[1]) - 1, Number(oldValueComponents[2]));
        //        //        $(this).datepicker("setDate", d);
        //        //    }
        //        //});
        //        $scope.secondPeriodFirstDate = oldValue;
        //        alert("La prima data deve essere minore");
        //    } else if (Number(firstDateComponents[0]) < Number(firstPeriodSecondDateComponents[0]) || Number(firstDateComponents[1]) < Number(firstPeriodSecondDateComponents[1]) || Number(firstDateComponents[2]) < Number(firstPeriodSecondDateComponents[2])) {
        //        //$("#range2 input").each(function (index) {
        //        //    if (index === 0) {
        //        //        var oldValueComponents = oldValue.split("-");
        //        //        var d = new Date(Number(oldValueComponents[0]), Number(oldValueComponents[1]) - 1, Number(oldValueComponents[2]));
        //        //        $(this).datepicker("setDate", d);
        //        //    }
        //        //});
        //        $scope.secondPeriodFirstDate = oldValue;
        //        alert("Il secondo periodo deve cominciare dopo la fine del primo");
        //    } else {
        //        if ($scope.firstPeriodFirstDate && $scope.firstPeriodSecondDate && $scope.secondPeriodFirstDate && $scope.secondPeriodSecondDate) {
        //            $scope.graphDate = [$scope.firstPeriodFirstDate, $scope.firstPeriodSecondDate, $scope.secondPeriodFirstDate, $scope.secondPeriodSecondDate];
        //            if (!$scope.$$phase) {
        //                $scope.$apply();
        //            }
        //        }
        //    }
        //}

        if ($scope.firstPeriodFirstDate && $scope.firstPeriodSecondDate && $scope.secondPeriodFirstDate && $scope.secondPeriodSecondDate) {
            $scope.app.graphDate = [$scope.firstPeriodFirstDate, $scope.firstPeriodSecondDate, $scope.secondPeriodFirstDate, $scope.secondPeriodSecondDate];
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
    });

    $scope.$watch("secondPeriodSecondDate", function (newValue, oldValue) {
        //if (newValue && $scope.firstPeriodFirstDate) {
        //    var firstDateComponents = $scope.secondPeriodFirstDate.split("-");
        //    var secondDateComponents = newValue.split("-");
        //    if (Number(secondDateComponents[0]) < Number(firstDateComponents[0]) || Number(secondDateComponents[1]) < Number(firstDateComponents[1]) || Number(secondDateComponents[2]) < Number(firstDateComponents[2])) {
        //        //$("#range2 input").each(function (index) {
        //        //    if (index === 1) {
        //        //        var oldValueComponents = oldValue.split("-");
        //        //        var d = new Date(Number(oldValueComponents[0]), Number(oldValueComponents[1]) - 1, Number(oldValueComponents[2]));
        //        //        $(this).datepicker("setDate", d);
        //        //    }
        //        //});
        //        $scope.secondPeriodSecondDate = oldValue;
        //        alert("La seconda data deve essere maggiore");
        //    } else {
        //        if ($scope.firstPeriodFirstDate && $scope.firstPeriodSecondDate && $scope.secondPeriodFirstDate && $scope.secondPeriodSecondDate) {
        //            $scope.graphDate = [$scope.firstPeriodFirstDate, $scope.firstPeriodSecondDate, $scope.secondPeriodFirstDate, $scope.secondPeriodSecondDate];
        //            if (!$scope.$$phase) {
        //                $scope.$apply();
        //            }
        //        }
        //    }
        //}

        if ($scope.firstPeriodFirstDate && $scope.firstPeriodSecondDate && $scope.secondPeriodFirstDate && $scope.secondPeriodSecondDate) {
            $scope.app.graphDate = [$scope.firstPeriodFirstDate, $scope.firstPeriodSecondDate, $scope.secondPeriodFirstDate, $scope.secondPeriodSecondDate];
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
    });

    $scope.$watch("selectedProperties", function (newValue, oldValue) {
        if (newValue === "variables") {
            for (var i in $scope.installationsProperties[$scope.app.installation]) {
                if ($scope.isPropertySelected[i]) {
                    $scope.showPunctual = false;
                    //var keys = Object.keys($scope.installationsProperties[$scope.installation]);
                    //for (var j = 0; j < keys.length; j++) {
                    //    //toPlot[keys[j]] = $scope.installationsProperties[$scope.installation][keys[j]].label ? $scope.installationsProperties[$scope.installation][keys[j]].label : $scope.installationsProperties[$scope.installation][keys[j]].labelon + " / " + $scope.installationsProperties[$scope.installation][keys[j]].labeloff;
                    //    $scope.isPropertySelected[keys[j]] = j === 0;
                    //}
                    break;
                }
            }
        } else if (newValue === "punctuals") {
            for (var i in $scope.installationsPunctualProperties[$scope.app.installation]) {
                if ($scope.isPropertySelected[i]) {
                    $scope.showPunctual = true;
                    //var keys = Object.keys($scope.installationsPunctualProperties[$scope.installation]);
                    //for (var j = 0; j < keys.length; j++) {
                    //    //toPlotPunctual[keys[j]] = $scope.installationsPunctualProperties[$scope.installation][keys[j]].label ? $scope.installationsPunctualProperties[$scope.installation][keys[j]].label : $scope.installationsPunctualProperties[$scope.installation][keys[j]].labelon + " / " + $scope.installationsPunctualProperties[$scope.installation][keys[j]].labeloff;
                    //    $scope.isPropertySelected[keys[j]] = j === 0;
                    //}
                    break;
                }
            }
        }
    });

    $scope.changeStyle = function(key){
        console.log(key);
        console.log("myStyle: ",$scope.myStyle);
        var hsvToRgb = function(h, s, v) {
            // console.log(h,s,v);
            var r, g, b;
            var i;
            var f, p, q, t;

            // Make sure our arguments stay in-range
            h = Math.max(0, Math.min(360, h));
            s = Math.max(0, Math.min(100, s));
            v = Math.max(0, Math.min(100, v));

            // We accept saturation and value arguments from 0 to 100 because that's
            // how Photoshop represents those values. Internally, however, the
            // saturation and value are calculated from a range of 0 to 1. We make
            // That conversion here.
            s /= 100;
            v /= 100;

            if (s == 0) {
                // Achromatic (grey)
                r = g = b = v;
                return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
            }

            h /= 60; // sector 0 to 5
            i = Math.floor(h);
            f = h - i; // factorial part of h
            p = v * (1 - s);
            q = v * (1 - s * f);
            t = v * (1 - s * (1 - f));

            switch (i) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;

                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;

                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;

                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;

                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;

                default: // case 5:
                    r = v;
                    g = p;
                    b = q;
            }

            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        };
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        function rgbToHex(a) {
            return "#" + componentToHex(a[0]) + componentToHex(a[1]) + componentToHex(a[2]);
        }
        var rgbColors = function(t) {
            t = parseInt(t);
            // if (t < 2)
            //     throw new Error("'t' must be greater than 1.");

            // distribute the colors evenly on
            // the hue range (the 'H' in HSV)
            var i = 360 / (t /*-1*/);

            // hold the generated colors
            var r = [];
            var s = 70 , v = 70;
            for (var x = 0; x < t; x++) {
                // alternate the s, v for more
                // contrast between the colors.
                s = 90 + Math.random()*10;
                v = 80 + Math.random()*10;
                r.push(rgbToHex(hsvToRgb(i * x, s, v)));
            }
            return r;
        };
        var arr = rgbColors(Object.keys($scope.app.toPlot).length);
        var index;
        var json = JSON.parse($scope.app.toPlot.replace(/'/g, "\""));
        var plot1 = [];
        for (var i in json) {
            plot1.push(i);
        }
        for (var i = 0; i < plot1.length ;i++){
            console.log(plot1[i], "==", key);
            if (plot1[i] == key){
                index = i;
                break;
            }
        }
        if (typeof index !="undefined")
        { console.log("quii1")
            $scope.myStyle[$scope.app.installation][key] = {'background-color':arr[index]}
        } else {
            console.log("quii2")
            $scope.myStyle[$scope.app.installation][key] = {}
        }

    }

    $scope.getLabel = function (elem) {
        return elem.label ? elem.label : elem.labelon + " / " + elem.labeloff;
    };

    $scope.setSelectedProperties = function (val) {
        $scope.selectedProperties = val;
    };

    $scope.showElement = function (property) {
        $scope.showPunctual = false;
        var temp = JSON.parse($scope.app.toPlot);
        if (temp.hasOwnProperty(property)) {
            delete temp[property];
            //$scope.isPropertySelected[property] = false;
        } else {
            temp[property] = $scope.installationsProperties[$scope.app.installation][property].label ? $scope.installationsProperties[$scope.app.installation][property].label : $scope.installationsProperties[$scope.app.installation][property].labelon + " / " + $scope.installationsProperties[$scope.app.installation][property].labeloff;
            //$scope.isPropertySelected[property] = true;
        }

        $scope.app.toPlot = JSON.stringify(temp);
    };

    $scope.showPunctualElement = function (property) {
        $scope.showPunctual = true;
        var temp = JSON.parse($scope.app.toPlotPunctual);
        if (temp.hasOwnProperty(property)) {
            delete temp[property];
            //$scope.isPropertySelected[property] = false;
        } else {
            temp[property] = $scope.installationsPunctualProperties[$scope.app.installation][property].label ? $scope.installationsPunctualProperties[$scope.app.installation][property].label : $scope.installationsPunctualProperties[$scope.app.installation][property].labelon + " / " + $scope.installationsPunctualProperties[$scope.app.installation][property].labeloff;
            //$scope.isPropertySelected[property] = true;
        }

        $scope.app.toPlotPunctual = JSON.stringify(temp);
    };

    $scope.startGraph = function(){
        // if (typeof $scope.app.graphDate == "object"){
        //     var greater_date = function(date1,date2){
        //         var split1 = date1.split("-");
        //         var split2 = date2.split("-");
        //         if (new Date(split1[0],split1[1],split1[2]).getTime() < new Date(split2[0],split2[1],split2[2]).getTime()){
        //             return false;
        //         } else {
        //             return true;
        //         }
        //     }
        //     if ($scope.app.graphDate.length == 2){
        //         if (greater_date($scope.app.graphDate[0],$scope.app.graphDate[1])){
        //             var app = $scope.app.graphDate[0];
        //             $scope.app.graphDate[0] = $scope.app.graphDate[1];
        //             $scope.app.graphDate[1] = app;
        //         }
        //     } if ($scope.app.graphDate.length == 4){
        //         if (greater_date($scope.app.graphDate[2],$scope.app.graphDate[3])){
        //             var app = $scope.app.graphDate[2];
        //             $scope.app.graphDate[2] = $scope.app.graphDate[3];
        //             $scope.app.graphDate[3] = app;
        //         }
        //     }
        // }

        console.log("entro qui in startGraph");
        // console.log("$scope.app.graphDate: ",$scope.app.graphDate);
        // console.log("$scope.app.toPlot: ",$scope.app.toPlot);

        if ($scope.app.installation != "-1") {
            $scope.installation = $scope.app.installation;
            $scope.graphDate = $scope.app.graphDate;
            $scope.toPlot = $scope.app.toPlot;
            $scope.toPlotPunctual = $scope.app.toPlotPunctual;

        }
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }
}]);

app.directive("installationRenderFinished", function ($timeout) {
    return {
        restrict: "A",
        link: function (scope) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit("installationRenderFinishedEmit");
                });
            }
        }
    }
});

setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication10"), ["ApioApplication10"]);
}, 10);