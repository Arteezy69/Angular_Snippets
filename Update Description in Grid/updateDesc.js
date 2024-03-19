$scope.updateDescription = async function () {
    try {
        loadingEvent(true);
        $scope.selectedRowsData = [];
        var selectedRows = gridOptionsSetup.api.getSelectedRows();


        selectedRows.forEach(updatedItem => {
            var node = gridOptionsSetup.api.getRowNode(updatedItem.id);
            if (node && gridOptionsMaintenance.columnApi.getColumn('Descrip').getColDef().editable) {
                node.setDataValue('Descrip', updatedItem.Descrip);
                $scope.selectedRowsData.push(updatedItem);
            }
        });
        var selectedData = $scope.selectedRowsData.map(function (row) {
            return {
                Id: row.Id,
                AcctCode: row.AcctCode,
                Descrip: row.Descrip
            };
        });

        const result = await Swal.fire({
            title: 'Update Description?',
            text: "Are you sure you want to Update the Description of this GL Account?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: "Yes",
        });
        if (result.value) {
            await GlSetupSvc.updateDescription(selectedRows);
            //gridOptionsSetup.setRowData(data);

            $shared.toastr.fire({
                icon: 'success',
                title: `Removed Successfully!`
            });

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

}