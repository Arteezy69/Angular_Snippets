//from controller to service 
//await
service.PostGLAccts = function () {
    return new Promise(function (resolve, reject) {
        $http.post(bkPath + 'api/pcf/postGLAccts')
            .then(function (response) {
                resolve(response.data);
            }, function (response) {
                console.error(response);
                reject(response);
            });
    });
}


//------------------------------------------------------------------
//Add GL Accounts 
$scope.AddGLAccts = async function (item) {
    //loadingEvent(true);
    $scope.isDuplicate = $scope.setupdata.filter(x => x.AcctCode === item.AcctCode.toString());

    if ($scope.isDuplicate.length > 0) {
        $shared.toastr.fire({
            icon: 'error',
            title: `Item already exists in the Grid!`
        });
        $scope.selectedMaintenance = '';
        loadingEvent(false);
        return;
    }

    try {
        //SWAL
        const result = await Swal.fire({
            title: 'Add GL Account?',
            text: "Are you sure you want to Add this GL Account?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: "Yes",
        });
        if (result.value) {
            await GlSetupSvc.PostGLAccts($scope.selectedGLAccts);

            $scope.getGlSetup();
            $shared.toastr.fire({
                icon: 'success',
                title: `Added Successfully!`
            });
        }

    } catch (error) {
        console.log(error);
        $shared.toastr.fire({
            icon: 'error',
            title: error.message
        });
        loadingEvent(false);
    }
};