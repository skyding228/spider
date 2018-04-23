/**
 * Created by weichunhe on 2015/10/21.
 */
require('app').register.controller('hostsController', function ($scope, $myhttp, $timeout, $rootScope) {
    $scope.hosts = [];

    function loadHosts() {
        $myhttp.get('/spider/hosts', function (data) {
            data = data || [];
            data.forEach(host=> {
                host.url = removeLastSlash(host.url) + (  host.master ? '' : '/spiderweb-node?' + $rootScope.TOKEN_PARAM);
            });
            $scope.hosts = data;
        });
        setTimeout(loadHosts, 30000);
    }

    function removeLastSlash(url) {
        if (url.lastIndexOf('/') === url.length - 1) {
            return url.substring(0, url.length - 1);
        }
        return url;
    }

    loadHosts();
});