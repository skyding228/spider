/**
 * Created by weichunhe on 2015/10/21.
 */
require('app').register.controller('hostsController', function ($scope, $myhttp, $timeout, $rootScope) {
    $scope.hosts = [];
    $scope.tags = [];
    $scope.tagHost = '';
    $scope.loading = false;
    $scope.loadingAll = 0;
    $scope.tagTxt = '';
    $scope.showTagTxt = false;


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
        $scope.tags = [];
        $scope.loading = true;
        doLoad(host);
    }

    function doLoad(host) {
        $scope.tagHost = host.name;
        var url = '/spider/getTag?' + $rootScope.TOKEN_PARAM;
        if (!host.master) {
            url = url + '&hostUrl=' + removeLastSlash(host.url);
        }

        $myhttp.get(url, function (data) {
            $scope.loading = false;
            $scope.loadingAll --;
            try {
                if (!Array.isArray(data)) {
                    data = JSON.parse(data);
                }
            } catch (e) {
                console.log('get tag error！', url, e);
            }
            setTags(data);
        });
    }

    function loadAllTags() {
        $scope.tagHost = '全部';
        $scope.loadingAll = $scope.hosts.length;
        $scope.tags = [];
        $scope.hosts.forEach(host => {
            doLoad(host);
        });
    }

    function setTags(data) {
        data.forEach(line => {
            var tag = extractTag(line);
            if (tag) {
                $scope.tags.push(tag);
            }
        });
    }

//fj340_dpm-task: tag with fj316_dpm_func121_build_20171030.1 from http://svn.vfinance.cn/svn/fujie/src/pmd/basis/dpm/branches/fit_wangshang_2.1.0@228486
// {app:fj340_dpm-task,tag:fj316_dpm_func121_build_20171030.1,branch:fit_wangshang_2.1.0@228486}
    function extractTag(line) {
        line = line && line.trim();
        if (!line) {
            return null;
        }
        var segments = line.split(/\s+/);
        var app = segments[0].substring(0, segments[0].length - 1); //remove :
        var tag = segments[3];
        var branch = segments[5].substring(segments[5].lastIndexOf('/') + 1);
        return {app: app, tag: tag, branch: branch, title: line};
    }

    function getTagTxt() {
        $scope.tagTxt = '';
        var txt = [];
        $scope.tags.forEach(tag=> {
            txt.push(tag.title);
        });
        $scope.tagTxt = txt.join('\r\n');
    }

    function changeShowTagTxt(flag){
        $scope.showTagTxt = flag;
    }
    $scope.loadTags = loadTags;
    $scope.loadAllTags = loadAllTags;
    $scope.getTagTxt = getTagTxt;
    $scope.changeShowTagTxt = changeShowTagTxt;
    loadHosts();
});