/**
 * #################################################################
 * WiseGuiNotificationsViewer
 * #################################################################
 *
 * Consumes wisegui events of type 'wisegui-notification' and displays them in a
 * notification area. A 'wisegui-notification' event has to carry data of the
 * following type:
 *  { type : "alert"|"block-alert" severity : "warning"|"error"|"success"|"info"
 * message : "Oh snap! Change this and that and try again." actions : an array
 * of buttons (only for block-alerts) }
 *
 */

var WiseGuiNotificationsViewer = function() {
	var self = this;
	this.view   = null;
	this.history = null;
	this.flashTime = 3000;
	this.blinker = {
			count : 0,
			maxCount : 9,
			interval: 1000,
			timer: null,
			stop : function () {
				if (this.timer) {
					clearTimeout(this.timer);
				}
				this.count = 0;
				self.button.find('#notifications-counter').removeClass(
						'badge-info ' +
						'badge-success ' +
						'badge-warning ' +
						'badge-important '
				);
			}
	};
	this.buildView();

	$(window).bind('wisegui-notification', function(e, data) {
		self.showNotification(data);
	});
};

WiseGuiNotificationsViewer.prototype.showNotification = function(notification) {
	if (notification.type == 'alert') {
		this.showAlert(notification);
	} else if (notification.type == 'block-alert') {
		this.showBlockAlert(notification);
	}
	this.updateCounter();
};

WiseGuiNotificationsViewer.prototype.blink = function(severity) {
	// mean hack because red badges are 'important' rateher than 'error'
	severity = (severity==='error') ? 'important' : severity;
	var self = this;
	var b = this.blinker;
	// reset if already running
	if (this.blinker.timer) {
		b.stop();
	}
	this.blinker.timer = setInterval(function() {
		
		if (b.count >= b.maxCount) {
			b.stop();
		} else {
			b.count++;
			self.button.find('#notifications-counter').toggleClass('badge-'+severity);
		}
		
	}, 	this.blinker.interval);
};

WiseGuiNotificationsViewer.prototype.updateCounter = function() {
	var cnt = this.history.children().length;
	this.view.find('#notifications-counter').html(cnt);
	if (cnt===0) {
		this.history.hide();
		this.button.removeClass('open');
	}
};

WiseGuiNotificationsViewer.prototype.showAlert = function(alert) {
	var alertDiv = $(
			'<div class="alert alert-'+alert.severity+'">' +
			'<button class="close" data-dismiss="alert">&times;</button>' +
			'</div>'
	);
	alertDiv.append(alert.message);
	this.history.append(alertDiv);
	this.flash(alertDiv.clone());
};

WiseGuiNotificationsViewer.prototype.showBlockAlert = function(alert) {
	var blockAlertDiv = $(
			'<div class="alert block-message alert-' + alert.severity + '">' +
			'	<button class="close" data-dismiss="alert">x</button>' +
			'	<div class="alert-actions">' +
			'	</div>' +
			'</div>'
	);
	if (alert.message instanceof Array) {
		for (var i=0; i<alert.message.length; i++) {
			blockAlertDiv.prepend(alert.message[i]);
		}
	} else {
		blockAlertDiv.prepend(alert.message);
	}
	var actionsDiv = blockAlertDiv.find('.alert-actions');
	if (alert.actions) {
		for (var j=0; j<alert.actions.length; j++) {
			actionsDiv.append(alert.actions[j]);
			actionsDiv.append(' ');
		}
	}

	var flashMessages = [];
	if (alert.message instanceof Array) {
		alert.message.forEach(function(message) {
			flashMessages.push(typeof message == 'string' ? message : "New alert. Please click there &#8594;");
		});
	} else {
		flashMessages.push(typeof alert.message == 'string' ? alert.message : "New alert. Please click there &#8594;");
	}
	flashMessages.forEach(function(message) {
		this.flash($('<div class="alert alert-'+alert.severity+'">' + message + '</div>'));
	}, this);
	this.blink(alert.severity);
	this.history.append(blockAlertDiv);
};

WiseGuiNotificationsViewer.prototype.flash = function(div) {
	var self = this;
	div.find('button').remove();
	this.flashArea.html('');
	this.flashArea.append(div);
	setTimeout(function(){self.flashArea.children().fadeOut();},this.flashTime);
};

WiseGuiNotificationsViewer.prototype.buildView = function() {
	
	this.view = $(
			'<div class="WiseGuiNotificationsContainer">' +
			'	<div id="WiseGuiNotificationsHistory"/>' +
			'	<div id="WiseGuiNotificationsRoster">' +
			' 	<div id="notification-flash" class="span11">&nbsp;</div>' +
			'		<div class="span1" id="WiseGuiNotificationsButton">' +
			'			<div class="btn-group">' +
			'				<a class="btn btn-mini" id="roster-btn" href="#" title="show old notifications"><span class="badge" id="notifications-counter">0</span></a>' +
			'				<a class="btn btn-mini dropdown-toggle" data-toggle="dropdown" href="#" title="remove all notifications"><span>&#9650;</span></a>' +
			'				<ul class="dropdown-menu" id="roster-dropdown">' +
			'					<li><a id="roster-clear" href="#">Clear</a></li>' +
			'				</ul>' +
			'			</div>' +
			'		</div>' +
			'	</div>' +
			'</div>'
	);

	this.history = this.view.find('#WiseGuiNotificationsHistory');
	this.history.hide();

	this.flashArea = this.view.find('#notification-flash').first();
	this.button = this.view.find('#WiseGuiNotificationsButton');
	
	var self = this;
	this.history.on("closed", ".alert", function(e){
		setTimeout(function(){self.updateCounter();}, 100);
	});
	this.button.find('#roster-clear').click(function(e) {
		e.preventDefault();
		self.history.html('');
		self.updateCounter();
	});
	this.button.find('#roster-btn').click(function(e) {
		e.preventDefault();
		
		// if there are no old notifications do nothing
		if (self.history.children().length === 0) {
			return;
		}

	    if ( self.history.is(':visible') ) {
	    	self.history.slideUp();
	    	self.button.removeClass('open');
	    } 
	    else {
	    	//FIXME dirty size hack for invisible element to make animation smooth
	    	//notifications.css({'position':'absolute','visibility':'hidden','display':'block'});
	    	//var height = notifications.height();
	    	//notifications.css({'position':'static','visibility':'visible','display':'none'});
	    	//notifications.css('height',height+'px');
	    	self.history.slideDown('fast',function() {
	    		self.history.css('height','auto');
	    		self.button.addClass('open');
	    	});
	    }
	});
};