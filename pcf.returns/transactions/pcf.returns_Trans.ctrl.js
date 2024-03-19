(function () {
    'use strict';

    angular.module('app').controller('ReturnsCtrl', Controller);
    Controller.$inject = ['$scope', 'PCFReturnsSvc', 'toastr', '$localStorage', '$state', 'SharedSvc', '$filter','SourceSvc'];
    function Controller($scope, $service, toastr, $local, $state, $shared, $filter,$source) {
        $scope.user = $local.disbUser;

        this.$onInit = async _ => {
            setgridReturns();
            setgridReturnsDetails();

            $scope.filter = {
                SDate: new Date(),
                EDate: new Date(),
                BrCode: $local.appUnifyUser.WhsCode,
                CashoutId: 0
            };
            $scope.user = $local.appUnifyUser;
            $scope.filter.BrCode = $scope.user.WhsCode;

            await $scope.getBranches();
            await $scope.getReturns();
            await $scope.getReturnsDetails();
        }

        var gridOptionsReturns = {};
        var gridOptionsReturnsDetails={};

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

        //loading event
        function loadingEvent(loading) {
            $scope.loading = loading;
            if (loading) {
                gridOptionsReturns.api.showLoadingOverlay();
                gridOptionsReturnsDetails.api.showLoadingOverlay();
            } else {
                gridOptionsReturns.api.hideOverlay();
                gridOptionsReturnsDetails.api.hideOverlay();
            }
            $scope.$applyAsync();
        }

        //Return Amt
        $scope.returnAmt = async function () {
            try {
                loadingEvent(true);
                $scope.selectedRowsData = [];

                var selectedRows = gridOptionsReturnsDetails.api.getSelectedRows();
                var remarksInput = $('#remarksInput').val();

                //Row Amount
                selectedRows.forEach(row => {
                    $scope.ReturnAmt = row.ReturnAmt;
                });

                //---------------------------------------------------------------
                //Validations
                //---------------------------------------------------------------

                if (selectedRows.length === 0) {
                    $shared.toastr.fire({
                        icon: 'warning',
                        title: `Please select rows to return!`
                    });
                    loadingEvent(false);
                    return;
                }

                if (!$scope.inputReturnAmt) {
                    $shared.toastr.fire({
                        icon: 'warning',
                        title: `Please input amount to Return!`
                    });
                    loadingEvent(false);
                    return;
                }
                //console.log('Return amount entered:', $scope.inputReturnAmt);
                if ($scope.ReturnAmt === $scope.inputReturnAmt) {
                    $shared.toastr.fire({
                        icon: 'warning',
                        title: `Cannot Return the same amount!`
                    });
                    loadingEvent(false);
                    return;
                }
                if (selectedRows.some(row => parseFloat($('#returnAmtInput').val()) > row.GrossAmt)) {
                    $shared.toastr.fire({
                        icon: 'warning',
                        title: `Invalid Amount: Return amount must not be higher than the Gross Amount!`
                    });
                    loadingEvent(false);
                    return;
                }
                if (selectedRows.some(row => row.ReturnAmt===0 )) {
                    $shared.toastr.fire({
                        icon: 'warning',
                        title: `Please make sure Return Amount is not 0 before returning it!`
                    });
                    loadingEvent(false);
                    return;
                }
                //No Remarks validation
                if (!remarksInput) {
                    $shared.toastr.fire({
                        icon: 'warning',
                        title: `Please Input Remarks!`
                    });
                    loadingEvent(false);
                    return;
                }

                //Selected Rows
                selectedRows.forEach(row => {
                    row.ReturnAmt = parseFloat($('#returnAmtInput').val());
                    row.Remarks = $('#remarksInput').val();
                });

                //Modal
                const result = await Swal.fire({
                    title: `Are you sure to Return the Amount?`,
                    showCancelButton: true,
                    confirmButtonColor: "#345C72",
                    confirmButtonText: "Yes",
                });
                if (result.value) {
                    loadingEvent(true);

                    await $service.returnAmt( selectedRows );

                    $shared.toastr.fire({
                        icon: 'success',
                        title: `Updated Successfully!`
                    });
                    $scope.getReturns();
                    $('#updateReturnsModal').modal('hide');

                    loadingEvent(false);
                    $scope.$applyAsync();
                    return true;
                }
            } catch (error) {
                $shared.toastr.fire({
                    icon: 'error',
                    title: error.message
                });
                loadingEvent(false);
            }
            loadingEvent(false);
        }

        //----------------------------------------------------------------
        //Get
        //----------------------------------------------------------------
        //GetReturns
        $scope.getReturns = async function () {
            loadingEvent(true);
            try {
                $scope.data = await $service.getReturns($scope.filter);
                gridOptionsReturns.api.setRowData($scope.data);
                computeTotal($scope.data);
                $scope.totalRows = gridOptionsReturns.api.getDisplayedRowCount();

            } catch (error) {
                $shared.toastr.fire({
                    icon: 'error',
                    title: error.message
                });
            }
            loadingEvent(false);
        }

        //Get Returns Details
        $scope.getReturnsDetails = async function () {
            loadingEvent(true);
            try {
                $scope.data = await $service.getReturnsDetails($scope.filter);
                gridOptionsReturnsDetails.api.setRowData($scope.data);
                computeTotalDetails($scope.data);
                $scope.totalRowsDetails = gridOptionsReturnsDetails.api.getDisplayedRowCount();
            } catch (error) {
                $shared.toastr.fire({
                    icon: 'error',
                    title: error.message
                });
            }
            loadingEvent(false);
        }

        //----------------------------------------------------------------
        //Footer Computations
        //----------------------------------------------------------------
        function computeTotal(data) {
            if (data && data.length > 0) {
                let totalAmount = data.map(x => x.Amt).reduce((prev, current) => prev + current);
                let totalReturnAmount = data.map(x => x.ReturnAmt).reduce((prev, current) => prev + current);
        
                let totalAmounts = [{
                    ReturnAmt: totalReturnAmount,
                    Amt: totalAmount
                }];
                gridOptionsReturns.api.setPinnedBottomRowData(totalAmounts);
            }
        }
        function computeTotalDetails(data) {
            if (data && data.length > 0) {
                let totalAmount = data.map(x => x.Amt).reduce((prev, current) => prev + current);
                let totalReturnAmount = data.map(x => x.ReturnAmt).reduce((prev, current) => prev + current);
        
                let totalAmounts = [{
                    ReturnAmt: totalReturnAmount,
                    Amt: totalAmount
                }];
                gridOptionsReturnsDetails.api.setPinnedBottomRowData(totalAmounts);
            }
        }


        //Header Grid
        async function setgridReturns() {
            var columnDefs =
                [
                    {
                        headerName: "",
                        field: "selected",
                        pinned: true,
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
                    { headerName: "Cashout Id", field: "CashOutId", pinned: true,width: 100},
                    { headerName: 'Gross Amount', field: 'GrossAmt', width: 120, cellClass: ['text-end'] , cellRenderer: $shared.render.float,
                    pinned: 'bottom'
                    },
                    { headerName: 'Return Amount', field: 'ReturnAmt',width: 150, cellClass: ['text-primary','text-end text-bold'] ,
                    cellRenderer: $shared.render.float,
                        onCellClicked :async function (params) {
                            if (params.node.rowPinned === 'bottom') {
                                return;
                            }
                            $scope.selectedReturn = params.data;
                            $scope.filter.CashOutId = $scope.selectedReturn.CashOutId

                            $('#updateReturnsModal').modal('show');

                            await $scope.getReturnsDetails($scope.filter);

                            var returnAmtValue=params.data.ReturnAmt;
                            var remarksValue=params.data.Remarks;

                            $('#remarksInput').val(remarksValue);
                            $scope.$applyAsync();
                        }
                    },
                    { headerName: 'Amount', field: 'Amt', width: 120,  cellClass: ['text-success','text-end text-bold'], cellRenderer: $shared.render.float, pinned: 'bottom' ,},
                    { headerName: "Created By", field: "CreatedBy", width: 200 },
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
                    { headerName: "UpdateBy", field: "UpdateBy", width: 200 },

                ];
            gridOptionsReturns.defaultColDef = {
                resizable: true,
                filter: true,
                sortable: true,
            };

            gridOptionsReturns.columnDefs = columnDefs;
            gridOptionsReturns.enableCellTextSelection = true;
            gridOptionsReturns.rowSelection = 'multiple';
            gridOptionsReturns.animateRows = true;

            new agGrid.Grid(document.querySelector('#gridOptionsReturns'), gridOptionsReturns);
            gridOptionsReturns.api.setRowData([]);
            $scope.$applyAsync();
        }

        //Header Details
        async function setgridReturnsDetails() {
            var columnDefs =
                [
                    {
                        headerName: "",
                        field: "selected",
                        pinned: true,
                        headerCheckboxSelection: true,
                        headerCheckboxSelectionFilteredOnly: true,
                        checkboxSelection: true,
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: ['contains', 'startsWith', 'endsWith', 'equals', 'notEqual'] },
                        cellClass: 'text-center link',
                        width: 40,
                        checkboxSelection: true,
                        headerCheckboxSelection: true
                    },
                    { headerName: "Return Id", field: "ReturnId", width: 100, hide:true},
                    { headerName: "BaseDoc", field: "BaseDoc", width: 100, hide:true},
                    { headerName: "Cashout Id", field: "CashOutId",width: 100,pinned:true},
                    { headerName: "DocEntry", field: "DocEntry",pinned: true, width: 100, },
                    { headerName: 'Gross Amount', field: 'GrossAmt', width: 120, cellClass: ['text-end'] , cellRenderer: $shared.render.float,
                    pinned: 'bottom'
                    },
                    { headerName: 'Return Amount', field: 'ReturnAmt',width: 150, cellClass: ['text-primary','text-end text-bold'] ,
                    cellRenderer: $shared.render.float,
                        onCellClicked :async function (params) {
                            var returnAmtValue=params.data.ReturnAmt;
                            var remarksValue=params.data.Remarks;
                        }
                    },
                    { headerName: 'Amount', field: 'Amt', width: 120,  cellClass: ['text-success','text-end text-bold'], cellRenderer: $shared.render.float, pinned: 'bottom' ,},
                    { headerName: "Remarks", field: "Remarks",width: 260,hide:true},
                    { headerName: "BrCode", field: "BrCode", width: 100,},
                    { headerName: "AcctCode", field: "AcctCode", width: 100,},
                    { headerName: "PCFType", field: "PCFType", width: 100, },
                    { headerName: "Descrip", field: "Descrip", width: 250, },

                    { headerName: "DeptCode", field: "DeptCode", width: 100, },
                    { headerName: "SecCode", field: "SecCode",width: 100, },

                    { headerName: "PCFType", field: "PCFType", width: 100, },
                    { headerName: "Descrip", field: "Descrip", width: 250, },
                    { headerName: "Created By", field: "CreatedBy", width: 200 },
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
                    { headerName: "UpdateBy", field: "UpdateBy", width: 200 },

                ];
            gridOptionsReturnsDetails.defaultColDef = {
                resizable: true,
                filter: true,
                sortable: true,
            };

            gridOptionsReturnsDetails.columnDefs = columnDefs;
            gridOptionsReturnsDetails.enableCellTextSelection = true;
            gridOptionsReturnsDetails.rowSelection = 'multiple';
            gridOptionsReturnsDetails.animateRows = true;

            new agGrid.Grid(document.querySelector('#gridOptionsReturnsDetails'), gridOptionsReturnsDetails);
            gridOptionsReturnsDetails.api.setRowData([]);
            $scope.$applyAsync();
        }

        //----------------------------------------------------------------
        //Search
        //----------------------------------------------------------------
        $scope.search = function (key) {
            gridOptionsReturns.api.setQuickFilter(key);
            $scope.totalRows = gridOptionsReturns.api.getDisplayedRowCount();
            
            var filteredData = gridOptionsReturns.api.getModel().rowsToDisplay.map(row => row.data);
            computeTotal(filteredData);
        }

        //----------------------------------------------------------------
        //EXPORT
        //----------------------------------------------------------------
        $scope.export = async function () {
            loadingEvent(true);
            try {
                $scope.filteredRows = [];

                gridOptionsReturns.api.forEachNodeAfterFilterAndSort(node => {
                    $scope.filteredRows.push(node.data);
                });

                var output = await $service.export($scope.filteredRows);

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