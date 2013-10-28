/**
 * #################################################################
 * WiseGuiSendView
 * #################################################################
 */

var WiseGuiSendView = function(reservation) {

	this.reservation         = reservation;
	this.experimentId        = reservation.experimentId;

	this.nodeSelectionButton = null;
	this.modeSelect          = null;
	this.messageInput        = null;
	this.sendButton          = null;
	this.lineFeedCheckbox    = null;

	this.buildView();
};

WiseGuiSendView.prototype.buildView = function() {

	this.view = $(
			  '<div class="row">'
			+ '	<button class="btn WiseGuiSendViewSelectNodesButton span2">Select Nodes</button>'
			+ '	<div class="span2">'
			+ '		<select class="WiseGuiSendViewModeSelect span2">'
			+ '			<option value="binary">Binary</option>'
			+ '			<option value="ascii">ASCII</option>'
			+ '		</select>'
			+ '	</div>'
			+ '	<div class="span4">'
			+ '		<input type="text" class="WiseGuiSendViewMessageInput span4"/>'
			+ '	</div>'
			+ '	<div class="span2">'
			+ '		<button class="btn btn-primary WiseGuiSendViewSendButton span2">Send message</button><br/>'
			+ '	</div>'
			+ '</div>'
			+ '<div class="row">'
			+ '	<div class="offset4 span8">'
			+ '		<div class="inputs-list">'
			+ '			<label class="checkbox inline"><input class="WiseGuiSendViewLineFeedCheckbox" type="checkbox"> always append line feed</label>'
			+ '		</div>'
			+ '	</div>'
			+ '</div>');

	this.nodeSelectionButton = this.view.find('button.WiseGuiSendViewSelectNodesButton').first();
	this.modeSelect          = this.view.find('select.WiseGuiSendViewModeSelect').first();
	this.messageInput        = this.view.find('input.WiseGuiSendViewMessageInput').first();
	this.sendButton          = this.view.find('button.WiseGuiSendViewSendButton').first();
	this.lineFeedCheckbox    = this.view.find('input.WiseGuiSendViewLineFeedCheckbox').first()[0];

	var self = this;

	this.nodeSelectionDialog = new WiseGuiNodeSelectionDialog(
			this.experimentId,
			'Select Node URNs',
			'Please select the nodes to which you want to send a message.',
			null,
			'nodeselection.send.'
	);

	this.nodeSelectionButton.bind('click', self, function(e) {
		self.nodeSelectionDialog.show(function(){
			self.updateControls();
		});
	});

	this.sendButton.bind('click', self, function(e) { self.onMessageButtonClicked(); });

	this.messageInput.bind('keyup', self, function(e) {
		self.updateControls();
		// send on 'enter' (keycode 13)
		if (e.which == 13 && self.isMessageInputValid() && self.isMessageNodesSelectionValid()) {
			self.onMessageButtonClicked();
		}
	});
	
	this.messageInput.popover({
		placement : 'bottom',
		trigger   : 'manual',
		animation   : true,
		content   : 'The message must consist of comma-separated bytes in base_10 (no prefix), base_2 (prefix 0b) or base_16 (prefix 0x).<br/>'
				+ '<br/>'
				+ 'Example: <code>0x0A,0x1B,0b11001001,40,80</code>',
		title     : "Message Format"
	});
	
	this.messageInput.focusin(function() {
		if (self.getMode() == 'binary') {
			self.messageInput.popover("show");
		}
	});
	
	this.messageInput.focusout(function() {
		if (self.getMode() == 'binary') {
			self.messageInput.popover("hide");
		}
	});

	this.updateControls();
};

WiseGuiSendView.prototype.send = function(targetNodeUrns, payloadBase64) {

	for (var i=0; i<targetNodeUrns.length; i++) {
		var message = {
			targetNodeUrn : targetNodeUrns[i],
			payloadBase64 : payloadBase64
		};
		this.socket.send(JSON.stringify(message));
	}
};

WiseGuiSendView.prototype.isMessageInputValid = function() {
	return this.parseMessagePayloadBase64() != null;
};

WiseGuiSendView.prototype.isMessageNodesSelectionValid = function() {
	return this.getSelectedNodeUrns().length > 0;
};

WiseGuiSendView.prototype.getSelectedNodeUrns = function() {
	return this.nodeSelectionDialog.getSelection();
};

WiseGuiSendView.prototype.updateControls = function() {

	var nodes = this.nodeSelectionDialog.getSelection();
	this.nodeSelectionButton.html(nodes.length == 1 ? "1 node selected" : nodes.length + ' nodes selected');

	if (this.isMessageInputValid()) {
		this.messageInput.removeClass('error');
	} else {
		this.messageInput.addClass('error');
	}

	this.sendButton.attr('disabled', !(this.isMessageInputValid() && this.isMessageNodesSelectionValid()));
};

WiseGuiSendView.prototype.onMessageButtonClicked = function() {

	var self = this;
	this.sendButton.attr('disabled', true);
	var nodeUrns = this.getSelectedNodeUrns();

	wisebed.experiments.send(
			this.experimentId,
			nodeUrns,
			this.parseMessagePayloadBase64(),
			function(result) {
				var progressView = new WiseGuiOperationProgressView(
						nodeUrns, 1,
						"The message was sent successfully to all nodes."
				);
				progressView.update(result);
				self.sendButton.attr('disabled', false);
			},
			function(jqXHR, textStatus, errorThrown) {
				self.sendButton.attr('disabled', false);
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
};

WiseGuiSendView.prototype.parseMessagePayloadBase64 = function() {

	var messageBytes;
	var messageString = this.messageInput[0].value;

	if (messageString === undefined || '') {
		return null;
	}
	
	if (this.lineFeedCheckbox.checked) {
		messageString += '\n';
	}

	messageBytes = this.getMode() == 'binary' ?
			this.parseByteArrayFromString(messageString) :
			this.parseByteArrayFromAsciiString(messageString);

	return messageBytes == null ? null : base64_encode(messageBytes);
};

WiseGuiSendView.prototype.getMode = function() {
	return this.modeSelect[0].options[this.modeSelect[0].selectedIndex].value;
};

WiseGuiSendView.prototype.parseByteArrayFromAsciiString = function(messageString) {

	if (messageString == null || messageString == '') {
		return null;
	}

	var messageBytes = new Array();
	for(var i = 0; i < messageString.length; i++) {
		messageBytes[i] = messageString.charCodeAt(i);
	}

	return messageBytes;
};

WiseGuiSendView.prototype.parseByteArrayFromString = function(messageString) {

	var splitMessage = messageString.split(",");
	var messageBytes = [];

	for (var i=0; i < splitMessage.length; i++) {

		splitMessage[i] = splitMessage[i].replace(/ /g, '');

		var radix = 10;

		if (splitMessage[i].indexOf("0x") == 0) {

			radix = 16;
			splitMessage[i] = splitMessage[i].replace("0x","");

		} else if (splitMessage[i].indexOf("0b") == 0) {

			radix = 2;
			splitMessage[i] = splitMessage[i].replace("0b","");

			if (/^(0|1)*$/.exec(splitMessage[i]) == null) {
				return null;
			}

		}

		messageBytes[i] = parseInt(splitMessage[i], radix);

		if (isNaN(messageBytes[i])) {
			return null;
		}
	}

	if (messageBytes.length == 0) {
		return null;
	}

	return messageBytes;
};