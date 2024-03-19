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