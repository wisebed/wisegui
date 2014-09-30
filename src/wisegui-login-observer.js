/**
 * #################################################################
 * WiseGuiLoginObserver
 * #################################################################
 *
 * Listens to WiseGui events 'wisegui-logged-in' and 'wisegui-logged-out'
 * and tries to renew the login before it times out. Also, it triggers the
 * initial checking if the user is currently logged in upon application
 * reload and triggers 'wisegui-logged-in' and 'wisegui-logged-out' events
 * respectively so that other components can update their state.
 */

var WiseGuiLoginObserver = function() {
	this.loginData   = undefined;
	this.schedule    = undefined;
	this.interval    = 10 * 60 * 1000;
};

WiseGuiLoginObserver.prototype.renewLogin = function() {

	console.log('WiseGuiLoginObserver trying to renew login');

	var self = this;
	wisebed.login(
			this.loginData,
			function(){
				console.log('WiseGuiLoginObserver successfully renewed login');
			},
			function(jqXHR, textStatus, errorThrown) {
				console.log('WiseGuiLoginObserver failed renewing login');
				self.stopObservation();
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
};

WiseGuiLoginObserver.prototype.startObserving = function() {

	var self = this;

	$(window).bind('wisegui-logged-in', function(e, data) {
		console.log('WiseGuiLoginObserver starting observation');
		if (data && data.loginData) {
			self.loginData = data.loginData;
			self.schedule = window.setInterval(self.renewLogin, self.interval);
		}
	});

	$(window).bind('wisegui-logged-out', function(e, data) {
		if (self.schedule !== undefined) {
			console.log('WiseGuiLoginObserver stopping observation');
			window.clearInterval(self.schedule);
			self.schedule = undefined;
		}
	});

	checkLoggedIn(function(isLoggedIn) {
		$(window).trigger(isLoggedIn ? 'wisegui-logged-in' : 'wisegui-logged-out');
	});
};

WiseGuiLoginObserver.prototype.stopObserving = function() {
	console.log('WiseGuiLoginObserver.stopObserving()');
	if (this.schedule !== undefined) {
		window.clearInterval(this.schedule);
	}
};

module.exports = WiseGuiLoginObserver;