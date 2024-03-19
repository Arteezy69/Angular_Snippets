//from controller to service 
//await
service.getGlSetup = function () {
    return new Promise(function (resolve, reject) {
        $http.post(bkPath + 'api/pcf/getGlSetup')
            .then(function (response) {
                resolve(response.data);
            }, function (response) {
                console.error(response);
                reject(response);
            });
    });
}