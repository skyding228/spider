/**
 * Created by weichunhe on 2015/10/21.
 */
require('app').register.controller('hostsController', function ($scope, $myhttp, $timeout, $rootScope) {
    $scope.hosts = [];
    $scope.tags = [];
    $scope.tagHost = '';
    $scope.loading = false;

    function loadHosts() {
        $myhttp.get('/spider/hosts', function (data) {
            data = data || [];
            data.forEach(host=> {
                if (host.master) {
                    host.masterUrl = host.url;
                }
                host.home = removeLastSlash(host.url) + '/spiderweb-node?' + $rootScope.TOKEN_PARAM;
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


    function loadTags(host) {
        $scope.loading = true;
        $scope.tagHost = host.name;
        var url = removeLastSlash(host.url) + '/spider/getTag?' + $rootScope.TOKEN_PARAM;
        $scope.tags = [];
        $myhttp.get(url, function (data) {
            $scope.loading = false;
            data.sort(sortApps);
            $scope.tags = data;
        });
    }

    function sortApps(t1, t2) {
        if (t1.app > t2.app) {
            return 1;
        }
        if (t1.app === t2.app) {
            return 0;
        }
        if (t1.app < t2.app) {
            return -1;
        }
    }

    $scope.loadTags = loadTags;
    loadHosts();
});