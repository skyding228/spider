/**Created by weichunhe on 2015/8/17.*/
/*常量数据区*/
var EVENT = {
    TAB_SHOWN: {emit: 'TAB_SHOWN', broadcast: 'Tab_Shown'},
    CONDITION_AREA: {emit: 'SHOW_CONDITION_AREA', broadcast: 'Show_Condition_Area'},
    CONDITION_CHANGE: {emit: 'CONDITION_CHANGE', broadcast: 'Condition_Change'}, //条件改变了 事实
    CHANGE_CONDITION: {emit: 'CHANGE_CONDITION', broadcast: 'Change_Condition'}, //去改变条件 动作
    CHANGE_CONDITION_DISPLAY: {emit: 'CHANGE_CONDITION_DISPLAY', broadcast: 'Change_Condition_Display'}, //改变条件显示名称
    SCROLL_BOTTOM: {emit: 'SCROLL_BOTTOM', broadcast: 'Scroll_Bottom'}
};
// localstorage key
var STORE = {
    CONDITION: 'condition_store',
    CONDITION_DISPLAY: 'condition_display_store',
    TIME_SLOT: 'time_slot',
    REDIRECT_HREF: 'redirect_href'
};
//如果有需要session失效，从登录跳转过来的，就需要重定向过去
(function () {
    var href = JSON.parse(localStorage.getItem(STORE.REDIRECT_HREF));
    if (href) {
        localStorage.setItem(STORE.REDIRECT_HREF, JSON.stringify(null));
        window.location.href = href;
    }
})();

var TIMESLOT_IS_CUSTOM = false; //时间区间是否是自定义
define('app', [ 'base'], function () {
    var app = window.APP = angular.module('app', ['ngExtend', 'ui.router']);

    /**
     * 弹出对话框
     * @param {string} html 弹出的内容
     * @param {function} close_callback 关闭对话框回调
     */
    app.dialog = function (html, close_callback) {
        var wrap = $.mask({maskHtml: html});

        function hide() {
            $.mask.hide();
            $(document).unbind('keydown.mask');
            wrap.unbind('click.mask');
            close_callback && close_callback();
        }

        setTimeout(function () {
            wrap.one('click.mask', function () {
                hide();
            });
            $(document).bind('keydown.mask', function (event) {
                var key = event.keyCode;
                if (key === 27) {
                    hide();
                }
            });
        }, 500);
    };
    var infodlg = null, infomsg = null;
    /**
     * 显示一些提示性信息
     * @param msg 要显示的提示信息
     * @param timeout 超时自动关闭时间，默认0表示不进行自动关闭
     */
    app.info = function (msg, timeout) {
        timeout = timeout === undefined ? 0 : timeout;
        if (!infodlg) {
            infodlg = $('#infodialog');
            infomsg = infodlg.find('#infomsg');
        }
        infomsg.text(msg);
        infodlg.show().find('.box').hide().slideDown(600);

        if (timeout > 0) {
            setTimeout(function () {
                app.info.hide();
            }, timeout);
        }
    };
    window.alert = app.info; //重写alert
    window.infoDlgHide = app.info.hide = function () {
        infodlg.find('.box').slideUp(600, function () {
            infodlg.hide();
        });
    };

    app.constant('VIEWS_BASE_PATH', '/public/views');
    app.config(function ($stateProvider, VIEWS_BASE_PATH, $controllerProvider, $filterProvider, $requireProvider, $urlRouterProvider, $provide) {
        app.register = {
            controller: $controllerProvider.register,
            filter: $filterProvider.register,
            factory: $provide.factory
        };

        //路由配置使用
        function resolve($q, url, deps) {
            var def = $q.defer();
            require(deps, function () {
                def.resolve();
            }, function () {
                def.resolve();
                console.warn(url + '没有对应的js依赖!');
            });
            return def.promise;
        }

        //处理url,添加后缀
        var suffix = '.html';

        function addSuffix(url) {
            if (url.indexOf('.') !== -1) {
                return url;
            }
            var index = url.indexOf('?');
            if (index === -1) {
                return url + suffix;
            } else {
                return url.substring(0, index) + suffix + url.substring(index);
            }
        }

        /**
         * 根据一定的规则取出依赖
         * abc/def/hg.html 以hg为依赖
         * @param url
         */
        function getDeps(url) {
            var dep = url;
            if (dep) {
                if (dep.indexOf('/') === 0) {
                    dep = dep.substring(1);
                }
                dep = dep.split(/[.\?]/)[0];
            }
            return [dep];
        }

        $urlRouterProvider.when(/^\/?$/, '/apps');

        $stateProvider
        //默认规则配置
            .state('def', {
                url: '{url:[^@]*}',
                templateUrl: function ($stateParams) {
                    var url = VIEWS_BASE_PATH + $stateParams.url;
                    return addSuffix(url);
                },
                resolve: {
                    require: function ($q, $stateParams) {
                        return resolve($q, $stateParams.url, getDeps($stateParams.url));
                    }
                }
            });

    });

    return app;
});

//初始化
define('init', ['app'], function (app) {

    app.controller('rootController', function ($rootScope, $timeout) {
        var condition = {}; //保存当前条件信息
        $rootScope.menuClass = function(menu){
            return window.location.hash.indexOf(menu) === 0 ? 'select' : '';
        };
        //添加方法
        $rootScope.JSONStringify = JSON.stringify;
        //标签页切换
        $rootScope.$on(EVENT.TAB_SHOWN.emit, function (event, data) {
            $rootScope.$broadcast(EVENT.TAB_SHOWN.broadcast, data);
        });
        //条件区域的显示与隐藏
        $rootScope.$on(EVENT.CONDITION_AREA.emit, function (event, data) {
            $rootScope.$broadcast(EVENT.CONDITION_AREA.broadcast, data);
        });
        //条件改变
        $rootScope.$on(EVENT.CONDITION_CHANGE.emit, function (event, data) {
            condition = data;
            $rootScope.$broadcast(EVENT.CONDITION_CHANGE.broadcast, data);
        });
        //改变条件
        $rootScope.$on(EVENT.CHANGE_CONDITION.emit, function (event, data) {
            //通过指定名称获取条件信息
            if (angular.isString(data)) {
                $rootScope.$broadcast(data, condition);
                return;
            }
            $rootScope.$broadcast(EVENT.CHANGE_CONDITION.broadcast, data);
        });

        $rootScope.escapeHtml = function (str) {
            var escape = str;
            if (angular.isString(str)) {
                escape = _.escape(str);
                //把mark转回来
                escape = escape.replace(/&lt;mark&gt;/g, '<mark>').replace(/&lt;\/mark&gt;/g, '</mark>').replace(/(&quot;|\\")/g, "").replace(/(\\n|\n)/g, "<br/>").replace(/(\\t|\t)/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
            }
            return escape;
        };
        function getCookie(name) {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg))
                return unescape(arr[2]);
            else
                return null;
        }

        $rootScope.user = JSON.parse(getCookie('user'));
        //$rootScope.user.logout_url = getCookie('logout_url');
        //滚动到底部事件
        ScrollBottom($timeout, function () {
            $rootScope.$broadcast(EVENT.SCROLL_BOTTOM.broadcast, null);
        });
        //标签页切换之后
        $(document).delegate('a[data-toggle="tab"]', 'shown.bs.tab', function (e) {
            $rootScope.$emit(EVENT.TAB_SHOWN.emit, e);
            setTimeout(function () {
                $(window).resize();
            }, 200);
        });

    });
});

require(['init'], function () {
    angular.element(document).ready(function () {
        //阻止 # 导航
        $(document).delegate('a', 'click', function (event) {
            var href = $(this).attr('href');
            if (href === '#') {
                event.preventDefault();
            }
        });

        angular.bootstrap(document, ['app']);
        if (window.__karma__) { //单元测试
            angular.module('app').provider({
                $rootElement: function () { //在获取$location 之前必须要有$rootElement
                    this.$get = function () {
                        return angular.element('<div ng-app></div>');
                    };
                }
            });
            window.my$injector = angular.injector(['app']); //必须在bootstrap之后才能获取injector
        }

    });

});
/**
 * 滚动加载
 * @param {angular} $timeout 定时
 * @param {function} callback
 * @param {number} threshold [100],滚动条距离底部还有多少距离时就可以认为到底部了
 */
function ScrollBottom($timeout, callback, threshold) {
    threshold = threshold || 100;
    callback = callback || $.noop;
    var $body = null, $window = null;
    var hasScrollBarFlag = false;

    /**
     * 滚动掉底部事件
     * @returns {boolean}
     */
    function hasToBottom() {
        return $body.height() - Math.max($body.scrollTop(), document.documentElement.scrollTop) <= $window.height() + threshold; //离底部还有100px就认为到底部了
    }

    /**
     * 是否具有滚动条
     * @returns {boolean}
     */
    function hasScrollBar() {
        hasScrollBarFlag = $body.height() > $window.height();
        return hasScrollBarFlag;
    }

    /**
     * 初始化
     */
    function init() {
        $body || ($body = $('body'));
        $window || ($window = $(window));
        $window.scroll(handle);
    }

    var queue = [];

    /**
     * 处理事件
     */
    function handle() {
        if (hasToBottom()) {
            while (queue.length) {
                clearTimeout(queue.shift());
            }
            queue.push(setTimeout(callback, 300));
        }
    }

    init();
}