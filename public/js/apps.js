/**
 * Created by weichunhe on 2015/10/21.
 */
require('app').register.controller('appsController', function ($scope, $myhttp, $timeout) {
    $scope.files = [];
    $scope.search = null;
    $scope.pwdSegments = [];
    var VALIDITY_PERIOD = 180 * 1000;
    var FileWS = null, FileWSId = null;
    /**
     * {
     *  folderName:{
     *       files:{uri:file} all files in the folder and subfolder
     *       folderName:{...
     *         }
     *       ...
     *    }
     * }
     * @type {{}}
     */
    var FileTree = {files: {}};
    /**
     * file object
     * {
     *  size
        shortName
        path
        segments
        uri
        tailUrl
        downloadUrl
        host
     * }
     */

    var SearchChanges = [];
    var supportWebSocket = !!window.WebSocket;
    if (!supportWebSocket) {
        alert('当前不支持WebSocket,请升级浏览器,否则影响体验!', 3000);
    }

    function loadFiles() {
        if (supportWebSocket) {
            loadFilesUseWs();
        } else {
            loadFilesUseHttp();
        }
        setTimeout(loadFiles, VALIDITY_PERIOD);
    }

    function loadFilesUseHttp() {
        $myhttp.get('/spider/files', function (data) {
            addFilesToTree(data);
            searchFile();
        });
    }

    function loadFilesUseWs() {
        if (!FileWSId) {
            $.get(window.location.origin + '/ws/new', function (data) {
                FileWSId = data;
                loadFilesUseWs();
            });
            return;
        }
        if (!FileWS) {
            FileWS = new WebSocket('ws://' + window.location.host + '/ws/files/' + FileWSId);
            FileWS.onmessage = function (event) {
                var files = JSON.parse(event.data);
                console.log("receive " + files.length + " files!");
                addFilesToTree(files);
                $timeout(searchFile);
            };
            FileWS.onclose = function (event) {
                FileWS = null;
                FileWSId = null;
            };
            FileWS.onopen = function (event) {
                FileWS.send('hello,give me files!');
            }
        } else {
            FileWS.send('hello,I need files!');
        }

    }

    function addFilesToTree(files) {
        var now = new Date().getTime();
        files && files.forEach(file=> {
            var tree = FileTree;
            file.updateAt = now;
            for (var i = 0; i < file.segments.length - 1; i++) {
                var folder = file.segments[i];
                if (!tree[folder]) {
                    tree[folder] = {files: {}};
                }
                if (!tree.files) {
                    tree.files = {};
                }
                tree.files[file.uri] = file;
                tree = tree[folder];
            }
            if (!tree.files) {
                tree.files = {};
            }
            tree.files[file.uri] = file;
            tree[file.uri] = file;
        });
    }


    function sortFileViews(data) {
        if (data) {
            data.sort(function (a, b) {
                if (a.name.length !== b.name.length) {
                    return a.name.length - b.name.length;
                }
                if (isFile(a)) {
                    return 1;
                }
                if (isFile(b)) {
                    return -1;
                }
                var result = 0;
                if (a.path > b.path) {
                    result = 1;
                } else if (a.path < b.path) {
                    result = -1;
                }
                return result;
            });
        }
        return data;
    }

    function searchFile() {
        var treeNode = getCurrentTreeNode();
        var views = [];
        if (!$scope.search) {
            views = listFileViews(treeNode);
        } else {
            views = filterFileViews(getFilesFromTreeNode(treeNode));
        }
        $scope.files = sortFileViews(views);
    }

    function filterFileViews(files) {
        var fileMap = {};
        files.forEach(file => {
            var view = pickFileView(file);
            if (view) {
                fileMap[view.path] = view;
            }
        });
        var searchedFiles = [];
        for (var k in fileMap) {
            searchedFiles.push(fileMap[k]);
        }
        return searchedFiles;
    }

    // use pwd to find out the tree node
    function getCurrentTreeNode() {
        var node = FileTree;
        $scope.pwdSegments.forEach(segment => {
            node = node[segment];
        });
        return node;
    }

    function listFileViews(treeNode) {
        var views = [];
        for (var k in treeNode) {
            if ('files' === k) {
                continue;
            }
            var view = treeNode[k];
            if (isFile(view)) {
                if (isOverdueFile(view)) {
                    delete treeNode[k];
                } else {
                    view.name = view.shortName;
                    views.push(view);
                }
            } else {
                view = {};
                view.name = k;
                view.path = $scope.pwdSegments.concat([k]).join('/');
                views.push(view);
            }
        }
        return views;
    }

    function getFilesFromTreeNode(treeNode) {
        var files = [], fileMap = treeNode.files;
        var now = new Date().getTime();
        for (var k in fileMap) {
            if (isOverdueFile(fileMap[k])) {
                delete fileMap[k];
                continue;
            }
            files.push(fileMap[k]);
        }
        return files;
    }

    function isOverdueFile(file, now) {
        now = now || new Date().getTime();
        return now - VALIDITY_PERIOD > file.updateAt;
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
        var view = {}, depth = getPwdDepth();
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
        if (view.name) {
            return view;
        }
        return null;
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

    //---------------------------websocket---------


    $scope.changeSearch = changeSearch;
    $scope.changePwdUseSegments = changePwdUseSegments;
    $scope.changePwd = changePwd;
    $scope.isFile = isFile;

    loadFiles();
});