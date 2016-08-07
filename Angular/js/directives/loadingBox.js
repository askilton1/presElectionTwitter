app.directive('loadingBox', function() {
	return {
		restrict: 'E',
		scope: { loaded: '=' },
		templateUrl: 'js/directives/loadingBox.html'
	}
});