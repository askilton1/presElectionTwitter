var app = angular.module('PoliTweet', ['ngRoute', 'nvd3']);

app.config(function($routeProvider) {
	$routeProvider

	.when('/', {
		templateUrl: 'js/directives/mainView.html',
		controller: 'MainController'
	}).
	otherwise('/');
});