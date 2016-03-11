"use strict";

$(document).ready(function(){
    $('.dropdown').Dropdown();
});

(function() {
	var app = angular.module('ffrStore', []);
	
	app.controller('StoreController', function(){
		this.products = ffRectangles;
		
		this.priceMultipliers = new Map([["Gray",1], ["Blue",1.2], ["Orange",2], ["Green",1.5]]);
	});
	
	app.controller('TabController', function(){
		this.tab = 0;
		
		this.getTab = function() {
			return this.tab;	
		};
		
		this.isSet = function(checkTab) {
			return this.tab === checkTab;
		};
		
		this.setTab = function(setTab) {
			this.tab = setTab;
		};
		
	});
	
	
	
	var ffRectangles = [
		{
			size: 'Small',
			description: 'Our smallest rectangles are perfect for when you need a little featureless flat space.',
			width: 4,
			height: 3,
			price: 5,
			colors: [
				"Gray",
				"Blue",
				"Orange",
				"Green"
			]
		},
		{
			size: 'Medium',
			description: 'Adaptable rectangles that can be used for just about anything, as long as it requires flat rectangles.',
			width: 11,
			height: 6,
			price: 12,
			colors: [
				"Gray",
				"Blue",
				"Orange",
				"Green"
			]
		},
		{
			size: 'Large',
			description: 'Big jobs call for big rectangles, according to our marketing department. Get yours today!',
			width: 15,
			height: 10,
			price: 20,
			colors: [
				"Gray",
				"Blue",
				"Orange",
				"Green"
			]
		},
	]
})();