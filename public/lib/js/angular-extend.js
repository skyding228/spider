/**
 * angular Js 扩展
 * Created by weichunhe on 2015/7/6.
 */
(function (window, angular, undefined) {
    'use strict';

    angular.module('ngExtend', ['ng']).
    provider('$require', function rq() {
        /**
         * 异步加载配置
         * @param deps 如果是单个依赖可以直接写名字,多个依赖使用数组,路径根据require配置
         * @returns {*}
         */
        this.require = function (deps) {
            if (angular.isString(deps)) {
                deps = [deps];
            }
            return ['$rootScope', '$q', function ($rootScope, $q) {
                var def = $q.defer();
                require(deps, function () {
                    $rootScope.$apply(function () {
                        def.resolve();
                    });
                });
                return def.promise;
            }]
        };

        this.$get = function () {
            return this;
        }
    }).

    factory('$myhttp', function ($rootScope) {
        function apply() {
            setTimeout(function () {
                $rootScope.$apply();
            }, 300);
        }

        function err(xhr, status, err) {
            if (xhr.responseText && xhr.responseText.indexOf('redirect:') === 0) {
                angular.store(STORE.REDIRECT_HREF, window.location.href);
                window.location.href = resetParamToUrl(xhr.responseText.substring(9), 'returnUrl', window.location.href);
            }
            alert(xhr.responseText || "请求出错!请检查网络连接，或联系管理员!");
            console.error('$myhttp请求出错', xhr, status, err);
        }

        function resetParamToUrl(url, name, val) {
            if (!url) {
                return url;
            }
            var paramStart = url.indexOf('?');
            if (paramStart === -1) {
                return url + '?' + name + '=' + val;
            } else {
                var params = url.substring(paramStart + 1).split('&');
                _.remove(params, function (str) {
                    return str.substring(0, str.indexOf('=')) === name;
                });
                params.push(name + "=" + val);
                return url.substring(0, paramStart + 1) + params.join('&');
            }
        }

        function get() {
            return $.get.apply(window, arguments).complete(apply).error(err);
        }

        function post() {
            return $.post.apply(window, arguments).complete(apply).error(err);
        }

        /**
         * 如果是事件名称，就会传播此事件，事件数据为 start，end
         * 如果有obj，此属性应为bool类型 就是将此对象上的此属性取反
         * @param name string 事件名称 或属性名称，如果传递了obj
         * @param obj object
         * @returns {{get: get, post: post}}
         */
        function http(name, obj) {
            if (angular.isString(name)) {
                if (angular.isObject(obj)) {
                } else {
                    $rootScope.$emit('HTTP_EVENT', {name: name, data: 'start'});
                }
            }
            function complete() {
                if (angular.isString(name)) {
                    if (angular.isObject(obj)) {
                        obj[name] = false;
                    } else {
                        $rootScope.$emit('HTTP_EVENT', {name: name, data: 'end'});
                    }
                }
                apply();
            }

            return {
                get: function () {
                    return $.get.apply(window, arguments).complete(complete).error(err);
                }, post: function () {
                    return $.post.apply(window, arguments).complete(complete).error(err);
                }
            };
        }

        http.get = get;
        http.post = post;

        return http;
    }).
    //http://bootstrap-datepicker.readthedocs.org/en/latest/options.html#format
    directive('myCalendar', function ($parse) {
        return {
            restrict: 'AE'
            , replace: false,
            scope: {
                ngModel: '=',
                cfg: '='
            }
            , link: function (scope, element, attrs, controller) {
                var format = 'YYYY-MM-DD';
                element.datetimepicker({
                    inline: true,
                    format: format
                });
                var $dpt = element.data('DateTimePicker');
                element.on('dp.change', function (e) {
                    scope.ngModel = e.date.format(format);
                    setTimeout(function () {
                        scope.$apply()
                    }, 100);
                });
                $dpt.date(scope.cfg.startDate || new Date());
                scope.$watch('cfg.startDate', function (date) {
                    $dpt.minDate(date);
                });
                scope.$watch('cfg.endDate', function (date) {
                    $dpt.maxDate(date);
                });
            }
        }
    }).
    directive('amChart', function ($parse) {
        return {
            restrict: 'AE'
            , replace: false,
            scope: {
                chartData: '=',
                amChart: '='
            }
            , link: function (scope, element, attrs, controller) {
                if (!window.ChartLength) {
                    window.ChartLength = 0;
                }

                var opts = scope.amChart;

                function zoomChart() {
                    chart.zoomToIndexes(0, 6);
                }

                var chart = new AmCharts.AmSerialChart();
                chart.type = 'serial';
                chart.pathToImages = '/public/amcharts/images/';
                //chart.startDuration = 1;
                chart.startEffect = 'bounce';
                chart.dataProvider = [];
                chart.categoryField = "x";

                var color = chart.colors[window.ChartLength++ % chart.colors.length];

                // listen for "dataUpdated" event (fired when chart is inited) and call zoomChart method when it happens
                chart.addListener("dataUpdated", zoomChart);

                // AXES
                // category
                var categoryAxis = chart.categoryAxis;
                categoryAxis.axisColor = '#606060';
                categoryAxis.axisAlpha = 0.15;
                categoryAxis.dashLength = 0;
                categoryAxis.gridAlpha = 0;
                categoryAxis.autoGridCount = false;
                // value
                var valueAxis = new AmCharts.ValueAxis();
                valueAxis.axisAlpha = 0;
                valueAxis.inside = true;
                valueAxis.dashLength = 0;
                valueAxis.gridCount = 4;
                valueAxis.autoGridCount = false;
                valueAxis.axisColor = '#606060';
                chart.addValueAxis(valueAxis);

                // GRAPH
                var graph = new AmCharts.AmGraph();
                opts && _.extend(graph, opts.graph);
                graph.type = "line";
                //graph.fillAlphas = 0.6;
                graph.bullet = "round";
                graph.bulletSize = 8;
                //graph.bulletBorderColor = "#FFFFFF";
                //graph.bulletBorderAlpha = 1;
                //graph.bulletBorderThickness = 2;
                graph.lineColor = color;
                graph.lineThickness = 2;
                graph.valueField = "y";
                graph.balloonText = "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>";
                chart.addGraph(graph);

                // CURSOR
                var chartCursor = new AmCharts.ChartCursor();
                chartCursor.cursorAlpha = 0.6;
                chartCursor.cursorPosition = "mouse";
                chartCursor.cursorColor = color;
                chart.addChartCursor(chartCursor);

                // SCROLLBAR
                var chartScrollbar = new AmCharts.ChartScrollbar();
                chartScrollbar.scrollbarHeight = 30;
                chartScrollbar.graph = graph;
                chart.addChartScrollbar(chartScrollbar);
                chart.creditsPosition = "top-left";
                // WRITE
                chart.write(element[0]);
                scope.$watch('chartData', function (n, o) {
                    if (!n || !n.length) {
                        chart.dataProvider = [];
                        try {
                            chart.addLabel(0.5, 150, '无数据', 'center', 20, '#606060');
                        } catch (e) {

                        }

                    } else {
                        chart.clearLabels();
                    }
                    chart.dataProvider = n;
                    chart.validateData();
                });
            }
        }
    }).
    //重写 tab,可以进行自由添加
    directive('myTab', function ($parse, $compile, $rootScope) {
        return {
            restrict: 'AE',
            replace: false,
            scope: {
                config: '='
                /**
                 * //addTab:function(tab){}, 指令执行完之后会生成此方法 tab = {id:,name:}
                 * newTabName: 新建 标签页时名称，默认 new tab
                 * tabs: //默认初始化的一些标签
                 * templateUrl: 模板
                 * addCallback: 添加完标签页回调
                 * saveCallback: 编辑完标签页名称的回调
                 * closeCallback: 关闭标签页时回调
                 * delCallback:删除标签时回调
                 * tabs：[{ //默认有哪些标签页
                     *  id:  标签页id
                     *  name：标签页的显示名称
                     * }]
                 */
            }
            , link: function (scope, element, attrs, controller) {
                scope.config = scope.config || {};
                scope.config.tabs = scope.config.tabs || [];
                scope.config.newTabName = scope.config.newTabName || 'new tab';

                var config = scope.config, $tabs = element.find('.nav-tabs:first'), $contents = element.find('.tab-content:first'), def_template = $contents.find('.tab-pane:first').html();
                //添加标签页
                var tab = [];
                tab.push('<li ng-repeat="t in config.tabs"><a target="#{{t.id}}" data-toggle="tab">');
                tab.push('    <span ng-if="!isTabEditing(t.id);">{{t.name}}</span>');
                tab.push('    <input class="form-control" style="display: inline-block;width:150px;"  ng-model="t.name" ng-if="isTabEditing(t.id);"/>');
                tab.push('    &nbsp;&nbsp;<i class="fa fa-edit" title="编辑" ng-if="!isTabEditing(t.id);" ng-click="editTab(t);"></i>');
                tab.push('    <i class="fa fa-check" ng-if="isTabEditing(t.id);" ng-click="saveTab(t);"></i>');
                tab.push('    &nbsp;&nbsp;<i class="fa fa-trash large" title="删除" ng-click="removeTab(t,true);"></i>');
                tab.push('    &nbsp;&nbsp;<i class="fa fa-remove large" title="关闭" ng-click="removeTab(t);"></i></a></li>');
                $tabs.append($compile(tab.join(''))(scope));

                //添加相应按钮
                $tabs.append($compile('<li class="add-tab-btn"><button class="btn btn-success" ng-click="addTab();"><i class="fa fa-plus"></i></button></li>')(scope));

                //生成标签页id
                function makeId() {
                    return _.makeUniqueId('tab');
                }

                var tabEditing = {};
                //标签页是否正在编辑
                scope.isTabEditing = function (id, flag) {
                    return flag !== undefined ? tabEditing[id] = flag : tabEditing[id];
                };
                scope.editTab = function (tab) {
                    tab.oldName = tab.name;
                    if (tab.name === scope.config.newTabName) {
                        tab.name = '';//清空
                    }
                    scope.isTabEditing(tab.id, true);
                    selTab(tab.id);
                };
                scope.saveTab = function (tab) {
                    scope.isTabEditing(tab.id, false);
                    selTab(tab.id);
                    tab.name = tab.name || scope.config.newTabName;
                    if(hasSameNameTab(tab)){
                        tab.name = tab.oldName;
                        return;
                    }
                    if (tab.oldName != tab.name) {
                        scope.config.saveCallback && scope.config.saveCallback(tab);
                    }
                };
                scope.removeTab = function (tab, toDel) {
                    if (toDel && !confirm("如果存在对应的告警及仪表盘也会被删除,确定删除'" + tab.name + "'吗?")) {
                        return;
                    }
                    var $t = get$tabById(tab.id);
                    if ($t.parent().hasClass('active')) {
                        selTab(); //选中第一个
                    }
                    $t.remove();
                    $contents.find('#' + tab.id).remove();
                    scope.config.closeCallback && scope.config.closeCallback(tab);
                    if (toDel) {
                        scope.config.delCallback && scope.config.delCallback(tab);
                    }
                };
                function hasSameNameTab(tab){
                    //判断同名
                    var hasTab = _.find(scope.config.tabs, function (t) {
                        return tab.name === t.name && tab.id !== t.id;
                    });
                    if (hasTab) {
                        alert("已经存在相同名称的tab:" + tab.name);
                        return true;
                    }
                    return false;
                }
                //notSel 添加之后是不选择
                scope.config.addTab = scope.addTab = function (tab, notSel) {
                    tab = tab || {id: makeId(), name: config.newTabName};
                    var id = tab.id;

                    scope.config.tabs.push(tab);
                    var content = [];
                    content.push('<div class="tab-pane" ');
                    content.push('id="' + id + '" ');
                    content.push(' ng-include="\'' + config.templateUrl + '\'"');
                    content.push('>');
                    content.push('</div>');
                    scope.config.addCallback && scope.config.addCallback(tab);
                    $contents.append($compile(content.join(''))(scope));
                    //直接选择会出现，DOM元素还没有生产就已经执行了代码，没达到想要的结果
                    if (!notSel) {
                        setTimeout(function () {
                            selTab(id);
                        }, 300);
                    }
                };

                function selTab(id) {
                    get$tabById(id).click();
                }

                function get$tabById(id) {
                    if (id === undefined) { //不传id，默认返回第一个
                        return $tabs.find('a').first();
                    }
                    return $tabs.find('a[target=#' + id + ']');
                }
            }
        }
    }).
    //确认对话框
    directive('myConfirm', function ($parse) {
        return {
            restrict: 'AE',
            replace: true,
            template: '<div class="modal"><div class="modal-dialog" style="text-align: center;"><div class="box box-warning" style="display: inline-block;width: auto;min-width: 300px;text-align: left;"><div class="box-header with-border"><h5 class="box-title">提示</h5><div class="box-tools"><button class="btn btn-box-tool" ng-click="close();"><i class="fa fa-times"></i></button></div></div><div class="box-body"><span class="msg" style=" line-height: 1.42857143;display: inline-block;padding-top:6px;padding-bottom:6px; font-weight:bold;">确认删除这条记录！</span><button class="btn btn-success pull-right" ng-click="confirm();"><i class="fa fa-check-circle"></i>&nbsp;&nbsp;确认</button></div></div></div></div>',
            scope: {
                config: '='
            }
            , link: function (scope, element, attrs, controller) {
                scope.config.handle = {
                    show: function () {
                        element.find('.msg').text(scope.config.msg);
                        element.show();
                    }
                };
                scope.close = function () {
                    element.hide();
                    scope.config.onclose && scope.config.onclose();
                };
                scope.confirm = function () {
                    element.hide();
                    scope.config.onconfirm && scope.config.onconfirm();
                };
            }
        }
    }).
    //提示输入对话框
    directive('myPrompt', function ($parse) {
        return {
            restrict: 'AE',
            replace: true,
            template: '<div class="modal"><div class="modal-dialog" style="width: 400px;"><div class="box box-warning"><div class="box-header with-border"><h3 class="box-title"></h3><div class="box-tools" ng-click="close();"><i class="fa fa-times"></i></div></div><div class="box-body"><div class="form-group"><label class="msg"></label><input type="text" class="form-control" ng-model="config.value"></div><div><button class="btn btn-success pull-right" ng-click="confirm();"><i class="fa fa-check-circle"></i>&nbsp;&nbsp;确认</button></div></div></div></div></div>',
            scope: {
                config: '='
            }
            , link: function (scope, element, attrs, controller) {
                scope.config.handle = {
                    show: function () {
                        element.find('.box-title').text(scope.config.title);
                        element.find('.msg').text(scope.config.msg);
                        element.show();
                    }
                };
                scope.close = function () {
                    element.hide();
                    scope.config.onclose && scope.config.onclose();
                };
                scope.confirm = function () {
                    element.hide();
                    scope.config.onconfirm && scope.config.onconfirm();
                };
            }
        }
    }).
    //切换按钮
    directive('btnToggle', function ($parse) {
        return {
            restrict: 'AE',
            replace: true,
            template: '<div class="btn-toggle" ng-class="{on:state,off:!state}" ng-click="toggle();"><i></i><span class="on"></span><span class="off"></span></div>',
            scope: {
                state: '=',
                onHandle: '&',
                offHandle: '&'
            }
            , link: function (scope, element, attrs, controller) {
                scope.toggle = function () {
                    var rt = true, state = !scope.state;
                    if (state && angular.isFunction(scope.onHandle)) {
                        rt = scope.onHandle();
                    } else if (!state && angular.isFunction(scope.offHandle)) {
                        rt = scope.offHandle();
                    }
                    /*if (rt !== false) {
                     scope.state = state;
                     }*/
                }
            }
        }
    }).
    //https://github.com/seiyria/bootstrap-slider/
    directive('mySlider', function ($parse) {
        return {
            restrict: 'AE',
            replace: false,
            scope: {
                opts: '=',
                ngModel: '=',
                refresh: '='
            }
            , link: function (scope, element, attrs, controller) {
                var onslider = false, slider = null;
                var opts = angular.extend({
                    formatter: function (value) {
                        return '' + value;
                    }
                }, scope.opts);
                slider = element.slider(opts);
                scope.$watch('opts.change', function (val) {
                    opts = angular.extend({
                        formatter: function (value) {
                            return '' + value;
                        }
                    }, scope.opts);
                    slider = element.slider(opts);
                    element.slider('refresh');
                });
                if (!onslider) {
                    onslider = true;
                    slider.on('change', function (value) {
                        value.value && (scope.ngModel = value.value.newValue, scope.opts.value = value.value.newValue);
                        scope.$apply();
                    });
                }
                scope.$watch('opts.value', function (value) {
                    slider.slider('setValue', value);
                });
            }
        }
    }).
    /**
     * 日期指令,包含时间
     *  <div my-date-time="" class='input-group date'>
     <div class="input-group-addon">$</div>
     <input type='text' class="form-control"/>
     <span class="input-group-addon">
     <span class="glyphicon glyphicon-calendar"></span>
     </span>
     </div>

     linkSelector: #dtp1 日期范围的结束日期选择器
     */
    directive('myDateTime', function ($parse) {
        return {
            restrict: 'AE'
            , replace: false
            , link: function (scope, element, attrs, controller) {
                var opts = {
                    format: 'YYYY-MM-DD HH:mm:ss',
                    showClear: true,
                    showClose: true,
                    showTodayButton: true
                }, cfg, $link;
                if (attrs.myDateTime) {
                    cfg = scope.$eval(attrs.myDateTime);
                }
                //范围绑定
                if (cfg && cfg.linkSelector && $(cfg.linkSelector).length) {
                    $link = $(cfg.linkSelector);
                    delete cfg.linkSelector;
                }

                angular.isObject(cfg) && $.extend(opts, cfg);
                element.datetimepicker(opts);

                var $date = element.data('DateTimePicker');
                var ngModel = element.find('input').attr('ng-model');
                if (!ngModel) {
                    return;
                }

                var modelGetter = $parse(ngModel);
                var modelSetter = modelGetter.assign;
                var initDate = modelGetter(scope);
                if (initDate) {
                    $date.date(initDate);
                }
                //双向绑定
                scope.$watch(ngModel, function (n, o) {
                    n && $date.date(n);
                });
                var moment = window.moment || require('moment');
                element.on('dp.change', function (e) {
                    modelSetter(scope, e.date ? moment(e.date._d).format(opts.format) : '');
                    //设置linkto
                    if ($link) {
                        var $dtp = $link.data('DateTimePicker');
                        $dtp.minDate(e.date);
                    }
                });
            }
        }
    }).
    /**
     * 分页指令
     * <pagination total-page="pagination.totalPage" current-page="pagination.currentPage"
     on-select-page="query(page)"></pagination>
     */
    directive('pagination', function () {
        return {
            restrict: 'E'
            ,
            replace: true
            ,
            template: '<div class="dataTables_paginate paging_simple_numbers">                                         ' +
            '  <ul class="pagination">                                                           ' +
            '    <li class="paginate_button previous " ng-class="{disabled:noPrev()}"><a href="#" ng-click="selectPage(1)"  title="首页">1</a></li>                                ' +
            '    <li class="paginate_button previous " ng-class="{disabled:noPrev()}"><a href="#" ng-click="prev()" title="上一页"><</a></li>                                ' +
            '    <li class="paginate_button" ng-repeat=" page in pages" ng-class="{active:isActive(page)}"><a href="javascript:void(0);" ng-click="selectPage(page)">{{page}}</a></li> ' +
            '    <li class="paginate_button next" ng-class="{disabled:noNext()}"><a href="#" ng-click="next()" title="下一页">></a></li>                                ' +
            '    <li class="paginate_button next" ng-class="{disabled:noNext()}"><a href="#" ng-click="selectPage(totalPage)"  title="尾页">{{totalPage||1}}</a></li>                                ' +
            '  </ul>                                                          ' +
            '</div>                                                           '

            ,
            scope: {
                totalPage: '='
                , currentPage: '='
                , onSelectPage: '&'
            },
            link: function (scope, element, attrs, controller) {
                scope.currentPage = scope.currentPage || 1;
                scope.$watch('currentPage', function (value) {
                    scope.pages = getPageItems(scope.totalPage, value, 10);
                    if (scope.currentPage > scope.totalPage) {
                        scope.currentPage = scope.totalPage;
                    }
                });
                scope.$watch('totalPage', function (value) {
                    scope.pages = getPageItems(value, scope.currentPage, 10);
                    if (scope.currentPage > value) {
                        scope.currentPage = value;
                    }
                });
                scope.isActive = function (page) {
                    return scope.currentPage === page;
                };
                scope.selectPage = function (page) {
                    if (page < 1) {
                        page = 1;
                    }
                    if (page > scope.totalPage) {
                        page = scope.totalPage;
                    }
                    if (!scope.isActive(page)) {
                        scope.currentPage = page;
                        scope.onSelectPage({page: scope.currentPage});
                    }
                };
                scope.prev = function () {
                    scope.selectPage(scope.currentPage - 1);
                };
                scope.next = function () {
                    scope.selectPage(scope.currentPage + 1);
                };

                scope.noPrev = function () {
                    return !(scope.currentPage > 1);
                };
                scope.noNext = function () {
                    return !(scope.currentPage < scope.totalPage);
                };
            }
        }
    });

    /**
     * 获取length个要展示的页面span
     */
    function getPageItems(total, current, length) {
        var items = [];
        if (length >= total) {
            for (var i = 1; i <= total; i++) {
                items.push(i);
            }
        } else {
            var base = 0;
            //前移
            if (current - 0 > Math.floor((length - 1) / 2)) {
                //后移
                base = Math.min(total, current - 0 + Math.ceil((length - 1) / 2)) - length;
            }
            for (var i = 1; i <= length; i++) {
                items.push(base + i);
            }
        }
        return items;
    }

})
(window, window.angular);
