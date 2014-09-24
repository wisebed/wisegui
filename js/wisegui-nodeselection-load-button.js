/**
 * #################################################################
 * WiseGuiNodeSelectionLoadButton
 * #################################################################
 */

// extend jQuery with the 'exists' function to check if selector returned empty result
// and only do so if not done yet...
if (!($.fn.exists)) {
	$.fn.exists = function () {
		return this.length !== 0;
	}
}

var WiseGuiNodeSelectionLoadButton = function(selectionCallback) {
	
	var self = this;
	
	this.view = $('<button class="btn">Load Selection</button>');
	this.view.bind('click', this, function(e) {
		if (!self.view.attr('disabled')) {
			var nodeSelections = JSON.parse(window.localStorage.getItem("wisegui.nodeselections")) || {};
			var callback = function(selected) {
				selectionCallback(nodeSelections[selected]);
			};
			var dialogOptions = {
				'title' : 'Pick a Node Selection',
				'selectButtonLabel' : 'Load'
			};
			new WiseGuiOptionSelectionDialog(nodeSelections, callback, undefined, dialogOptions).show();
		}
	});
	
	this.enable = function(enable) {
		if (enable) {
			self.view.removeAttr('disabled');
		} else {
			self.view.attr('disabled', 'disabled');
			self.view.tooltip({
				title : 'No saved node selections available yet! (Saved selections are not '
					+ 'synchronized with your account on the server but are stored in your Browsers local storage)',
				delay : 100
			});
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