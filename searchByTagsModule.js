var $ = require('jquery');

module.exports = function() {

    function searchPage() {
        if(window.searchByTags == null) {
            return;
        }
        //данные из шаблона
        this.services = window.searchByTags.services;
        this.news = window.searchByTags.news;
        this.max = window.searchByTags.max;
        this.services_counter = window.searchByTags.services_counter;
        this.news_counter = window.searchByTags.news_counter;

        this.tagsField = $('.js-tags-field');
        this.tags = this.tagsField.find('div');
        this.showMoreTagsBtn = $('.js-show-more-tags');
        this.clearAllTagsBtn = $('.js-clear-all-tags');
        this.showMoreNewsBtn = $('.js-show-more-news');
        this.hideTagsBtn = $('.js-hide-tags');
        this.newsField = $('.js-result-field');
        this.resultCount = $('.js-result-count');

        this.activeTagClass = 'is_active';
        this.allTagsClass = 'show_all';
        this.hiddenClass = 'disabled';

        var self = this;
        
        this.init = function() {
            this.restartCounter();
            this.changeDataFormat();
            this.showMoreTagsEvent();
            this.clearAllTagsEvent();
            this.showMoreNewsEvent();
            this.makeNewRequestEvent();
        };

        this.restartCounter = function() {
            this.globalCounter = 0;
        };

        this.changeDataFormat = function() {
            this.data = [];
            for(var i = 0, max = this.services.length; i < max; i++) {
                this.services[i].type = 'service';
                this.data.push(this.services[i]);
            }

            for(var i = 0, max = this.news.length; i < max; i++) {
                var newsItem = this.news[i];
                for(var j = 0, maxJ = newsItem.news.length; j < maxJ; j++) {
                    newsItem.news[j].type = 'news';
                    newsItem.news[j].is_today = newsItem.is_today;
                    newsItem.news[j].date = newsItem.date;

                    this.data.push(newsItem.news[j]);
                }
            }
        };

        this.showMoreTagsEvent = function() {
            this.showMoreTagsBtn.on('click', function() {
                self.tagsField.addClass(self.allTagsClass);
                $(this).addClass(self.hiddenClass);
                self.hideTagsBtn.removeClass(self.hiddenClass);
            });

             this.hideTagsBtn.on('click', function() {
                self.tagsField.removeClass(self.allTagsClass);
                $(this).addClass(self.hiddenClass);
                self.showMoreTagsBtn.removeClass(self.hiddenClass);
            });
        };

        this.clearAllTagsEvent = function() {
            this.clearAllTagsBtn.on('click', function() {
                self.tags.removeClass(self.activeTagClass);
                self.newsField.empty();
                self.changeResultCount(0, 0);
            });
        };

        this.getWordEnding = function(number, word_for_1, word_for_2_3_4, word_other) {
            var intgr = parseInt(number/10) == 1 ? true : false;
            var rest = number%10; 
            if(rest == 1 && !intgr) {
                return number + ' ' + word_for_1;
            } else if(rest > 1 && !intgr) {
                return number + ' ' + word_for_2_3_4;
            } else {
                return number + ' ' + word_other;
            }
        };

        this.changeResultCount = function(services_counter, news_counter) {
            var services_counter = self.getWordEnding(services_counter, 'сервис', 'сервиса', 'сервисов');
            var news_counter = self.getWordEnding(news_counter, 'новость', 'новости', 'новостей');
            self.resultCount.html('Найдено ' + news_counter + ' и ' + services_counter);
            self.disableButton();
        };

        this.showMoreNewsEvent = function() {
            this.showMoreNewsBtn.on('click', function() {
                self.globalCounter = self.globalCounter + self.max;
                self.buildContent();
            });
        };

        this.buildContent = function() {
            var items = [];
            var maxIterationLength = this.max + this.globalCounter;
            if(this.data.length <= maxIterationLength) {
                this.disableButton();
            }

            for(var i = this.globalCounter; i < maxIterationLength; i++) {
                this.globalCounter = i;
                if(this.data[i]) {
                    var item = this.data[i];
                    if(item.type == 'news') {
                        if(item.date != this.data[i-1].date) {
                            items.push('<h3>Новости/'+ (item.is_today ? 'Сегодня' :  item.date) +'</h3>');
                        }
                    }
                    items.push(this.item_template(this.data[i]));    
                } else {
                    return;
                }
            }
            this.newsField.append(items.join(""));
        };

        this.item_template = function (item) {
            var element = {};
            if(item.type == 'service') {
                element = {
                    'theme': 'Сервисы',
                    'link': item.link,
                    'title': item.title,
                    'desc': item.description,
                    'originalUrl': item.link,
                    'linkTitle': item.link
                }; 
            } else {
                element = {
                    'theme': item.date,
                    'link': '/news/' + item.id + '/',
                    'title': item.title,
                    'desc': item.annotation,
                    'originalUrl': item.original_url,
                    'linkTitle': 'Источник: ' + (item['resource'] != null ? item.resource.title : item.original_url)
                };
            }

            var template = '<div class="'+ (item.type == 'service' ? 'search-block' : '') +' result-item-block">\
                <div class="result-item-block-theme">'+ element.theme +'</div>\
                <a href="'+ element.link +'" class="result-item-block-title">'+ element.title +'</a>\
                <div class="result-item-block-desc">'+ element.desc +'</div>\
                 <a href="'+ element.originalUrl +'" class="result-item-block-link">'+ element.linkTitle +'</a>\
            </div>';
            return template;
        };

        this.disableButton = function() {
            this.showMoreNewsBtn.addClass(self.hiddenClass);
        };

        this.enableButton = function() {
            this.showMoreNewsBtn.removeClass(self.hiddenClass);
        };

        this.makeNewRequestEvent = function() {
            this.tags.on('click', function() {
                $(this).toggleClass(self.activeTagClass);
               
                if(typeof this.xhr !== 'undefined') {
                    this.xhr.abort();
                }
                setTimeout(self.request, 1000);

            });
        };

        this.request = function() {
            var params = self.getTagParams();
            this.xhr =  $.ajax({
                method: 'POST',
                url: window.location.href,
                data: {'tags': params},
                dataType: 'json' 
            }).done(function(responce) {
                if(!responce['error']) {
                    self.displayRequest(responce);
                }
            });
        };

        this.getTagParams =  function() {
            var data = [];
            this.tags.each(function(){
                if($(this).hasClass(self.activeTagClass)) {
                    data.push($(this).data('id'));
                }
            });
            return data;
        };

        this.putNewData = function(json) {
            this.service = json.services;
            this.news = json.news;
            this.changeDataFormat();
        };

        this.displayRequest = function(json) {
            this.putNewData(json);
            this.restartCounter();
            this.buildContent();
            this.enableButton();
        }

        this.init();
    }


    $(function() {
        window.searchPage = new searchPage();
    });
}
