var dateUtil = dateUtil || {};

dateUtil = {

    calendar: {
        "year": "Year",
        "month": "Mon",
        "week": "Week",
        "day": "Day",
        "hour": "Hour",
        "minute": "Min",
        "second": "Sec"
    },

    /**
     * 格式化
     */
    format: function (date, format) {
        format = arguments[1] || "yyyy-MM-dd hh:mm:ss";
        var o = {
            "M+": date.getMonth() + 1, // month
            "d+": date.getDate(), // day
            "h+": date.getHours(), // hour
            "m+": date.getMinutes(), // minute
            "s+": date.getSeconds(), // second
            "q+": Math.floor((date.getMonth() + 3) / 3), // quarter
            "S": date.getMilliseconds()
            // millisecond
        };

        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + "")
                .substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    },
    /**
     * 解析
     * @param str
     * @returns {Date}
     */
    parse: function (str) {
        if (typeof str === 'string') {
            var date = new Date();
            var arr = str.split(/\D+/g);
            arr.length > 0 && date.setFullYear(arr[0]);
            arr.length > 1 && date.setMonth(arr[1] - 1);
            arr.length > 2 && date.setDate(arr[2]);
            arr.length > 3 && date.setHours(arr[3]);
            arr.length > 4 && date.setMinutes(arr[4]);
            arr.length > 5 && date.setSeconds(arr[5]);
            date.setMilliseconds(arr.length > 6 ? arr[6] : 0);
            return date;
        }
        return str;
    },
    /**
     * amount：可为负
     */
    addInteger: function (date, dateType, num) {
        date = arguments[0] || new Date();
        switch (dateType) {
            case dateUtil.calendar.second :
                return new Date(date.getTime() + (1000 * num));
            case dateUtil.calendar.minute :
                return new Date(date.getTime() + (60000 * num));
            case dateUtil.calendar.hour :
                return new Date(date.getTime() + (3600000 * num));
            case dateUtil.calendar.day :
                return new Date(date.getTime() + (86400000 * num));
            case dateUtil.calendar.week :
                return new Date(date.getTime() + ((86400000 * 7) * num));
            case dateUtil.calendar.month :
                return new Date(date.getFullYear(), (date.getMonth()) + num, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            case dateUtil.calendar.year :
                return new Date((date.getFullYear() + num), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        }
    }

};
