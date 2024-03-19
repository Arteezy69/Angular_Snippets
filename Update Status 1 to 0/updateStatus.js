 //------------------------------------------------------------------
        //UDATE FUNCTIONS

        //Update GL Accs
        $scope.updateGlAccs = async function () {
            loadingEvent(true);
            var ctr = 0;
            var selectedRows = gridOptionsSetup.api.getSelectedRows();

            selectedRows.forEach(e => {
                if (e.Active === 'True') {
                    ctr++;
                }
            });

            if ( $scope.uncheckedRows<=0 ) {
                $shared.toastr.fire({
                    icon: 'warning',
                    title: `Please uncheck rows first to Update GL Accounts!`
                });
                loadingEvent(false);
                return;
            }

            try {
                const result = await Swal.fire({
                    title: 'Update Status?',
                    text: "Are you sure you want to Update the status of this GL Account?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: "Yes",
                });
                if (result.value) {

                   
                    await GlSetupSvc.updateGlAccs($scope.uncheckedRows);
                    $scope.getGlBranches();
                    $scope.getGlAccs();

                    //Success Message.
                    $shared.toastr.fire({
                        icon: 'success',
                        title: `Updated Successfully!`
                    });

                    loadingEvent(false);
                    $scope.$applyAsync();

                }
                loadingEvent(false);
                $scope.$applyAsync();
            } catch (error) {
                console.log(error);
                $shared.toastr.fire({
                    icon: 'error',
                    title: error.message
                });
                loadingEvent(false);
            }
        };