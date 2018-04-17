/**
 * Created by weichunhe on 2015/10/21.
 */
require('app').register.controller('appsController', function ($scope, $myhttp, $timeout) {
    $scope.files = [];
    $scope.search = null;
    $scope.pwd = '';
    var Files = [];
    $myhttp.get('/spider/files', function (data) {
        Files = data;
        searchFile();
    });

    function searchFile() {
        var fileMap = {};
        Files.forEach(fileSteps => {
            var file = getFileName(fileSteps);
            if(file){
                fileMap[file.path || file] = file;
            }
        });
        var searchedFiles = [];
        for (var k in fileMap) {
            searchedFiles.push(fileMap[k]);
        }
        $scope.files = searchedFiles;
    }

    /**
     *
     * @param fileSteps
     * @returns {
     *  name:short name,
     *  path:absolute path
     * }
     */
    function getFileName(fileSteps) {
        fileSteps = inPwdSteps(fileSteps);
        if(!fileSteps){
            return null;
        }
        var step = null;
        if (!$scope.search) {
            step = fileSteps[0];
        }else{
            for (var i = 0; i < fileSteps.length - 1; i++) {
                if (fileSteps[i].indexOf($scope.search) !== -1) {
                    step = fileSteps[i];
                    break;
                }
            }
            if (step == null) {
                if (fileSteps[fileSteps.length - 1].path.indexOf($scope.search) !== -1) {
                    step = fileSteps[fileSteps.length - 1];
                }
            }
        }
        return step;
    }

    function inPwdSteps(steps){
        var depth = getPwdDepth();
        if(depth == 0){
            return steps;
        }
        if(steps.length > depth && steps[depth-1] == $scope.pwd){
            var pwdSteps = steps.slice(depth);
            var removeSteps = [];
            pwdSteps.forEach(step =>{
                if(isFile(step)){
                    step.path = step.path.substring($scope.pwd.length+1);
                }else {
                    step = step.substring($scope.pwd.length+1);
                }
               removeSteps.push(step);
            });
            return removeSteps;
        }
        return null;
    }
    function getPwdDepth() {
        var segments = $scope.pwd.split('/');
        var depth = 0;
        segments.forEach(step=> {
            depth += step ? 1 : 0;
        });
        return depth;
    }

    function isFile(name){
        return !!name.path;
    }

    function startsWith(str,prefix){
        if(str && (str.indexOf(prefix) === 0)){
            return true;
        }
        return false;
    }
    function removeFirstSlash(name){
        return startsWith(name,'/') ? name.substring(1) : name;
    }

    $scope.changePwd = function (folder) {
        $scope.pwd = $scope.pwd + folder;
        searchFile();
    };

    $scope.isFile = isFile;
    $scope.removeFirstSlash = removeFirstSlash;
});