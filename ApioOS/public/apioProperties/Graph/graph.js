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
angular.module("apioProperty").directive("graph", ["currentObject", "$http", "$location", "$timeout", "$q", "objectService", function (currentObject, $http, $location, $timeout, $q, objectService) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            //model: "=graphname"
        },
        templateUrl: "apioProperties/Graph/graph.html",
        link: function (scope, elem, attrs) {
            elem.on("dblclick", function () {
                $location.path("/home/10/" + scope.object.objectId);
            });
            scope.labels = [];
            var deferredAbort = $q.defer();
            scope.currentObject = currentObject;
            scope.graphname = attrs.graphname;
            scope.object = currentObject.get();
            console.log("target", attrs.target ? attrs.target : scope.object.objectId);
            console.log("attrs", attrs);
            objectService.getById(Number(attrs.target ? attrs.target : scope.object.objectId)).then(function (otherObject) {
                scope.addObject = otherObject.data;
                $http.get("/apio/getPlatform", {timeout: deferredAbort.promise}).success(function (data) {
                    if (data.type === "gateway") {
                        scope.object.apioId = data.apioId;
                    }
                });
                function objectConstructor() {
                    //***self***
                    var self = this;
                    //***attributes***
                    var ready = false;// if false shows the loading wheel, if true shows the graph
                    var attrInterval;// timeout which is used if an attribute is changed
                    var timeoutTime = 200;//time of the timeout in milliseconds
                    //***attributes of the red bar/label rectangle/red circles fix to be improved and refactorized
                    var labelVisibility = [];
                    var rectVisibility = [];
                    var flagMouseDown = false;
                    var temp_style = [];
                    var circle = [];
                    var label = [];
                    var rectLabel = [];
                    var startTime;
                    var endTime;
                    var Interval = setInterval(function () { //defines the eventlistener for mousemove and mouseup for the fix
                        var elem = document.getElementById(scope.graphname);
                        if (elem) {
                            clearInterval(Interval);


                            elem.addEventListener('mousedown', function () {
                                //console.log('mousedown');
                                flagMouseDown = true;
                                for (var n in circle) {
                                    for (var s in circle[n]) {
                                        //console.log(circle[n][s])
                                        circle[n][s].setAttribute('style', '');
                                        if (!label[n][s].classList.contains('visibility-hidden')) {
                                            label[n][s].classList.add('visibility-hidden');

                                        }
                                        if (!rectLabel[n][s].classList.contains('visibility-hidden')) {
                                            rectLabel[n][s].classList.add('visibility-hidden');
                                        }
                                    }
                                }
                            });
                            elem.addEventListener('mouseup', function () {
                                //console.log('mouseup');
                                flagMouseDown = false;
                                //console.log(flagMouseDown);
                            });
                            elem.addEventListener('mousemove', function (e) {
                                // console.log('**********mouse-move**********');
                                //console.log("e.clientX", e.clientX);
                                if (!flagMouseDown) {
                                    var margine = 0.3;
                                    var contentGraph = document.getElementsByClassName('vis-line-graph').item(0).firstChild;
                                    var contentOnlyGraph = document.getElementsByClassName('vis-panel vis-center').item(0)
                                    var positionTime = e.clientX - (self.getPosition(contentOnlyGraph).x);
                                    var posizione = self.getPosition(contentGraph);
                                    var relativeX = e.clientX - posizione.x;
                                    var relativeY = e.clientY - posizione.y;
                                    var n = document.getElementsByClassName('vis-point');
                                    var tempMedia = 0;
                                    // console.log('positionTime', positionTime);
                                    if (!document.getElementById('cursorTime')) {
                                        //inserimento cerchio sul mouse
                                        var xmlns = "http://www.w3.org/2000/svg";
                                        var elemCircleTime = document.createElementNS(xmlns, "rect");
                                        elemCircleTime.setAttributeNS(null, "x", relativeX - 4);
                                        //elemCircleTime.setAttributeNS(null,"y",relativeY-5);
                                        elemCircleTime.setAttribute('id', 'cursorTime');
                                        elemCircleTime.setAttribute('style', 'width: 3px;height: 100%;fill: rgb(255, 0, 0);fill-opacity: 0.4;');
                                        n.item(0).parentNode.insertBefore(elemCircleTime, n.item(0).parentNode.firstChild)
                                        var elemTextTime = document.createElementNS(xmlns, "text");
                                        elemTextTime.setAttributeNS(null, "x", relativeX);
                                        elemTextTime.setAttributeNS(null, "y", relativeY);
                                        elemTextTime.setAttribute('id', 'cursorTextTime');
                                        n.item(0).parentNode.appendChild(elemTextTime);
                                    } else {
                                        document.getElementById('cursorTime').setAttribute('x', relativeX - 4)
                                        document.getElementById('cursorTextTime').setAttribute('x', relativeX + 10)
                                        document.getElementById('cursorTextTime').setAttribute('y', relativeY - 5)
                                        //console.log("e.clientX: ", e.clientX);
                                        var x = (endTime - startTime) / (Number(document.getElementsByClassName('vis-panel vis-center').item(0).clientWidth));
                                        var y = parseInt(startTime + (x * (positionTime)));
                                        // console.log("document.getElementsByClassName('vis-panel vis-center').item(1))",document.getElementsByClassName('vis-panel vis-center').item(0));
                                        // console.log("startTime:",startTime);
                                        // console.log("positionTime: ",positionTime);
                                        // console.log("x: ",x);
                                        // console.log("y: ",y);
                                        var d = new Date(y);
                                        // console.log("d: ",d);
                                        var h = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
                                        var m = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
                                        var s = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
                                        //console.log('h',h,'m',m);
                                        scope.time = h + ':' + m + ':' + s;
                                        if (scope.object.objectId != 10) {
                                            document.getElementById('cursorTextTime').innerHTML = h + ':' + m + ':' + s;

                                        }
                                        if (!scope.$$phase) {
                                            scope.$apply();
                                        }
                                    }

                                    var cursorTextTime = document.getElementById('cursorTextTime')
                                    var margineDxTime = (Number(cursorTextTime.parentNode.clientWidth) / 1.514) - (Number(cursorTextTime.getAttribute('x')) + Number(cursorTextTime.clientWidth))
                                    //console.log('get X',Number(rectLabel[l][h].getAttribute('x')));

                                    //console.log('get witdh',Number(rectLabel[l][h].getAttribute('width')));
                                    //console.log('get clientWidth',Number(rectLabel[l][h].parentNode.clientWidth));
                                    //console.log();
                                    //console.log('margineDx',margineDx);
                                    if (margineDxTime < 0) {
                                        //console.log('margineDx',margineDx)
                                        cursorTextTime.setAttribute('x', Number(cursorTextTime.getAttribute('x')) - (Number(cursorTextTime.clientWidth) + 20))
                                        //label[l][h].setAttribute('x', Number(label[l][h].getAttribute('x'))+Number(margineDxTime))
                                    }

                                    for (var s in circle) {
                                        for (var h in circle[s]) {
                                            if (circle[s][h].nodeName == "circle" && h != 0) {
                                                tempMedia = circle[s][h].getAttribute('cx') - circle[s][h - 1].getAttribute('cx');
                                                if (margine < tempMedia) {
                                                    margine = tempMedia;
                                                }
                                            }
                                        }
                                    }
                                    if (margine > 1) {
                                        margine = 3;
                                        for (var l in circle) {
                                            for (var h in circle[l]) {
                                                if (circle[l][h].nodeName == "circle" && (circle[l][h].getAttribute('cx') < relativeX + margine && circle[l][h].getAttribute('cx') > relativeX - margine) && label[l][h].classList.contains('visibility-hidden') && document.getElementById(label[l][h].getAttribute('id'))) {
                                                    var tempNode = label[l][h].classList;
                                                    // console.log("classlist",tempNode);
                                                    // console.log("className",className);
                                                    var proprietaAttuale = '';
                                                    // var flag_attuale = false;
                                                    for (var f in tempNode) {
                                                        if (tempNode.item(f).indexOf('label-group-') > -1) {
                                                            proprietaAttuale = tempNode.item(f).split('label-group-')[1];
                                                            // flag_attuale = true;
                                                        } else if (tempNode.item(f).indexOf('vis-label') < 0) {
                                                            proprietaAttuale += " " + tempNode.item(f);
                                                        } else {
                                                            break;
                                                        }
                                                        // }
                                                    }
                                                    temp_style[l][h] = circle[l][h].getAttribute("style");
                                                    rectLabel[l][h].setAttribute('x', (Number(label[l][h].getAttribute('x')) - 5))
                                                    rectLabel[l][h].setAttribute('y', (Number(label[l][h].getAttribute('y')) - 13))
                                                    if (scope.object.objectId != 10) {
                                                        // console.log("proprietaAttuale: ",proprietaAttuale);
                                                        label[l][h].innerHTML = proprietaAttuale + ' ' + label[l][h].innerHTML;
                                                    }
                                                    // label[l][h].setAttribute("style",temp_style[l][h]+";fill-opacity: 0.8")
                                                    // label[l][h].setAttribute('fill', temp_style[l][h].split("fill:")[1]);
                                                    // label[l][h].setAttribute('style', temp_style[l][h].split("fill")[0]);
                                                    //console.log('fill ',circle[l][h].style.fill);

                                                    circle[l][h].setAttribute('style', 'fill:#DE0000; stroke:#DE0000; stroke-width:6px; z-index:-1;')


                                                    if (scope.object.objectId == 10) {
                                                        //prima era così
                                                        //label[l][h].classList.remove('visibility-hidden');
                                                        var index = undefined;
                                                        for (var i in scope.labels) {
                                                            // console.log(scope.labels[i].label, "==", proprietaAttuale);
                                                            if (scope.labels[i].label == proprietaAttuale) {
                                                                // console.log("uguali");
                                                                index = i;
                                                                break;
                                                            }
                                                        }
                                                        //label[l][h].classList.remove('visibility-hidden');

                                                        scope.labels[index].value = label[l][h].innerHTML;
                                                        // label[l][h].innerHTML = '';
                                                        if (!scope.$$phase) {
                                                            scope.$apply();
                                                        }

                                                        console.log("label[l][h]", label[l][h]);
                                                    }

                                                    label[l][h].classList.remove('visibility-hidden');
                                                    if (scope.object.objectId == 10) {
                                                        label[l][h].style.opacity = '0';
                                                    }
                                                    // console.log('visibile');

                                                    rectLabel[l][h].setAttribute('width', (Number(label[l][h].clientWidth + 9)))
                                                    var correzione = (Number(label[l][h].parentNode.clientWidth) - Number(document.getElementById(scope.graphname).clientWidth))
                                                    // console.log('correzione', correzione);
                                                    //console.log('svg clientWidth',Number(label[l][h].parentNode.clientWidth));
                                                    //console.log('Analytics clientWidth',Number(document.getElementById(scope.graphname).clientWidth));
                                                    if (scope.object.objectId != 10) {
                                                        var margineDxLabel = (Number(rectLabel[l][h].parentNode.clientWidth) / 1.514) - (Number(rectLabel[l][h].getAttribute('x')) + Number(rectLabel[l][h].getAttribute('width')))

                                                        //console.log('get X',Number(rectLabel[l][h].getAttribute('x')));

                                                        //console.log('get witdh',Number(rectLabel[l][h].getAttribute('width')));
                                                        //console.log('get clientWidth',Number(rectLabel[l][h].parentNode.clientWidth));
                                                        //console.log();
                                                        //console.log('margineDx',margineDx);
                                                        if (margineDxLabel < 0) {
                                                            //console.log('margineDx',margineDx)
                                                            rectLabel[l][h].setAttribute('x', Number(rectLabel[l][h].getAttribute('x')) + Number(margineDxLabel))
                                                            label[l][h].setAttribute('x', Number(label[l][h].getAttribute('x')) + Number(margineDxLabel))
                                                        }
                                                    }

                                                    // rectLabel[l][h].setAttribute('class', 'vis-graph-group' + l)
                                                    // console.log(temp_style[l][h]);
                                                    rectLabel[l][h].setAttribute('fill', temp_style[l][h].split("fill:")[1]);
                                                    rectLabel[l][h].setAttribute('style', temp_style[l][h]);
                                                    rectLabel[l][h].classList.remove('visibility-hidden');


                                                    //rectLabel[l][h].classList.remove('visibility-hidden');

                                                    labelVisibility.push(label[l][h]);
                                                    rectVisibility.push(rectLabel[l][h]);
                                                } else if (circle[l][h].nodeName == "circle" && (circle[l][h].getAttribute('cx') > relativeX + margine || circle[l][h].getAttribute('cx') < relativeX - margine) && !label[l][h].classList.contains('visibility-hidden')) {
                                                    var tempNode = label[l][h].classList;
                                                    var proprietaAttuale = '';
                                                    // for (var c in tempNode) {
                                                    //     if (tempNode.item(c).indexOf('label-group-') > -1) {
                                                    //         proprietaAttuale = tempNode.item(c).split('label-group-')[1];
                                                    //     }
                                                    // }
                                                    for (var f in tempNode) {
                                                        if (tempNode.item(f).indexOf('label-group-') > -1) {
                                                            proprietaAttuale = tempNode.item(f).split('label-group-')[1];
                                                            // flag_attuale = true;
                                                        } else if (tempNode.item(f).indexOf('vis-label') < 0) {
                                                            proprietaAttuale += " " + tempNode.item(f);
                                                        } else {
                                                            break;
                                                        }
                                                        // }
                                                    }
                                                    circle[l][h].setAttribute('style', temp_style[l][h]);
                                                    if (scope.object.objectId != 10) {
                                                        label[l][h].innerHTML = label[l][h].innerHTML.split(proprietaAttuale)[1];
                                                    }
                                                    label[l][h].classList.add('visibility-hidden');
                                                    rectLabel[l][h].classList.add('visibility-hidden');
                                                }
                                            }
                                        }
                                    }
                                }
                                labelVisibility.sort(function (a, b) {
                                    return Number(a.getAttribute("y")) - Number(b.getAttribute("y"));
                                });
                                rectVisibility.sort(function (a, b) {
                                    return Number(a.getAttribute("y")) - Number(b.getAttribute("y"));
                                });
                                //console.log('labelPost',labelVisibility);
                                //console.log('rectPost',rectVisibility);
                                for (var i = 1; i < labelVisibility.length; i++) {
                                    var delta = Number(labelVisibility[i].getAttribute("y")) - Number(labelVisibility[i - 1].getAttribute("y"));
                                    if (delta < 25) {
                                        labelVisibility[i].setAttribute("y", Number(labelVisibility[i].getAttribute("y")) + (25 - delta));
                                        rectVisibility[i].setAttribute("y", Number(rectVisibility[i].getAttribute("y")) + (25 - delta));
                                    }
                                }
                                labelVisibility = [];
                                rectVisibility = [];
                            });
                            
                            
                            /*elem.addEventListener('touchstart', function () {
                                //console.log('mousedown');
                                flagMouseDown = true;
                                for (var n in circle) {
                                    for (var s in circle[n]) {
                                        //console.log(circle[n][s])
                                        circle[n][s].setAttribute('style', '');
                                        if (!label[n][s].classList.contains('visibility-hidden')) {
                                            label[n][s].classList.add('visibility-hidden');

                                        }
                                        if (!rectLabel[n][s].classList.contains('visibility-hidden')) {
                                            rectLabel[n][s].classList.add('visibility-hidden');
                                        }
                                    }
                                }
                            });
                            elem.addEventListener('touchend', function () {
                                //console.log('mouseup');
                                flagMouseDown = false;
                                //console.log(flagMouseDown);
                            });
                            elem.addEventListener('touchmove', function (e) {
                                console.log('**********mouse-move**********');
                                console.log("e.touches[0].clientX", e.touches[0].clientX);
                                if (!flagMouseDown) {
                                    var margine = 0.3;
                                    var contentGraph = document.getElementsByClassName('vis-line-graph').item(0).firstChild;
                                    var contentOnlyGraph = document.getElementsByClassName('vis-panel vis-center').item(0)
                                    var positionTime = e.touches[0].clientX - (self.getPosition(contentOnlyGraph).x);
                                    var posizione = self.getPosition(contentGraph);
                                    var relativeX = e.touches[0].clientX - posizione.x;
                                    var relativeY = e.touches[0].clientY - posizione.y;
                                    var n = document.getElementsByClassName('vis-point');
                                    var tempMedia = 0;
                                    console.log('positionTime', positionTime);
                                    if (!document.getElementById('cursorTime')) {
                                        //inserimento cerchio sul mouse
                                        var xmlns = "http://www.w3.org/2000/svg";
                                        var elemCircleTime = document.createElementNS(xmlns, "rect");
                                        elemCircleTime.setAttributeNS(null, "x", relativeX - 4);
                                        //elemCircleTime.setAttributeNS(null,"y",relativeY-5);
                                        elemCircleTime.setAttribute('id', 'cursorTime');
                                        elemCircleTime.setAttribute('style', 'width: 3px;height: 100%;fill: rgb(255, 0, 0);fill-opacity: 0.4;');
                                        n.item(0).parentNode.insertBefore(elemCircleTime, n.item(0).parentNode.firstChild)
                                        var elemTextTime = document.createElementNS(xmlns, "text");
                                        elemTextTime.setAttributeNS(null, "x", relativeX);
                                        elemTextTime.setAttributeNS(null, "y", relativeY);
                                        elemTextTime.setAttribute('id', 'cursorTextTime');
                                        n.item(0).parentNode.appendChild(elemTextTime);
                                    } else {
                                        document.getElementById('cursorTime').setAttribute('x', relativeX - 4)
                                        document.getElementById('cursorTextTime').setAttribute('x', relativeX + 10)
                                        document.getElementById('cursorTextTime').setAttribute('y', relativeY - 5)
                                        //console.log("e.clientX: ", e.clientX);
                                        var x = (endTime - startTime) / (Number(document.getElementsByClassName('vis-panel vis-center').item(0).clientWidth));
                                        var y = parseInt(startTime + (x * (positionTime)));
                                        // console.log("document.getElementsByClassName('vis-panel vis-center').item(1))",document.getElementsByClassName('vis-panel vis-center').item(0));
                                        console.log("startTime:",startTime);
                                        console.log("positionTime: ",positionTime);
                                        // console.log("x: ",x);
                                        // console.log("y: ",y);
                                        var d = new Date(y);
                                        // console.log("d: ",d);
                                        var h = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
                                        var m = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
                                        var s = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
                                        //console.log('h',h,'m',m);
                                        scope.time = h + ':' + m + ':' + s;
                                        if (scope.object.objectId != 10) {
                                            document.getElementById('cursorTextTime').innerHTML = h + ':' + m + ':' + s;

                                        }
                                        if (!scope.$$phase) {
                                            scope.$apply();
                                        }
                                    }

                                    var cursorTextTime = document.getElementById('cursorTextTime')
                                    var margineDxTime = (Number(cursorTextTime.parentNode.clientWidth) / 1.514) - (Number(cursorTextTime.getAttribute('x')) + Number(cursorTextTime.clientWidth))
                                    //console.log('get X',Number(rectLabel[l][h].getAttribute('x')));

                                    //console.log('get witdh',Number(rectLabel[l][h].getAttribute('width')));
                                    //console.log('get clientWidth',Number(rectLabel[l][h].parentNode.clientWidth));
                                    //console.log();
                                    //console.log('margineDx',margineDx);
                                    if (margineDxTime < 0) {
                                        //console.log('margineDx',margineDx)
                                        cursorTextTime.setAttribute('x', Number(cursorTextTime.getAttribute('x')) - (Number(cursorTextTime.clientWidth) + 20))
                                        //label[l][h].setAttribute('x', Number(label[l][h].getAttribute('x'))+Number(margineDxTime))
                                    }

                                    for (var s in circle) {
                                        for (var h in circle[s]) {
                                            if (circle[s][h].nodeName == "circle" && h != 0) {
                                                tempMedia = circle[s][h].getAttribute('cx') - circle[s][h - 1].getAttribute('cx');
                                                if (margine < tempMedia) {
                                                    margine = tempMedia;
                                                }
                                            }
                                        }
                                    }
                                    if (margine > 1) {
                                        margine = 3;
                                        for (var l in circle) {
                                            for (var h in circle[l]) {
                                                if (circle[l][h].nodeName == "circle" && (circle[l][h].getAttribute('cx') < relativeX + margine && circle[l][h].getAttribute('cx') > relativeX - margine) && label[l][h].classList.contains('visibility-hidden') && document.getElementById(label[l][h].getAttribute('id'))) {
                                                    var tempNode = label[l][h].classList;
                                                    // console.log("classlist",tempNode);
                                                    // console.log("className",className);
                                                    var proprietaAttuale = '';
                                                    // var flag_attuale = false;
                                                    for (var f in tempNode) {
                                                        if (tempNode.item(f).indexOf('label-group-') > -1) {
                                                            proprietaAttuale = tempNode.item(f).split('label-group-')[1];
                                                            // flag_attuale = true;
                                                        } else if (tempNode.item(f).indexOf('vis-label') < 0) {
                                                            proprietaAttuale += " " + tempNode.item(f);
                                                        } else {
                                                            break;
                                                        }
                                                        // }
                                                    }
                                                    temp_style[l][h] = circle[l][h].getAttribute("style");
                                                    rectLabel[l][h].setAttribute('x', (Number(label[l][h].getAttribute('x')) - 5))
                                                    rectLabel[l][h].setAttribute('y', (Number(label[l][h].getAttribute('y')) - 13))
                                                    if (scope.object.objectId != 10) {
                                                        // console.log("proprietaAttuale: ",proprietaAttuale);
                                                        label[l][h].innerHTML = proprietaAttuale + ' ' + label[l][h].innerHTML;
                                                    }
                                                    // label[l][h].setAttribute("style",temp_style[l][h]+";fill-opacity: 0.8")
                                                    // label[l][h].setAttribute('fill', temp_style[l][h].split("fill:")[1]);
                                                    // label[l][h].setAttribute('style', temp_style[l][h].split("fill")[0]);
                                                    //console.log('fill ',circle[l][h].style.fill);

                                                    circle[l][h].setAttribute('style', 'fill:#DE0000; stroke:#DE0000; stroke-width:6px; z-index:-1;')


                                                    if (scope.object.objectId == 10) {
                                                        //prima era così
                                                        //label[l][h].classList.remove('visibility-hidden');
                                                        var index = undefined;
                                                        for (var i in scope.labels) {
                                                            // console.log(scope.labels[i].label, "==", proprietaAttuale);
                                                            if (scope.labels[i].label == proprietaAttuale) {
                                                                // console.log("uguali");
                                                                index = i;
                                                                break;
                                                            }
                                                        }
                                                        //label[l][h].classList.remove('visibility-hidden');

                                                        scope.labels[index].value = label[l][h].innerHTML;
                                                        // label[l][h].innerHTML = '';
                                                        if (!scope.$$phase) {
                                                            scope.$apply();
                                                        }

                                                        console.log("label[l][h]", label[l][h]);
                                                    }

                                                    label[l][h].classList.remove('visibility-hidden');
                                                    if (scope.object.objectId == 10) {
                                                        label[l][h].style.opacity = '0';
                                                    }
                                                    // console.log('visibile');

                                                    rectLabel[l][h].setAttribute('width', (Number(label[l][h].clientWidth + 9)))
                                                    var correzione = (Number(label[l][h].parentNode.clientWidth) - Number(document.getElementById(scope.graphname).clientWidth))
                                                    // console.log('correzione', correzione);
                                                    //console.log('svg clientWidth',Number(label[l][h].parentNode.clientWidth));
                                                    //console.log('Analytics clientWidth',Number(document.getElementById(scope.graphname).clientWidth));
                                                    if (scope.object.objectId != 10) {
                                                        var margineDxLabel = (Number(rectLabel[l][h].parentNode.clientWidth) / 1.514) - (Number(rectLabel[l][h].getAttribute('x')) + Number(rectLabel[l][h].getAttribute('width')))

                                                        //console.log('get X',Number(rectLabel[l][h].getAttribute('x')));

                                                        //console.log('get witdh',Number(rectLabel[l][h].getAttribute('width')));
                                                        //console.log('get clientWidth',Number(rectLabel[l][h].parentNode.clientWidth));
                                                        //console.log();
                                                        //console.log('margineDx',margineDx);
                                                        if (margineDxLabel < 0) {
                                                            //console.log('margineDx',margineDx)
                                                            rectLabel[l][h].setAttribute('x', Number(rectLabel[l][h].getAttribute('x')) + Number(margineDxLabel))
                                                            label[l][h].setAttribute('x', Number(label[l][h].getAttribute('x')) + Number(margineDxLabel))
                                                        }
                                                    }

                                                    // rectLabel[l][h].setAttribute('class', 'vis-graph-group' + l)
                                                    // console.log(temp_style[l][h]);
                                                    rectLabel[l][h].setAttribute('fill', temp_style[l][h].split("fill:")[1]);
                                                    rectLabel[l][h].setAttribute('style', temp_style[l][h]);
                                                    rectLabel[l][h].classList.remove('visibility-hidden');


                                                    //rectLabel[l][h].classList.remove('visibility-hidden');

                                                    labelVisibility.push(label[l][h]);
                                                    rectVisibility.push(rectLabel[l][h]);
                                                } else if (circle[l][h].nodeName == "circle" && (circle[l][h].getAttribute('cx') > relativeX + margine || circle[l][h].getAttribute('cx') < relativeX - margine) && !label[l][h].classList.contains('visibility-hidden')) {
                                                    var tempNode = label[l][h].classList;
                                                    var proprietaAttuale = '';
                                                    // for (var c in tempNode) {
                                                    //     if (tempNode.item(c).indexOf('label-group-') > -1) {
                                                    //         proprietaAttuale = tempNode.item(c).split('label-group-')[1];
                                                    //     }
                                                    // }
                                                    for (var f in tempNode) {
                                                        if (tempNode.item(f).indexOf('label-group-') > -1) {
                                                            proprietaAttuale = tempNode.item(f).split('label-group-')[1];
                                                            // flag_attuale = true;
                                                        } else if (tempNode.item(f).indexOf('vis-label') < 0) {
                                                            proprietaAttuale += " " + tempNode.item(f);
                                                        } else {
                                                            break;
                                                        }
                                                        // }
                                                    }
                                                    circle[l][h].setAttribute('style', temp_style[l][h]);
                                                    if (scope.object.objectId != 10) {
                                                        label[l][h].innerHTML = label[l][h].innerHTML.split(proprietaAttuale)[1];
                                                    }
                                                    label[l][h].classList.add('visibility-hidden');
                                                    rectLabel[l][h].classList.add('visibility-hidden');
                                                }
                                            }
                                        }
                                    }
                                }
                                labelVisibility.sort(function (a, b) {
                                    return Number(a.getAttribute("y")) - Number(b.getAttribute("y"));
                                });
                                rectVisibility.sort(function (a, b) {
                                    return Number(a.getAttribute("y")) - Number(b.getAttribute("y"));
                                });
                                //console.log('labelPost',labelVisibility);
                                //console.log('rectPost',rectVisibility);
                                for (var i = 1; i < labelVisibility.length; i++) {
                                    var delta = Number(labelVisibility[i].getAttribute("y")) - Number(labelVisibility[i - 1].getAttribute("y"));
                                    if (delta < 25) {
                                        labelVisibility[i].setAttribute("y", Number(labelVisibility[i].getAttribute("y")) + (25 - delta));
                                        rectVisibility[i].setAttribute("y", Number(rectVisibility[i].getAttribute("y")) + (25 - delta));
                                    }
                                }
                                labelVisibility = [];
                                rectVisibility = [];
                            });*/
                        }
                    }, 0);
                    //***set_methods***
                    this.setReady = function (value) {
                        if (typeof(value) === "boolean" && value != undefined) {
                            ready = value;
                            return true;
                        }
                        else {
                            return false;
                        }
                    };
                    //***get_methods***
                    this.getReady = function () {
                        return ready;
                    };
                    //***attrsCheckermethod***//checks the attributes, if defined and well written, then start a timeout before calling the infoRetriever method
                    var self = this;
                    this.attrsChecker = function () {
                        var e;
                        if (typeof attrInterval != "undefined") {
                            clearTimeout(attrInterval);
                        }
                        console.log("***attrsChecker()***");
                        ready = false; //shows the loading wheel
                        // console.log("attrs.date: ",attrs.date);
                        try {
                            if (attrs.hasOwnProperty("date") && attrs.date != "") {//checks date
                                try {
                                    var json = JSON.parse(attrs.date.replace(/'/g, "\""));
                                    // console.log("attrs.date", json);
                                    if (json instanceof Array) {
                                        var arrayDate = [[]];
                                        for (var i in json) {
                                            arrayDate[i] = json[i].split("-");
                                            console.log("arrayDate[i]: ", arrayDate[i]);
                                        }
                                    }
                                    else {
                                        arrayDate = json.split("-");
                                    }
                                } catch (er) {
                                    // console.log("-----------");
                                    // console.log("er: ", er);
                                    var arrayDate = [];
                                    arrayDate = attrs.date.split("-");
                                }
                            } else {
                                var dt = new Date();
                                // // var arrayDate=dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
                                var arrayDate = [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()];
                                // throw e = "No Date";
                            }
                            if (attrs.hasOwnProperty("target") && attrs.target != "") {//checks target
                                if (Number(attrs.target) < 0) {
                                    throw e = "Seleziona un oggetto";
                                }
                                var objectId = attrs.target;

                            } else {
                                var objectId = scope.object.objectId;
                                // console.log("objectId: ", scope.object.objectId);
                            }
                            if (attrs.hasOwnProperty("type") && attrs.type != "") {//checks type
                                var type = attrs.type.split("-");
                                if (Number(type[1]) < 15) {
                                    type[1] = "15";
                                }
                            }
                            else {
                                var type = "punctual";
                            }
                            if (attrs.hasOwnProperty("legend") && attrs.legend != "") {//checks legend
                                var legend = true;
                            } else {
                                var legend = false;
                            }
                            var plot = [];
                            var labelArray = [];
                            console.log("addObject", scope.addObject);
                            console.log("plot", attrs.plot.replace(/'/g, "\""));

                            try {//checks plot
                                // console.log("plot",attrs.plot.replace(/'/g, "\""));
                                var json = JSON.parse(attrs.plot.replace(/'/g, "\""));
                                for (var i in json) {
                                    plot.push(i);
                                    labelArray.push(json[i]);
                                }
                                // for (var i in plot) {
                                //     labelArray.push(scope.addObject.propertiesAdditionalInfo[plot[i]].label ? scope.addObject.propertiesAdditionalInfo[plot[i]].label : scope.addObject.propertiesAdditionalInfo[plot[i]].labelon + "/" + scope.addObject.propertiesAdditionalInfo[plot[[i]]].labeloff);
                                // }
                            } catch (err) {
                                plot = attrs.plot.split(",");
                                // for (var j in scope.addObject) {
                                //     console.log(j);
                                //     for (var i in scope.addObject[j]) {
                                //         console.log(i);
                                //     }
                                // }
                                console.log(scope.addObject);
                                for (var i in plot) {
                                    labelArray.push(scope.addObject.propertiesAdditionalInfo[plot[i]].label ? scope.addObject.propertiesAdditionalInfo[plot[i]].label : scope.addObject.propertiesAdditionalInfo[plot[i]].labelon + "/" + scope.addObject.propertiesAdditionalInfo[plot[[i]]].labeloff);
                                    // labelArray.push(plot[i]);
                                }
                                // for (var i in plot) {
                                //     labelArray.push(plot[i]);
                                // }
                            }
                            // console.log("plot: ", plot)
                            if (plot.length == 0) {
                                // console.log("attrs.plot:", attrs.plot);
                                throw e = "No properties to plot";
                            }
                        } catch (e) {
                            console.log("C'è stato un errore in AttrsChecker: ", e);
                        }
                        if (typeof e == "undefined") {
                            // console.log("date :", arrayDate);
                            console.log("type :", type);
                            console.log("plot :", plot);
                            console.log("labelArray :", labelArray);
                            console.log("target :", objectId);
                            attrInterval = setTimeout(function () {
                                console.log("Calling Info Retriever");
                                self.infoRetriever(arrayDate, type, plot, labelArray, objectId);

                            }, timeoutTime);
                        }
                    };

                    //***infoRetriever method***
                    // requires the log service and according to the attributes input, it requests to the LOG sql db the needed data
                    // after it manipulates them to make the vis module capable of using it. After it creates the graph

                    this.infoRetriever = function (dates, type, plot, labelArray, objectId) {
                        scope.labels = [];
                        $http.get("/apio/user/getSession", {timeout: deferredAbort.promise}).success(function (session) {
                            scope.loggedUser = session;
                            // console.log("session: ", session);
                            $http.get("/apio/getService/log", {timeout: deferredAbort.promise}).success(function (service) {
                                // console.log("log");
                                if (dates instanceof Array && dates[0] instanceof Array) {
                                    arrayDate = [];
                                    for (var i in dates) {
                                        arrayDate[i] = new Date(Number(dates[i][0]), Number(dates[i][1]) - 1, Number(dates[i][2]));
                                    }
                                    if (dates.length == 2) {
                                        var numberOfDays = (arrayDate[1] - arrayDate[0]) / 1000 / 60 / 60 / 24;
                                        // console.log("Numberofdays :", numberOfDays);
                                        // console.log("period");
                                    } else if (dates.length == 4) {
                                        var numberOfDays = (arrayDate[3] - arrayDate[0]) / 1000 / 60 / 60 / 24;
                                        // console.log("Numberofdays :", numberOfDays);
                                        // console.log("2 periods");
                                        var from = JSON.stringify([dates[0][0] + "-" + dates[0][1] + "-" + dates[0][2], dates[2][0] + "-" + dates[2][1] + "-" + dates[2][2]]);
                                        var until = JSON.stringify([dates[1][0] + "-" + dates[1][1] + "-" + dates[1][2], dates[3][0] + "-" + dates[3][1] + "-" + dates[3][2]]);
                                    }
                                } else {
                                    console.log("single_date");

                                }
                                for (var i in plot) {
                                    scope.labels.push({property: plot[i], label: labelArray[i]});
                                }
                                var selector;
                                if (type == "punctual" && (dates.length == 1 || !(dates[0] instanceof Array))) {
                                    selector = 1
                                } else if ((type[0] == "avg" || type[0] == "sum") && (dates.length == 1 || !(dates[0] instanceof Array))) {
                                    selector = 2
                                } else if (type == "punctual" && dates.length == 2) {
                                    selector = 3
                                } else if ((type[0] == "avg" || type[0] == "sum") && dates.length == 2) {
                                    selector = 4
                                } else if (type == "punctual" && dates.length == 4) {
                                    selector = 5
                                } else if ((type[0] == "avg" || type[0] == "sum") && dates.length == 4) {
                                    selector = 6
                                }
                                // console.log("selector : ", selector);
                                var query;
                                // console.log("labelArray", labelArray);
                                if (selector == 1) {
                                    // query = "/apio/service/log/route/" + encodeURIComponent("/apio/log/getByDate/objectId/" + objectId + "/date/" + dates[0] + "-" + dates[1] + "-" + dates[2]);
                                    query = "/apio/service/log/route/" + encodeURIComponent("/apio/log/getByRange/objectId/" + objectId + "/from/" + dates[0] + "-" + dates[1] + "-" + dates[2] + "/daysNumber/" + 0 + "/properties/" + JSON.stringify(plot));

                                }
                                if (selector == 2) {
                                    // query = "/apio/service/log/route/" + encodeURIComponent("/apio/log/getSumFileByDate/objectId/" + objectId + "/date/" + dates[0] + "-" + dates[1] + "-" + dates[2]);
	                                    query = "/apio/service/log/route/" + encodeURIComponent("/apio/log/getSumFileByRange/objectId/" + objectId + "/from/" + dates[0] + "-" + dates[1] + "-" + dates[2] + "/daysNumber/" + 0 + "/properties/" + JSON.stringify(plot) + "/type/" + type[0] + "/timing/" + type[1]);

                                }
                                if (selector == 3 || selector == 5) {
                                    query = "/apio/service/log/route/" + encodeURIComponent("/apio/log/getByRange/objectId/" + objectId + "/from/" + dates[0][0] + "-" + dates[0][1] + "-" + dates[0][2] + "/daysNumber/" + numberOfDays + "/properties/" + JSON.stringify(plot));
                                }
                                if (selector == 4) {
                                    query = "/apio/service/log/route/" + encodeURIComponent("/apio/log/getSumFileByRange/objectId/" + objectId + "/from/" + dates[0][0] + "-" + dates[0][1] + "-" + dates[0][2] + "/daysNumber/" + numberOfDays + "/properties/" + JSON.stringify(plot) + "/type/" + type[0] + "/timing/" + type[1]);
                                }
                                if (selector == 6) {
                                    query = "/apio/service/log/route/" + encodeURIComponent("/apio/log/getSumFileByRange/objectId/" + objectId + "/from/" + from + "/until/" + until + "/properties/" + JSON.stringify(plot) + "/type/" + type[0] + "/timing/" + type[1]);
                                }


                                console.log("query :", query);
                                $http.get(query, {timeout: deferredAbort.promise}).success(function (file) {
                                    /*for (var i in file){//prints the results
                                     console.log("file[" + i + "]: ",file[i]);
                                     for (var j in file[i]){
                                     console.log("file[" + i + "][" + j + "]: ",file[i][j]);
                                     }
                                     }*/
                                    // console.log("file: ", file);
                                    var container = document.getElementById(scope.graphname);
                                    //container.innerHTML = "";
                                    var end = undefined, start = undefined;
                                    var groups = new vis.DataSet(), items = [];
                                    var groupExists = function (id) {
                                        for (var i in groups._data) {
                                            if (groups._data[i].id === id) {
                                                return true;
                                            }
                                        }
                                        return false;
                                    };
                                    var parseDate = function (d, addSeconds, addDate) {
                                        var date = new Date(Number(d));
                                        var date_ = "";
                                        if (addDate === true) {
                                            date_ += (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + "-" + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + date.getFullYear() + " ; ";
                                        }
                                        date_ += (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
                                        if (addSeconds === true) {
                                            date_ += ":" + (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
                                        }
                                        return date_;
                                    };
                                    if (selector == 1) {//caso 1
                                        for (var i in file) {
                                            if (plot.indexOf(i) > -1) {
                                                for (var j in file[i]) {
                                                    var ts = Number(j), temp_date = new Date(ts);
                                                    /*
                                                     if (end === undefined) {
                                                     end = ts;
                                                     }

                                                     if (start === undefined) {
                                                     start = ts;
                                                     }

                                                     if (ts > end) {
                                                     end = ts;
                                                     } else if (ts < start) {
                                                     start = ts;
                                                     }*/


                                                    if (!groupExists(i)) {
                                                        groups.add({
                                                            content: labelArray[plot.indexOf(i)],
                                                            id: i,
                                                            options: {
                                                                shaded: {
                                                                    orientation: "bottom"
                                                                }
                                                            }
                                                        });
                                                    }

                                                    items.push({
                                                        group: i,
                                                        label: {
                                                            className: "visibility-hidden label-group-" + labelArray[plot.indexOf(i)],
                                                            content: Number(file[i][j].replace(",", ".")).toFixed(1),
                                                            xOffset: -10 / 3 * Number(file[i][j].replace(",", ".")).toFixed(1).length,
                                                            yOffset: 20
                                                        },
                                                        x: temp_date,
                                                        y: Number(file[i][j].replace(",", "."))
                                                    });
                                                }
                                            }
                                        }
                                        start = new Date(dates[0], dates[1] - 1, dates[2], 0, 0, 0).getTime();
                                        end = new Date(dates[0], dates[1] - 1, dates[2], 0, 1440, 0).getTime();
                                        //console.log(items);
                                        /*var minDate = undefined, minLength = undefined;
                                         for (var i in items) {
                                         if (minDate === undefined || items[i].x.getTime() <= minDate) {
                                         minDate = items[i].x.getTime();
                                         if (minLength === undefined || items[i].label.content.length < minLength) {
                                         minLength = items[i].label.content.length
                                         }
                                         }
                                         }*/
                                    }
                                    // if (selector == 2) {//caso 2
                                    //     var fn = type[0];
                                    //     var timing = Number(type[1]);
                                    //     var year = Number(dates[0]), month = Number(dates[1]) - 1, day = Number(dates[2]);
                                    //     var GD = [], now = new Date().getTime();
                                    //     var start = new Date(year, month, day, 0, 0, 0, 0).getTime();
                                    //     var end = new Date(year, month, day, 0, 1440, 0, 0).getTime();
                                    //
                                    //     for (var i = 0; i < 1440; i += timing) {
                                    //         var t = new Date(year, month, day, 0, i, 0, 0).getTime();
                                    //         var flag = true;
                                    //         for (var j in file) {
                                    //             if (j.indexOf("count") == -1 && plot.indexOf(j) != -1) {
                                    //                 for (k in file[j]) {
                                    //                     if (t <= now && flag && k >= t && k < t + timing * 60000) {
                                    //                         flag = false;
                                    //                         GD.push({
                                    //                             date: parseDate(t),
                                    //                             timestamp: t
                                    //                         });
                                    //                     }
                                    //                 }
                                    //             }
                                    //         }
                                    //     }
                                    //
                                    //     for (var i in file) {
                                    //         for (var j in file[i]) {
                                    //             for (var k = 0; k < GD.length; k++) {
                                    //                 if (k === GD.length - 1) {
                                    //                     var nextDay = new Date(year, month, day + 1, 0, 0, 0, 0).getTime();
                                    //                     if (Number(j) >= Number(GD[k].timestamp) && Number(j) < Number(nextDay)) {
                                    //                         if (typeof GD[k][i] === "undefined") {
                                    //                             if (fn === "sum" || fn === "avg") {
                                    //                                 GD[k][i] = Number(file[i][j].replace(",", "."));
                                    //                             }
                                    //                         } else {
                                    //                             if (fn === "sum" || fn === "avg") {
                                    //                                 GD[k][i] += Number(file[i][j].replace(",", "."));
                                    //                             }
                                    //                         }
                                    //                     }
                                    //                 } else {
                                    //                     if (Number(j) >= Number(GD[k].timestamp) && Number(j) < Number(GD[k + 1].timestamp)) {
                                    //                         if (typeof GD[k][i] === "undefined") {
                                    //                             if (fn === "sum" || fn === "avg") {
                                    //                                 GD[k][i] = Number(file[i][j].replace(",", "."));
                                    //                             }
                                    //                         } else {
                                    //                             if (fn === "sum" || fn === "avg") {
                                    //                                 GD[k][i] += Number(file[i][j].replace(",", "."));
                                    //                             }
                                    //                         }
                                    //                     }
                                    //                 }
                                    //             }
                                    //         }
                                    //     }
                                    //
                                    //     for (var i in plot) {
                                    //         for (var j in GD) {
                                    //             if (!GD[j].hasOwnProperty(plot[i])) {
                                    //                 GD[j][plot[i]] = 0;
                                    //                 if (fn === "avg") {
                                    //                     GD[j]["count" + plot[i]] = 1;
                                    //                 }
                                    //             }
                                    //         }
                                    //     }
                                    //
                                    //     if (fn === "avg") {
                                    //         for (var i in GD) {
                                    //             var keys = Object.keys(GD[i]);
                                    //             for (var j in keys) {
                                    //                 var key = Object.keys(GD[i])[j];
                                    //                 if (key.indexOf("count") === -1 && key !== "date" && key !== "timestamp") {
                                    //                     if (GD[i]["count" + key] == 0) {
                                    //                         GD[i][key] /= (GD[i]["count" + key] + 1);
                                    //                     } else {
                                    //                         GD[i][key] /= GD[i]["count" + key];
                                    //                     }
                                    //                 }
                                    //             }
                                    //         }
                                    //     }
                                    //     for (var i in plot) {
                                    //         groups.add({
                                    //             content: labelArray[i],
                                    //             id: plot[i],
                                    //             options: {
                                    //                 shaded: {
                                    //                     orientation: "bottom"/*,
                                    //                      style:"fill:orange;"*/
                                    //
                                    //                 }/*,
                                    //                  drawPoints:{
                                    //                  styles:"stroke:orange; fill:orange;"
                                    //                  }*/
                                    //             }/*,
                                    //              style:"stroke:orange"*/
                                    //         });
                                    //
                                    //         for (var j in GD) {
                                    //             items.push({
                                    //                 group: plot[i],
                                    //                 label: {
                                    //                     className: "visibility-hidden label-group-" + plot[i],
                                    //                     content: GD[j][plot[i]].toFixed(1),
                                    //                     xOffset: -10 / 3 * GD[j][plot[i]].toFixed(1).length,
                                    //                     yOffset: 20
                                    //                 },
                                    //                 x: new Date(GD[j].timestamp),
                                    //                 y: GD[j][plot[i]]
                                    //             });
                                    //         }
                                    //     }
                                    //     // console.log("GD: ", GD);
                                    //
                                    //     /*var minLength = undefined;
                                    //      for (var i in plot) {
                                    //      if (minLength === undefined || GD[0][plot[i]].toFixed(1).length < minLength) {
                                    //      minLength = GD[0][plot[i]].toFixed(1).length;
                                    //      }
                                    //      }*/
                                    // }
                                    if (selector == 3) {//caso 3
                                        for (var i in file) {
                                            if (plot.indexOf(i) > -1) {
                                                for (var j in file[i]) {
                                                    var ts = Number(j), temp_date = new Date(ts);

                                                    /*if (end === undefined) {
                                                     end = ts;
                                                     }

                                                     if (start === undefined) {
                                                     start = ts;
                                                     }

                                                     if (ts > end) {
                                                     end = ts;
                                                     } else if (ts < start) {
                                                     start = ts;
                                                     }*/

                                                    if (!groupExists(i)) {
                                                        groups.add({
                                                            content: labelArray[plot.indexOf(i)],
                                                            id: i,
                                                            options: {
                                                                shaded: {
                                                                    orientation: "bottom"
                                                                }
                                                            }
                                                        });
                                                    }

                                                    items.push({
                                                        group: i,
                                                        label: {
                                                            className: "visibility-hidden label-group-" + labelArray[plot.indexOf(i)],
                                                            content: Number(file[i][j].replace(",", ".")).toFixed(1),
                                                            xOffset: -10 / 3 * Number(file[i][j].replace(",", ".")).toFixed(1).length,
                                                            yOffset: 20
                                                        },
                                                        x: temp_date,
                                                        y: Number(file[i][j].replace(",", "."))
                                                    });
                                                }
                                            }
                                        }
                                        // console.log(items);
                                        start = new Date(dates[0][0], dates[0][1] - 1, dates[0][2], 0, 0, 0).getTime();
                                        end = new Date(dates[1][0], dates[1][1] - 1, dates[1][2], 0, 1440, 0).getTime();

                                        /*var minDate = undefined, minLength = undefined;
                                         for (var i in items) {
                                         if (minDate === undefined || items[i].x.getTime() <= minDate) {
                                         minDate = items[i].x.getTime();
                                         if (minLength === undefined || items[i].label.content.length < minLength) {
                                         minLength = items[i].label.content.length
                                         }
                                         }
                                         }*/
                                    }
                                    if (selector == 2 || selector == 4) {//caso 2/4
                                        // console.log("file: ",file);
                                        // var fn = type[0];
                                        // var timing = Number(type[1]);

                                        if (typeof dates[0] == "object") {
                                            var year1 = Number(dates[1][0]), month1 = Number(dates[1][1]) - 1, day1 = Number(dates[1][2]);
                                            var year0 = Number(dates[0][0]), month0 = Number(dates[0][1]) - 1, day0 = Number(dates[0][2]);
                                            var start = new Date(year0, month0, day0, 0, 0, 0, 0).getTime();
                                            var end = new Date(year1, month1, day1, 0, 1440, 0, 0).getTime();
                                        } else {
                                            var year0 = Number(dates[0]), month0 = Number(dates[1]) - 1, day0 = Number(dates[2]);
                                            var start = new Date(year0, month0, day0, 0, 0, 0, 0).getTime();
                                            var end = new Date(year0, month0, day0, 24, 0, 0, 0).getTime();

                                        }
                                        // console.log("start: ", new Date(year0, month0, day0, 0, 0, 0, 0));
                                        // console.log("end: ", new Date(year1, month1, day1, 0, 1440, 0, 0));
                                        // var now = new Date().getTime();
                                        // for (var i = 0; i < 1440*(new Date(year1, month1, day1, 0, 1440, 0, 0).getDate()-new Date(year0, month0, day0, 0, 0, 0, 0).getDate()+1); i += timing) {
                                        // 	var t0 = new Date(year0, month0, day0, 0, i, 0, 0).getTime();
                                        // 	//var t1 = new Date(year1, month1, day1, 0, i, 0, 0).getTime();
                                        // 	var flag0= true;
                                        // 	//var flag1= true;
                                        // 	for (var j in file) {
                                        // 		//scorre i vari valori da plottare e prende solo quelli che non sono di tipo count.. e quelli da plottare
                                        // 		if (j.indexOf("count") == -1 && plot.indexOf(j)!=-1) {
                                        // 			// console.log("plot: ",j);
                                        // 			for (var k in file[j]) {
                                        // 				// console.log("k: ",k);
                                        // 				if (t0 <= now && flag0 && k >= t0 && k< t0+timing*60000) {
                                        // 					// console.log(2);
                                        // 					flag0=false;
                                        // 					GD.push({
                                        // 						date: parseDate(t0),
                                        // 						timestamp: t0
                                        // 					});
                                        // 				}
                                        // 				/*if (t1 <= now && flag1 && k >= t1 && k< t1+timing*60000) {
                                        // 					flag1=false;
                                        // 					GD.push({
                                        // 						date: parseDate(t1),
                                        // 						timestamp: t1
                                        // 					});
                                        // 				}*/
                                        // 			}
                                        // 			break;
                                        // 		}
                                        // 	}
                                        //
                                        // }
                                        // console.log(1);
                                        // GD.sort(function (a, b) {
                                        // 	return a.timestamp - b.timestamp;
                                        // });
                                        // for (var i in file) {
                                        // 	for (var j in file[i]) {
                                        // 		for (var k = 0; k < GD.length; k++) {
                                        // 			if (k === GD.length - 1) {
                                        // 				var nextDay = new Date(year1, month1, day1 + 1, 0, 0, 0, 0).getTime();
                                        // 				if (Number(j) >= Number(GD[k].timestamp) && Number(j) < Number(nextDay)) {
                                        // 					if (typeof GD[k][i] === "undefined") {
                                        // 						if (fn === "sum" || fn === "avg") {
                                        // 							GD[k][i] = Number(file[i][j].replace(",", "."));
                                        // 						}
                                        // 					} else {
                                        // 						if (fn === "sum" || fn === "avg") {
                                        // 							GD[k][i] += Number(file[i][j].replace(",", "."));
                                        // 						}
                                        // 					}
                                        // 				}
                                        // 			} else {
                                        // 				if (Number(j) >= Number(GD[k].timestamp) && Number(j) < Number(GD[k + 1].timestamp)) {
                                        // 					if (typeof GD[k][i] === "undefined") {
                                        // 						if (fn === "sum" || fn === "avg") {
                                        // 							GD[k][i] = Number(file[i][j].replace(",", "."));
                                        // 						}
                                        // 					} else {
                                        // 						if (fn === "sum" || fn === "avg") {
                                        // 							GD[k][i] += Number(file[i][j].replace(",", "."));
                                        // 						}
                                        // 					}
                                        // 				}
                                        // 			}
                                        // 		}
                                        // 	}
                                        // }
                                        var GD = file;
                                        delete file;
                                        // console.log(3);
                                        /*for (var i in plot) {
                                         for (var j in GD) {
                                         if (!GD[j].hasOwnProperty(plot[i])) {
                                         GD[j][plot[i]] = 0;
                                         if (fn === "avg") {
                                         GD[j]["count" + plot[i]] = 1;
                                         }
                                         }
                                         }
                                         }*/

                                        // if (fn === "avg") {
                                        //     for (var i in GD) {
                                        //         var keys = Object.keys(GD[i]);
                                        //         for (var j in keys) {
                                        //             var key = Object.keys(GD[i])[j];
                                        //             if (key.indexOf("count") === -1 && key !== "date" && key !== "timestamp") {
                                        //                 if (GD[i]["count" + key] == 0) {
                                        //                     GD[i][key] /= (GD[i]["count" + key] + 1);
                                        //                 } else {
                                        //                     GD[i][key] /= GD[i]["count" + key];
                                        //                 }
                                        //             }
                                        //         }
                                        //     }
                                        // }
                                        for (var i in plot) {
                                            groups.add({
                                                content: labelArray[i],
                                                id: plot[i],
                                                options: {
                                                    shaded: {
                                                        orientation: "bottom"
                                                    }
                                                }
                                            });

                                            for (var j in GD) {
                                                if (GD[j].hasOwnProperty(plot[i])) {
                                                    items.push({
                                                        group: plot[i],
                                                        label: {
                                                            className: "visibility-hidden label-group-" + labelArray[i],
                                                            content: GD[j][plot[i]].toFixed(1),
                                                            xOffset: -10 / 3 * GD[j][plot[i]].toFixed(1).length,
                                                            yOffset: 20
                                                        },
                                                        x: new Date(GD[j].timestamp),
                                                        y: Number(String(GD[j][plot[i]]).replace(",", "."))
                                                    });
                                                }
                                            }
                                        }

                                        /*var minLength = undefined;
                                         for (var i in plot) {
                                         if (minLength === undefined || GD[0][plot[i]].toFixed(1).length < minLength) {
                                         minLength = GD[0][plot[i]].toFixed(1).length;
                                         }
                                         }*/
                                    }
                                    if (selector == 5) {//caso 5
                                        var zeroComponents = dates[0];
                                        var oneComponents = dates[1];
                                        var twoComponents = dates[2];
                                        var threeComponents = dates[3];

                                        var zeroComponentsDate = new Date(Number(zeroComponents[0]), Number(zeroComponents[1]) - 1, Number(zeroComponents[2]));
                                        var oneComponentsDate = new Date(Number(oneComponents[0]), Number(oneComponents[1]) - 1, Number(oneComponents[2]));
                                        var firstPeriodNumberOfDays = (oneComponentsDate - zeroComponentsDate) / 1000 / 60 / 60 / 24;
                                        var firstPeriodDatesArr = [zeroComponentsDate.getTime()];
                                        for (var i = 1; i <= firstPeriodNumberOfDays; i++) {
                                            firstPeriodDatesArr.push(new Date(zeroComponentsDate.getTime() + i * 24 * 60 * 60 * 1000).getTime());
                                        }

                                        var twoComponentsDate = new Date(Number(twoComponents[0]), Number(twoComponents[1]) - 1, Number(twoComponents[2]));
                                        var threeComponentsDate = new Date(Number(threeComponents[0]), Number(threeComponents[1]) - 1, Number(threeComponents[2]));
                                        var secondPeriodNumberOfDays = (threeComponentsDate - twoComponentsDate) / 1000 / 60 / 60 / 24;
                                        // console.log(secondPeriodNumberOfDays);
                                        var secondPeriodDatesArr = [twoComponentsDate.getTime()];
                                        for (var i = 1; i <= secondPeriodNumberOfDays; i++) {
                                            secondPeriodDatesArr.push(new Date(twoComponentsDate.getTime() + i * 24 * 60 * 60 * 1000).getTime());
                                        }
                                        var start = undefined;

                                        for (var i = 0; i < Math.max(firstPeriodDatesArr.length, secondPeriodDatesArr.length); i++) {
                                            if (firstPeriodDatesArr.hasOwnProperty(i)) {
                                                if (start === undefined || firstPeriodDatesArr[i] < start) {
                                                    start = firstPeriodDatesArr[i];
                                                }
                                            }

                                            if (secondPeriodDatesArr.hasOwnProperty(i)) {
                                                if (start === undefined || secondPeriodDatesArr[i] < start) {
                                                    start = secondPeriodDatesArr[i];
                                                }
                                            }
                                        }

                                        var end = start + Math.max(firstPeriodDatesArr.length, secondPeriodDatesArr.length) * 24 * 60 * 60 * 1000;
                                        // console.log(firstPeriodDatesArr);
                                        // console.log(secondPeriodDatesArr);
                                        // console.log(Math.max(firstPeriodDatesArr.length, secondPeriodDatesArr.length));
                                        // console.log(start);
                                        // console.log(end);

                                        for (var i in file) {
                                            var label = [];
                                            var groupId = [];
                                            if (plot.indexOf(i) > -1) {
                                                for (var j in file[i]) {
                                                    var ts = Number(j), temp_date = new Date(ts), temp_date1 = new Date(ts);
                                                    var isPeriod1 = false;
                                                    var isPeriod2 = false;
                                                    var searchTs = new Date(temp_date.getFullYear(), temp_date.getMonth(), temp_date.getDate()).getTime();
                                                    if (firstPeriodDatesArr.indexOf(searchTs) > -1) {
                                                        if (temp_date < oneComponentsDate.getTime() + 24 * 60 * 60 * 1000) {
                                                            isPeriod1 = true;
                                                            groupId[0] = i + "p1";
                                                            label[0] = labelArray[plot.indexOf(i)] + " p1";
                                                        }
                                                    }
                                                    if (secondPeriodDatesArr.indexOf(searchTs) > -1) {
                                                        if (temp_date < threeComponentsDate.getTime() + 24 * 60 * 60 * 1000) {
                                                            isPeriod2 = true;
                                                            groupId[1] = i + "p2";
                                                            label[1] = labelArray[plot.indexOf(i)] + " p2";
                                                            var date1 = new Date(Number(zeroComponents[0]), Number(zeroComponents[1]) - 1, Number(zeroComponents[2]));
                                                            var date2 = new Date(Number(twoComponents[0]), Number(twoComponents[1]) - 1, Number(twoComponents[2]));
                                                            var diff = (date2.getTime() - date1.getTime()) / 24 / 60 / 60 / 1000;
                                                            temp_date1.setDate(temp_date1.getDate() - diff);
                                                        }
                                                    }
                                                    if (isPeriod1) {
                                                        if (!groupExists(groupId[0])) {
                                                            groups.add({
                                                                content: label[0],
                                                                id: groupId[0],
                                                                options: {
                                                                    shaded: {
                                                                        orientation: "bottom"
                                                                    }
                                                                }
                                                            });
                                                        }

                                                        items.push({
                                                            group: groupId[0],
                                                            label: {
                                                                className: "visibility-hidden label-group-" + label[0],
                                                                content: Number(file[i][j].replace(",", ".")).toFixed(1),
                                                                xOffset: -10 / 3 * Number(file[i][j].replace(",", ".")).toFixed(1).length,
                                                                yOffset: 20
                                                            },
                                                            x: temp_date,
                                                            y: Number(file[i][j].replace(",", "."))
                                                        });
                                                    }
                                                    if (isPeriod2) {
                                                        if (!groupExists(groupId[1])) {
                                                            groups.add({
                                                                content: label[1],
                                                                id: groupId[1],
                                                                options: {
                                                                    shaded: {
                                                                        orientation: "bottom"
                                                                    }
                                                                }
                                                            });
                                                        }

                                                        items.push({
                                                            group: groupId[1],
                                                            label: {
                                                                className: "visibility-hidden label-group-" + label[1],
                                                                content: Number(file[i][j].replace(",", ".")).toFixed(1),
                                                                xOffset: -10 / 3 * Number(file[i][j].replace(",", ".")).toFixed(1).length,
                                                                yOffset: 20
                                                            },
                                                            x: temp_date1,
                                                            y: Number(file[i][j].replace(",", "."))
                                                        });
                                                    }

                                                }

                                            }
                                        }
                                        // console.log("items: ", items);
                                        /*var minDate = undefined, minLength = undefined;
                                         for (var i in items) {
                                         if (minDate === undefined || items[i].x.getTime() <= minDate) {
                                         minDate = items[i].x.getTime();
                                         if (minLength === undefined || items[i].label.content.length < minLength) {
                                         minLength = items[i].label.content.length
                                         }
                                         }
                                         }*/
                                    }
                                    if (selector == 6) {//caso 6
                                        // var GD=[];
                                        // var fn = type[0];
                                        // var timing = Number(type[1]);
                                        //
                                        // var zeroComponents = dates[0];
                                        // var oneComponents = dates[1];
                                        // var twoComponents = dates[2];
                                        // var threeComponents = dates[3];
                                        //
                                        // var zeroComponentsDate = new Date(Number(zeroComponents[0]), Number(zeroComponents[1]) - 1, Number(zeroComponents[2]));
                                        // var oneComponentsDate = new Date(Number(oneComponents[0]), Number(oneComponents[1]) - 1, Number(oneComponents[2]));
                                        // var firstPeriodNumberOfDays = (oneComponentsDate - zeroComponentsDate) / 1000 / 60 / 60 / 24;
                                        // var firstPeriodDatesArr = [zeroComponentsDate.getTime()];
                                        // for (var i = 1; i <= firstPeriodNumberOfDays; i++) {
                                        // 	firstPeriodDatesArr.push(new Date(zeroComponentsDate.getTime() + i * 24 * 60 * 60 * 1000).getTime());
                                        // }
                                        //
                                        // var twoComponentsDate = new Date(Number(twoComponents[0]), Number(twoComponents[1]) - 1, Number(twoComponents[2]));
                                        // var threeComponentsDate = new Date(Number(threeComponents[0]), Number(threeComponents[1]) - 1, Number(threeComponents[2]));
                                        // var secondPeriodNumberOfDays = (threeComponentsDate - twoComponentsDate) / 1000 / 60 / 60 / 24;
                                        // var secondPeriodDatesArr = [twoComponentsDate.getTime()];
                                        // for (var i = 1; i <= secondPeriodNumberOfDays; i++) {
                                        // 	secondPeriodDatesArr.push(new Date(twoComponentsDate.getTime() + i * 24 * 60 * 60 * 1000).getTime());
                                        // }
                                        // var date1 = new Date(Number(zeroComponents[0]), Number(zeroComponents[1]) - 1, Number(zeroComponents[2]));
                                        // var date2 = new Date(Number(twoComponents[0]), Number(twoComponents[1]) - 1, Number(twoComponents[2]));
                                        // var diff = (date2.getTime() - date1.getTime()) / 24 / 60 / 60 / 1000;
                                        // console.log(diff);
                                        // console.log(Math.max(firstPeriodDatesArr.length, secondPeriodDatesArr.length));
                                        //
                                        // for (var i = 0; i < Math.max(firstPeriodDatesArr.length, secondPeriodDatesArr.length) * 24 * 60; i += timing) { //original_good
                                        // //for (var i = 0; i < (numberOfDays+1) * 24 * 60; i += timing) {//to be removed
                                        // 	var t_date = new Date(Number(zeroComponents[0]), Number(zeroComponents[1]) - 1, Number(zeroComponents[2]), 0, i, 0, 0);
                                        // 	var t = t_date.getTime();
                                        // 	var flag_plot= true;
                                        // 	for (var j in file) {
                                        // 		if (j.indexOf("count") == -1 && plot.indexOf(j)!=-1) {
                                        // 			for (k in file[j]) {
                                        // 				if (flag_plot && k >= t && k < t + timing*60000) {
                                        // 					flag_plot = false;
                                        // 					if (t>= twoComponentsDate.getTime() && t <threeComponentsDate.getTime()+24*60*60*1000 && t>=oneComponentsDate.getTime()+24*60*60*1000) {
                                        // 						if(GD.indexOf({date: new Date(t_date.setDate(t_date.getDate() - diff))})==-1) {
                                        // 								GD.push({
                                        // 									date: new Date(t_date.setDate(t_date.getDate() - diff))
                                        // 								});
                                        // 						}
                                        // 					}else if(t>= zeroComponentsDate.getTime() && t <oneComponentsDate.getTime()+24*60*60*1000){
                                        // 						if(GD.indexOf({date: new Date(Number(zeroComponents[0]), Number(zeroComponents[1]) - 1, Number(zeroComponents[2]), 0, i, 0, 0)})==-1) {
                                        // 							GD.push({
                                        // 								date: new Date(Number(zeroComponents[0]), Number(zeroComponents[1]) - 1, Number(zeroComponents[2]), 0, i, 0, 0)
                                        // 							});
                                        // 						}
                                        // 					}
                                        // 				}
                                        // 			}
                                        // 		}
                                        // 	}
                                        // }
                                        //
                                        //
                                        // for (var i in file) {
                                        // 	if (plot.indexOf(i) > -1) {
                                        // 		for (var j in file[i]) {
                                        // 			var ts = Number(j), temp_date = new Date(ts);
                                        // 			//console.log("temp_date: ",temp_date);
                                        //
                                        // 			if (end === undefined) {
                                        // 				end = ts;
                                        // 			}
                                        //
                                        // 			if (start === undefined) {
                                        // 				start = ts;
                                        // 			}
                                        //
                                        // 			if (ts > end) {
                                        // 				end = ts;
                                        // 			} else if (ts < start) {
                                        // 				start = ts;
                                        // 			}
                                        //
                                        // 			var searchTs = new Date(temp_date.getFullYear(), temp_date.getMonth(), temp_date.getDate()).getTime();
                                        // 			/*console.log("serachTs: ",searchTs);
                                        // 			console.log("max1: ",Math.max(null,firstPeriodDatesArr));
                                        // 			console.log("min1: ",Math.min(null,firstPeriodDatesArr));
                                        // 			console.log("max2: ",Math.max(null,secondPeriodDatesArr));
                                        // 			console.log("min2: ",Math.min(null,secondPeriodDatesArr));*/
                                        // 			/*console.log("firstperiodArray: ",firstPeriodDatesArr);
                                        // 			console.log("secondPeriodArray: ",secondPeriodDatesArr);*/
                                        //            GD.sort(function (a, b) {
                                        //                return a.timestamp - b.timestamp;
                                        //            });
                                        //
                                        // 			if (firstPeriodDatesArr.indexOf(searchTs) > -1) {
                                        // 				console.log('entrato1');
                                        // 				for (var c = 0; c < GD.length; c++) {
                                        // 					if (c === GD.length - 1) {
                                        // 						var over = new Date(GD[c].date.getTime() + timing * 60 * 1000).getTime();
                                        // 						if (ts >= GD[c].date.getTime() && ts < over) {
                                        // 							console.log("i: ", i);
                                        // 							console.log('GD[c][i + "p1"]: (1)', GD[c][i + "p1"]);
                                        // 							if (GD[c].hasOwnProperty(i + "p1")) {
                                        // 								GD[c][i + "p1"] += Number(file[i][j].replace(",", "."));
                                        // 								GD[c]["count" + i + "p1"] += Number(file["count" + i][j].replace(",", "."));
                                        // 							} else {
                                        // 								GD[c][i + "p1"] = Number(file[i][j].replace(",", "."));
                                        // 								GD[c]["count" + i + "p1"] = Number(file["count" + i][j].replace(",", "."));
                                        // 							}
                                        // 							console.log('GD[c][i + "p1"]: (2)', GD[c][i + "p1"]);
                                        // 						}
                                        // 					} else {
                                        // 						if (ts >= GD[c].date.getTime() && ts < new Date(GD[c].date.getTime() + timing * 60 * 1000).getTime()) {
                                        // 							console.log('GD[c][i + "p1"]: (3)', GD[c][i + "p1"]);
                                        // 							if (GD[c].hasOwnProperty(i + "p1")) {
                                        // 								GD[c][i + "p1"] += Number(file[i][j].replace(",", "."));
                                        // 								GD[c]["count" + i + "p1"] += Number(file["count" + i][j].replace(",", "."));
                                        // 							} else {
                                        // 								GD[c][i + "p1"] = Number(file[i][j].replace(",", "."));
                                        // 								GD[c]["count" + i + "p1"] = Number(file["count" + i][j].replace(",", "."));
                                        // 							}
                                        // 							console.log('GD[c][i + "p1"]: (4)', GD[c][i + "p1"]);
                                        // 						}
                                        // 					}
                                        // 				}
                                        // 			} if (secondPeriodDatesArr.indexOf(searchTs) > -1) {
                                        // 				console.log('entrato2');
                                        //
                                        // 				temp_date.setDate(temp_date.getDate() - diff);
                                        // 				var TS = temp_date.getTime();
                                        // 				for (var c = 0; c < GD.length; c++) {
                                        // 					if (c === GD.length - 1) {
                                        // 						var over = new Date(GD[c].date.getTime() + timing * 60 * 1000).getTime();
                                        // 						if (TS >= GD[c].date.getTime() && TS < over) {
                                        // 							if (GD[c].hasOwnProperty(i + "p2")) {
                                        // 								GD[c][i + "p2"] += Number(file[i][j].replace(",", "."));
                                        // 								GD[c]["count" + i + "p2"] += Number(file["count" + i][j].replace(",", "."));
                                        // 							} else {
                                        // 								GD[c][i + "p2"] = Number(file[i][j].replace(",", "."));
                                        // 								GD[c]["count" + i + "p2"] = Number(file["count" + i][j].replace(",", "."));
                                        // 							}
                                        // 						}
                                        // 					} else {
                                        // 						if (TS >= GD[c].date.getTime() && TS < new Date(GD[c].date.getTime() + timing * 60 * 1000).getTime()) {
                                        // 							if (GD[c].hasOwnProperty(i + "p2")) {
                                        // 								GD[c][i + "p2"] += Number(file[i][j].replace(",", "."));
                                        // 								GD[c]["count" + i + "p2"] += Number(file["count" + i][j].replace(",", "."));
                                        // 							} else {
                                        // 								GD[c][i + "p2"] = Number(file[i][j].replace(",", "."));
                                        // 								GD[c]["count" + i + "p2"] = Number(file["count" + i][j].replace(",", "."));
                                        // 							}
                                        // 						}
                                        // 					}
                                        // 				}
                                        // 			}
                                        // 		}
                                        // 	}
                                        // }
                                        //
                                        // console.log("GD: ",GD);
                                        //
                                        // start= new Date(Number(zeroComponents[0]), Number(zeroComponents[1]) - 1, Number(zeroComponents[2]), 0, 0, 0, 0).getTime();
                                        // var end = start + Math.max(firstPeriodDatesArr.length, secondPeriodDatesArr.length) * 24 * 60 * 60 * 1000;
                                        //
                                        // if (fn === "avg") {
                                        // 	for (var c = 0; c < GD.length; c++) {
                                        // 		for (var f in GD[c]) {
                                        // 			if (f !== "date" && f.indexOf("count") === -1) {
                                        // 				if (GD[c]["count" + f]==0) {
                                        // 					GD[c][f] /= (GD[c]["count" + f]+1);
                                        // 				}else{
                                        // 					GD[c][f] /= GD[c]["count" + f];
                                        // 				}
                                        // 			}
                                        // 		}
                                        // 	}
                                        // }
                                        var GD = file.GD;
                                        var start = file.start;
                                        var end = file.end;
                                        // var flagGroup = file.flagGroup;
                                        delete file;
                                        console.log("GD: ", GD);
                                        for (var c = 0; c < GD.length; c++) {
                                            for (var f in GD[c]) {
                                                if (f !== "timestamp" && f !== "date" && f.indexOf("count") === -1) {
                                                    var groupId = f;
                                                    if (f.indexOf("p1") > -1) {
                                                        f = f.substr(0, f.indexOf("p1"));
                                                        var period = "p1";
                                                    } else if (f.indexOf("p2") > -1) {
                                                        f = f.substr(0, f.indexOf("p2"));
                                                        var period = "p2";
                                                    }

                                                    if (!groupExists(groupId)) {
                                                        groups.add({
                                                            content: labelArray[plot.indexOf(f)] + " " + period,
                                                            id: groupId,
                                                            options: {
                                                                shaded: {
                                                                    orientation: "bottom"
                                                                }
                                                            }
                                                        });
                                                    }
                                                    items.push({
                                                        group: groupId,
                                                        label: {
                                                            className: "visibility-hidden label-group-" + labelArray[plot.indexOf(f)] + " " + period,
                                                            content: GD[c][groupId].toFixed(1),
                                                            xOffset: -10 / 3 * GD[c][groupId].toFixed(1).length,
                                                            yOffset: 20
                                                        },
                                                        x: new Date(Number(GD[c]["timestamp"])),
                                                        y: Number(GD[c][groupId])
                                                    });
                                                }
                                            }
                                        }
                                        // console.log("items: ",items);
                                        // console.log("groups: ",groups);

                                        // if (flagGroup[0]) {
                                        //     if (!groupExists(groupId[0])) {
                                        //         groups.add({
                                        //             content: label[0],
                                        //             id: groupId[0],
                                        //             options: {
                                        //                 shaded: {
                                        //                     orientation: "bottom"
                                        //                 }
                                        //             }
                                        //         });
                                        //     }
                                        //
                                        //     items.push({
                                        //         group: groupId[0],
                                        //         label: {
                                        //             className: "visibility-hidden label-group-" + groupId[0],
                                        //             content: Number(file[i][j].replace(",", ".")).toFixed(1),
                                        //             xOffset: -10 / 3 * Number(file[i][j].replace(",", ".")).toFixed(1).length,
                                        //             yOffset: 20
                                        //         },
                                        //         x: temp_date,
                                        //         y: Number(file[i][j].replace(",", "."))
                                        //     });
                                        // }
                                        // if (flagGroup[1]) {
                                        //     if (!groupExists(groupId[1])) {
                                        //         groups.add({
                                        //             content: label[1],
                                        //             id: groupId[1],
                                        //             options: {
                                        //                 shaded: {
                                        //                     orientation: "bottom"
                                        //                 }
                                        //             }
                                        //         });
                                        //     }
                                        //
                                        //     items.push({
                                        //         group: groupId[1],
                                        //         label: {
                                        //             className: "visibility-hidden label-group-" + groupId[1],
                                        //             content: Number(file[i][j].replace(",", ".")).toFixed(1),
                                        //             xOffset: -10 / 3 * Number(file[i][j].replace(",", ".")).toFixed(1).length,
                                        //             yOffset: 20
                                        //         },
                                        //         x: temp_date1,
                                        //         y: Number(file[i][j].replace(",", "."))
                                        //     });
                                        // }

                                        /*var minDate = undefined, minLength = undefined;
                                         for (var i in items) {
                                         if (minDate === undefined || items[i].x.getTime() <= minDate) {
                                         minDate = items[i].x.getTime();
                                         if (minLength === undefined || items[i].label.content.length < minLength) {
                                         minLength = items[i].label.content.length
                                         }
                                         }
                                         }*/
                                    }
                                    $timeout(function () {
                                        if (attrs.reduce === undefined) {
                                            if (window.innerWidth < 992) {
                                                document.getElementById(scope.graphname).style.width = window.innerWidth + "px";
                                            } else {
                                                document.getElementById(scope.graphname).style.width = (parseInt(window.innerWidth * 33 / 100) - 20) + "px";
                                            }
                                        }

                                        items.sort(function (a, b) {
                                            return (a.group == b.group ? 0 : a.group < b.group ? -1 : 1) || a.x.getTime() - b.x.getTime();
                                        });

                                        scope.labels.sort(function (a, b) {
                                            return (a.property == b.property ? 0 : a.property < b.property ? -1 : 1)
                                        });

                                        // console.log("items", items);
                                        if (selector == 1 || selector == 3 || selector == 5 || selector == 2 || selector == 4 || selector == 6) {
                                            if (type === "punctual") {//vedere se modificare
                                                type = [];
                                                type[1] = 15;
                                            }
                                            console.log("type: ", type);
                                            var hsvToRgb = function (h, s, v) {
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

                                            var rgbColors = function (t) {
                                                t = parseInt(t);
                                                // if (t < 2)
                                                //     throw new Error("'t' must be greater than 1.");

                                                // distribute the colors evenly on
                                                // the hue range (the 'H' in HSV)
                                                var i = 360 / (t /*-1*/);

                                                // hold the generated colors
                                                var r = [];
                                                var s = 70, v = 70;
                                                for (var x = 0; x < t; x++) {
                                                    // alternate the s, v for more
                                                    // contrast between the colors.
                                                    s = 90 + Math.random() * 10;
                                                    v = 80 + Math.random() * 10;
                                                    r.push(rgbToHex(hsvToRgb(i * x, s, v)));
                                                }
                                                return r;
                                            };
                                            if (selector == 1 || selector == 3 || selector == 2 || selector == 4) {
                                                // if (plot.length > 1) {
                                                var arr_color = rgbColors(plot.length);
                                                // } else {
                                                //     var arr_color = ["#ff0000"];
                                                // }
                                            } else if (selector == 5 || selector == 6) {
                                                var length = scope.labels.length;
                                                for (var i = 0; i < length; i++) {
                                                    scope.labels.push({
                                                        property: scope.labels[i].property + "p2",
                                                        label: scope.labels[i].label + " p2"
                                                    });
                                                }

                                                for (var i in scope.labels) {
                                                    if (i < length) {
                                                        scope.labels[i].property = scope.labels[i].property + "p1";
                                                        scope.labels[i].label = scope.labels[i].label + " p1";
                                                    }
                                                }
                                                var arr_color = rgbColors(2 * plot.length);
                                            }
                                            for (var i in arr_color) {
                                                scope.labels[i].style = {"border-bottom-color": arr_color[i]};
                                            }
                                            // console.log("arr_color",arr_color);
                                            // console.log("entro nella linea spezzata");
                                            var groupId = 0;
                                            var properties = 0;
                                            for (var i = 0; i < items.length; i++) {
                                                if (i == 0) {
                                                    groups.add({
                                                        content: groupId,
                                                        id: groupId,
                                                        style: "stroke:" + arr_color[properties],
                                                        options: {
                                                            shaded: {
                                                                orientation: "bottom",
                                                                style: "fill:" + arr_color[properties]
                                                            },
                                                            drawPoints: {
                                                                styles: "stroke:" + arr_color[properties] + ";fill:" + arr_color[properties]
                                                            }
                                                        }
                                                    });
                                                    items[i].group = groupId;
                                                    scope.labels[properties].max = Number(items[i].y).toFixed(1);
                                                    scope.labels[properties].min = Number(items[i].y).toFixed(1);
                                                } else {
                                                    if (items[i].label.className == items[i - 1].label.className) {
                                                        if (items[i].x.getTime() - items[i - 1].x.getTime() > Number(type[1]) * 60 * 1000) {
                                                            groupId++;
                                                            groups.add({
                                                                content: groupId,
                                                                id: groupId,
                                                                style: "stroke:" + arr_color[properties],
                                                                options: {
                                                                    shaded: {
                                                                        orientation: "bottom",
                                                                        style: "fill:" + arr_color[properties]
                                                                    },
                                                                    drawPoints: {
                                                                        styles: "stroke:" + arr_color[properties] + ";fill:" + arr_color[properties]
                                                                    }
                                                                }
                                                            });
                                                        }
                                                        items[i].group = groupId;
                                                        scope.labels[properties].max = Math.max(scope.labels[properties].max, Number(items[i].y)).toFixed(1);//scope.labels[properties].max > Number(items[i].y) ? scope.labels[properties].max: Number(items[i].y);
                                                        scope.labels[properties].min = Math.min(scope.labels[properties].min, Number(items[i].y)).toFixed(1);//scope.labels[properties].min < Number(items[i].y) ? scope.labels[properties].min:  Number(items[i].y);
                                                    } else {
                                                        groupId++;
                                                        properties++;
                                                        groups.add({
                                                            content: groupId,
                                                            id: groupId,
                                                            style: "stroke:" + arr_color[properties],
                                                            options: {
                                                                shaded: {
                                                                    orientation: "bottom",
                                                                    style: "fill:" + arr_color[properties]
                                                                },
                                                                drawPoints: {
                                                                    styles: "stroke:" + arr_color[properties] + ";fill:" + arr_color[properties]
                                                                }
                                                            }
                                                        });
                                                        // console.log(properties);
                                                        items[i].group = groupId;
                                                        scope.labels[properties].max = Number(items[i].y).toFixed(1);
                                                        scope.labels[properties].min = Number(items[i].y).toFixed(1);
                                                    }
                                                }

                                            }
                                        }

                                        // console.log("groups: ",groups);
                                        var container = document.getElementById(scope.graphname);
                                        container.innerHTML = "";
                                        var dataset = new vis.DataSet(items);

                                        var options = {
                                            dataAxis: {
                                                left: {
                                                    format: function (value) {
                                                        return Number(value).toFixed(1);
                                                    }
                                                }
                                            },
                                            drawPoints: {
                                                style: "circle"
                                            },
                                            // interpolation:false,
                                            // legend: true,
                                            //legend: legend,
                                            orientation: "top",
                                            showCurrentTime: true,
                                            end: new Date(end),
                                            max: new Date(end),
                                            min: new Date(start),
                                            start: new Date(start),
                                            // style:"points"
                                            // timeAxis: {scale: 'minute', step: 15}
                                        };

                                        // if (selector == 1 || selector == 3 || selector == 5){
                                        //     options.style ="points";
                                        // }


                                        if (window.innerWidth < 992) {
                                            options.height = window.innerHeight / 2;
                                        }
                                        console.log("container :", container);
                                        console.log("scope.graphname :", scope.graphname);
                                        startTime = options.start.getTime();
                                        endTime = options.end.getTime();
                                        console.log("Grafico");
                                        scope.graph2d = new vis.Graph2d(container, dataset, groups, options);
                                        scope.graph2d.on("changed", self.zIndexSVG());

                                        scope.graph2d.on("rangechange", function (start, end) {
                                            self.changeRange(start, end)
                                        });
                                        console.log("scope.labels: ", scope.labels);
                                        if (window.innerWidth < 992) {
                                            // if (scope.object.objectId) {
                                            scope.graph2d.on("click", function () {
                                                var offset = document.getElementById("app").offsetTop + Number(getComputedStyle(document.getElementsByClassName("analytics")[0]).marginTop.split("px")[0]) + Number(getComputedStyle(document.getElementById("ApioApplication" + scope.object.objectId)).paddingTop.split("px")[0]);
                                                if (options.height === window.innerHeight / 2) {
                                                    options.height = window.innerHeight - offset;
                                                } else if (options.height === window.innerHeight - offset) {
                                                    options.height = window.innerHeight / 2;
                                                }
                                                scope.graph2d.setOptions(options);
                                            });
                                        }
                                        // }
                                    });
                                    ready = true;

                                }).error(function (error) {
                                    scope.ready = true;
                                    console.log("Error while getting logs for object with objectId " + objectId + " at date " + dates[0] + ": ", error);
                                });


                            }).error(function (error) {
                                scope.ready = true;
                                console.log("Error while getting service log: ", error)
                            });
                        }).error(function (err) {
                            scope.ready = true;
                            console.log("Error while getting session: ", err);
                        });

                    };
                    //***changeRange method***//
                    //this method is triggered when a rangechange event is made,it makes all the circles/rectLabels/labels not visible if not undefined
                    //and deletes circles/rectLabels/labels if they have not an id associated in the DOM. It calls the zIndexSVG method if at least one
                    // element is deleted
                    this.changeRange = function (params) {
                        var intervalChangeRange = setInterval(function () {
                            var elem = document.getElementsByClassName('vis-point');
                            // console.log(elem);
                            if (elem) {
                                clearInterval(intervalChangeRange);

                                // console.log('*******changeRange******');
                                // console.log('start', params.start, 'end', params.end);
                                startTime = params.start.getTime();
                                endTime = params.end.getTime();
                                var enter = 0;
                                //se viene tolto
                                var countTemp1 = circle.length;
                                var countTemp2 = 0;
                                //console.log('label',label);
                                //console.log('circle1',circle);
                                //console.log('countTemp1',countTemp1);
                                for (var a = 0; a < countTemp1; a++) {
                                    //console.log('a vale:',a);
                                    countTemp2 = circle[a].length;
                                    //console.log('countTemp2',countTemp2);
                                    for (var b = 0; b < countTemp2; b++) {
                                        //console.log('b vale:',b);
                                        //console.log('prima dell\'IF',circle[a][b]);
                                        if (typeof circle[a][b] !== 'undefined') {
                                            label[a][b].classList.add('visibility-hidden')
                                            rectLabel[a][b].classList.add('visibility-hidden')
                                            // circle[a][b].setAttribute('style', '');

                                            if (!document.getElementById(circle[a][b].getAttribute('id'))) {
                                                //console.log('splice',circle[a][b]);
                                                circle[a].splice(b, 1)
                                                label[a].splice(b, 1)
                                                rectLabel[a].splice(b, 1)
                                                b--;
                                                enter = 1;
                                            }
                                        }
                                    }
                                }
                                //console.log('labelPost',label);
                                //console.log('circle1Post',circle);

                                //se viene aggiunto
                                for (var a in elem) {
                                    if (elem[a].nodeName == "circle") {
                                        //console.log(elem[a]);
                                        //console.log(elem[a].getAttribute('id'));
                                    }
                                    if (elem[a].nodeName == "circle" && (!elem[a].getAttribute('id') || elem[a].getAttribute('id') == null)) {
                                        enter = 1;
                                        //console.log('************* enter 1 ****************');
                                    }
                                }
                                if (enter == 1) {
                                    self.zIndexSVG();
                                }
                                //console.log('totale',circle);
                            }
                        }, 0);
                    }
                    //***zIndexSVG method***//
                    //if in the DOM an element in vis-point is a circle without id, it creates in point[s] a circle and a rectangle with the label and value of the point
                    //it also adds them in the attributes circle, label, rectLabel
                    this.zIndexSVG = function () {
                        var intervalzIndex = setInterval(function () {
                            var elem = document.getElementsByClassName('vis-point');
                            var first = 0;
                            if (elem) {
                                clearInterval(intervalzIndex);
                                // console.log(first);


                                // console.log('RE-DRAW')
                                if (first = 0) {
                                    console.log("dentro first");
                                    circle = [];
                                    label = [];
                                    rectLabel = [];
                                    first = 1;
                                }
                                var point = document.getElementsByClassName('vis-point');
                                var labelPoint = document.getElementsByClassName('vis-label');
                                var actualGroup;


                                //console.log('point draw',point);
                                for (var s in point) {
                                    if (point[s].nodeName == "circle") {
                                        //console.log('circle vale:',point[s]);
                                    }
                                    if (point[s].nodeName == "circle" && (point[s].getAttribute('id') == null || !point[s].getAttribute('id'))) {
                                        //console.log('non ha un id');
                                        var tempClass = point[s].classList
                                        //console.log('point[s]',point[s]);
                                        //console.log('tempClass',tempClass);
                                        for (var h in tempClass) {
                                            //console.log("h: ", h, "tempClass[h]: ", tempClass[h]);
                                            if (typeof tempClass[h] === "string" && tempClass[h].indexOf('vis-graph-group') > -1) {
                                                //console.log('this->point',point[s]);
                                                actualGroup = Number(tempClass.item(h).split('vis-graph-group')[1]);
                                                console.log('actualGroup', actualGroup);
                                            }
                                        }
                                        //console.log('actualGroup',actualGroup);
                                        if (typeof circle[actualGroup] === 'undefined') {
                                            //console.log('circle[actualGroup] udefined')
                                            circle[actualGroup] = [];
                                            temp_style[actualGroup] = [];
                                            label[actualGroup] = [];
                                            rectLabel[actualGroup] = [];
                                        }
                                        circle[actualGroup].push(point[s])
                                        label[actualGroup].push(point[s].nextSibling);
                                        //circle[actualGroup][circle[actualGroup].length] = point[s];
                                        //label[actualGroup][label[actualGroup].length] = point[s].nextSibling;
                                        //console.log(circle[actualGroup]);
                                        point[s].setAttribute('id', 'point-' + actualGroup + '-' + (circle[actualGroup].length));
                                        point[s].setAttribute('data-group', actualGroup);

                                        point[s].nextSibling.setAttribute('id', 'label-' + actualGroup + '-' + (label[actualGroup].length));

                                        point[s].nextSibling.setAttribute('data-group', actualGroup);

                                        //inserimento rettangolo che contiene i testi
                                        var xmlns = "http://www.w3.org/2000/svg";
                                        var elemRect = document.createElementNS(xmlns, "rect");
                                        elemRect.setAttributeNS(null, "x", label[actualGroup][label[actualGroup].length - 1].getAttribute('x') - 5);
                                        elemRect.setAttributeNS(null, "y", label[actualGroup][label[actualGroup].length - 1].getAttribute('y') - 13);
                                        elemRect.setAttributeNS(null, "width", 100);
                                        elemRect.setAttributeNS(null, "height", 20);
                                        elemRect.setAttributeNS(null, "fill", "white");
                                        elemRect.classList.add('visibility-hidden')

                                        //elem.setAttribute('class','vis-graph-group'+actualGroup)
                                        elemRect.setAttribute('style', 'fill-opacity: 0.8;')
                                        if (scope.object.objectId != 10) {
                                            point[s].nextSibling.parentNode.appendChild(elemRect);
                                        }
                                        rectLabel[actualGroup].push(elemRect);
                                        //rimuovo ed inserisco gli lementi text dell'svg in modo da visualizzare i testi sempre sopra i	grafici
                                        if (scope.object.objectId != 10) {
                                            point[s].nextSibling.parentNode.removeChild(point[s].nextSibling)
                                            point[s].nextSibling.parentNode.appendChild(label[actualGroup][label[actualGroup].length - 1])
                                        }
                                    }
                                }
                                //var svg = document.getElementsByClassName('vis-point').item(0).parentNode;
                                /*var svg = document.getElementsByTagName('svg').item(0)*/

                                //circle = circle1;
                                //label = label1;
                                //rectLabel = rectLabel1;
                                //console.log('pre',circle);


                                var countTemp1 = circle.length;
                                var countTemp2 = 0;
                                //console.log('label',label);
                                //console.log('circle1',circle);
                                //console.log('countTemp1',countTemp1);
                                for (var a = 0; a < countTemp1; a++) {
                                    //console.log('a vale:',a);
                                    countTemp2 = circle[a].length;
                                    //console.log('countTemp2',countTemp2);
                                    for (var b = 0; b < countTemp2; b++) {
                                        //console.log('b vale:',b);
                                        //console.log('prima dell\'IF',circle[a][b]);
                                        if (typeof circle[a][b] !== 'undefined' && circle[a][b].nodeName === 'circle') {
                                            var tempClass = circle[a][b].classList

                                            var group;
                                            for (var h in tempClass) {
                                                //console.log("h: ", h, "tempClass[h]: ", tempClass[h]);
                                                if (typeof tempClass[h] === "string" && tempClass[h].indexOf('vis-graph-group') > -1) {
                                                    //console.log('this->point',point[s]);
                                                    group = Number(tempClass.item(h).split('vis-graph-group')[1]);
                                                    //console.log('Group',group);
                                                }
                                            }
                                            if (Number(circle[a][b].getAttribute('data-group')) !== Number(group)) {

                                                var circleTemp = circle[a].splice(b, 1)[0];
                                                var labelTemp = label[a].splice(b, 1)[0];
                                                var rectLabelTemp = rectLabel[a].splice(b, 1)[0];
                                                circleTemp.setAttribute('data-group', group);
                                                labelTemp.setAttribute('data-group', group);
                                                rectLabelTemp.setAttribute('data-group', group);
                                                circle[group].push(circleTemp)
                                                temp_style[group].push(undefined);
                                                label[group].push(labelTemp)
                                                rectLabel[group].push(rectLabelTemp)
                                                if (a !== group) {
                                                    b--;
                                                }
                                                //console.log('+++++++++++++++',circle[group]);

                                            }
                                        }
                                        /*else {
                                         circle[a].splice(b, 1)
                                         label[a].splice(b, 1)
                                         rectLabel[a].splice(b, 1)
                                         }*/
                                    }
                                }

                                //console.log('post',circle);
                                //console.log(circle);
                                //console.log(label);
                                //console.log(rectLabel);

                            }

                        }, 0);
                    };
                    //***getPosition method***//
                    //it is used to obtain the current position of the mouse inside the graph, used in the mousemove event listener
                    this.getPosition = function (obj) {
                        function getAbsoluteXY(element) {
                            var viewportElement = document.documentElement;
                            var box = element.getBoundingClientRect();
                            var scrollLeft = viewportElement.scrollLeft;
                            var scrollTop = viewportElement.scrollTop;
                            var x = box.left + scrollLeft;
                            var y = box.top + scrollTop;
                            return {"x": x, "y": y}
                        };
                        var pos = Array();
                        pos['left'] = 0;
                        pos['top'] = 0;
                        if (obj) {
                            while (obj.offsetParent) {
                                pos['left'] += obj.offsetLeft - obj.scrollLeft;
                                pos['top'] += obj.offsetTop - obj.scrollTop;
                                var tmp = obj.parentNode;
                                while (tmp != obj.offsetParent) {
                                    pos['left'] -= tmp.scrollLeft;
                                    pos['top'] -= tmp.scrollTop;
                                    tmp = tmp.parentNode;
                                    //console.log("tmp: ", tmp);
                                }
                                obj = obj.offsetParent;
                                //console.log("obj: ", obj);
                            }
                            // console.log("obj: ", obj, "obj.offsetLeft: ", obj.offsetLeft, "obj.offsetTop: ", obj.offsetTop);
                            if (obj) {
                                if (obj.offsetLeft && obj.offsetTop) {
                                    pos['left'] += obj.offsetLeft;
                                    pos['top'] += obj.offsetTop;
                                } else {
                                    absXY = getAbsoluteXY(obj);
                                    pos['left'] += absXY.x;
                                    pos['top'] += absXY.y;
                                }
                            }
                        }
                        //console.log("pos['left']: ", pos['left'], "pos['top']: ", pos['top']);
                        return {x: pos['left'], y: pos['top']};
                    }
                }

                scope.graph = new objectConstructor();
                console.log("ready1", scope.graph.getReady());
                attrs.$observe("date", function (newValue) {
                    scope.graph.attrsChecker();

                });
                attrs.$observe("plot", function (newValue) {
                    scope.graph.attrsChecker();
                    // });
                });
                attrs.$observe("target", function (newValue) {
                    scope.graph.attrsChecker();
                    // });
                });
                // scope.graph.attrsChecker();
                if (scope.object.objectId == 10) {
                    var container = document.getElementById(scope.graphname);
                    container.innerHTML = "";
                    var groups = new vis.DataSet(), items = [];
                    var dataset = new vis.DataSet(items);
                    var options = {
                        dataAxis: {
                            left: {
                                format: function (value) {
                                    return Number(value).toFixed(1);
                                }
                            }
                        },
                        drawPoints: {
                            style: "circle"
                        },
                        // interpolation:false,
                        // legend: true,
                        //legend: legend,
                        orientation: "top",
                        showCurrentTime: true,
                        end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1),
                        max: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1),
                        min: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
                        start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
                        // style:"points"
                        // timeAxis: {scale: 'minute', step: 15}
                    };
                    scope.graph2d = new vis.Graph2d(container, dataset, groups, options);
                    scope.graph.setReady(true);
                }

            });
        }
    };
}]);