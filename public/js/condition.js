/**
 * Created by weichunhe on 2015/10/23.
 */
/*条件*/
define('condition', function () {
    return function ($scope) {
        //时间点选择
        $scope.timeSlots = [
            {value: '30', display: '30分钟', unit: 'MIN', tickInter: 5, dateFormat: 'hh:mm'},
            {value: '60', display: '60分钟', unit: 'MIN', tickInter: 10, dateFormat: 'hh:mm'},
            {value: '3', display: '3小时', unit: 'HOUR', tickInter: 30, dateFormat: 'hh:mm'},
            {value: '6', display: '6小时', unit: 'HOUR', tickInter: 30, dateFormat: 'hh:mm'},
            {value: '12', display: '12小时', unit: 'HOUR', tickInter: 24, dateFormat: 'hh:mm'},
            {value: '24', display: '24小时', unit: 'HOUR', tickInter: 24, dateFormat: 'hh:mm'},
            {value: '3', display: '3天', unit: 'DAY', tickInter: 24, dateFormat: 'MM月dd日 hh:mm'},
            {value: '7', display: '7天', unit: 'DAY', tickInter: 24, dateFormat: 'MM月dd日 hh:mm'}
            //{value: 'customer', display: '自定义', ref: '30MIN'}
        ];
        //小时 slider 配置
        $scope.sliderOpts = {
            min: dateUtil.format(new Date(), 'hh') - 0,
            max: 23,
            value: dateUtil.format(new Date(), 'hh') - 0,
            step: 1,
            change: true // 触发改变
        };
        //自定义时间段
        $scope.customTimeSlot = {
            startTime: '',
            hour: $scope.sliderOpts.value,
            slot: '30:MIN',
            endTime: ''
        };

        //日历配置
        var curDate = new Date();
        $scope.calendarCfg = {
            startDate: dateUtil.addInteger(curDate, dateUtil.calendar.day, -7),
            endDate: curDate
        };

        //时间点改变
        $scope.$watch('customTimeSlot.startTime', function (value) {
            resetHours();
            reShowSlots();
            $scope.onTimeSlotChange();
        });
        $scope.$watch('customTimeSlot.hour', function (value) {
            reShowSlots();
            $scope.onTimeSlotChange();
        });
        //自定义时间段改变,计算结束时间
        $scope.onTimeSlotChange = function () {
            var slot = _.find($scope.timeSlots, function (t) {
                return t.value + ':' + t.unit === $scope.customTimeSlot.slot;
            });
            if (slot) {
                $scope.customTimeSlot.endTime = dateUtil.format(_.calcTime(slot, getSelTime()), 'yyyy-MM-dd hh:mm');
            }
        };
        //获取当前选择的时间
        function getSelTime() {
            return dateUtil.parse($scope.customTimeSlot.startTime + ' ' + $scope.customTimeSlot.hour + ':00');
        }

        //重新计算小时可选
        function resetHours() {
            if ($scope.customTimeSlot.startTime >= dateUtil.format(new Date(), 'yyyy-MM-dd')) { //最近一天
                //小时 slider 配置
                $scope.sliderOpts.min = 0;
                $scope.sliderOpts.value = $scope.sliderOpts.min;
                $scope.customTimeSlot.hour = $scope.sliderOpts.value;
                $scope.sliderOpts.max = dateUtil.format(new Date(), 'hh') - 0;
                $scope.sliderOpts.change = !$scope.sliderOpts.change;
            } else if ($scope.customTimeSlot.startTime === dateUtil.format($scope.calendarCfg.startDate, 'yyyy-MM-dd')) { //最远一天
                //小时 slider 配置
                $scope.sliderOpts.max = 23;
                $scope.sliderOpts.min = dateUtil.format(new Date(), 'hh') - 0;
                $scope.sliderOpts.value = $scope.sliderOpts.min;
                $scope.customTimeSlot.hour = $scope.sliderOpts.value;
                $scope.sliderOpts.change = !$scope.sliderOpts.change;
            } else {
                if ($scope.sliderOpts.max !== 23 || $scope.sliderOpts.min !== 0) {
                    $scope.sliderOpts.min = 0;
                    $scope.sliderOpts.max = 23;
                    $scope.sliderOpts.value = $scope.customTimeSlot.hour - 0;
                    $scope.sliderOpts.change = !$scope.sliderOpts.change;
                }
            }
        }

        /**
         * 重新计算哪些slot可以选择
         */
        $scope.slotThreshold = 0;
        function reShowSlots() {
            var selTime = getSelTime(), endTime = new Date();

            var index = _.findIndex($scope.timeSlots, function (slot) {
                return _.calcTime(slot, selTime) > endTime;
            });
            $scope.slotThreshold = index === -1 ? $scope.timeSlots.length : index;
            //如果当前选择的是非法的 就重置为30分钟
            index = _.findIndex($scope.timeSlots, function (t) {
                return t.value + ':' + t.unit === $scope.customTimeSlot.slot;
            });
            if (index >= $scope.slotThreshold) {
                $scope.customTimeSlot.slot = '30:MIN';
            }
        }

        //条件显示名称
        $scope.condition_display = {timeSlot: '30分钟'};
        changeConDisplay(angular.store(STORE.CONDITION_DISPLAY));
        //显示条件区域
        $scope.show_condition_area = true;
        $scope.$on(EVENT.CONDITION_AREA.broadcast, function (event, data) {
            $scope.show_condition_area = !!data;
        });

        /**
         * 改变时间范围
         * @param timeSlot
         * @param start_time 开始时间
         */
        $scope.changeTimeSlot = function (timeSlot, start_time, timeslot_is_custom) {
            TIMESLOT_IS_CUSTOM = !!timeslot_is_custom;
            $scope.customTimeSlotActive = false;
            var endTime = null, startTime = null;
            if (start_time) {
                startTime = start_time;
                endTime = _.calcTime(timeSlot, startTime);
            } else {
                endTime = new Date();
                startTime = _.calcTime(timeSlot);
            }
            //改变条件
            changeCondition({
                unit: timeSlot.unit,
                timeSlot: timeSlot.value,
                endTime: dateUtil.format(endTime),
                startTime: dateUtil.format(startTime)
            });
            //改变显示名称
            var time = null, display = null;
            if (start_time) {//自定义
                display = dateUtil.format(dateUtil.parse(condition.startTime), "yyyy-MM-dd hh:mm") + ' 至 ' + dateUtil.format(dateUtil.parse(condition.endTime), "yyyy-MM-dd hh:mm");
            } else {
                time = _.find($scope.timeSlots, function (c) {
                    return c.value === condition.timeSlot && c.unit === condition.unit;
                });
                time && (display = time.display);
            }
            changeConDisplay({timeSlot: display});
        };
        //是否为active
        $scope.isActiveTimeSlot = function (slot) {
            return !$scope.customTimeSlotActive && slot.value === condition.timeSlot && slot.unit === condition.unit;
        };
        $scope.isActiveCustomSlot = function () {
            return $scope.customTimeSlotActive;
        };

        $scope.customTimeSlotActive = false;
        $scope.changeCustomTimeSlot = function () {
            var slot = _.find($scope.timeSlots, function (t) {
                return t.value + ':' + t.unit === $scope.customTimeSlot.slot;
            }), start_time = getSelTime();
            $scope.changeTimeSlot(slot, start_time, true);
            $scope.customTimeSlotActive = true;
        };
        //条件改变
        var condition = {
            timeSlot: '30',
            unit: 'MIN',
            endTime: dateUtil.format(new Date()),
            startTime: dateUtil.format(dateUtil.addInteger(new Date(), dateUtil.calendar.minute, -30))
        };//条件数据
        //扩展条件时只扩展当前有的属性，多余的属性不要
        var _condition_keys = _.keys(condition);

        function extendCondition(data) {
            data && _.each(_condition_keys, function (key) {
                if (data.hasOwnProperty(key)) {
                    condition[key] = data[key];
                }
            });
        }

        changeCondition(angular.store(STORE.CONDITION));
        //重置timeslot
        $scope.changeTimeSlot(_.find($scope.timeSlots, function (c) {
            return c.value === condition.timeSlot && c.unit === condition.unit;
        }));
        $scope.$emit(EVENT.CONDITION_CHANGE.emit, condition);

        //改变条件
        $scope.$on(EVENT.CHANGE_CONDITION.broadcast, function (event, data) {
            changeCondition(data);
        });
        var event_condition = {}; //用于事件传递
        function changeCondition(data) {
            if (data) {
                extendCondition(data);
                if (angular.isString(data.timeSlot)) {
                    var timeSlot = _.find($scope.timeSlots, function (t) {
                        return t.display === data.timeSlot;
                    });
                    if (timeSlot) {
                        $scope.changeTimeSlot(timeSlot);
                        return;
                    }
                }
            }
            $.extend(event_condition, condition);
            $scope.$emit(EVENT.CONDITION_CHANGE.emit, event_condition);
            angular.store(STORE.CONDITION, condition);
        }

        //改变条件显示名称
        function changeConDisplay(data) {
            $.extend($scope.condition_display, data);
            angular.store(STORE.CONDITION_DISPLAY, $scope.condition_display);
        }
    };
});