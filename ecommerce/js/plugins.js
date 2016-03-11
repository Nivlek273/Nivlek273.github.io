"use strict";
// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.



//------ Click Outside ------
/*!
 * jQuery outside events - v1.1 - 3/16/2010
 * http://benalman.com/projects/jquery-outside-events-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function ($, doc, outside) {
    $.map('click dblclick mousemove mousedown mouseup mouseover mouseout change select submit keydown keypress keyup'.split(' '), function (event_name) {
        jq_addOutsideEvent(event_name);
    }
    );

    jq_addOutsideEvent('focusin', 'focus' + outside);
    jq_addOutsideEvent('focusout', 'blur' + outside);

    $.addOutsideEvent = jq_addOutsideEvent;

    function jq_addOutsideEvent(event_name, outside_event_name) {
        outside_event_name = outside_event_name || event_name + outside;

        var elems = $(),
            event_namespaced = event_name + '.' + outside_event_name + '-special-event';

        $.event.special[outside_event_name] = {
            setup: function () {
                elems = elems.add(this);
                if (elems.length === 1) {
                    $(doc).bind(event_namespaced, handle_event);
                }
            },
            teardown: function () {
                elems = elems.not(this);
                if (elems.length === 0) {
                    $(doc).unbind(event_namespaced);
                }
            },
            add: function (handleObj) {
                var old_handler = handleObj.handler;
                handleObj.handler = function (event, elem) {
                    event.target = elem;
                    old_handler.apply(this, arguments);
                };
            }
        };

        function handle_event(event) {
            $(elems).each(function () {
                var elem = $(this);
                if (this !== event.target && !elem.has(event.target).length) {
                    elem.triggerHandler(outside_event_name, [
                event.target
                    ]);
                }
            });
        };
    };
})(jQuery, document, 'outside');

//------- Dropdowns ----------
; (function ($, document, window) {

    var Dropdown = 'Dropdown',
        prefix='drop',
        settings = {
            init: function () { },
            open: function () { },
            close: function () { }
        };
            

    function Plugin(element) {
        this.element = element;
        this.settings = settings;
        this._name = Dropdown;

        this.init();
    };

    Plugin.prototype._dropdownToggle = function () {
        var $this = this;
        var settings = $this.settings;
        var btn = $this.btn;
        var drop = $this.drop;

        if (btn.hasClass(prefix + '_collapsed')) {
            btn.removeClass(prefix + '_collapsed');
            btn.addClass(prefix + '_open');
        } else {
            btn.removeClass(prefix + '_open');
            btn.addClass(prefix + '_collapsed');
        }

        $this._visibilityToggle();
    };
    
    

    Plugin.prototype._visibilityToggle = function () {
        var $this = this,
            settings = $this.settings,
            btn = $this.btn,
            drop = $this.drop;

        if (drop.hasClass(prefix + '_hidden')) {
            drop.removeClass(prefix + '_hidden');
        } else {
            drop.addClass(prefix + '_hidden');
        }
    };

    Plugin.prototype.init = function () {
        var $this = this;
        var target = $this.element.id;
        $this.btn = $('.dropdown-btn').filter(function(){
            return $(this).attr('data-dropdown')==target;
        });
        $this.btn.addClass(prefix + '_collapsed');
        $this.drop = $($this.element);
        
        $this._clickOutside($this.btn);

        $this.btn.click(function (e) {
            e.preventDefault();
            $this._dropdownToggle();
        });
        
    };
    
    Plugin.prototype._clickOutside = function (el) {
        var $this = this;
        var btn = $(el);
        
        $($this.element).on('clickoutside keydownoutside', function(event){
            if (!$($this.element).hasClass('drop_hidden')) {
                var target = $(event.target);
                if (!target.is(btn)) {
                    $this.close();
                }
            }
        })
    }

    Plugin.prototype.toggle = function () {
        var $this = this;
        $this._dropdownToggle();
    };

    Plugin.prototype.open = function () {
        var $this = this;
        if ($this.btn.hasClass(prefix + '_collapsed')) {

            $this._dropdownToggle();
        }
    };

    Plugin.prototype.close = function () {
        var $this = this;
        if ($this.btn.hasClass(prefix + '_open')) {

            $this._dropdownToggle();
        }
    };

    $.fn[Dropdown] = function () {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + Dropdown)) {
                $.data(this, 'plugin_' + Dropdown, new Plugin(this));
            }
        })
    }

}(jQuery, document, window));