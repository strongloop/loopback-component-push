function DeviceListControl($scope, $http) {

    $http.get('/devices').success(function (data) {
        $scope.devices = data;
        $scope.orderProp = 'appId';
    });

    $scope.notify = function (id, msg) {
        $http.post('/devices/' + id + '/notify', {msg: msg}).success(function (data, status, headers) {
            $scope.status = 'Notification sent: ' + data + ' status: ' + status;
        });
    };

    $scope.delete = function (index, id) {
        $http.delete('/devices/' + id).success(function (data, status, headers) {
        $scope.devices.splice(index, 1);
        $scope.status = 'Record deleted: ' + id + ' status: ' + status;
        });
    };


  $scope.getAction = function (status) {
        return 'Active' === status ? 'Deactivate' : 'Activate';
    };

    $scope.switchStatus = function (device) {
        var newStatus = 'Active' === device.status ? 'Inactive' : 'Active';
        console.log('Setting status to '+newStatus);
        device.status = newStatus;
        $http.put('/devices/' + device.id, device ).success(function (data, status, headers) {
            $scope.status = 'Status changed: ' + data + ' status: ' + status;
        });
    };
}