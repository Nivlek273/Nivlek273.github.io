$(document).ready(function () {
	$('.dropdown').Dropdown();

	$('#apply-tFix').click(function () {
		if (!$(this).hasClass('disabled')) {
			$(this).addClass('disabled');
			var counter = 3 * $('table').length;
			while ($('table:not(".no-tableFix")').length && counter > 0) {
				tableFix($($('table:not(".no-tableFix")')[0]));
				counter--;
			}

		}
	})

});