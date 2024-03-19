//Select Branch To Duplicate
$scope.selectGLDuplicate = async function () {
    try {
        //validations
        $scope.selectedBranch = gridOptionsGlBranches.api.getSelectedRows();

        if ( $scope.selectedBranch.length ===0 ) {
            $shared.toastr.fire({
                icon: 'warning',
                title: `Please select Rows to Duplicate!`
            });
            return;
        }
        angular.element('#modalDuplicateAccts').modal('show');
        $scope.selectedToBeDuplicated =  $scope.selectedBranch;
    } catch (error) {
        console.log(error);
        $shared.toastr.fire({
            icon: 'error',
            title: error.message
        });
        
    }
};

//DUPLICATE FUNCTION
$scope.duplicateGlAccs = async function () {
    loadingEvent(true);
   
    var similarBrCodeExists = $scope.selectedRows.some(row => row.BrCode === $scope.selectedBrCode);
    if (similarBrCodeExists) {
        $shared.toastr.fire({
            icon: 'warning',
            title: `Source and Destination Branches must not be the same!`
        });
        $scope.selectedMaintenance='';
        loadingEvent(false);
        return;
    }


    if ($scope.selectedBrCode<=0) {
        $shared.toastr.fire({
            icon: 'warning',
            title: `Please select Destination Branch to Proceed!`
        });
        loadingEvent(false);
        return;
        
    }
    try {
        const result = await Swal.fire({
            title: 'Duplicate Branches?',
            text: "Are you sure you want to Duplicate this GL Accounts?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: "Yes",
        });
        if (result.value) {
            var model = [
                {
                    BrCode: $scope.selectedBrCode,
                    SelectedRows: gridOptionsGlAccs.api.getSelectedRows(),
                }
            ];
          
            await GlSetupSvc.DuplicateGlAccs(model);
          
            
            $shared.toastr.fire({
                icon: 'success',
                title: `Updated Successfully!`
            });

            loadingEvent(false);
            $scope.$applyAsync();
        }
        loadingEvent(false);
        $scope.$applyAsync();
        loadingEvent(false);
    } catch (error) {
        console.log(error);
        $shared.toastr.fire({
            icon: 'error',
            title: error.message
        });
        loadingEvent(false);
    }
};