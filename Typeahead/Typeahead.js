//LOGIC
// 1. Get data first in console 
// 2. 
// 2. select the data in typeahead 
// 3. create typeAhead event 'Enter' or 'click '
// 4. create add function with Duplicate validation and Swal to Add the data in database
// 5. 

//------------------------------------------------------------------
//Load Data in Typeahead
$scope.Dropdown = [];
$scope.getGlList = async function () {
    try {
        $scope.Dropdown = await GlSetupSvc.getGlList();

    } catch (error) {
        console.log(error);
        $scope.loading = false;
    }
};

//------------------------------------------------------------------
//selected GL Accts 
$scope.onMaintenanceSelected = function (item) {
    if (item && item.AcctCode) {
        $scope.AddGLAccts(item);

    }
};

$scope.onTypeaheadSelect = function (item, model, label, event) {
    if (event) {
        if (event.key === 'Enter' || event.type === 'click') {
            $scope.selectedMaintenance = item.AcctCode + ' - ' + item.AcctName;
            $scope.onMaintenanceSelected(item);
        }
    }
};



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

//------------------------------------------------------------------
//HTML
<div>
    <label for="includedGLAccounts">Included GL Accounts</label>
    <input type="text" id="includedGLAccounts" class="form-control" ng-model="selectedMaintenance"
        uib-typeahead="maintenanceItem as (maintenanceItem.AcctCode + ' - ' + maintenanceItem.AcctName) for maintenanceItem in Dropdown | filter:$viewValue | limitTo:8"
        ng-change="onMaintenanceSelected(selectedMaintenance)"
        typeahead-on-select="onTypeaheadSelect($item, $model, $label, $event)" />



</div>

