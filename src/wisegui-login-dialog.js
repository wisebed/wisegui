/**
 * #################################################################
 * WiseGuiLoginDialog
 * #################################################################
 */
var WiseGuiLoginDialog = function() {

	this.loginFormRows = [];
	this.loginData = { authenticationData : [] };

	this.view = $('<div id="WiseGuiLoginDialog" class="modal hide"></div>');
	$(document.body).append(this.view);

	this.okButton = null;
	this.cancelButton = null;

	this.buildView();

	var self = this;
	$(window).bind('wisegui-login-error', function(e, data) { self.onLoginError(data); });
	$(window).bind('wisegui-logged-in', function() { self.onLoginSuccess(); });
	$(window).bind('wisegui-logged-out', function() { self.onLoginSuccess(); });
};

WiseGuiLoginDialog.prototype.onLoginError = function(data) {

	var self = this;

	if (data.jqXHR.status != 403) {
		console.log(data.jqXHR);
		WiseGui.showAjaxError(data.jqXHR, data.textStatus, data.errorThrown);
		window.setTimeout(function() {self.hide();}, 1000);
	}

	$.each(this.loginFormRows, function(index, elem) {
		$(elem.inputUsername).removeClass('success');
		$(elem.inputPassword).removeClass('success');
		$(elem.inputUsername).addClass('error');
		$(elem.inputPassword).addClass('error');
		self.okButton.removeAttr("disabled");
		self.cancelButton.removeAttr("disabled");
	});
};

WiseGuiLoginDialog.prototype.onLoginSuccess = function() {

	var self = this;

	$.each(this.loginFormRows, function(index, elem) {
		$(elem.inputUsername).removeClass('error');
		$(elem.inputPassword).removeClass('error');
		$(elem.inputUsername).addClass('success');
		$(elem.inputPassword).addClass('success');
	});

	window.setTimeout(function() {self.hide();}, 1000);
};

WiseGuiLoginDialog.prototype.hide = function() {
	this.view.modal('hide');
};

WiseGuiLoginDialog.prototype.show = function() {
	this.view.modal('show');
};

WiseGuiLoginDialog.prototype.updateLoginDataFromForm = function() {

	for (var i=0; i<this.loginFormRows.length; i++) {

		this.loginData.authenticationData[i] = {
			urnPrefix : this.loginFormRows[i].inputUrnPrefix.value,
			username  : this.loginFormRows[i].inputUsername.value,
			password  : this.loginFormRows[i].inputPassword.value
		};
	}
};

WiseGuiLoginDialog.prototype.addRowToLoginForm = function(tbody, urnPrefix, username, password) {

	var that = this;
	var tr = $('<tr/>');
	var i = this.loginFormRows.length;

	var inputUrnPrefix = $('<input type="text" id="urnprefix'+i+'" name="urnprefix'+i+'" value="'+urnPrefix+'" readonly/>');
	var inputUsername = $('<input type="text" id="username'+i+'" name="username'+i+'" value="'+username+'"/>');
	var inputPassword = $('<input type="password" id="password'+i+'" name="password'+i+'" value="'+password+'"/>');

	inputUsername.keyup(function(e) {
		if ((e.keyCode || e.which) == 13) {
			that.startLogin();
		}
	});

	inputPassword.keyup(function(e) {
		if ((e.keyCode || e.which) == 13) {
			that.startLogin();
		}
	});

	this.loginFormRows[this.loginFormRows.length] = {
		"tr" : tr,
		"inputUrnPrefix" : inputUrnPrefix[0],
		"inputUsername" : inputUsername[0],
		"inputPassword" : inputPassword[0]
	};

	var tdUrnPrefix = $('<td/>');
	var tdUsername = $('<td/>');
	var tdPassword = $('<td/>');

	tdUrnPrefix.append(inputUrnPrefix);
	tdUsername.append(inputUsername);
	tdPassword.append(inputPassword);

	tr.append($('<td>'+(this.loginFormRows.length)+'</td>'));
	tr.append(tdUrnPrefix);
	tr.append(tdUsername);
	tr.append(tdPassword);

	tbody.append(tr);
};

WiseGuiLoginDialog.prototype.buildView = function() {

	var that = this;

	var dialogHeader = $('<div class="modal-header"><h3>Login</h3></div>');

	var dialogBody = $(
		'<div class="modal-body WiseGuiLoginDialog"/>' +
		'		<form id="WiseGuiLoginDialogForm">' +
		'		<table class="table" id="WiseGuiLoginDialogFormTable">' +
		'			<thead>' +
		'				<tr>' +
		'					<th>Testbed</th>' +
		'					<th>URN Prefix</th>' +
		'					<th>Username</th>' +
		'					<th>Password</th>' +
		'				</tr>' +
		'			</thead>' +
		'			<tbody>' +
		'			</tbody>' +
		'		</table>' +
		'		</form>' +
		'	</div>');

	this.okButton = $('<input class="btn btn-primary" value="OK" style="width:25px;text-align:center;">');
	this.cancelButton = $('<input class="btn" value="Cancel" style="width:45px;text-align:center;">');

	this.cancelButton.bind('click', this, function(e) {
		e.data.hide();
	});

	this.okButton.bind('click', this, function(e) {
		that.startLogin();
	});

	var dialogFooter = $('<div class="modal-footer"/>');
	dialogFooter.append(this.cancelButton, this.okButton);
	this.view.append(dialogHeader, dialogBody, dialogFooter);

	var loginFormTableBody = this.view.find('#WiseGuiLoginDialogFormTable tbody');
	var urnPrefixes = testbedDescription.urnPrefixes;

	for (var i=0; i<urnPrefixes.length; i++) {
		var user = (localStorage[urnPrefixes[i]+'_user'] !== undefined) ? localStorage[urnPrefixes[i]+'_user'] : '';
		var pass = (localStorage[urnPrefixes[i]+'_pass'] !== undefined) ? localStorage[urnPrefixes[i]+'_pass'] : '';
		this.addRowToLoginForm(loginFormTableBody, urnPrefixes[i], user, pass );
	}

	
	var helpTextLocalStorage = 'Select this check box, log in and your credentials are stored ' +
		'<strong>unencrypted</strong> in your browser (HTML5 local storage). <br/>' +
		'<br/>' +
		'Uncheck the check box and log in to delete previously stored credentials.';

	var trStoreCredentials = $('<tr/>');
	var storeCredentials_checkbox;
	
	if(localStorage[this.loginFormRows[0].inputUrnPrefix.value+'_user'] !== undefined){
		storeCredentials_checkbox = $('<input type="checkbox" style="margin:3px" checked="checked">');
	}else{
		storeCredentials_checkbox = $('<input type="checkbox" style="margin:3px" ">');
	}

	storeCredentials_checkbox.popover({
		placement : 'bottom',
		trigger   : 'manual',
		animation : true,
		content   : helpTextLocalStorage,
		title     : "Caution!"
	});
	
	storeCredentials_checkbox.mouseover(
		function() {
			storeCredentials_checkbox.popover("show");
		}
	);

	storeCredentials_checkbox.mouseout(
		function() {
			storeCredentials_checkbox.popover("hide");
		}
	);
	
	var tdStoreCredentials = $('<td colspan="4"/>');
	tdStoreCredentials.append(storeCredentials_checkbox);
	tdStoreCredentials.append(" remember");
	trStoreCredentials.append(tdStoreCredentials);
	this.storeCredentials_checkbox = storeCredentials_checkbox;

	loginFormTableBody.append(trStoreCredentials);


	loginFormTableBody.append($(
			'<tr>' + 
			'	<td style="padding-bottom: 0" colspan="4">' +
			'		No account yet? <a href="/user_registration" target="_blank">Register here!' +
			'	</td>' +
			'</tr>')
	);
};

WiseGuiLoginDialog.prototype.startLogin= function() {

	this.okButton.attr("disabled", "true");
	this.cancelButton.attr("disabled", "true");

	if (this.storeCredentials_checkbox[0].checked) {
		for (var i=0; i<this.loginFormRows.length; i++) {
			localStorage[this.loginFormRows[i].inputUrnPrefix.value+'_user'] = this.loginFormRows[i].inputUsername.value;
			localStorage[this.loginFormRows[i].inputUrnPrefix.value+'_pass'] = this.loginFormRows[i].inputPassword.value;
		}
	} else {
		for (var j=0; j<this.loginFormRows.length; j++) {
			localStorage.removeItem(this.loginFormRows[j].inputUrnPrefix.value+'_user');
			localStorage.removeItem(this.loginFormRows[j].inputUrnPrefix.value+'_pass');
		}
	}

	this.updateLoginDataFromForm();
	doLogin(this.loginData);
};

module.exports = WiseGuiLoginDialog;