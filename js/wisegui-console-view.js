/**
 * #################################################################
 * WiseGuiConsoleView
 * #################################################################
 */

var WiseGuiConsoleView = function(reservation) {

	var id = reservation.experimentId.replace(/=/g, '');

	this.reservation                  = reservation;
	this.experimentId                 = reservation.experimentId;

	this.columns                      = { 'time' : true, 'urn' : true, 'message' : true };
	this.outputsNumMessages           = 100;
	this.outputsRedrawLimit           = 200;
	this.outputs                      = [];
	this.outputsFollow                = true;
	this.outputsMakePrintable         = true;
	this.outputsType                  = 'ascii';
	this.socket                       = null;
	this.view                         = null;

	this.progressBarId                = 'WiseGuiConsoleView-progress-bar-'+id;
	this.progressBar                  = null;
	this.progressBarSchedule          = undefined;
	this.statusBadgeId                = 'WiseGuiConsoleView-status-badge-'+id;
	this.statusBadgeDetachedId        = 'WiseGuiConsoleView-status-badge-detached-'+id;
	this.statusBadge                  = null;
	this.outputsNumMessagesInput      = null;
	this.outputsRedrawLimitInput      = null;
	this.outputsTable                 = null;
	this.outputsClearButton           = null;
	this.outputsFollowCheckbox        = null;
	this.outputsFilterButton          = null;
	this.outputsColumnDropdown        = null;
	this.outputsViewDropdown          = null;
	this.outputsMakePrintableCheckbox = null;

	this.buildView();
	this.connectToReservation();

	var self = this;
	this.throttledRedraw = $.throttle(self.outputsRedrawLimit, function(){ self.redrawOutput(); });
};

WiseGuiConsoleView.prototype.buildView = function() {
	this.view = $(
			  '<div class="WiseGuiConsoleViewDiv">'
			+ '	<div class="row">'
			+ '		<div class="span5">'
			+ '			<span><b>start:</b> ' + this.reservation.from.format("YYYY-MM-DD HH:mm:ss") + '</b></span>'
			+ '			<span class="pull-right"><b>end:</b> ' + this.reservation.to.format("YYYY-MM-DD HH:mm:ss") + '</span>'
			+ '			<div id="' + this.progressBarId+ '" class="progress"><div class="bar" style="width: 0%;"></div></div>'
			+ '		</div>'
			+ '		<div class="span3">'
			+ '			<span id="' + this.statusBadgeId + '" class="badge">Loading...</span>'
			+ '			<span id="' + this.statusBadgeDetachedId + '" class="badge badge-important" style="display: none;">Loading...</span>'
			+ '		</div>'
			+ '		<div class="span4">'
			+ '			<div class="btn-toolbar btn-toolbar2  pull-right">'
			+ '				<div class="btn-group">'
			+ '					<button id="pause-output" class="btn" data-toggle="button" title="Pause receiving messages"><i class="icon-pause"></i></button>'
			+ '				</div>'
			+ '				<div class="btn-group">'
			+ '					<button id="clear-output" class="btn" title="Clear output"><i class="icon-remove"></i></button>'
			+ '				</div>'
			+ '				<div class="btn-group">'			
			+ '					<button id="output-view" data-toggle="dropdown" class="btn dropdown-toggle" title="Change shown columns">'
			+ '						<i class="icon-th"></i>&nbsp;<span class="caret"</span>'
			+ '					</button>'
			+ '					<ul id="column-dropdown" class="dropdown-menu">'
			+ '						<li><strong>Show Columns:</strong></li>'
			+ '						<li>'
			+ '							<label class="radio">'
			+ '								<input type="checkbox" data-col="time" checked>'
			+ '									Timestamp'
			+ '							</label>'
	    	+ '						</li>'	
			+ '						<li>'
			+ '							<label class="radio">'
			+ '								<input type="checkbox" data-col="urn" checked>'
			+ '									Node URN'
			+ '							</label>'
	    	+ '						</li>'
			+ '						<li>'
			+ '							<label class="radio">'
			+ '								<input type="checkbox" data-col="message" checked>'
			+ '									Message'
			+ '							</label>'
			+ '						</li>'
			+ '					</ul>'
			+ '				</div>'
			+ '				<div class="btn-group">'			
			+ '					<button id="output-view" data-toggle="dropdown" class="btn dropdown-toggle" title="Change view options">'
			+ '						<i class="icon-eye-open"></i>&nbsp;<span class="caret"</span>'
			+ '					</button>'
			+ '					<ul class="dropdown-menu" id="view-dropdown">'
			+ '						<li><strong>Format ouput as:</strong></li>'
			+ '						<li>'
			+ '							<label class="radio">'
			+ '								<input type="radio" name="viewRadio" id="optionsRadios1" value="ascii" checked>'
			+ '									ASCII'
			+ '							</label>'
			+ '						</li>'	
			+ '						<li>'
			+ '							<label class="radio">'
			+ '								<input type="radio" name="viewRadio" id="optionsRadios1" value="hex">'
			+ '									Hex'
			+ '							</label>'
			+ '						</li>'
			+ '						<li>'
			+ '							<label class="radio">'
			+ '								<input type="radio" name="viewRadio" id="optionsRadios1" value="decimal">'
			+ '									Decimal'
			+ '							</label>'
			+ '						</li>'
			+ '						<li>'
			+ '							<label class="radio">'
			+ '								<input type="radio" name="viewRadio" id="optionsRadios1" value="binary">'
			+ '									Binary'
			+ '							</label>'
			+ '						</li>'
			+ '						<li>'
			+ '							<label class="checkbox" title="Show non-printable chars in ASCII mode: e.g. 0x00 gets [NUL]">'
			+ '								<input id="make-printable" checked type="checkbox">non-printables</input>'
			+ '							</label>'
			+ '						</li>'
			+ '					</ul>'
			+ '				</div>'
			+ '				<div class="btn-group">'
			+ '					<button id="filter-nodes" class="btn" title="Filter output for nodes."><i class="icon-filter"></i></button>'
			+ '				</div>'
			+ '				<div class="btn-group">'
			+ '					<button class="btn dropdown-toggle" data-toggle="dropdown" title="Show output options.">'
			+ '						<i class="icon-wrench"></i>&nbsp;<span class="caret"</span>'
			+ '					</button>'
			+ '					<ul id="options-dropdown" class="dropdown-menu">'
			+ '						<li>'
			+ '							<form class="form-inline">'
			+ '								<label class="checkbox">'
			+ '									<input id="auto-scroll" checked="checked" type="checkbox">auto scroll</input>'
			+ '								</label>'
			+ '							</form>'
			+ '						</li>'	
			+ '						<li>'
			+ '							<form class="form-inline">'
			+ '								<label title="press enter to save">'
			+ '									Show <input type="text" value="'+this.outputsNumMessages+'" id="num-outputs" style="width: 30px; height: 10px;"> messages'
			+ '								</label>'
			+ '							</form>'
			+ '						</li>'
			+ '						<li>'
			+ '							<form class="form-inline">'
			+ '								<label title="Incresing helps if your browser freezes due to too many messages. Press enter to save.">'
			+ '									Redraw at most every <input type="text" value="'+this.outputsRedrawLimit+'" id="redraw-limit" style="width: 30px; height: 10px;"> ms'
			+ '								</label>'
			+ '							</form>'
			+ '						</li>'
			+ '					</ul>'
			+ '				</div>'
			+ '			</div>'
			+ '		</div>'
			+ '	</div>'
			+ '	<div class="row">'
			+ '		<div class="span12"><div class="well WiseGuiConsoleViewOutputsWell" style="height:300px; overflow:auto;">'
			+ '			<table class="table WiseGuiConsoleViewOutputsTable">'
			+ '				<tbody></tbody>'
			+ '			</table>'
			+ '		</div></div>'
			+ '	</div>');

	var self = this;
	this.progressBar                  = this.view.find('#'+this.progressBarId).first();
	this.progressBarSchedule          = undefined;
	this.statusBadge                  = this.view.find('#'+this.statusBadgeId).first();
	this.statusBadgeDetached          = this.view.find('#'+this.statusBadgeDetachedId).first();
	this.outputsNumMessagesInput      = this.view.find('#num-outputs').first();
	this.outputsRedrawLimitInput      = this.view.find('#redraw-limit').first();
	this.outputsTable                 = this.view.find('table.WiseGuiConsoleViewOutputsTable tbody').first();
	this.outputsClearButton           = this.view.find('.btn#clear-output').first();
	this.outputsFollowCheckbox        = this.view.find('#auto-scroll').first();
	this.outputsFilterButton          = this.view.find('.btn#filter-nodes').first();
	this.outputsColumnDropdown        = this.view.find('#column-dropdown');
	this.outputsViewDropdown          = this.view.find('#view-dropdown');
	this.outputsMakePrintableCheckbox = this.view.find('#make-printable');

	WiseGui.bindToReservationState(this.view.find('button'), this.experimentId);

	var now = moment();
	var interval = undefined;
	var statusBadgeInterval = undefined;
	var status = 'pending';
	var devicesDetached = [];

	var updateStatusBadge = function() {
		
		self.statusBadge.empty();

		if (status == 'pending') {

			self.statusBadge.addClass('badge-info');
			self.statusBadge.append('Reservation starting in ' + now.from(self.reservation.from, true));

		} else if (status == 'running') {
			
			self.statusBadge.removeClass('badge-info').addClass('badge-success');
			self.statusBadge.append('Reservation running since ' + moment.duration(self.reservation.from.diff(moment())).humanize());

			if (devicesDetached.length > 0) {
				
				self.statusBadgeDetached.empty();
				self.statusBadgeDetached.append(devicesDetached.length + ' devices currently detached');
				self.statusBadgeDetached.toggle(true);

				self.statusBadgeDetached.tooltip('hide');
				self.statusBadgeDetached.data('tooltip', false);
				self.statusBadgeDetached.tooltip({title: devicesDetached.join('<br/>'), placement:'bottom' });

			} else if (self.statusBadgeDetached != null) {

				self.statusBadgeDetached.empty();
				self.statusBadgeDetached.tooltip('hide');
				self.statusBadgeDetached.data('tooltip', false);
				self.statusBadgeDetached.toggle(false);
			}

		} else if (status == 'ended') {

			self.statusBadge.removeClass('badge-info badge-success').addClass('badge-warning');
			self.statusBadge.append('Reservation ended ' + self.reservation.to.from(moment()));
		}
	}

	updateStatusBadge();
	statusBadgeInterval = window.setInterval(updateStatusBadge, 5000);
	
	$(window).bind('wisegui-reservation-started', function(e, reservation) {
		if (self.experimentId == reservation.experimentId) {
			
			// start progress bar as soon as reservation starts
			self.progressBar.toggleClass('progress-success', true);
			self.progressBar.find('div.bar').css('width', '1%');
			self.progressBarSchedule = window.setInterval(function(){
				var durationInMillis = reservation.to.unix() - reservation.from.unix();
				var millisSinceStart = moment().unix() - reservation.from.unix();
				var passedInPercent  = (millisSinceStart / durationInMillis) * 100;
				self.progressBar.find('div.bar').css('width', (passedInPercent > 1 ? passedInPercent + '%' : '1%'));
			}, 1000);

			// update status badge to show device connectivity
			status = 'running';
			updateStatusBadge();
		}
	});

	$(window).bind('wisegui-reservation-ended', function(e, reservation) {
		if (self.experimentId == reservation.experimentId) {

			// stop progress bar as soon as reservation ends
			window.clearInterval(self.progressBarSchedule);
			self.progressBar.toggleClass('progress-success', false);
			self.progressBar.toggleClass('progress-warning', true);
			self.progressBar.find('div.bar').css('width', '100%');

			// update status badge
			status = 'ended';
			updateStatusBadge();
		}
	});

	$(window).bind('wisegui-devices-attached-event', function(e, devicesAttachedEvent) {

		devicesAttachedEvent.nodeUrns.forEach(function(nodeUrn) {
			if (self.reservation.nodeUrns.indexOf(nodeUrn) > -1) {
				var index = devicesDetached.indexOf(nodeUrn);
				if (index > -1) {
					devicesDetached.splice(index, 1);
				}
			}
		});

		updateStatusBadge();
	});

	$(window).bind('wisegui-devices-detached-event', function(e, devicesDetachedEvent) {

		devicesDetachedEvent.nodeUrns.forEach(function(nodeUrn) {
			if (self.reservation.nodeUrns.indexOf(nodeUrn) > -1) {
				var index = devicesDetached.indexOf(nodeUrn);
				if (index == -1) {
					devicesDetached.push(nodeUrn);
				}
			}
		});

		updateStatusBadge();
	});

	// don't close popup when clicking on a form
	this.view.find('.dropdown-menu').click(function(e) {
		e.stopPropagation();
	});

	// watch shown-columns-checkbox changes
	this.outputsColumnDropdown.find('input[type="checkbox"]').change(function() {
		self.columns[$(this).data('col')] = $(this).is(':checked');
		self.redrawOutput();
	});
	
	this.outputsViewDropdown.find('input').change(function(){
		self.redrawOutput();
	});

	this.outputsNumMessagesInput.bind('change', self, function(e) {
		var fieldValue = parseInt(self.outputsNumMessagesInput[0].value);
		if (isNaN(fieldValue)) {
			self.outputsNumMessagesInput.addClass('error');
		} else {
			self.outputsNumMessagesInput.removeClass('error');
			self.outputsNumMessages = fieldValue;
			self.redrawOutput();
		}
	});
	
	this.outputsRedrawLimitInput.bind('change', self, function(e) {
		var fieldValue = parseInt(self.outputsRedrawLimitInput[0].value);
		if (isNaN(fieldValue)) {
			self.outputsRedrawLimitInput.addClass('error');
		} else {
			self.outputsRedrawLimitInput.removeClass('error');
			self.outputsRedrawLimit = fieldValue;
			self.throttledRedraw = $.throttle(self.outputsRedrawLimit, function(){	self.redrawOutput();});
		}
	});

	this.outputsFollowCheckbox.bind('change', self, function(e) {
		self.outputsFollow = self.outputsFollowCheckbox.first().is(':checked');
	});
	
	this.outputsMakePrintableCheckbox.bind('change', self, function(e) {
		self.outputsMakePrintable = self.outputsMakePrintableCheckbox.is(':checked');
		self.redrawOutput();
	});

	this.outputsClearButton.bind('click', self, function(e) {
		self.outputs.length = 0;
		self.redrawOutput();
	});
	
	this.outputsViewDropdown.find('input[type="radio"]').bind('change', self, function(e) {
		self.outputsType = self.outputsViewDropdown.find('input[type="radio"]:checked"').attr('value');
		self.redrawOutput();
	});

	this.outputsFilterNodeSelectionDialog = new WiseGuiNodeSelectionDialog(
			self.experimentId,
			'Select Nodes',
			'Please select the nodes you want to see output from. If no nodes are selected, every output will be shown.',
			[],
			'nodeselection.output.'
	);
	this.outputsFilterButton.click(function(e) {
		self.outputsFilterButton.attr('disabled', true);
		self.outputsFilterNodeSelectionDialog.show(
			function() {
				self.outputsFilterButton.attr('disabled', false);
				self.updateOutputsFilterNodesButton();
				self.redrawOutput();
			},
			function() {
				self.outputsFilterButton.attr('disabled', false);
				self.updateOutputsFilterNodesButton();
			}
		);
	});

	this.outputsFilterNodeSelectionDialog.onReady(function() {self.updateOutputsFilterNodesButton()});
};

WiseGuiConsoleView.prototype.redrawOutput = function() {

	// remove messages that are too much
	if (this.outputs.length > this.outputsNumMessages) {
		var elementsToRemove = this.outputs.length - this.outputsNumMessages;
		this.outputs.splice(0, elementsToRemove);
	}
	
	// 'draw' messages to table
	this.outputsTable.empty();
	var rows = null;
	for (var i=0; i<this.outputs.length; i++) {
		var row = this.generateRow(this.outputs[i]);
		rows = rows ? rows.after(row) : row;
	}

	this.outputsTable.append(rows);

	// scroll down if active
	if (this.outputsFollow) {
		var scrollArea = this.outputsTable.parent().parent();
		scrollArea.scrollTop(scrollArea[0].scrollHeight);
	}
};

WiseGuiConsoleView.prototype.generateRow = function(message) {

	var col = function(text) {
		return $('<td>').append(text);
	};
	var row = $('<tr></tr>');
	var cols = {
			'time' : message.timestamp,
			'urn' : message.sourceNodeUrn,
			'message' : this.formatBase64(message.payloadBase64)
	};

	var self = this;
	$.each(cols, function(key, val) {
		if (self.columns[key])
			row.append(col(val));
	});
	
	return row;
};

WiseGuiConsoleView.prototype.formatBase64 = function(base64) {
	var wrapEach = function(arr) {
		var ret = '';
		for (var i=0; i<arr.length; i++) {
			ret += '<span class="WiseGuiNumber">' + arr[i] + '</span>';
		}
		return ret;
	};
	var res = null;
	var msg = base64_decode(base64);
	switch (this.outputsType) {
		case 'ascii':
			if (this.outputsMakePrintable) {
				res = StringUtils.makePrintable(msg);
			} else {
				res = msg;
			}
			break;
		case 'hex':
			res = wrapEach(StringUtils.toHexArray(msg));
			break;
		case 'decimal':
			res = wrapEach(StringUtils.toDecimalArray(msg));
			break;
		case 'binary':
			res = wrapEach(StringUtils.toBinaryArray(msg));
			break;
	}
	return res;
};

WiseGuiConsoleView.prototype.onWebSocketMessageEvent = function(event) {

	var self = this;
	var message = JSON.parse(event.data);

	if (!message.type) {
		console.log('Received message with unknown content: ' + event.data);
		return;
	}

	var paused = this.view.find('#pause-output').is('.active');
	
	if (message.type == 'upstream'  && !paused) {

		// append new message if in whitelist or whitelist empty
		var outputsFilterNodes = self.getOutputsFilterNodes();
		if (outputsFilterNodes.length == 0 || outputsFilterNodes.indexOf(message.sourceNodeUrn) > -1) {
			self.outputs[self.outputs.length] = message;
			// queue throttled redraw (keeps GUI responsive)
			setTimeout(function(){ self.throttledRedraw(); }, 5);
		}
		
	} else if (message.type == 'notification') {

		var blockAlertActions = null;
		var blockAlertMessage = $(
			'<div><strong>Backend notification at ' + message.timestamp + ':</strong><br/>' + message.message + '</div>'
		);

		if (getNavigationData().experimentId != this.reservation.experimentId) {

			var goToReservationButton = $('<button class="btn btn-primary">Go to reservation</button>');
			blockAlertActions = [goToReservationButton];
			goToReservationButton.bind('click', this, function(e, data) {
				navigateTo(self.experimentId);
			});

		}

		WiseGui.showInfoBlockAlert(blockAlertMessage, blockAlertActions);

	} else if (message.type == 'devicesAttached') {
		WiseGui.showInfoBlockAlert('Devices [' + message.nodeUrns.join(', ') + '] were attached at ' + message.timestamp);
	} else if (message.type == 'devicesDetached') {
		WiseGui.showInfoBlockAlert('Devices [' + message.nodeUrns.join(', ') + '] were detached at ' + message.timestamp);
	} else if (message.type == 'reservationStarted') {
		
		var reservation = new WisebedReservation(message.reservationData);
		$(window).trigger('wisegui-reservation-started', reservation);

		if (reservation.experimentId != getNavigationData().experimentId) {
			var button = $('<input class="btn" type="button" value="Take me there">');
			button.bind('click', reservation, function(e) {
				navigateTo(e.data.experimentId);
			});
			WiseGui.showInfoBlockAlert('Reservation started at ' + message.timestamp, [button]);
		}

	} else if (message.type == 'reservationEnded') {
		$(window).trigger('wisegui-reservation-ended', new WisebedReservation(message.reservationData));
		WiseGui.showInfoBlockAlert('Reservation ended at ' + message.timestamp);
	}
};

WiseGuiConsoleView.prototype.onWebSocketOpen = function(event) {

};

WiseGuiConsoleView.prototype.onWebSocketClose = function(event) {

};

WiseGuiConsoleView.prototype.connectToReservation = function() {

	window.WebSocket = window.MozWebSocket || window.WebSocket;

	if (window.WebSocket) {

		var self = this;

		this.socket = new WebSocket(wisebedWebSocketBaseUrl + '/experiments/' + this.reservation.experimentId);

		this.socket.onmessage = function(event) {self.onWebSocketMessageEvent(event); };
		this.socket.onopen    = function(event) {self.onWebSocketOpen(event);         };
		this.socket.onclose   = function(event) {self.onWebSocketClose(event);        };

	} else {
		alert("Your browser does not support Web Sockets.");
	}
};

WiseGuiConsoleView.prototype.updateOutputsFilterNodesButton = function() {
	var filtered =  this.outputsFilterNodeSelectionDialog.areSomeSelected() &&
			       !this.outputsFilterNodeSelectionDialog.areAllSelected();
	this.outputsFilterButton.toggleClass('btn-info', filtered);
};

WiseGuiConsoleView.prototype.getOutputsFilterNodes = function() {
	return this.outputsFilterNodeSelectionDialog.getSelection();
};