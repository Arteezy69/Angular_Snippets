var gridOptionsSetup = {};

//loading event
function loadingEvent(loading) {
    $scope.loading = loading;
    if (loading) {

        gridOptionsSetup.api.showLoadingOverlay();


    } else {

        gridOptionsSetup.api.hideOverlay();
    }
    $scope.$applyAsync();
}


//LOAD GRID FUNCTIONS
$scope.getGlSetup = async function () {
    loadingEvent(true);
    try {
        $scope.setupdata = await GlSetupSvc.getGlSetup($scope.rows);
        gridOptionsSetup.api.setRowData($scope.setupdata);

    } catch (error) {
        $shared.toastr.fire({
            icon: 'error',
            title: error.message
        });
        loadingEvent(false);

    }
    loadingEvent(false);

}

//SETUP GRID
function setgridSetup() {
    var columnDefs =
        [
            {
                headerName: "",
                field: "selected",
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                filter: 'agTextColumnFilter',
                filterParams: { filterOptions: ['contains', 'startsWith', 'endsWith', 'equals', 'notEqual'] },
                cellClass: 'text-center link',
                width: 40,
                checkboxSelection: true,
                headerCheckboxSelection: true,

            },
            { headerName: "AcctCode", field: "AcctCode", width: 100, editable: true, },
            { headerName: "Acct Name", field: "AcctName", width: 300, },
            {
                headerName: "Description", editable: true, filter: 'agTextColumnFilter', filterParams: { filterOptions: ['contains', 'startsWith', 'endsWith', 'equals', 'notEqual'] },
                field: "Descrip", width: 330,
                onCellValueChanged: async function (params) {
                    var input = params.data;
                    try {
                        await $scope.updateDescription([input]);
                    } catch (error) {
                        toastr.warning("Error", 'Notification');
                    }
                }
            },
            // {
            //     headerName: "Status", field: "Active", width: 100,
            //     cellRenderer: function (params) {
            //         var status = params.value === true ? 'Active' : 'Inactive';
            //         var color = params.value === true ? 'green' : 'red';
            //         return `<span style="color: ${color};">${status}</span>`;
            //     }
            // },
            {
                headerName: "Date Created", field: "DateCreated", width: 120,
                cellRenderer: function (params) {
                    if (params.value && params.value.substring(0, 10) === '1900-01-01') {
                        return '';
                    } else {
                        return $filter('date')(params.value, 'yyyy-MM-dd');
                    }
                }
            },
            { headerName: "Created By", field: "CreatedBy", width: 200 },
            {
                headerName: "LastUpdate", field: "LastUpdate", width: 120,
                cellRenderer: function (params) {
                    if (params.value && params.value.substring(0, 10) === '1900-01-01') {
                        return '';
                    } else {
                        return $filter('date')(params.value, 'yyyy-MM-dd');
                    }
                }
            },
            { headerName: "Update By", field: "UpdateBy", width: 200 },

        ];
    gridOptionsSetup.defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
    };


    gridOptionsSetup.columnDefs = columnDefs;
    gridOptionsSetup.enableCellTextSelection = true;
    gridOptionsSetup.rowSelection = 'multiple';
    gridOptionsSetup.animateRows = true;
    new agGrid.Grid(document.querySelector('#gridOptionsSetup'), gridOptionsSetup);
    gridOptionsSetup.api.setRowData([]);
    $scope.$applyAsync();
}


//Search
$scope.onFilterTextBoxChanged2 = () => {
    if (gridOptionsSetup.api) {
        gridOptionsSetup.api.setQuickFilter($scope.searchfilter2);
    } else {
        console.error('Grid API not available');
    }
}

this.$onInit = function () {

    setgridSetup();
    $scope.getGlSetup();
}



