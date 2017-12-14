var app = angular.module("ApioApplication_TMP_", ["apioProperty"]);
app.controller("defaultController", ["$scope", "currentObject", function ($scope, currentObject) {
    $scope.object = currentObject.get();
    console.log("Sono il defaultController e l'oggetto è: ", $scope.object);
    //ordino le date in manutenzioni in ordine decrescente
	$scope.object.db.manutenzione.sort(function (a, b) {
	   var aComponents = a.date.split("-")[0].trim().split("/");
	   var bComponents = b.date.split("-")[0].trim().split("/");
	   return Number(bComponents[2]) - Number(aComponents[2]) || Number(bComponents[1]) - Number(aComponents[1]) || Number(bComponents[0]) - Number(aComponents[0])
	});
	//alert($scope.object.db.manutenzione[0].date)
	$scope.object.prossima_manutenzione = $scope.object.db.manutenzione[0].date;
	var date = $scope.object.prossima_manutenzione.split("/");
    //var host = $location.host();
    var today = new Date();
    $scope.month = today.getMonth() + 1;
    var day = today.getDate();
    $scope.data = today.getDate() + "/" + $scope.month + "/" + today.getFullYear();
    for (var a in $scope.object.data) {
        $scope[a] = $scope.object.data[a];
        console.log("CIAOOOO ", $scope[a])
    }
    console.log("Scope ", $scope)
    $scope.next = {}
    $scope.next.manutentore = "";
    $scope.next.azienda = "";
    var x = $scope.object.db.manutenzione[$scope.object.db.manutenzione.length - 1].date;
    var processing = x.split("-");
    x = processing[0];
    processing = x.split("/")
    console.log(x);
    processing[1] = Number(processing[1]) + 1;
    var s = processing[2].split(" ")
    processing[2] = s[0]
    if (processing[1] < 10) {
        var appoggio = "0"
        appoggio = appoggio + String(processing[1])
        processing[1] = appoggio
    } else {
        processing[1] = String(processing[1]);
    }
    console.log(processing[0])
    console.log(processing[1])
    if(Number(processing[0])<10) {
    	processing[0]= "0"+String(processing[0]);
    } else {
    	processing[0]=String(processing[0]);
    }
    var d = new Date(processing[2] + "-" + processing[1] + "-" + processing[0]);
    $scope.next.date = today.getDate() + "/" + $scope.month + "/" + today.getFullYear();

    $scope.next.dateP = processing[0] + "/" + processing[1] + "/" + processing[2];
    if (today <= d) {
        document.getElementById("prossima").setAttribute("style", "background-color:rgb(200, 219, 177) !important;");
    } else {
        document.getElementById("prossima").setAttribute("style", "background-color:rgb(219, 131, 122) !important;");
    }
    
    $scope.update = function () {
        var o = {}
        o.command = "$push";
        o.who = $scope.object.objectId
        o.where = {}
        o.where.data = {}
        o.where.data.manutenzione = []
        o.data = {}
        o.data.date = $scope.next.date;
        o.data.manutentore = $scope.next.manutentore;
        o.data.aziendaManutenzione = $scope.next.azienda;
        o.where.data.manutenzione.push(o.data);
        console.log("DATA: ", $scope.date);
        console.log("MANUTENTORE: ", $scope.manutentore);
        console.log("AZIENDA MANUTENZIONE: ", $scope.aziendaManutenzione);
        /*console.log($scope.aziendaManutenzione)*/
        //$http.get("/apio/getService/log").success(function (service) {
        //    $http.post("http://" + host + ":" + service.port + "/apio/log/data/insert", {
        //        data: o
        //    }).success(function () {
        //        $scope.object.data.manutenzione.push(o.data)
        //        $scope.next.manutentore = "";
        //        $scope.next.azienda = "";
        //    });
        //});
		document.getElementById('prossima').classList.add('update');
		document.getElementById('prossima').classList.remove('update');
        $scope.object.db.manutenzione.unshift(o.data);
        $scope.next.dateP = o.data.date;
        $scope.next.manutentore = "";
        $scope.next.azienda = "";
        alert('Manutenzione Registrata con Successo');
        /*$http.post("/apio/service/log/route/" + encodeURIComponent("/apio/log/data/insert") + "/data/" + encodeURIComponent(JSON.stringify({data: o}))).success(function () {
	        document.getElementById('prossima').classList.remove('update');
            $scope.object.data.manutenzione.unshift(o.data);
            $scope.next.dateP = o.data.date;
            $scope.next.manutentore = "";
            $scope.next.azienda = "";
            alert('Manutenzione Registrata con Successo');
        });*/
        document.getElementById("newManutenzione").classList.remove("in");
    };
    

}]);

setTimeout(function () {
    angular.bootstrap(document.getElementById("ApioApplication_TMP_"), ["ApioApplication_TMP_"]);
}, 10);