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

angular.module("ApioApplication").controller("modalAN158", ["$scope", "$http", "$mdDialog", "socket", "sweet", function ($scope, $http, $mdDialog, socket, sweet) {
    console.log($scope);
    var self = this;
    if (self.data) {
        var keys = Object.keys(self.data);
        for (var i = 0; i< keys.length; i++){
            $scope[keys[i]] = self.data[keys[i]];
            console.log([keys[i]], $scope[keys[i]]);
        }
    }
    $scope.base = true;
    $scope.selected = false;
    $scope.list = false;
    $scope.apps = [];
    $scope.price = "";
    var modal = "AN158";
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
        $http.get("/apio/user/getSessionComplete").success(function (session) {
            $scope.modalData.apioId = session.apioId;
            socket.emit("close_autoInstall_modal", session.apioId);
            socket.emit("send_to_service", {
                service: "autoInstall",
                message: "apio_install_new_object_final",
                data: $scope.modalData
            });
            $mdDialog.hide();
        });
    };

    $scope.more = function () {
        console.log("entro in more");
        $http.get("/apio/service/autoInstall/route/"+ encodeURIComponent("/store/compatibility/") + encodeURIComponent(modal)).success(function (data) {
            console.log("faccio la richiesta");
            console.log("data: ", data);
            $scope.data = data;
            $scope.base = false;
            $scope.apps =[];
            data.list.forEach(function (elem, index, ref_array) {
                $scope.apps.push(elem)
            });
        })
            .error(function (data, status) {
                console.error('Response error', status, data);
            })
    }

    $scope.select = function (app) {
        $scope.description = undefined;
        $scope.list = true;
        $scope.selected = true;
        $scope.app = app;
        console.log("app: ", app);
        if (app !== "base") {
            app.links.forEach(function (elem, index, ref_array) {

                $scope.image = elem.path;
                // $http.get(elem.path)
                //     .success(function (data) {
                //
                //         //console.log("link: ",data);
                //     })
                //     .error(function (data, status) {
                //         console.error('Response error', status, data);
                //     })
            });
            $scope.description = app.manifest.description;
            $scope.price = app.manifest.price;
            // $scope.data.list.forEach(function (elem, index, ref_array) {
            //     if (app == elem.appId) {
            //         elem.links.forEach(function(elem,index,ref_array){
            //             $http.get(elem.path).success(function (data) {
            //                 console.log("Urray");
            //                 console.log(data);
            //             });
            //         });
            //     }
            // });
        }
        if (app == "base") {
            $scope.image = undefined;
            $scope.price = "FREE";
        }
        $scope.list = false;
    }

    // $scope.prompt = function (ev) {
    //     // Appending dialog to document.body to cover sidenav in docs app
    //     var confirm = $mdDialog.confirm()
    //         .title('Insert your password to install')
    //         .textContent('Insert your password to confirm your purchase and install the app')
    //         .placeholder('password')
    //         .ariaLabel('Password')
    //         .initialValue('password')
    //         .targetEvent(ev)
    //         .ok('Okay!')
    //         .cancel('Cancel');
    //
    //     $mdDialog.show(confirm).then(function (result) {
    //         $scope.status = "Sending request...";
    //         $http.post("/apio/service/autoInstall/route/%2FdownloadAppStore/data/" + encodeURIComponent(string))
    //             .success(function (data) {
    //                 console.log(data);
    //             })
    //             .error(function (data, status) {
    //
    //             })
    //     }, function () {
    //         $scope.status = '';
    //     });
    // }

    $scope.showAdvanced = function (ev) {
        $mdDialog.show({
            locals:{parent: $scope},
            templateUrl: 'dialog1.tmpl.html',
            controller: DialogController,
            bindToController: true})
            .then(function (answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
    };

    $scope.install = function () {

        console.log("app: ",$scope.app);
        // if ($scope.app !== "base") {
        //     console.log("app: ",$scope.app);
        //     $http.get("/apio/user/getSessionComplete").success(function (session) {
        //         json = {};
        //         json.appId = $scope.app.appId;
        //         json.username = session.email;
        //         json.apioId = session.apioId;
        //         json.password = $scope.password;
        //         console.log(json);
        //         ///////////
        //
        //
        //         ///////////
        //         // $http.post("/apio/service/autoInstall/route/%2FdownloadAppStore/data/" + encodeURIComponent(string))
        //         //     .success(function (data) {
        //         //         console.log(data);
        //         //     })
        //         //     .error(function (data, status) {
        //         //
        //         //     })
        //     });
        // }
        if ($scope.app == "base"){
            $scope.confirm();
        }
    }

    $scope.back=function(){
        $scope.base = true;
        $scope.cancelData();
        $scope.apps =[];
    }

    $scope.cancelData = function(){
        $scope.selected = false;
        $scope.list = false;
        $scope.description = undefined;
        $scope.price = "";
    }
    function DialogController($scope, $mdDialog, sweet, parent) {

        console.log(parent);
        console.log($scope);
        $scope.app =parent.app;
        $scope.installNew = function () {

            console.log("prova");

            console.log("app: ",$scope.app);
            if ($scope.app !== "base") {
                console.log("app: ",$scope.app);
                $http.get("/apio/user/getSessionComplete").success(function (session) {
                    var json ={};
                    json.data = parent.modalData;
                    json.appId = $scope.app.appId;
                    json.username = session.email;
                    json.apioId = session.apioId;
                    json.password = $scope.password;
                    console.log(json);
                    var string = JSON.stringify(json);
                    ///////////
                    $http.post("/apio/service/autoInstall/route/"+encodeURIComponent("/store/downloadApp")+"/data/" + encodeURIComponent(string))
                        .success(function (data) {
                            console.log(data);
                            sweet.show("Success","App successfully installed","success");
                            $mdDialog.hide();

                        })
                        .error(function (data, status) {
                            console.log("error", data);
                            sweet.show("Error", data.error, "error");
                            //     $mdDialog.show(
                            //         $mdDialog.alert()
                            //         .clickOutsideToClose(true)
                            //         .title('This is an alert title')
                            //         .textContent('You can specify some description text in here.')
                            //         .ariaLabel('Alert Dialog Demo')
                            //         .ok('Got it!')
                            //     // .targetEvent(ev)
                            // );

                        })

                    ///////////

                });
            }
            if ($scope.app == "base"){
                $scope.confirm();
            }
        }

        $scope.backModal = function(){
            var s= $scope.$new();
            s.modalData = parent.modalData;
            $mdDialog.show({
                templateUrl: "/applications/newfile/" + modal + "/template_modal.html",
                locals: {data:{modalData:s.modalData/*, base:parent.base,selected:parent.base,description:parent.description,image:parent.image,list:parent.list*/}},
                controller: "modal" + modal,
                clickOutsideToClose: false,
                bindToController: true
            });
        }
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };
    }
}]);