//----------------------------------------------------------------
//EXPORT
//----------------------------------------------------------------
$scope.exportGlSetup = async function () {
    loadingEvent(true);
    try {
        $scope.filteredRows = [];

        gridOptionsSetup.api.forEachNodeAfterFilterAndSort(node => {
            $scope.filteredRows.push(node.data);
        });

        var output = await GlSetupSvc.ExportGlSetup($scope.filteredRows);

        // Export to Excel
        $shared.exportToExcel(`GL ACCOUNTS SETUP `, output);
    } catch (ex) {
        $shared.toastr.fire({
            icon: 'error',
            title: ex.message
        });
    }
    loadingEvent(false);
}