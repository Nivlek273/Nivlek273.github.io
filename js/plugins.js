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


//Sitemenu
//Based off of SlickNav
/*!
    SlickNav Responsive Mobile Menu v1.0.1
    (c) 2014 Josh Cope
    licensed under MIT
*/
; (function ($, document, window) {

    var siteMenu = 'siteMenu',
        prefix = 'siteMenu',
        defaults = {
            duration: 150,
            easingOpen: 'swing',
            easingClose: 'swing',
            closeOnClick: true,
            closeOnClickOutside: true,
            mobileOnly: false,
            enableHover: false,
            init: function () { },
            open: function () { },
            close: function () { }
        };

    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._name = siteMenu;
        this.init();
    }

    Plugin.prototype.init = function () {
        var $this = this,
            menu = $(this.element).children('ul.sub-menu'),
            buttonId = $(this.element).data('button');
        settings = this.settings;

        if (menu.length == 0 || !buttonId || $('#' + buttonId).length == 0) {
            console.log('failed to create menu');
            return;
        }

        $this.siteNav = menu;

        $this.btn = $('#' + buttonId + ' > a.nav-btn');
        if ($this.btn.length == 0) {
            $this.btn = $('#' + buttonId);
        }

        console.log($this.btn);

        if (settings.closeOnClickOutside) {
            $this._clickOutside($this.btn);
        }

        //iterate over structure adding additional structure
        var items = $this.siteNav.find('li');
        $(items).each(function () {
            var item = $(this),
                data = {};
            data.children = item.children('ul').attr('role', 'menu');
            item.data('menu', data);
            item.btn = item.children('a');

            if ($(data.children).length) {
                $this._clickOutside(item.btn);
            }

            item.children('a').attr('role', 'menuitem').click(function (event) {
                if (settings.closeOnClick && !$(event.target).parent().closest('li').hasClass('has-submenu')) {
                    $this.btn.click();
                }
            });

        });

        $(items).each(function () {
            var data = $(this).data('menu');

            $this._visibilityToggle(data.children, false, null, true);

        });

        //accesibility for button
        $this._visibilityToggle($this.siteNav, false, 'init', true);

        //Unhide if mobileOnly
        if (settings.mobileOnly && $this._browserSize() != "small") {
            $this.open();
        }

        //Close/Open on resize
        $(window).resize(function () {

            if ($this._hideAtSize()) {
                $this.close();
            }
            else {
                if ($this.siteNav.hasClass(prefix + '_hidden')) {
                    $this.open();
                }
            }
        });

        //outline prevention for mouse
        $(document).mousedown(function () {
            $this._outlines(false);
        });

        $(document).keyup(function () {
            $this._outlines(true);
        });


        //menu button click
        $this.btn.click(function (e) {
            console.log('firing');
            e.preventDefault();
            $this._closeOpenMenus();
            $this._closeSubMenus($(this));
            $this._menuToggle();
        });

        // Add hover if enabled
        if (settings.enableHover) {
            var startOpen = null,
                startClose = null,
                hoverGroup = $($this.btn.parent()).add($this.siteNav);
            $(hoverGroup).hover(
                function (e) {
                    if ($this._browserSize() != "small") {
                        if (startClose) { clearTimeout(startClose) }
                        startOpen = window.setTimeout(function () {
                            $this._closeOpenMenus();
                            $this._closeSubMenus($(this));
                            $this.open();
                        }, 200);
                    }
                }, function (e) {
                    if ($this._browserSize() != "small") {
                        if (startOpen) { clearTimeout(startOpen) }
                        startClose = window.setTimeout(function () {
                            $this._closeSubMenus($(this));
                            $this.close();
                        }, 200);
                    }
                }
            );
        };


        //click on menu parent
        $this.siteNav.on('click', '.' + prefix + '_item', function (e) {
            e.preventDefault();
            $this._closeSubMenus($(this));
            $this._itemClick($(this));
        });

        // check for enter key on menu button and menu parents
        $($this.btn).keydown(function (e) {
            var ev = e || event;
            if (ev.keyCode == 13) {
                e.preventDefault();
                $this._closeOpenMenus();
                $this._closeSubMenus($(this));
                $this._menuToggle();
            } else {
                if (ev.keyCode == 9 && $this.btn.hasClass(prefix + '_open')) {
                    window.setTimeout(function () {
                        $this.siteNav.find('a')[0].focus();
                        console.log($(':focus'));

                    }, 1);

                }
            }
        });

        $this.siteNav.on('keydown', '.' + prefix + '_item', function (e) {
            var ev = e || event;
            if (ev.keyCode == 13) {
                e.preventDefault();
                $this._itemClick($(e.target));
            }
        });
    };

    // Get browser size
    Plugin.prototype._browserSize = function () {
        var browserSize = "medium";
        if ($('#meta-format').css('content')) {
            browserSize = $('#meta-format').css('content').replace(/^"(.*)"$/, '$1');
        }
        return browserSize;
    };
    // Check mobileOnly and window
    Plugin.prototype._hideAtSize = function () {
        var $this = this;
        var settings = $this.settings;

        if (!settings.mobileOnly || $this._browserSize() == "small") {
            return true;
        }
        else {
            if (settings.mobileOnly) {
                return false;
            }
        }
    };

    // Close the open menu when another is clicked
    Plugin.prototype._closeOpenMenus = function (el) {
        //var $this = this;
        //var btn = $this.btn;
        //var openMenus = $('.nav-btn.' + prefix + '_open').not(btn);

        //$(openMenus).click();
    };

    // Close any open sub-menus when another menu is opened
    Plugin.prototype._closeSubMenus = function (el) {
        //var $this = this;
        //var clickedBtn = $(el).parent();
        //var openSubmenus = $('li.' + prefix + '_open').not(function () {
        //    var c = clickedBtn;
        //    var p = $(this);

        //    while (c.length > 0 && c.not(p).length > 0) {
        //        c = c.parent();
        //    };
        //    return !!c.length;
        //});
        //var openLinks = openSubmenus.children('a');

        //$this._itemClick(openLinks);
    };

    // Close menu when outside clicked
    Plugin.prototype._clickOutside = function (el) {
        var $this = this;
        var siteNav = $this.siteNav;
        var btn = $(el);
        var container;

        if ($(el).hasClass('nav-btn')) {
            $(siteNav).on('clickoutside keydownoutside', function (event) {
                var target = $(event.target);
                if (!target.is(btn)) {
                    $this.close();
                }
            });
        } else {
            $(btn.parent()).on('clickoutside keydownoutside', function (event) {
                var target = $(event.target);
                if (!target.is(btn) && btn.parent().hasClass(prefix + '_open')) {
                    $this._itemClick(btn);
                }
            })

        }
    }

    // Toggle for top-level buttons
    Plugin.prototype._menuToggle = function (el) {
        var $this = this;
        var btn = $this.btn;
        var siteNav = $this.siteNav;

        if (btn.hasClass(prefix + '_collapsed')) {
            btn.removeClass(prefix + '_collapsed');
            btn.addClass(prefix + '_open');
        } else {
            btn.removeClass(prefix + '_open');
            btn.addClass(prefix + '_collapsed');
        }
        $this._visibilityToggle(siteNav, true, btn);
    };

    // Toggle for sub-menu items
    Plugin.prototype._itemClick = function (el) {
        var $this = this;
        var settings = $this.settings;
        var data = el.data('menu');
        if (!data) {
            data = {};
            data.arrow = el.children('.arrow');
            data.ul = el.next('ul');
            data.parent = el.parent();
            el.data('menu', data);
        }
        if (data.parent.hasClass(prefix + '_collapsed')) {
            data.arrow.html(settings.openedSymbol);
            data.parent.removeClass(prefix + '_collapsed');
            data.parent.addClass(prefix + '_open');
            $this._visibilityToggle(data.ul, true, el);
        } else {
            data.arrow.html(settings.closedSymbol);
            data.parent.removeClass(prefix + '_open');
            data.parent.addClass(prefix + '_collapsed');
            $this._visibilityToggle(data.ul, true, el);
        }
    };

    //Toggle visibility and accessibility tags
    Plugin.prototype._visibilityToggle = function (el, animate, trigger, init) {
        var $this = this;
        var settings = $this.settings;
        var items = $this._getActionItems(el);
        var duration = 0;
        if (animate) {
            duration = settings.duration;
        }
        if (el.hasClass(prefix + '_hidden')) {
            el.removeClass(prefix + '_hidden');
            el.slideDown(duration, settings.easingOpen, function () {
                if (!init) {
                    settings.open(trigger);
                }
            });
            el.attr('aria-hidden', 'false');
            items.attr('tabindex', '0');
            $this._setVisAttr(el, false);
        } else {
            el.slideUp(duration, this.settings.easingClose, function () {
                el.attr('aria-hidden', 'true');
                items.attr('tabindex', '-1');
                $this._setVisAttr(el, true);

                el.addClass(prefix + '_hidden');
                if (!init) {
                    settings.close(trigger);
                }
                else if (trigger == 'init') {
                    settings.init();
                }
            });
        }
    };

    //set attributes of element and children based on visibility
    Plugin.prototype._setVisAttr = function (el, hidden) {
        var $this = this;

        //select non-hidden parents
        var nonHidden = el.children('li').children('ul').not('.' + prefix + '_hidden');

        // iterate over all items setting appropriate tags
        if (!hidden) {
            nonHidden.each(function () {
                var ul = $(this);
                ul.attr('aria-hidden', 'false');
                var items = $this._getActionItems(ul);
                items.attr('tabindex', '0');
                $this._setVisAttr(ul, hidden);
            });
        } else {
            nonHidden.each(function () {
                var ul = $(this);
                ul.attr('aria-hidden', 'true');
                var items = $this._getActionItems(ul);
                items.attr('tabindex', '-1');
                $this._setVisAttr(ul, hidden);
            });
        }
    };

    // get all 1st level items that are clickable
    Plugin.prototype._getActionItems = function (el) {
        var data = el.data("menu");
        if (!data) {
            data = {};
            var items = el.children('li');
            var anchors = items.find('a');
            data.links = anchors.add(items.find('.item'));
            el.data('menu', data);
        }
        return data.links;
    };

    Plugin.prototype._outlines = function (state) {
        if (!state) {
            $('.item, .nav-btn').css('outline', 'none');
        } else {
            $('.item, .nav-btn').css('outline', '');
        }
    };

    Plugin.prototype.toggle = function () {
        var $this = this;
        $this._menuToggle();
    };

    Plugin.prototype.open = function () {
        var $this = this;
        if ($this.btn.hasClass(prefix + '_collapsed')) {

            $this._menuToggle();
        }
    };

    Plugin.prototype.close = function () {
        var $this = this;
        if ($this.btn.hasClass(prefix + '_open') && $this._hideAtSize()) {
            $this._closeSubMenus($(this));
            $this._menuToggle();
        }
    };

    $.fn[siteMenu] = function (options) {
        var args = arguments;

        // Is the first parameter an object (options), or was omitted, instantiate a new instance
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {

                // Only allow the plugin to be instantiated once due to methods
                if (!$.data(this, 'plugin_' + siteMenu)) {

                    // if it has no instance, create a new one, pass options to our plugin constructor,
                    // and store the plugin instance in the elements jQuery data object.
                    $.data(this, 'plugin_' + siteMenu, new Plugin(this, options));
                }
            });

            // If is a string and doesn't start with an underscore or 'init' function, treat this as a call to a public method.
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

            // Cache the method call to make it possible to return a value
            var returns;

            this.each(function () {
                var instance = $.data(this, 'plugin_' + siteMenu);

                // Tests that there's already a plugin-instance and checks that the requested public method exists
                if (instance instanceof Plugin && typeof instance[options] === 'function') {

                    // Call the method of our plugin instance, and pass it the supplied arguments.
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
            });

            // If the earlier cached method gives a value back return the value, otherwise return this to preserve chainability.
            return returns !== undefined ? returns : this;
        }
    };
}(jQuery, document, window));
