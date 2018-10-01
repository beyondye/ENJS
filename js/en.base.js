(function ($) {

    var Modal = function () {
        this.init.apply(this, arguments);
    };

    Modal.prototype.init = function (container, options) {

        this.options = options;

        if (container === window || container === document) {
            this.options.local = false;
        } else {
            this.options.local = true;
        }

        this.container = this.options.local ? $(container) : $('body');
        this.containerWidth = this.options.local ? this.container.innerWidth() : $(window).width();
        this.containerHeight = this.options.local ? this.container.innerHeight() : $(document).height();
        this.options.before(this);
    };

    Modal.prototype.backdrop = function (ele) {

        if (!this.options.backdrop || this.container.children(ele).length > 0) {
            return this;
        }

        var element = $('<div>').addClass(ele.replace('.', ''))
                .appendTo(this.container)
                .css({width: this.options.local ? this.containerWidth : this.containerWidth + $(window).scrollLeft(), height: this.containerHeight})
                .fadeTo("slow", this.options.opacity);

        if (!this.options.local) {
            $(window).on('resize scroll', function () {
                var win = $(window);
                element.css({
                    height: win.height() + win.scrollTop(),
                    width: win.width() + win.scrollLeft()
                });
            });
        }

        return this;
    };

    Modal.prototype.bindEvent = function () {

        var that = this;
        this.container.children('.En-modal').find('.En-modal-remove').on('click', function () {
            that.container.children('.En-modal').remove();
            that.container.children('.En-modal-backdrop').remove();
        });

        return this;
    };

    Modal.prototype.show = function (ele) {

        var that = this;
        var element = this.container.children(ele);
        element = element.length > 0 ? element : $('<div>').addClass(ele.replace('.', '')).appendTo(this.container);

        if (!this.options.local) {
            $(window).resize(function () {
                that.setPosition(element);
            });
        }

        if (this.options.local && this.container.css('position') !== 'absolute' && this.container.css('position') !== 'fixed') {
            this.container.css('position', 'relative');
        }

        element.html(this.options.content);
        this.setPosition(element);
        if (this.options.remote) {
            element.load(this.options.remote, function () {
                that.setPosition(element, true);
                that.options.after(that);
                that.bindEvent();
            });
        } else {
            this.options.after(this);
            this.bindEvent();
        }

        return this;
    };

    Modal.prototype.setPosition = function (element, isAnimate) {

        var width = element.width();
        var height = element.height();
        var winWidth = $(window).width();
        var winHeight = $(window).height();

        var top = this.options.local ? (height > this.containerHeight ? 0 : this.containerHeight / 2 - height / 2) : height > winHeight ? $(window).scrollTop() : (winHeight / 2 - height / 2)+ $(window).scrollTop();
        var left = this.options.local ? (width > this.containerWidth ? 0 : this.containerWidth / 2 - width / 2) : width > winWidth ? $(window).scrollLeft() : (winWidth / 2 + $(window).scrollLeft()) - width / 2;

        //if (isAnimate) {
        //    element.animate({top: top, left: left}, 'fast');
        //} else {
            element.css({top: top, left: left});
        //}

        return this;
    };

    $.fn.modal = function (options) {

        var options = $.extend({}, $.fn.modal.defaults, options);
        this.each(function () {
            new Modal(this, options).backdrop('.En-modal-backdrop').show('.En-modal');
        });
        return this;
    };

    $.fn.modalClose = function () {
        this.children('.En-modal').remove();
        this.children('.En-modal-backdrop').remove();
    };

    $.fn.modal.defaults = {local: false, backdrop: true, opacity: 0.6, remote: false, content: '<p class="En-modal-loading"></p>', before: function () {
        }, after: function () {
        }};
    $.fn.modal.Constructor = Modal;

})(jQuery);


(function ($) {

    var Alert = function () {
        this.init.apply(this, arguments);
    };

    Alert.prototype = $.extend({}, $.fn.modal.Constructor.prototype);
    Alert.prototype.constructor = Alert;

    Alert.prototype.delay = function () {

        if (this.options.type === 'loading' || this.options.delay < 1) {
            return this;
        }

        var that = this;
        var handle = setInterval(function () {
            that.container.children('.En-alert').fadeOut(function () {
                $(this).remove();
                that.container.children('.En-alert-backdrop').remove();
                that.options.afterDelay();
            });
            clearInterval(handle);
        }, this.options.delay);

        return this;
    };

    Alert.prototype.bindEvent = function () {

        var that = this;
        that.container.children('.En-alert').find('.En-alert-confirm-cancel').on('click', function () {
            that.container.children('.En-alert').remove();
            that.container.children('.En-alert-backdrop').remove();
        });

        that.container.children('.En-alert').find('.En-alert-confirm-execute').on('click', function () {
            that.container.children('.En-alert').remove();
            that.container.children('.En-alert-backdrop').remove();
            that.options.confirm();
        });
        return this;
    };


    $.fn.alert = function (options) {

        var options = $.extend({}, $.fn.alert.defaults, options);

        if (options.type === 'notice') {
            options.content = '<p class="En-alert-notice">' + options.content + '</p>';
        } else if (options.type === 'loading') {
            options.content = '<p class="En-alert-loading"></p>';
        } else if (options.type === 'confirm') {
            options.content = '<div class="En-alert-confirm">\n\
                               <div class="En-alert-confirm-body">' + options.content + '</div>\n\
                               <div class="En-alert-confirm-foot">\n\
                               <button class="En-alert-confirm-execute">确定</button>\n\
                               <button class="En-alert-confirm-cancel">取消</button>\n\
                               </div></div>';
            options.delay = 0;
        }

        this.each(function () {
            new Alert(this, options).backdrop('.En-alert-backdrop').show('.En-alert').delay();
        });

        return this;
    };

    $.fn.alertClose = function () {
        this.children('.En-alert').remove();
        this.children('.En-alert-backdrop').remove();
    };

    $.fn.alert.defaults = {type: 'loading', delay: 1500, local: false, opacity: .5, backdrop: true, remote: false, content: '<p class="En-alert-loading"></p>', before: function () {
        }, after: function () {
        }, afterDelay: function () {
        }, confirm: function () {
        }};
    $.fn.alert.Constructor = Alert;

})(jQuery);



(function ($) {
    $.fn.validate = function (options) {

        var setting = $.extend(true, {}, $.fn.validate.defaults, options);
        var pass = true;

        var validate = function (el) {

            var $el = $(el);
            var rule = $el.attr('data-validate-rule') || setting.rules[$el.attr('data-validate')] || false;
            var status = true;

            if ($.type(rule) === 'string') {
                rule = (new Function("return " + rule))();
            }

            if ($.type(rule.validate) === 'function') {
                status = rule.validate($el.val());
            } else if ($.type(rule.validate) === 'regexp') {
                status = $el.val().match(rule.validate);
                if ($el.val().match(rule.validate) === null) {
                    status = false;
                } else {
                    status = true;
                }
            }

            return status;
        };

        this.each(function () {

            var status = validate(this);
            var currentRule = $(this).attr('data-validate-rule') || setting.rules[$(this).attr('data-validate')];

            if (pass) {
                pass = status;
            }

            if ($.type(currentRule) === 'string') {
                currentRule = (new Function("return " + currentRule))();
            }

            if ($.type(currentRule) === 'object') {

                if (status) {
                    if ($.type(currentRule.success) === "function") {
                        currentRule.success(this);
                    } else {
                        setting.success(this);
                    }
                } else {
                    if ($.type(currentRule.warning) === "function") {
                        currentRule.warning(this);
                    } else {
                        setting.warning(this);
                    }
                }
            }


        });

        return pass;
    };

    $.fn.validate.defaults = {rules: {
            required: {validate: function (value) {
                    return !($.trim(value) === '');
                }, message: '请输入内容。'},
            email: {validate: /^[a-z0-9]+([\+_\-\.]?[a-z0-9]+)*@([a-z0-9]+[\-]?[a-z0-9]+\.)+[a-z]{2,4}$/, message: '请正确输入邮箱地址。'},
            number: {validate: /^\d+$/, message: '请输入数字。'}
        },
        warning: function (el) {
            var rule = $(el).attr('data-validate-rule') || this.rules[$(el).attr('data-validate')];

            if ($.type(rule) === 'string') {
                rule = (new Function("return " + rule))();
            }

            $(el).next('.En-validate-span').remove()
            $(el).after('<span class="En-validate-span En-validate-warning"> ' + rule.message + '</span>');
        },
        success: function (el) {
            $(el).next('.En-validate-span').remove();
        }};

})(jQuery);