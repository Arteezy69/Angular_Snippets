//Search
$scope.search = function (key) {
    gridOptionsReports.api.setQuickFilter(key);
    $scope.totalRows = gridOptionsReports.api.getDisplayedRowCount();
    
    var filteredData = gridOptionsReports.api.getModel().rowsToDisplay.map(row => row.data);
    computeTotal(filteredData);
}