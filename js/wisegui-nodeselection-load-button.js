/**
 * #################################################################
 * WiseGuiNodeSelectionLoadButton
 * #################################################################
 */

var WiseGuiNodeSelectionLoadButton = function(setSelectionCallback) {
	var self = this;
	this.view = $('<button class="btn">Load Selection</button>');
	this.view.bind('click', this, function(e) {
		if (!self.view.attr('disabled')) {
			var selections = JSON.parse(window.localStorage.getItem("wisegui.nodeselections")) || {};
			setSelectionCallback(selections);
		}
	});
	
	this.enable = function(enable) {
		if (enable) {
			self.view.removeAttr('disabled');
		} else {
			self.view.attr('disabled', 'disabled');
		}
	};

	this.updateEnabledState = function() {
		var savedSelection = window.localStorage.getItem("wisegui.nodeselections");
		this.enable(savedSelection != null && savedSelection !== undefined);
	};

	$(window).bind('wisegui-nodeselection-storage-changed', function (e) {
		self.updateEnabledState();
	});

	this.updateEnabledState();
};