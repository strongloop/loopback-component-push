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
}