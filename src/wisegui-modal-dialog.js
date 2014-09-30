var WiseGuiModalDialog = function(options, callbackOk, callbackCancel) {

	this.options = {
		title       : (options && options.title)       || 'Please Confirm',
		body        : (options && options.body)        || 'Are you sure?',
		labelCancel : (options && options.labelCancel) || 'Cancel',
		labelOk     : (options && options.labelOk)     || 'OK'
	};

	this.cancelled = true;
	this.view = $(
		'<div class="modal hide" id="myModal">' +
		'	<div class="modal-header">' +
		'		<button type="button" class="close" data-dismiss="modal">×</button>' +
		'		<h3>' + this.options.title + '</h3>' +
		'	</div>' +
		'	<div class="modal-body">' +
		'		<p>' + this.options.body + '</p>' +
		'	</div>' +
		'	<div class="modal-footer">' +
		'		<a href="#" class="btn btn-cancel" data-dismiss="modal">' + this.options.labelCancel + '</a>' +
		'		<a href="#" class="btn btn-ok btn-primary">' + this.options.labelOk + '</a>' +
		'	</div>' +
		'</div>'
	);
	
	this.view.find('.btn-ok').on('click', function(e) {
		e.preventDefault();
		this.cancelled = false;
		this.hide();
	}.bind(this));

	this.view.on('hidden', function() {
		if (this.cancelled && $.isFunction(callbackCancel)) {
			callbackCancel();
		} else if (!this.cancelled && $.isFunction(callbackOk)) {
			callbackOk();
		}
	}.bind(this));
};

WiseGuiModalDialog.prototype.show = function() {
	this.view.modal('show');
};

WiseGuiModalDialog.prototype.hide = function() {
	this.view.modal('hide');
};

WiseGuiModalDialog.prototype.wasCancelled = function() {
	return this.cancelled;
};

module.exports = WiseGuiModalDialog;