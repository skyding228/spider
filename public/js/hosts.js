/**
 * Created by weichunhe on 2015/10/21.
 */
require('app').register.controller('hostsController', function ($scope, $myhttp, $timeout) {
    $scope.hosts = [];

    function loadHosts() {
        $myhttp.get('/spider/hosts', function (data) {
            $scope.hosts = data;
        });
        setTimeout(loadHosts, 30000);
    }

    loadHosts();
});