(function () {
    'use strict';

    angular.module('app').controller('ReportsCtrl', Controller);
    Controller.$inject = ['$scope', 'PCFReturnsSvc', 'toastr', '$localStorage', '$state', 'SharedSvc', '$filter','SourceSvc'];
    function Controller($scope, $service, toastr, $local, $state, $shared, $filter,$source) {
        $scope.user = $local.disbUser;
        var gridOptionsReports = {};

        function loadingEvent(loading) {
            $scope.loading = loading;
            if (loading) {
                gridOptionsReports.api.showLoadingOverlay();
            } else {
                gridOptionsReports.api.hideOverlay();
            }
            $scope.$applyAsync();
        }
        
        this.$onInit = async function () {
            setgridReports();
          
            $scope.filter = {
                SDate: new Date(),
                EDate: new Date(),
                BrCode: $local.appUnifyUser.WhsCode,
            };
            $scope.user = $local.appUnifyUser;
            $scope.filter.BrCode = $scope.user.WhsCode;

            await $scope.getBranches();
            await $scope.getReports(); 
        }

        //get branches
        $scope.getBranches =async function(){
            $scope.branches = await $source.branches();
            var Branches = $scope.branches.find(branch => branch.Code === $local.appUnifyUser.WhsCode);
            if (Branches) {
                
                $scope.Blk = Branches.Blk;
            } else {
                console.log('Branch not found.');
            }

        }
        //Get
        $scope.getReports = async function () {
            loadingEvent(true);
            try {
                $scope.data = await $service.getReports($scope.filter);
                gridOptionsReports.api.setRowData($scope.data);
                $scope.totalRows = gridOptionsReports.api.getDisplayedRowCount();
                computeTotal($scope.data);
            } catch (error) {
                $shared.toastr.fire({
                    icon: 'error',
                    title: error.message
                });  
            }
            loadingEvent(false);
        }
        //Grid
        async function setgridReports() {
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
                    //HIDDEN
                    { headerName: "Return Id", field: "ReturnId", width: 100,hide:true},
                    { headerName: "BaseDoc", field: "BaseDoc", width: 100, hide:true},
                    { headerName: "DocEntry", field: "DocEntry", width: 100, },                   
                    { headerName: "EmpCode", field: "EmpCode", width: 100,hide:true },
                    { headerName: 'GrossAmt', field: 'GrossAmt', width: 100, cellClass: ['text-end'] , cellRenderer: $shared.render.float,hide:true },
                    { headerName: 'Amount', field: 'Amt', width: 100, cellClass: ['text-success','text-end text-bold'], cellRenderer: $shared.render.float,hide:true},
                    //Fields
                    { headerName: 'Return Amount', field: 'ReturnAmt', width: 150, cellClass: ['text-primary','text-end text-bold'] , cellRenderer: $shared.render.float,},
                    { headerName: "Remarks", field: "Remarks", width: 250,},
                    { headerName: "Created By", field: "CreatedBy", width: 180 },
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
                    { headerName: "LastUpdate", field: "LastUpdate", width: 120,
                        cellRenderer: function(params) {
                            if (params.value && params.value.substring(0, 10) === '0001-01-01') {
                                return '';
                            } else {
                                return $filter('date')(params.value, 'yyyy-MM-dd');
                            }
                        }
                    },
                    { headerName: "Update By", field: "UpdateBy", width: 180 },

                ];
                gridOptionsReports.defaultColDef = {
                resizable: true,
                filter: true,
                sortable: true,
            };

            gridOptionsReports.columnDefs = columnDefs;
            gridOptionsReports.enableCellTextSelection = true;
            gridOptionsReports.rowSelection = 'multiple';
            gridOptionsReports.animateRows = true;

            new agGrid.Grid(document.querySelector('#gridOptionsReports'), gridOptionsReports);
            gridOptionsReports.api.setRowData([]);
            $scope.$applyAsync();
        }

        //Footer Computations
        function computeTotal(data) {
            if (data && data.length > 0) {
                let totalReturnAmount = data.map(x => x.ReturnAmt).reduce((prev, current) => prev + current);
        
                let totalAmounts = [{
                    ReturnAmt: totalReturnAmount,
                }];
                gridOptionsReports.api.setPinnedBottomRowData(totalAmounts);
            }
        }

        //Search
        $scope.search = function (key) {
            gridOptionsReports.api.setQuickFilter(key);
            $scope.totalRows = gridOptionsReports.api.getDisplayedRowCount();
            
            var filteredData = gridOptionsReports.api.getModel().rowsToDisplay.map(row => row.data);
            computeTotal(filteredData);
        }

        //Export
        $scope.exportReports = async function () {
            loadingEvent(true);
            try {
                $scope.filteredRows = [];
                
                gridOptionsReports.api.forEachNodeAfterFilterAndSort(node => {
                    $scope.filteredRows.push(node.data);
                });
              
                var output = await $service.exportReports($scope.filteredRows);
        
                // Export to Excel
                $shared.exportToExcel(`PCF-Returns`, output);
            } catch (ex) {
                $shared.toastr.fire({
                    icon: 'error',
                    title: ex.message
                });
            }
            loadingEvent(false);
        }
    }
})();