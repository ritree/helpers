var d3 = require('d3');

module.exports = function() {
	var dates = {
        serverFormat: d3.time.format('%d-%m-%Y'),
        appFormat: d3.time.format('%d.%m.%y'),
        oneDayMS: 24 * 60 * 60 * 1000,
        ranges: ['daily', 'weekly', 'monthly'],
        rangeLimits: [100, 600, Number.MAX_VALUE],
        world: new Date(1988, 1, 1, 0, 0, 0).getTime(),
        today: new Date(window['currencyDate']).getTime(),
        min: null,
        max: null,
        begin: null,
        end: null,
        getPeriod: function(b, e) {
            return parseInt((e - b)/this.oneDayMS);
        },
        getActualPeriod: function() {
            return this.getPeriod(this.begin, this.end);
        },
        getRangePeriod: function() {
            return this.getPeriod(this.min, this.max);
        },
        getTypePeriod: function(b, e) {
            var period = this.getPeriod(b, e);
            for(var i = 0; i < this.ranges.length; i++) {
                if(period < this.rangeLimits[i]) {
                    return this.ranges[i];
                }
            }
        },
        getActualTypePeriod: function() {
            return this.getTypePeriod(this.begin, this.end);
        },
        getRangeTypePeriod: function() {
            console.log(this.min, this.max);
            return this.getTypePeriod(this.min, this.max);
        },
        getDate: function(date) {
            if(date in this) {
                return new Date(this[date]);
            } else if(_.isDate(date)) {
                return date;
            } else if(_.isNumber(date)) {
                return new Date(date);
            } else {
                return this.serverFormat.parse(date);
            }
        },
        getServerDate: function(type) {
            return this.serverFormat(this.getDate(type));
        },
        getAppDate: function(type) {
            return this.appFormat(this.getDate(type));
        },
        setDate: function(key, val) {
            this[key] = this.getDate(val).getTime();
        },
        setRange: function(begin, end) {
            begin = this.getDate(begin).getTime();
            end = this.getDate(end).getTime();
            this.setDate('begin', begin < this.min ? this.min : begin);
            this.setDate('end', end > this.max ? this.max : end);
        },
        setUserRange: function(userRange) {
            if(userRange.begin && userRange.end) {
                this.setRange(userRange.begin, userRange.end);
            }
        },
        setThreshold: function(min, max) {
            console.log('setThreshold', min, max);
            this.setDate('min', min);
            this.setDate('max', max);
            this.log();
        },
        log: function() {
            console.log("begin = " +
            dates.appFormat(new Date(dates.begin)) + "\n end = " +
            dates.appFormat(new Date(dates.end)) + "\n min = " +
            dates.appFormat(new Date(dates.min)) + "\n max = " +
            dates.appFormat(new Date(dates.max)));
        }
    };
}
