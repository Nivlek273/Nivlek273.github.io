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

/*------ Table Fixer ----------*/

function tableFix(t) {
    var $table=$(t),
        $tbody,
        $allRows = new Array(),
        columns = 0,
        columnWidths = new Array(),
        tableCells = new Array();

    $table.children('caption').remove();
    $tbody = $table.children('tbody');

    if ($table.children('thead').length) {
        $table.children('tbody').prepend($table.children('thead').html());
        $table.children('thead').remove();
    }

    if ($table.children('tfoot').length) {
        $table.children('tbody').append($table.children('tfoot').html());
        $table.children('tfoot').remove();
    }

    $tbody.children('tr').each(function () {
        $allRows.push($(this));
        $(this).children().css('width', '');
    })

    columns = $allRows[0].children('td, th').length;

    $allRows[0].children('[colspan]').each(function () {
        columns += $(this).attr('colspan') - 1;
    })


    for (i = 0; i < $allRows.length; i++) {
        var rowCells = new Array();
        $($allRows[i].children('td, th')).each(function () {
            rowCells.push($(this));
            if ($(this).attr('colspan')) {
                var spanWidth = parseInt($(this).attr('colspan'));
                for (j = 0; j < spanWidth - 1; j++) {
                    rowCells.push(null);
                }
            }
        })
        tableCells.push(rowCells);
    }

    for (i = 0; i < columns; i++) {
        var reduceColspan = false;
        for (j = 0; j < tableCells.length; j++) {
            var $cell = $(tableCells[j][i]);
            if ($cell.length && !$cell.attr('colspan') || parseInt($cell.attr('colspan')) < 2) {
                j = tableCells.length;
            } else {
                if (j == tableCells.length - 1 && reduceColspan == false) {
                    j = -1;
                    columns--;
                    reduceColspan = true;
                } else {
                    if ($cell.length && reduceColspan) {
                        var newColspan = parseInt($cell.attr('colspan')) - 1;
                        $cell.attr('colspan', newColspan);
                        tableCells[j].splice(i + 1, 1);
                    }
                }
            }
        }
    }

    for (i = 0; i < columns; i++) {
        for (j = 0; j < tableCells.length; j++) {
            var $cell = $(tableCells[j][i]);
            if ($cell.length && !$cell.attr('colspan') || parseInt($cell.attr('colspan')) < 2) {
                var x = Math.round($cell.outerWidth());
                columnWidths.push(x);
                j = tableCells.length;
            }
        }
    }

    $allRows.forEach(function (d) {
        var $thisRow = $(d);

        if (!$thisRow.attr('height')) {
            $thisRow.attr('height', $thisRow.outerHeight());
        }

        if ($thisRow.children('[rowspan]')) {
            rowSpanFix($thisRow);
        }
    });

    $allRows.forEach(function (e) {
        rowFix(e, columnWidths);
    });

    if (!$table.attr('border') || $table.attr('border') == "0") {
        replacer($tbody, "table", null);
    } else {
        replacer($tbody, "table table-border", null)
    }

    $table.replaceWith($table.html());
}

//Adds <td>'s underneath cells with the rowspan property
function rowSpanFix(r) {
    var $thisRow = $(r);
    var multiRow = new Array();
    var maxRows = 0;
    var $nextRow = $thisRow.next('tr');

    $thisRow.children('td, th').each(function () {
        if ($(this).attr('rowspan')) {
            multiRow.push(parseInt($(this).attr('rowspan')));
            if (parseInt($(this).attr('rowspan')) > maxRows) {
                maxRows = parseInt($(this).attr('rowspan'));
            }
        } else {
            multiRow.push(parseInt('0'));
        }

    });

    for (c = 0; c < maxRows - 1; c++) {
        for (x = 0; x < multiRow.length; x++) {
            if (multiRow[x] > c + 1) {
                $($nextRow.children('td, th')[x]).before('<td></td>');
            }
        }
        $nextRow = $($nextRow).next('tr');
    }

}

//Handles replacement of a row and its cells
function rowFix(r, c) {
    var iMod = 0;
    var rowHeight = 0;
    var $thisRow = $(r);
    var columnWidths = c;
    var rowWidth = $thisRow.outerWidth();

    if ($thisRow.attr('height')) {
        rowHeight = $thisRow.attr('height');
    } else {
        rowHeight = $thisRow.outerHeight();
    }

    $thisRow.children('td, th').each(function (i) {
        var span = columnWidths[i + iMod];
        if ($(this).attr('colspan')) {
            for (j = 1; j < $(this).attr('colspan') ; j++) {
                span += columnWidths[i + iMod + j];
            }
            iMod += $(this).attr('colspan') - 1;
            $(this).css('flex-grow', $(this).attr('colspan'));
        }
        if ($(this).is(':last-child')) {
            //var totalSpan = 0;
            //for (k = i + iMod; k >= 0; k--) {
            //    totalSpan += columnWidths[k];
            //    if (totalSpan > 12) {
            //        span = span - totalSpan + 12;
            //    }
            //}
            iMod = 0;
        }
        
        var flexBasis = 12 * span / rowWidth;
        var flexGrow = 12 * span / rowWidth;
        
        $(this).css('flex-basis', flexBasis + "rem");
        $(this).css('flex-grow', flexGrow);
        
        if ($(this).is('td')) {
            replacer($(this), "td column", null);
        } else {
            replacer($(this), "th column", null);
        }
    });

    //$thisRow.children().css('min-height', parseInt(rowHeight));
    $thisRow.each(function (i) {
        replacer($(this), "tr row", null);
    })
}

//Accepts an element and classes as arguments. Replaces the element with a div along with classes and styles
function replacer(e, c, w) {
    var $el = $(e),
        styles = "",
        newClass = c,
        flexBasis = w;
        contents = $el.html();

    if ($el.attr('bgcolor')) {
        styles += "background:" + $el.attr('bgcolor') + "; ";
    } else {
        if ($el.attr('background')) {
            styles += "background-image:url('" + $el.attr('background') + "'); ";
        }
    }
    if ($el.attr('style')) {
        styles += $el.attr('style');
    }

    if (flexBasis) {
        styles += "flex-basis:" + flexBasis;
    }

    $el.replaceWith('<div class="mod-' + newClass + '" style="' + styles + '">' + contents + '</div>');
}

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