/**
 * Created by weichunhe on 2015/10/21.
 */
require('app').register.controller('appsController', function ($scope, $myhttp, $timeout) {
    $scope.files = [];
    $scope.search = null;
    $scope.pwdSegments = [];
    var Files = [];
    var SearchChanges = [];

    function loadFiles(){
        $myhttp.get('/spider/files', function (data) {
            Files = data;
            //sortFiles(Files);
            searchFile();
        });
        setTimeout(loadFiles,30000);
    }
    loadFiles();
    function sortFiles(data){
        if(data){
            data.sort(function(a,b){
                var result = 0;
                if(a.path > b.path){
                    result = 1;
                }else if(a.path < b.path){
                    result = -1;
                }
                return result;
            });
        }
    }

    function searchFile() {
        var fileMap = {};
        Files.forEach(file => {
            var view = pickFileView(file);
            if (view) {
                fileMap[view.path] = view;
            }
        });
        var searchedFiles = [];
        for (var k in fileMap) {
            searchedFiles.push(fileMap[k]);
        }
        $scope.files = searchedFiles;
    }

    function changeSearch() {
        SearchChanges.forEach(timeout => {
            $timeout.cancel(timeout);
        });
        SearchChanges = [];
        SearchChanges.push($timeout(searchFile, 300));
    }

    /**
     *
     * @param file
     * @returns {
     *  name: show name,
     *  path:absolute path
     * }
     */
    function pickFileView(file) {
        if (!isInPwd(file)) {
            return null;
        }
        var view = {}, depth = getPwdDepth();
        if (!$scope.search) {
            view.name = file.segments[depth];
            if (depth === file.segments.length - 1) {
                file.name = view.name;
                view = file;
            } else {
                view.path = file.segments.slice(0, depth + 1).join('/');
            }
        } else {
            for (var i = depth; i < file.segments.length; i++) {
                if (file.segments[i].indexOf($scope.search) !== -1) {
                    view.name = file.segments.slice(depth, i + 1).join('/');
                    if (i === file.segments.length - 1) {
                        file.name = view.name;
                        view = file;
                    } else {
                        view.path = file.segments.slice(0, i + 1).join('/');
                    }
                    break;
                }
            }
        }
        if (view.name) {

            return view;
        }
        return null;
    }

    function isInPwd(file) {
        var depth = getPwdDepth();
        return compareArray($scope.pwdSegments, file.segments, depth);
    }

    /**
     * compare two arrays ,before depth should equal
     * @param a1
     * @param a2
     * @param depth
     */
    function compareArray(a1, a2, depth) {
        if (!depth) {
            depth = 0;
        }
        if (!a1 || !a2 || a1.length < depth || a2.length < depth) {
            return false;
        }
        for (var i = 0; i < depth; i++) {
            if (a1[i] !== a2[i]) {
                return false;
            }
        }
        return true;
    }

    function getPwdDepth() {
        return $scope.pwdSegments.length;
    }

    function isFile(name) {
        return !!name.size;
    }


    function changePwd(path) {
        if (!path) {
            $scope.pwdSegments = [];
        } else {
            $scope.pwdSegments = path.split('/');
        }
        $scope.search = null;
        searchFile();
    }


    function changePwdUseSegments(index) {
        changePwd($scope.pwdSegments.slice(0, index + 1).join('/'));
    }

    $scope.changeSearch = changeSearch;
    $scope.changePwdUseSegments = changePwdUseSegments;
    $scope.changePwd = changePwd;
    $scope.isFile = isFile;
});