function DeviceListControl($scope, $http) {

    $http.get('/deviceRegistrations').success(function (data) {
        $scope.devices = data;
        $scope.orderProp = 'appId';
    });

    $scope.notify = function (id, msg) {
        $http.post('/deviceRegistrations/' + id + '/notify', {msg: msg}).success(function (data, status, headers) {
            $scope.status = 'Notification sent: ' + data + ' status: ' + status;
        });
    };

    $scope.getAction = function (status) {
        return 'Active' === status ? 'Deactivate' : 'Activate';
    };

    $scope.switchStatus = function (device) {
        var newStatus = 'Active' === device.status ? 'Inactive' : 'Active';
        console.log('Setting status to '+newStatus);
        device.status = newStatus;
        $http.put('/deviceRegistrations/' + device.id, device ).success(function (data, status, headers) {
            $scope.status = 'Status changed: ' + data + ' status: ' + status;
        });
    };
}