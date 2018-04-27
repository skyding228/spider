/**
 * Created by weichunhe on 2015/7/6.
 */
(function (_t) {

    _t.GetRelativePath = function () {
        var path = location.pathname;
        if (path) {
            path = path.substring(0, path.lastIndexOf('/'));
        } else {
            path = '';
        }
        return path;
    };
    var pathPrefix = _t.GetRelativePath();
    var ROOT = pathPrefix + '/public/',
        BASE = ROOT + 'js/',
        LIB = ROOT + 'lib/js' + '/',
        BOWER_ROOT = pathPrefix + '/node_modules/';
    var config = {
        baseUrl: BASE
        , paths: {
            angular_ace_builds: BOWER_ROOT + 'ace-builds/src-min-noconflict/ace'
            , jquery: BOWER_ROOT + 'jquery/dist/jquery.min'
            , slider: BOWER_ROOT + 'seiyria-bootstrap-slider/dist/bootstrap-slider.min'
            , moment: BOWER_ROOT + 'moment/min/moment.min'
            , datetimepicker: BOWER_ROOT + 'eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min'
            , treeview: LIB + 'bootstrap.treeview'
            , dropdown: BOWER_ROOT + 'bootstrap/js/dropdown'
            , tab: LIB + 'tab'
            , mask: LIB + 'mask'
            , angular: BOWER_ROOT + 'angular/angular'
            , angular_sanitize: BOWER_ROOT + 'angular/angular-sanitize.min'
            , angular_ui_ace: BOWER_ROOT + 'angular-ui-ace/ui-ace.min'
            , route: BOWER_ROOT + 'angular-ui-router/release/angular-ui-router.min'
            , lodash: BOWER_ROOT + 'lodash/lodash.min'
            , gridster: BOWER_ROOT + 'gridster/dist/jquery.gridster.min'
            , dateutil: LIB + 'date-util'
            , amcharts: BOWER_ROOT + 'amcharts/dist/amcharts/amcharts'
            , serial: BOWER_ROOT + 'amcharts/dist/amcharts/serial'
            , extend: LIB + 'angular-extend'
            , select2: LIB + 'select2.min'
            , base: LIB + (!_t.UGLIFY ? 'base' : 'index' ) //index 压缩后
        }
        , shim: {
            angular: {
                deps: ['jquery']
            },
            angular_sanitize: {
                deps: ['angular']
            },
            angular_ui_ace: {
                deps: ['angular']
            },
            route: {
                deps: ['angular']
            },
            gridster: {
                deps: ['jquery']
            },
            dropdown: {
                deps: ['jquery']
            },
            treeview: {
                deps: ['jquery']
            },
            tab: {
                deps: ['jquery']
            },
            select2: {
                deps: ['jquery']
            },
            extend: {
                deps: ['angular', 'dropdown', 'tab', 'select2']
            },
            mask: {
                deps: ['jquery']
            },
            serial: {
                deps: ['amcharts']
            },
            base: {
                deps: _t.UGLIFY ? ['angular_ace_builds'] : ['route', 'extend', 'mask', 'treeview']
            }
        }
    };

    //运行grunt任务进行打包时使用
    if (typeof module !== 'undefined' && module.exports) {
        var _ = require('lodash');
        module.exports = config;
        module.exports.karma_paths = module.exports.paths; //karma 测试使用
        module.exports.paths = _.omit(module.exports.paths, 'angular_mock', 'angular_ace_builds'); //去除掉测试时的依赖
    } else {
        requirejs.config(config);
    }
})(this);
