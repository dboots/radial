(function () {
	'use strict';

	angular.module('app.directives', [])
		.directive("compareTo", function() {
			return {
				require: "ngModel",
				link: function(scope, element, attrs, ctrl) {
					ctrl.$validators.compareTo = function(val) {
						console.log(val);
						console.log(attrs.compareTo);
						return val == document.getElementsByName(scope.$eval(attrs.compareTo));
					};

					scope.$watch(attrs.compareTo, function() {
						ctrl.$validate();
					});
				}
			};
		});
}());