var Helpers = {
    is_developer: false,
    vars: {
        selectObjects: {}
    },
    // привести вывод в консоль в читабельном виде 
    // запретить вывод в консль не для разработчиков
    prettyConsole : function() {
        if(typeof console == 'undefined'){
            console = {
                'log': function(){},
                'time': function(){},
                'timeEnd': function(){},
                'trace': function(){},
                'groupCollapsed': function(){},
                'groupEnd': function(){},
                'group': function(){},
            }
        }

         // модернизируем логи
        if(!$.browser.msie && !$.browser.mozilla){
            console.log = function(){
                if(Helpers.is_developer == false)return false;

                var diff = (new Date() - Helpers.vars.app_inited_time) / 1000;
                diff = Helpers.helper.parseSeconds(diff);
                if(arguments.length > 1){
                    if(typeof console.groupCollapsed == 'undefined'){
                        console.info(arguments);
                        return;
                    }
                    console.groupCollapsed('%c[' + diff + ']', 'color:#00a2c2; font-family: DINWebPro;', typeof arguments[0] == 'string' ? arguments[0]:'');
                    for(var i=0; i < arguments.length; i++){
                        console.info(arguments[i]);
                    }
                    console.groupCollapsed('Вызвана из:');
                    console.trace();
                    console.groupEnd();
                    console.groupEnd();

                }else{
                    if(typeof console.groupCollapsed == 'undefined'){
                        console.info(arguments);
                        return;
                    }
                    console.info('%c[' + diff + ']', 'color:#bc3fb2; font-family: DINWebPro;', arguments[0]);
                    console.groupCollapsed('Вызвана из:');
                    console.trace();
                    console.groupEnd();
                }
            }
        }else if(Helpers.is_developer == false){
            console.log = function() {
                return false;
            }
        }

        // Для ie в котором нет console.time и console.timeEnd
        if(typeof console != 'undefined' && typeof(console.time) == "undefined") {
            console.time = function(name, reset){
                if(!name) { return; }
                var time = new Date().getTime();
                if(!console.timeCounters) { console.timeCounters = {} };
                var key = "KEY" + name.toString();
                if(!reset && console.timeCounters[key]) { return; }
                console.timeCounters[key] = time;
            };

            console.timeEnd = function(name){
                var time = new Date().getTime();
                if(!console.timeCounters) { return; }
                var key = "KEY" + name.toString();
                var timeCounter = console.timeCounters[key];
                if(timeCounter) {
                    var diff = time - timeCounter;
                    var label = name + ": " + diff.toFixed(3) + "ms";
                    console.info(label);
                    delete console.timeCounters[key];
                }
                return diff;
            };
        }
    },
    
    //объединение всех функций на событие ресайза окна
    resize: { 
        funcs: [],
        add: function(func){
            var inf = {
                'func': func
            };
            inf.id = Helpers.resize.funcs.push(inf) - 1;
            $(window).on('resize', inf.func);
            return inf;
        },
        unbind: function(inf){
            if(typeof inf != 'undefined' && typeof inf.func == 'function'){
                $(window).unbind('resize', inf.func);
                delete Helpers.resize.funcs[inf.id];
            }
        },
        clear: function(){
            Helpers.resize.funcs.map(function(e){
                Helpers.resize.unbind(e);
            });
            Helpers.resize.funcs = [];
        }
    },
    
    // работа с localStorage
    storage: {
        set: function(key, val){
            if(typeof val != 'string'){
                val = JSON.stringify(val);
            }

            localStorage[key] = val;
        },
        get: function(key){
            var val = localStorage[key];

            try{
                val = jQuery.parseJSON(val);
            }catch(e){}

            return val;
        },
        remove: function(key){
            delete localStorage[key];
        }
    },
    
    // сохранение истории переходов для SPA
    history: {
        init: function(){
            $(window).on('popstate', function(e){
                if (Helpers.history.listing.length == 0) return;
                var data = e.originalEvent.state;
                if(data == null){
                    return;
                }
                //загрузка страницы

            });
        },
        add: function(url, id){
            if(history!= null && history.pushState != null){
                try{
                    history.pushState({'url': url, 'id': id}, '', url);
                }catch(e){
                    console.log('Не удалось сменить URL', url, e)
                }
            }else{
                location.hash = url;
            }

            Helpers.history.listing.push({
                'url': url,
                'id': id
            });
        },
        onPageOpen: function(){
            //функция для реинициализации каких-ли бо процессов на только что загруженной странице  
        },
        list: function(){
            console.log('Листинг истории за сессию', Helpers.history.listing);
        },
        listing: []
    },
    
    // работа с cookie
    cookie: {
        set: function(name, value, expires, path, domain, secure){
            var expires = expires || new Date((new Date).valueOf() + 1000*3600*24*365);
            document.cookie = name + "=" + escape (value) +
                ((expires == null) ? "" : ("; expires=" +
                    expires.toGMTString())) +
                ((path == null) ? "; path=/" : ("; path=" + path)) +
                ((domain == null) ? "" : ("; domain=" + domain)) +
                ((secure == true) ? "; secure" : "");
        },
        read: function(name){
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length,c.length));
            }
            return null;
        },
        remove: function(name){
            Helpers.cookie.set(name, '', new Date(0));
        }
    },

    elements: {
        // хак для нахначения новых функций set&get для dom-элемента select
        makeJQHooks: function(){
            $.valHooks['select'] = {
                set: function(e,val){
                    var num = $(e).attr('data-select');
                    if(num != null){
                        Helpers.vars.selectObjects[num].val(val);
                    }
                },
                get: function( elem ) { var value, option, options = elem.options, index = elem.selectedIndex, one = elem.type === "select-one" || index < 0, values = one ? null : [], max = one ? index + 1 : options.length, i = index < 0 ? max : one ? index : 0; for ( ; i < max; i++ ) {option = options[ i ]; if ( ( option.selected || i === index ) && ( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) && ( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {value = jQuery( option ).val(); if ( one ) {return value; } values.push( value ); } } return values; }
            }
        },

        // прелоадер загрузки
        preloader: {
            init: function(elem) {
                var elem = $(elem);
                if(elem.length){
                    elem.each(function(){
                        $(this).html('<div class="preloader">\
                            <svg class="svg-preloader" height="66px" width="66px" xmlns="http://www.w3.org/2000/svg">\
                                <circle class="warp-circle" cx="50%" cy="50%" r="32" fill="none" stroke="#eaeaea" stroke-width="1px" />\
                                <g style="stroke: #666; fill: none; stroke-width: 30px">\
                                    <path d="M 33 33 a 0 0 0 0 0 0 0" class="arc2"></path>\
                                </g>\
                                <circle class="inner-circle" cx="50%" cy="50%" r="22" fill="#fff" stroke="#9f9f9f" stroke-width="2px" />\
                                <g style="stroke: #00a2c2; fill: none; stroke-width: 20px">\
                                    <path d="M 33 33 a 0 0 0 0 0 0 0" class="arc1"></path>\
                                </g>\
                            </svg>\
                        </div>');
                    });
                    setTimeout(function(){
                        console.log('Запустился прелоадер', elem)
                        Helpers.elements.preloader.animatePreloader();
                    });
                }
            },
            animatePreloader: function() { 
                var i=0, j=0;
                var revert_i = false;
                var revert_j = false;

                var smallTimeOut = setInterval(function(){
                    i+=6/33;
                    if(i >= 360){
                        i=0;
                        revert_i = !revert_i;
                    }
                    if($(".arc1").length > 0){
                        $(".arc1").attr("d", Helpers.elements.preloader.describeArc(33, 33, 10, revert_i ? i:0, revert_i ? 359: i));
                    }else{
                        clearTimeout(smallTimeOut);
                    }

                }, 500/33);

                var bigTimeOut = setInterval(function(){
                    j+=6/33;
                    if(j >= 360){
                        j=0;
                        revert_j = !revert_j;
                    }

                    if($(".arc2").length > 0){
                        $(".arc2").attr("d", Helpers.elements.preloader.describeArc(33, 33, 15, revert_j ? j:0, revert_j ? 359: j));
                    }else{
                        clearTimeout(bigTimeOut);
                    }

                }, 18000/33);
            },
            polarToCartesian: function(centerX, centerY, radius, angleInDegrees) {
                var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
                return {
                    x: centerX + (radius * Math.cos(angleInRadians)),
                    y: centerY + (radius * Math.sin(angleInRadians))
                }
            },

            describeArc: function(x, y, radius, startAngle, endAngle){
                var start = Helpers.elements.preloader.polarToCartesian(x, y, radius, endAngle);
                var end = Helpers.elements.preloader.polarToCartesian(x, y, radius, startAngle);
                var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

                var d = [
                    "M", start.x, start.y,
                    "A", radius, radius, 0, arcSweep, 0, end.x, end.y
                ].join(" ");

                return d;
            }
        }
    },
    // событие на загрузку скрипта
    loadJs: function(src, callback){
        console.log('Запрос на подгрузку скрипта', src, callback);
        $.getScript(src, function(e,a){
            console.log('Подгружен скрипт', src);
            if(typeof callback == 'function'){
                callback(e,a);
            }
        });
    },
    
    //конвертирование объекта в qwery_srting с возможностью исколючения
    objectToUrl: function(data, exclude){
        var exclude = exclude || [];
        var str = '';
        for(var key in data){
            if(exclude.filter(function(e){return e==key}).length) continue;
            str += key + '=' + data[key] + '&';
        }
        return str;
    },
    
    // моргнуть элементом
    blink: function(elem){ 
        elem.classList.add('seeImHere');
        setTimeout(function(){
            elem.classList.remove('seeImHere');
        }, 400);
    },
    
    // переводим "180 сек." в "3 мин."
    parseSecondsToMinutes: function(sec){ 
        var res = {
            'value': sec,
            'type': 'second'
        };

        if(Math.abs(sec) >= 60){
            res.value = sec / 60;
            res.type = 'minute';
        }
        return res;
    },
    
    // проверка на соответсвие даты в периоде
    validateDate: function(str, minDate, maxDate) {
        var matches = /^(\d{2})[-\/\.](\d{2})[-\/\.](\d{4})$/.exec(str.trim());
        if (matches == null) return false;
        var d = matches[1] * 1;
        var m = matches[2] - 1;
        var y = matches[3] * 1;
        var composedDate = new Date(y, m, d);

        minDate = minDate || false;
        maxDate = maxDate || false;

        if (
            composedDate.getDate() == d && composedDate.getMonth() == m && composedDate.getFullYear() == y &&
                (!minDate || (composedDate >= minDate)) &&
                (!maxDate || (composedDate <= maxDate))
            )
            return composedDate;
        else
            return false;
    },
    
    // проверяем, что строка из двух дат - допустимая
    validateDatePeriod: function(str, minDate, maxDate) { 
        var dateStrs = str.split('-').map(function(s){ return s.trim(); });
        var dates = dateStrs.map(function(date) { return Helpers.helper.validateDate(date, minDate, maxDate) });
        return (dates.length == 2) && dates[0] && dates[1] && dates[0] <= dates[1];
    },
    
    // исключение из урла одно из get параметров
    get_url: function(exclude, loc){
        var loc = loc || location.href;
        var new_path = '';
        if(loc.indexOf('?') == -1){
            new_path = loc + '?';
        }else{
            new_path = loc.substr(0, loc.indexOf('?')) + '?';
        }
        var path = location.search.substr(1).split('&');
        var params = [];
        for(i=0; i<path.length; i++){
            data = path[i].split('=');
            if(data[0] != exclude && data[0] != exclude + '[]' && data[0] != ''){
                new_path += data.join('=') + '&';
            }
        }
        return new_path;
    },

    urlReplace: function(url, exclude){
        var url = url || location.href;
        var exclude = exclude || [];

        if(!exclude.length){return url;}

        var q_pos = url.indexOf('?');
        var search = '';
        if(q_pos != -1){
            search = url.substr(q_pos + 1);
            url = url.substr(0, q_pos+1);
        }

        search = search.split('&').filter(function(e){var exp = e.split('='); return exclude.indexOf(exp[0]) == -1 }).join('&');
        return url + search;
    },
    
    // возвращение параметра qwery_string из урла
    urlGetParam: function(url, param){
        var url = url || location.href;
        return url.split('?')[1].split('&').filter(function(e){return e.split('=')[0] == param}).map(function(e){return e.split('=')[1]});
    },

    // класс для получения свойств url
    'Location': function(url){
        var _this = this;
        this.url = String(url).trim();

        this.protocol = url.indexOf('://') != -1 ? url.substr(0, url.indexOf('://')) + ':': location.protocol;

        url = url.indexOf('://') != -1 ? url.substr(url.indexOf('://') + 3) : url;

        var split = url.split('/');

        this.domain = split[0] || location.host;

        split.shift();
        url = split.join('/');
        var split = url.split('?');

        this.path = split[0];

        var questionIndex = this.url.indexOf('?');
        if (questionIndex < 0)
            this.query_string = '';
        else
            this.query_string = this.url.substr( questionIndex+1 );

        this.get = {};

        var ex = this.query_string.split('&');

        ex.map(function(e){

            var sub = e.split('=');
            if (sub[0]) {
                if (sub.length > 1)
                    _this.get[sub[0]] = sub[1];
                else
                    _this.get[sub[0]] = '';
            }

        });

        this.getUrl = function(ops){
            var ops = $.extend({
                'ignoreGet': [],
                'after': ''
            }, ops);

            var query_string = '';
            for(var key in _this.get){
                if( ops.ignoreGet.indexOf(key) != -1 ) continue;
                var val = _this.get[key];
                if(!query_string){
                    query_string += '?';
                }else{
                    query_string += '&';
                }

                query_string += key + '=' + val;
            }

            var url = _this.protocol + '//'
                + _this.domain + '/'
                + _this.path
                + query_string
                + ops.after;
            return url;
        }
    },

    // конвертация цвета hsl в rgb
    hsvToRgb: function(h, s, v) {
        var r, g, b; var i; var f, p, q, t; h = Math.max(0, Math.min(360, h)); s = Math.max(0, Math.min(100, s)); v = Math.max(0, Math.min(100, v)); s /= 100; v /= 100; if(s == 0) {r = g = b = v; return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]; } h /= 60; i = Math.floor(h); f = h - i; p = v * (1 - s); q = v * (1 - s * f); t = v * (1 - s * (1 - f)); switch(i) {case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break; case 2: r = p; g = v; b = t; break; case 3: r = p; g = q; b = v; break; case 4: r = t; g = p; b = v; break; default: r = v; g = p; b = q; } return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },

    // конвертация цвета hsl в hex
    hsvToHex: function(h, s, v){
        var rgb = Helpers.helper.hsvToRgb(h, s, v);
        return Helpers.helper.rgbToHex(rgb[0], rgb[1], rgb[2]);
    },

    // конвертация цвета rgb в hex
    rgbToHex: function(r, g, b) {
        r = r.toString(16); g = g.toString(16); b = b.toString(16); if (r.length == 1) r = '0' + r; if (g.length == 1) g = '0' + g; if (b.length == 1) b = '0' + b; return (r + g + b).toUpperCase();
    },

    // конвертация цвета rgb в hsl
    rgbToHsv: function() {
        var rr, gg, bb, r = arguments[0] / 255, g = arguments[1] / 255, b = arguments[2] / 255, h, s, v = Math.max(r, g, b), diff = v - Math.min(r, g, b), diffc = function(c){return (v - c) / 6 / diff + 1 / 2; }; if (diff == 0) {h = s = 0; } else {s = diff / v; rr = diffc(r); gg = diffc(g); bb = diffc(b); if (r === v) {h = bb - gg; }else if (g === v) {h = (1 / 3) + rr - bb; }else if (b === v) {h = (2 / 3) + gg - rr; } if (h < 0) {h += 1; }else if (h > 1) {h -= 1; } } return {h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
    },

    // конвертация цвета hex в rgb
    hexToRgb: function (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? {r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
    },

    //конвертация цвета hex в hsl
    hexToHsv: function(hex) {
        var rgb = Helpers.helper.hexToRgb(hex);
        return Helpers.helper.rgbToHsv(rgb.r,rgb.g,rgb.b);
    },

    //цветовая насыщенность
    colorSaturation: function(hsl, saturation) {
        hsl.s = saturation;
        return Helpers.helper.hsvToHex(hsl.h, hsl.s, hsl.v);
    },

    // генератор градиента по цвету. diff - уровень разброса
    colorToGradient: function(hex, diff){
        if( diff == null )diff = 0;
        var rgb = Helpers.helper.hexToRgb(hex);
        if( rgb == null )return;
        var hsl = Helpers.helper.rgbToHsv(rgb.r, rgb.g, rgb.b);


        var rgb_from = Helpers.helper.hsvToRgb( hsl.h, hsl.s, (hsl.v + diff > 100) ? 100: (hsl.v + diff) );
        var hex_from = Helpers.helper.rgbToHex(rgb_from[0], rgb_from[1], rgb_from[2]);

        var rgb_to = Helpers.helper.hsvToRgb( hsl.h, hsl.s, (hsl.v - diff < 0) ? 0: (hsl.v - diff) );
        var hex_to = Helpers.helper.rgbToHex(rgb_to[0], rgb_to[1], rgb_to[2]);

        return {'from': hex_from, 'to': hex_to};
    },

    // валидация email
    isValidEmailAddress: function(emailAddress) {
        var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
        return pattern.test(emailAddress);
    },

    // валидация скайпа
    isValidSkype: function(skype){
        if(skype.indexOf(' ') != -1)return false;
        var pattern = new RegExp(/^[a-zA-Z0-9_\-\,\.]{5,31}$/i);
        return pattern.test(skype);
    },

    // конвертация 01.06.2012 в Date()
    dayToDate: function(day){
        day = day.split('.');
        return date = new Date(day[1] + '.' + day[0] + '.' + day[2]);
    },

    // получение GET параметра по имени (включая массивы)
    getParam: function(get, return_as_array){
        var url = location.search.substr(1);
        var str = [];
        var val = [];
        ex = url.split('&');
        for(var i=0; i<ex.length; i++){
            var params = ex[i].split('=');
            if( params[0] == get || params[0].replace('[]', '') == get ){
                str.push(ex[i]);
                val.push(params[1]);
            }
        }
        if(return_as_array != null && return_as_array){
            return val;
        }
        return str.join('&');
    },
    
    // преобразование числа 100000 в 100'000
    formatNum: function(str, digs){
        if(digs == 'percent') {
            return str + '%';
        }
        str = str + '';
        if(typeof digs == 'string' && digs.indexOf('percent.') == 0) {
            digs = parseInt(digs.replace('percent.', '')) || 0;
            str = parseFloat(str.replace(/\,/g, '.').replace(/\'/g, '')).toFixed(digs);
            return str + '%';
        }
        digs = digs || 0;
        str = Number(str.replace(/\,/g, '.').replace(/\'/g, '')).toFixed(digs);
        str = str.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1’');
        return (function(str){var a = str.split('.');if(a.length<=1){return str};a[a.length-1]=a[a.length-1].replace(/\’/g,'');return a.join('.');})(str)
    },
    
    // преобразование числа в секунды
    parseSeconds: function(s){
        s = Number(s);
        var h = Math.floor(s / 3600);
        s -= h*3600;
        var m = Math.floor(s / 60);
        s -= m*60;

        h = h < 10 ? '0' + h : h;
        m = m < 10 ? '0' + m : m;
        s = s < 10 ? '0' + parseInt(s) : parseInt(s);

        return h + ':' + m + ':' + s;
    },
    
    // возвращает только четные индексы массива
    arraySliceTwo: function(arr){
        var new_arr = []
        for(var i=0; i < arr.length; i++){
            if(i%2 == 0){
                new_arr.push(arr[i]);
            }
        }
        return new_arr;
    },
    
    // возвращает массив в процентах
    array2proc: function(arr){
        if(arr == null)return arr;
        for(var i=0; i<arr.length; i++){
            arr[i] = parseFloat( (arr[i] * 100) );
        }
        return arr;
    },
    
    // возвращает массив с опреденнным числом символов после запятой
    array2fixed: function(arr, len){
        var len = len || 4;
        if(arr == null)return arr;
        for(var i=0; i < arr.length; i++){
            arr[i] = parseFloat(arr[i].toFixed(len));
        }
        return arr;
    },

    //среднее арифметическое
    average: function(arr){
        if(arr == null)return arr;
        var summ = 0;
        for(var i=0; i<arr.length; i++){
            summ += arr[i];
        }
        return summ/arr.length;
    },

    // находим элемент по координатам
    getElementFromCoords: function(x, y){
        return $(document.elementFromPoint(x,y));
    },
    
    // остановка дальнейших событий
    stopEvents: function(e){  
        try{
            var evt = e || window.event;
            if(evt.originalEvent){
                evt = e.originalEvent;
            }
            if(evt.cancelBubble != null){
                evt.cancelBubble = true;
            }
            if(evt.stopPropagation != null){
                evt.stopPropagation();
            }
        }catch(e){}
    }

}
