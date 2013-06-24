function DeviceListControl($scope, $http) {

    $http.get('/deviceRegistrations').success(function (data) {
        $scope.devices = data;
        $scope.orderProp = 'appId';
    });

    $scope.notify = function (id, msg) {
        $http.post('/deviceRegistrations/' + id + '/notify', {msg: msg}).success(function (data, status, headers) {
            console.log(status);
        });
    }

    $scope.getAction = function (status) {
        return 'Active' === status ? 'Deactivate' : 'Activate';
    }

    $scope.switchStatus = function (device) {
        var newStatus = 'Active' === device.status ? 'Inactive' : 'Active';
        console.log('Setting status to '+newStatus);
        device.status = newStatus;
        $http.put('/deviceRegistrations/' + id, device ).success(function (data, status, headers) {
            console.log(status);
        });
    }
}