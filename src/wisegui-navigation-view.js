var WiseGuiEvents      = require('./wisegui-events.js');
var WiseGuiLoginDialog = require('./wisegui-login-dialog.js');

/**
 * #################################################################
 * WiseGuiNavigationView
 * #################################################################
 */

var WiseGuiNavigationView = function() {

	this.view                 = null;
	this.primaryMenu          = null;
	this.secondaryMenu        = null;

	this.aboutButton          = null;
	this.loginButtonLi        = null;
	this.loginButton          = null;
	this.logoutButtonLi       = null;
	this.logoutButton         = null;
	this.reservationsButtonLi = null;
	this.reservationsButton   = null;

	this.buildView();
};

WiseGuiNavigationView.prototype.buildView = function() {

	this.view = $(
			'<div class="navbar">' +
			'		<div class="navbar-inner">' +
			'			<div class="container">' +
			'				<ul class="nav"/>' +
			'				<ul class="nav secondary-nav pull-right">' +
			'					<li class="WiseGuiNavAboutButton">' +
			'						<a href="#" data-toggle="modal" data-target="#aboutModal">About</a>' +
			'					</li>' +
			'				</ul>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'	<div id="aboutModal" class="modal hide">' +
			'		<div class="modal-header">' +
			' 		<h1>About WiseGui</h1>' +
			'		</div>' +
			'		<div class="modal-body">' +
			'			This is an open-source project published under the terms of the BSD license. Sources are freely available from' +
			'			<a href="https://github.com/wisebed/wisegui" target="_blank">github.com/wisebed/wisegui</a>.' +
			' 		<br/>' +
			' 		<br/>' +
		    '         <h3>Troubleshooting</h3>' +
		    '         If you experience any issues with this software please file a bug report at ' +
		    '         <a href="https://github.com/wisebed/wisegui/issues" target="_blank">github.com/wisebed/wisegui/issues</a>.' +
		    '         Please include the versioning information below.<br/>' +
		    '         <br/>' +
		    '         <h3>Backend Version Information</h3>' +
		    '         <table class="table table-striped table-condensed">' +
		    '             <tr>' +
    		'                 <td>Application Name:</td>' +
		    '                 <td>'+testbedDescription.appName+'</td>' +
		    '             </tr>' +
		    '             <tr>' +
		    '                 <td>Application Version:</td>' +
		    '                 <td>'+testbedDescription.appVersion+'</td>' +
		    '             </tr>' +
		    '             <tr>' +
		    '                 <td>Application Build:</td>' +
		    '                 <td>'+testbedDescription.appBuild+'</td>' +
		    '             </tr>' +
		    '             <tr>' +
		    '                 <td>Application Branch:</td>' +
		    '                 <td>'+testbedDescription.appBranch+'</td>' +
		    '             </tr>' +
		    '         </table>' +
			'			&copy; <a href="http://www.itm.uni-luebeck.de/people/bimschas/" target="_blank">Daniel Bimschas</a>,' +
			'			<a href="http://www.itm.uni-luebeck.de/people/ebers/" target="_blank">Sebastian Ebers</a>,' +
			'			<a href="http://www.itm.uni-luebeck.de/people/pfisterer/" target="_blank">Dennis Pfisterer</a>,' +
			'			<a href="http://www.itm.uni-luebeck.de/people/boldt/" target="_blank">Dennis Boldt</a>,' +
			'			<a href="http://www.itm.uni-luebeck.de/people/massel/" target="_blank">Florian Massel</a>,' +
			'			Philipp Abraham<br/>' +
			'		</div>' +
			'		<div class="modal-footer">' +
			'		</div>' +
			'	</div>'
	);

	this.primaryMenu   = this.view.find('ul.nav:not(ul.secondary-nav)').first();
	this.secondaryMenu = this.view.find('ul.secondary-nav').first();

	// create all buttons and attach them
	this.primaryMenu.append('<li class="WiseGuiNavOverviewButton"><a href="#">Overview</a></li>');

	this.overviewButtonLi         = this.primaryMenu.find('li.WiseGuiNavOverviewButton').first();
	this.overviewButton           = this.overviewButtonLi.find('a').first();

	this.secondaryMenu.append(
			  '<li class="WiseGuiNavReservationsButton"><a href="#">Make Reservation</a></li>' +
			'<li class="WiseGuiNavLogoutButton"><a href="#">Logout</a></li>' +
			'<li class="WiseGuiNavLoginButton"><a href="#">Login / Register</a></li>');

	this.reservationsButtonLi = this.secondaryMenu.find('li.WiseGuiNavReservationsButton').first();
	this.reservationsButton   = this.reservationsButtonLi.find('a').first();
	this.loginButtonLi        = this.secondaryMenu.find('li.WiseGuiNavLoginButton').first();
	this.loginButton          = this.loginButtonLi.find('a').first();
	this.logoutButtonLi       = this.secondaryMenu.find('li.WiseGuiNavLogoutButton').first();
	this.logoutButton         = this.logoutButtonLi.find('a').first();

	// hide all buttons
	this.loginButtonLi.hide();
	this.logoutButtonLi.hide();
	this.reservationsButtonLi.hide();

	var self = this;

	// bind actions to buttons
	this.overviewButton.bind('click', function(e) {
		e.preventDefault();
		if (getNavigationData().experimentId) {
			navigateTo();
		}
	});

	this.reservationsButton.bind('click', function(e) {
		e.preventDefault();
		showReservationsDialog();
	});

	this.logoutButton.bind('click', function(e) {
		e.preventDefault();
		doLogout();
	});

	this.loginButton.bind('click', function(e) {
		e.preventDefault();
		new WiseGuiLoginDialog().show();
	});

	// bind to login and logout events
	$(window).bind(WiseGuiEvents.EVENT_LOGGED_IN, function() {
		self.loginButtonLi.hide();
		self.logoutButtonLi.show();
		self.reservationsButtonLi.show();
	});

	$(window).bind(WiseGuiEvents.EVENT_LOGGED_OUT, function() {
		self.loginButtonLi.show();
		self.logoutButtonLi.hide();
		self.reservationsButtonLi.hide();
	});
	
	$(window).bind(WiseGuiEvents.EVENT_NAVIGATION, function(e, navigationData) {
		if (navigationData.nav == 'experiment') {
			self.overviewButtonLi.removeClass('active');
		} else {
			self.overviewButtonLi.addClass('active');
		}
	});
};

module.exports = WiseGuiNavigationView;
