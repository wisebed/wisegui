/**
 * #################################################################
 * WiseGuiNodeStatusIcon
 * #################################################################
 */
var WiseGuiNodeStatusIcon = function(nodeUrn) {
	
	this.nodeUrn = nodeUrn;
	
	this.view = $('<img src="img/famfamfam/help.png" alt="'+nodeUrn+'" title="'+nodeUrn+'"/>');
	
	var self = this;

	$(window).bind('wisegui-devices-attached-event', function(e, devicesAttachedEvent) {
		if (devicesAttachedEvent.nodeUrns.indexOf(nodeUrn) >= 0) {
			self.view.attr('src', 'img/famfamfam/tick.png');
		}
	});

	$(window).bind('wisegui-devices-detached-event', function(e, devicesDetachedEvent) {
		if (devicesDetachedEvent.nodeUrns.indexOf(nodeUrn) >= 0) {
			self.view.attr('src', 'img/famfamfam/cross.png');
		}
	});
};

module.exports = WiseGuiNodeStatusIcon;