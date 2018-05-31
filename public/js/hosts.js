/**
 * Created by weichunhe on 2015/10/21.
 */
require('app').register.controller('hostsController', function ($scope, $myhttp, $timeout, $rootScope) {
    $scope.hosts = [];
    $scope.tags = {};
    $scope.tagHost = '';
    $scope.loading = 0;
    $scope.tagTxt = '';
    $scope.showTagTxt = false;
    $scope.hostLoading = false;

    $scope.loadHosts =function () {
        $myhttp('hostLoading',$scope).get('spider/hosts', function (data) {
            data = data || [];
            data.forEach(host=> {
                if (host.master) {
                    host.masterUrl = host.url;
                }
                host.home = removeLastSlash(host.url) + '/spiderweb-node?' + $rootScope.TOKEN_PARAM;
            });
            $scope.hosts = data;
        });
    }

    function removeLastSlash(url) {
        if (url.lastIndexOf('/') === url.length - 1) {
            return url.substring(0, url.length - 1);
        }
        return url;
    }


    function loadTags(host) {
        $scope.tagTxt = '';
        $scope.tags = {};
        $scope.loading = 1;
        $scope.tagHost = host.name;
        doLoad(host);
    }

    function doLoad(host) {
        var url = 'spider/getTag?' + $rootScope.TOKEN_PARAM;
        if (!host.master) {
            url = url + '&hostUrl=' + removeLastSlash(host.intraUrl);
        }

        $myhttp.get(url, function (data) {
            $scope.loading --;
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
        $scope.tagTxt = '';
        $scope.tagHost = '全部(已去重)';
        $scope.loading = $scope.hosts.length;
        $scope.tags = {};
        $scope.hosts.forEach(host => {
            doLoad(host);
        });
    }

    function setTags(data) {
        data.forEach(line => {
            var tag = extractTag(line);
            if (tag) {
                if($scope.tags[line]){
                    tag.count = tag.count || 1;
                    tag.count ++;
                }
                $scope.tags[line] =tag ;
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
        for (var k in $scope.tags) {
            var tag = $scope.tags[k];
            txt.push(tag.title);
        }
        $scope.tagTxt = txt.join('\r\n');
    }

    function changeShowTagTxt(flag) {
        $scope.showTagTxt = flag;
        if (flag) {
            getTagTxt();
        }
    }

    $scope.loadTags = loadTags;
    $scope.loadAllTags = loadAllTags;
    $scope.getTagTxt = getTagTxt;
    $scope.changeShowTagTxt = changeShowTagTxt;
    $scope.loadHosts();
});