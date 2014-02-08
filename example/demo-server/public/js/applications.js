function ApplicationsController($scope, $http) {

  $scope.load = function () {
    $http.get('/api/applications').success(function (data) {
      console.log(data);
      $scope.apps = data;
      $scope.orderProp = 'id';
    });
  };

  $scope.create = function (/* name, certData, keyData, gcmKey */) {
    $http.post('/api/applications',
      {
        name: $scope.name,
        pushSettings: {
          apns: {
            certData: $scope.certData,
            keyData: $scope.keyData
          },
          gcm: {
            serverApiKey: $scope.gcmKey
          }
        }
      })
      .success(function (data, status, headers) {
        // console.log(data, status);
        $scope.id = 'Application Id: ' + data.id;
        $scope.restApiKey = 'Application Key: ' + data.restApiKey;
      });
  };

  $scope.delete = function (index, id) {
    $http.delete('/api/applications/' + id).success(function (data, status, headers) {
      $scope.apps.splice(index, 1);
      $scope.status = 'Application deleted: ' + id + ' status: ' + status;
    });
  };
}