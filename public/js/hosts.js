/**
 * Created by weichunhe on 2015/10/21.
 */
require('app').register.controller('hostsController', function ($scope,$myhttp,$timeout) {
    $scope.hosts = [{name:'app1',url:'',master:1,local:1}];

    $myhttp.get('/spider/hosts',function(data){
        $scope.hosts = data;
    });
});