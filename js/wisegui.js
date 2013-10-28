var WiseGui = new function() {

	this.showAlert = function(message, severity) {
		$(window).trigger('wisegui-notification',
				{
					type     : 'alert',
					severity : severity,
					message  : message
				}
		);
	};

	this.showWarningAlert = function(message) { this.showAlert(message, 'warning'); };
	this.showErrorAlert = function(message) { this.showAlert(message, 'error'); };
	this.showSuccessAlert = function(message) { this.showAlert(message, 'success'); };
	this.showInfoAlert = function(message) { this.showAlert(message, 'info'); };

	this.showBlockAlert = function(message, actions, severity) {
		$(window).trigger('wisegui-notification',
				{
					type     : 'block-alert',
					severity : severity,
					message  : message,
					actions  : actions
				}
		);
	};
	this.showWarningBlockAlert = function(message, actions) { this.showBlockAlert(message, actions, 'warning'); };
	this.showErrorBlockAlert = function(message, actions) { this.showBlockAlert(message, actions, 'error'); };
	this.showSuccessBlockAlert = function(message, actions) { this.showBlockAlert(message, actions, 'success'); };
	this.showInfoBlockAlert = function(message, actions) { this.showBlockAlert(message, actions, 'info'); };

	var self = this;
	this.showAjaxError = function(jqXHR, textStatus, errorThrown) {
		console.log(jqXHR);
		var message = $('<h2>Error while loading data!</h2>'
				+ '<h3>jqXHR</h3>'
				+ (jqXHR.readyState ? ('readyState = ' + jqXHR.readyState + '<br/>') : '')
				+ (jqXHR.status ? ('status = ' + jqXHR.status + '<br/>') : '')
				+ (jqXHR.responseText ? ('responseText = <pre>' + jqXHR.responseText + '</pre><br/>') : '')
				+ '<h3>textStatus</h3>'
				+ '<pre>'+textStatus+'</pre>'
				+ '<h3>errorThrown</h3>'
				+ '<pre>'+errorThrown+'</pre>');
		self.showErrorBlockAlert(message);
	};
};

var WiseGuiNavigationViewer = function() {

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

WiseGuiNavigationViewer.prototype.buildView = function() {

	this.view = $('<div class="navbar">'
			+ '		<div class="navbar-inner">'
			+ '			<div class="container">'
			+ '				<ul class="nav"/>'
			+ '				<ul class="nav secondary-nav pull-right">'
			+ '					<li class="WiseGuiNavAboutButton">'
			+ '						<a href="#" data-toggle="modal" data-target="#aboutModal">About</a>'
			+ '				</li>'
			+ '				</ul>'
			+ '			</div>'
			+ '		</div>'
			+ '	</div>'
			+ '	<div id="aboutModal" class="modal hide">'
			+ '		<div class="modal-header">'
			+ ' 		<h1>About WiseGui</h1>'
			+ '		</div>'
			+ '		<div class="modal-body">'
			+ '			This is an open-source project published under the terms of the BSD license.<br/>'
			+ ' 		The sources are freely available from'
			+ '			<a href="https://github.com/wisebed/wisegui" target="_blank">github.com/wisebed/wisegui</a>.'
			+ ' 		<br/>'
			+ ' 		<br/>'
			+ '			&copy; <a href="http://www.itm.uni-luebeck.de/people/bimschas/" target="_blank">Daniel Bimschas</a>,'
			+ '			<a href="http://www.itm.uni-luebeck.de/people/ebers/" target="_blank">Sebastian Ebers</a>,'
			+ '			<a href="http://www.itm.uni-luebeck.de/people/pfisterer/" target="_blank">Dennis Pfisterer</a>,'
			+ '			<a href="http://www.itm.uni-luebeck.de/people/boldt/" target="_blank">Dennis Boldt</a>,'
			+ '			<a href="http://www.itm.uni-luebeck.de/people/massel/" target="_blank">Florian Massel</a>,'
			+ '			Philipp Abraham<br/>'
			+ '		</div>'
			+ '		<div class="modal-footer">'
			+ '		</div>'
			+ '	</div>'
	);

	this.primaryMenu   = this.view.find('ul.nav:not(ul.secondary-nav)').first();
	this.secondaryMenu = this.view.find('ul.secondary-nav').first();

	// create all buttons and attach them
	this.primaryMenu.append('<li class="WiseGuiNavOverviewButton"><a href="#">Overview</a></li>');

	this.overviewButtonLi         = this.primaryMenu.find('li.WiseGuiNavOverviewButton').first();
	this.overviewButton           = this.overviewButtonLi.find('a').first();

	this.secondaryMenu.append('<li class="WiseGuiNavReservationsButton"><a href="#">Make Reservation</a></li>'
			+ '<li class="WiseGuiNavLogoutButton"><a href="#">Logout</a></li>'
			+ '<li class="WiseGuiNavLoginButton"><a href="#">Login</a></li>');

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

	// bind actions to buttons
	var self = this;

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
	var self = this;
	$(window).bind('wisegui-logged-in',  function() { self.onLoggedInEvent();  });
	$(window).bind('wisegui-logged-out', function() { self.onLoggedOutEvent(); });
	$(window).bind('wisegui-navigation-event', function(e, navigationData) {
		if (navigationData.nav == 'experiment') {
			self.overviewButtonLi.removeClass('active');
		} else {
			self.overviewButtonLi.addClass('active');
		}
	});
};

WiseGuiNavigationViewer.prototype.onLoggedInEvent = function() {
	this.loginButtonLi.hide();
	this.logoutButtonLi.show();
	this.reservationsButtonLi.show();
};

WiseGuiNavigationViewer.prototype.onLoggedOutEvent = function() {
	this.loginButtonLi.show();
	this.logoutButtonLi.hide();
	this.reservationsButtonLi.hide();
};

/**
 * #################################################################
 * WiseGuiLoginObserver
 * #################################################################
 *
 * Listens to WiseGui events 'wisegui-logged-in' and 'wisegui-logged-out'
 */
var WiseGuiLoginObserver = function() {
	this.isObserving = false;
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

	this.isObserving = true;
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
			this.schedule = undefined;
		}
	});

	checkLoggedIn(function(isLoggedIn) {
		$(window).trigger(isLoggedIn ? 'wisegui-logged-in' : 'wisegui-logged-out');
	});
};

WiseGuiLoginObserver.prototype.stopObserving = function() {
	console.log('WiseGuiLoginObserver.stopObserving()');
	this.isObserving = false;
	if (this.schedule !== undefined) {
		window.clearInterval(this.schedule);
	}
};


/**
 * #################################################################
 * WiseGuiLoadConfigurationDialog
 * #################################################################
 */

var WiseGuiLoadConfigurationDialog = function(onSuccess, onError) {
	this.onSuccess = onSuccess;
	this.onError = onError;
	this.table = null;
	this.view = $('<div id="WiseGuiLoadDialog" class="modal hide"></div>');
	this.buildView();
};

WiseGuiLoadConfigurationDialog.prototype.hide = function() {
	this.view.modal('hide');
	this.view.remove();
};

WiseGuiLoadConfigurationDialog.prototype.show = function() {
	$(document.body).append(this.view);
	this.view.modal('show');
};

WiseGuiLoadConfigurationDialog.prototype.buildView = function() {

	var self = this;

	function handleError(errorMessage, input) {
		input.addClass('error');
		alert("Error: " + (errorMessage.length > 500 ? (errorMessage.substr(0, 500) + " [...]") : errorMessage));
		okButton.removeAttr('disabled');
		cancelButton.removeAttr('disabled');
	}

	function loadFromURL() {
		wisebed.experiments.getConfiguration(
				$.trim(input_url.val()),
				function(data, textStatus, jqXHR) {
					self.onSuccess(data, textStatus, jqXHR);
				},
				function(jqXHR, textStatus, errorThrown) {
					handleError(jqXHR.responseText, input_url);
				}
		);
	}

	function loadFromFile() {

		var files = document.getElementById('input_file').files;
		var f = files[0];

		if(f != "") {
			var fileReader = new FileReader();
			fileReader.onloadend = function(progressEvent) {
				try {
					self.onSuccess(JSON.parse(fileReader.result));
				} catch(e) {
					handleError(e, input_file);
				}
			};
			fileReader.readAsText(f);
		} else {
			handleError("No file chosen", input_file);
		}
	}

	/*
	 * Dialog Header
	 */
	var dialogHeader = $('<div class="modal-header"><h3>Load a configuration</h3></div>');

	/*
	 * Dialog Body
	 */
	var dialogBody = $('<div class="modal-body"/>');

	var url = "";

	var form = $('<form class="form-horizontal"/>');

	var control_group_url = $('<div class="control-group"/>');
	var label_url = $('<label for="type_url" class="control-label">URL:</label>');
	var controls_url = $('<div class="controls"/>');
	var input_checkbox_url  = $('<input type="radio" name="type" id="type_url" value="url" checked>');
	var input_url = $('<input type="text" value="' + url + '" id="input_url" />');

	var control_group_file = $('<div class="control-group"/>');
	var label_file = $('<label for="type_file" class="control-label">File:</label>');
	var controls_file = $('<div class="controls"/>');
	var input_checkbox_file = $('<input type="radio" name="type" id="type_file" value="file">');
	var input_file = $('<input type="file" id="input_file"/>');

	input_url.focusin(
		function() {
			input_checkbox_file.attr('checked', false);
			input_checkbox_url.attr('checked', true);
		}
	);

	input_file.change(
		function() {
			input_checkbox_url.attr('checked', false);
			input_checkbox_file.attr('checked', true);
		}
	);

	controls_url.append(input_checkbox_url, input_url);
	control_group_url.append(label_url, controls_url);
	controls_file.append(input_checkbox_file, input_file);
	control_group_file.append(label_file, controls_file);
	form.append(control_group_url, control_group_file);
	dialogBody.append(form);

	/*
	 * Dialog Footer
	 */
	var dialogFooter = $('<div class="modal-footer"/>');

	var okButton = $('<input class="btn btn-primary" value="OK" style="width:35px;text-align:center;"/>');
	var cancelButton = $('<input class="btn" value="Cancel" style="width:45px;text-align:center;"/>');

	okButton.bind('click', this, function(e) {

		okButton.attr("disabled", "true");
		cancelButton.attr("disabled", "true");

		// Check, which radio button is used
		var val = dialogBody.find("input:checked").val();
		if(val == "url") {
			loadFromURL.bind(self)();
		} else if (val == "file") {
			loadFromFile.bind(self)();
		}
	});

	cancelButton.bind('click', this, function(e) {
		self.onSuccess(null);
	});

	dialogFooter.append(okButton, cancelButton);

	/**
	 * Build view
	 */
	this.view.append(dialogHeader, dialogBody, dialogFooter);
};

/**
 * #################################################################
 * WiseGuiReservationDialog
 * #################################################################
 */

var WiseGuiReservationDialog = function() {
	this.table = null;
	this.view = $('<div id="WiseGuiReservationDialog" class="modal hide reservation"></div>');
	$(document.body).append(this.view);
	this.buildView();
	this.show();
};

WiseGuiReservationDialog.prototype.hide = function() {
	this.view.modal('hide');
};

WiseGuiReservationDialog.prototype.show = function() {
	this.view.modal('show');
};

WiseGuiReservationDialog.prototype.buildView = function() {

	Array.prototype.diff = function(a) {
	    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
	};

	var that = this;

	var dialogHeader = $('<div class="modal-header"><h3>Make a reservation</h3></div>');

	var now = new Date();
	now.setSeconds(0);

	var format = function(val) {
		// Prepend a zero
		if(val >=0 && val <= 9) {
			return "0" + val;
		} else {
			return val;
		}
	};

	var yyyy = now.getFullYear();
	var mm = (now.getMonth());
	var dd = now.getDate();
	var ii = now.getMinutes();
	var hh = now.getHours();

	// Hint: it works even over years
	var in_one_hour = new Date(yyyy,mm,dd,hh+1,ii,0);

	var date_start = format(dd) + "." + format(mm+1) + "." + yyyy;
	var time_start = format(hh) + ":" + format(ii);

	var date_end = format(in_one_hour.getDate()) + "." + format(in_one_hour.getMonth() +1) + "." + in_one_hour.getFullYear();
	var time_end = format(in_one_hour.getHours()) + ":" + format(in_one_hour.getMinutes());

	
	// Create the inputs
	var input_date_start = $('<input type="text" value="' + date_start + '" id="input_date_start" style="width:75px"/>');
	var input_time_start = $('<input type="text" value="' + time_start + '" id="input_time_start" style="width:40px"/>');
	var input_date_end =   $('<input type="text" value="' + date_end + '" id="input_date_end" style="width:75px"/>');
	var input_time_end =   $('<input type="text" value="' + time_end + '" id="input_time_end" style="width:40px"/>');
	var input_desciption = $('<input type="text" id="description" style="width:280px"/>');

	var p_nodes = $("<p></p>");

	var tabs = $(
			  '<ul class="nav nav-tabs">'
			+ '	<li class="active"><a href="#WiseGuiTestbedMakeReservationList" data-toggle="tab">List</a></li>'
			+ '	<li><a href="#WiseGuiTestbedMakeReservationMap" data-toggle="tab">Map</a></li>'
			+ '</ul>'
			+ '<div class="tab-content">'
			+ '	<div class="tab-pane active" id="WiseGuiTestbedMakeReservationList"></div>'
			+ '	<div class="tab-pane" id="WiseGuiTestbedMakeReservationMap"></div>'
			+ '</div>');	
	
	tabs.find('#WiseGuiTestbedMakeReservationList').append(p_nodes);

	tabs.find('a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
	});

	var showTable = function (wiseML) {
		that.table = new WiseGuiNodeTable(wiseML, p_nodes, true, true);
	};
	
	var createMap = function() {
		wisebed.getWiseMLAsJSON(null, showMap,
				function(jqXHR, textStatus, errorThrown) {
					console.log('TODO handle error in WiseGuiReservationDialog');
					WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
				}
		);
	};

	wisebed.getWiseMLAsJSON(null, showTable,
			function(jqXHR, textStatus, errorThrown) {
				console.log('TODO handle error in WiseGuiReservationDialog');
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}, createMap
	);

	 //Show specialized google map for reservation 
	var showMap = function(wiseML){
		
		that.mapsView = new WiseGuiGoogleMapsView(wiseML, tabs.find('#WiseGuiTestbedMakeReservationMap'));
		var mapsView = that.mapsView;

		if (mapsView.map != null) {

			mapsView.map.enableKeyDragZoom();
			mapsView.map.selectedURNs = [];
			
			var ICON_SELECTED   = 'img/maps/yellow-dot.png';
			var ICON_DESELECTED = 'img/maps/red-dot.png';
			
			$.each(mapsView.markersArray, function (index, marker) {

				mapsView.mapSpiderfier.clearListeners('click');
				mapsView.mapSpiderfier.addListener('click', function(marker, event) {

					if (marker.getIcon() == ICON_SELECTED){
						mapsView.map.selectURNs([marker.urn], true);
					} else {
						mapsView.map.selectURNs([marker.urn], false);
					}

					var selectedFun = function(data) {
						var nodeids = mapsView.map.selectedURNs;
						for(var i = 0; i < nodeids.length; i++) {
							if(data.id == nodeids[i]) return true;
						}
						return false;
					};

					that.table.applySelected(selectedFun);
				});
	        });
			
			mapsView.map.selectURNs = function(urns, deselect){
				
				//loop over markers and set new image
				$.each(mapsView.markersArray, function (index, marker) {
					if (urns.indexOf(marker.urn) > -1) {
						marker.setIcon(deselect ? ICON_DESELECTED : ICON_SELECTED);
					}
	            });
				
				//loop over selected urns and insert them to model if necessary
				$.each(urns, function(index, urn) {
					var index = mapsView.map.selectedURNs.indexOf(urn);
					if(index == -1) {
						if (!deselect) {
							mapsView.map.selectedURNs.push(urn);
						} else {
							mapsView.map.selectedURNs.splice(index,1);
						}
					} else {
						if (deselect) {
							mapsView.map.selectedURNs.splice(index,1);
						}
					}	
				});
			};

			//Filter out all markers but the ones with the urns given
			mapsView.map.filter = function(urns){
				//loop over markers and set new image
				var markersArray = mapsView.markersArray;
				$.each(markersArray, function (index, marker) {
					if(urns.indexOf(marker.urn)==-1){
			            marker.setMap(null);
					}else{
						marker.setMap(mapsView.map);
					}
			    });
			};
			
			that.table.table.addSelectionListener(mapsView.map.selectURNs);
			that.table.table.addFilterListener(mapsView.map.filter);
			
			var dz = mapsView.map.getDragZoomObject();
			
			google.maps.event.addListener(dz, 'dragend', function(bounds) {       
	            var selectedURNs = [];
	            var deselectedURNs = [];
	            
	            // get nodes that have been (de-)selected
	            $.each(mapsView.markersArray, function (index, marker) {
	                if (bounds.contains(marker.getPosition()) && marker.getMap() != null) {
	                    if(marker.getIcon().url == 'img/node.png'){
	                    selectedURNs.push(marker.urn);
	                    }else{
	                    	deselectedURNs.push(marker.urn);
	                    }
	                }
	            });
	            
	            // update the map
	            mapsView.map.selectURNs(selectedURNs);
	            mapsView.map.selectURNs(deselectedURNs, true);
	            
	            
	            //remove all deselected nodes
	            mapsView.map.selectedURNs = mapsView.map.selectedURNs.diff(deselectedURNs);
	            //update selection in table
	            var selectedFun =function(data) {
					var nodeids = mapsView.map.selectedURNs;
					for(var i = 0; i < nodeids.length; i++) {
						if(data.id == nodeids[i]) return true;
					}
					return false;
				};
	            
	           that.table.applySelected(selectedFun);
	    	});
			
			tabs.find('li a[href=#WiseGuiTestbedMakeReservationMap]').on('shown', function(e) {
				google.maps.event.trigger(that.mapsView.map, 'resize');
				that.mapsView.setBounds();
			});
		}
	};

	tabs.find('#WiseGuiTestbedMakeReservationMap').append("<h4>Click on single nodes or Shift+Click for bounding box</h4>");

	// Add the picker
    input_date_start.datepicker({dateFormat: 'dd.mm.yy'});
    input_date_end.datepicker({dateFormat: 'dd.mm.yy'});
    input_time_start.timePicker({step: 5});
    input_time_end.timePicker({step: 5});

    var h4_nodes = $("<h4>Select the nodes to reserve</h4>");

    var error = $('<div class="alert alert-error"></div>');
    var error_close = $('<button type="button" class="close" data-dismiss="alert">×</button>');
    error_close.click(function() {
		error.hide();
	});
    var error_msg = $('<p></p>');
    error.append(error_close, $('<p><strong>Error:</strong></p>'), error_msg);
    error.hide();

    var onError = function (msg) {
		okButton.removeAttr("disabled");
		cancelButton.removeAttr("disabled");

    	error_msg.empty();
    	error_msg.append(msg);
    	error.show();
    };

    var span_start = $('<span>Start: </span>');
    var span_end = $('<span style="margin-left:10px;">End: </span>');
    var span_description = $('<span style="margin-left:10px;">Description: </span>');

	var dialogBody = $('<div class="modal-body reservation-body"/></div>');
	dialogBody.append(error, span_start, input_date_start, input_time_start);
	dialogBody.append(span_end, input_date_end, input_time_end);
	dialogBody.append(span_description, input_desciption);
	
	dialogBody.append(h4_nodes);
	dialogBody.append(tabs);

	
	var okButton = $('<input class="btn btn-primary" value="Reserve" style="width:50px;text-align:center;">');
	var cancelButton = $('<input class="btn" value="Cancel" style="width:45px;text-align:center;">');

	okButton.bind('click', this, function(e) {

		okButton.attr("disabled", "true");
		cancelButton.attr("disabled", "true");

		input_date_start.removeClass("error");
		input_date_end.removeClass("error");
		input_time_start.removeClass("error");
		input_time_end.removeClass("error");

		var dateStart = explode(".", input_date_start.val());
		var dateEnd = explode(".", input_date_end.val());

		var timeStart = explode(":", input_time_start.val());
		var timeEnd = explode(":", input_time_end.val());

		var nodes = that.table.getSelectedNodes();

		if(dateStart.length != 3) {
			input_date_start.addClass("error");
			onError("Start date incorrect.");
			return;
		} else if (dateEnd.length != 3) {
			input_date_end.addClass("error");
			onError("End date incorrect.");
			return;
		} else if (timeStart.length != 2) {
			input_time_start.addClass("error");
			onError("Start time incorrect.");
			return;
		} else if (timeEnd.length != 2){
			input_time_end.addClass("error");
			onError("End time incorrect.");
			return;
		}

		var from = new Date(dateStart[2], dateStart[1]-1, dateStart[0], timeStart[0], timeStart[1], 0);
		var to = new Date(dateEnd[2], dateEnd[1]-1, dateEnd[0], timeEnd[0], timeEnd[1], 0);

		if(to <= from) {
			input_date_start.addClass("error");
			input_date_end.addClass("error");
			input_time_start.addClass("error");
			input_time_end.addClass("error");
			onError("End date must after the start date.");
			return;
		} else if(nodes.length <= 0) {
			onError("You must select at least one node");
			return;
		}

		var callbackError = function(jqXHR, textStatus, errorThrown) {
			onError(jqXHR.responseText);
			WiseGui.showAjaxError(jqXHR, textStatus, errorThrown)
		};

		var callbackDone = function() {

			okButton.removeAttr("disabled");
			cancelButton.removeAttr("disabled");

			that.hide();

			// Refresh the reservation table
			$(window).trigger('wisegui-reservations-changed');

			// Refresh the experiments tab in the menu
			$(window).trigger('wisegui-navigation-event', getNavigationData());
		};

		// TODO support key-value pairs in "options" field
		wisebed.reservations.make(
			from,
			to,
			nodes,
			input_desciption.val(),
			[],
			callbackDone,
		    callbackError
		);
	});

	cancelButton.bind('click', this, function(e) {
		e.data.hide();
	});

	var dialogFooter = $('<div class="modal-footer"/>');
	dialogFooter.append(okButton, cancelButton);
	this.view.append(dialogHeader, dialogBody, dialogFooter);
};

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

	helpText = 'Please enter your username in the format <strong>username@idphost</strong>. '
				+ '<br/><br/>'
				+'If you have registered on <strong>wisebed.eu</strong>, use <strong>yourusername@wisebed1.itm.uni-luebeck.de</strong>.';

	inputUsername.popover({
		placement : 'bottom',
		trigger   : 'focus',
		animation : true,
		content   : helpText,
		title     : "Format of the username field"
	});

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

	var dialogBody = $('<div class="modal-body WiseGuiLoginDialog"/>'
			+ '		<form id="WiseGuiLoginDialogForm">'
			+ '		<table class="table" id="WiseGuiLoginDialogFormTable">'
			+ '			<thead>'
			+ '				<tr>'
			+ '					<th>Testbed</th>'
			+ '					<th>URN Prefix</th>'
			+ '					<th>Username</th>'
			+ '					<th>Password</th>'
			+ '				</tr>'
			+ '			</thead>'
			+ '			<tbody>'
			+ '			</tbody>'
			+ '		</table>'
			+ '		</form>'
			+ '	</div>');

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
		var user = (localStorage[urnPrefixes[i]+'_user'] != undefined) ? localStorage[urnPrefixes[i]+'_user'] : '';
		var pass = (localStorage[urnPrefixes[i]+'_pass'] != undefined) ? localStorage[urnPrefixes[i]+'_pass'] : '';
		this.addRowToLoginForm(loginFormTableBody, urnPrefixes[i], user, pass );
	}

	
	var helpTextLocalStorage = 'Select this check box, log in and your credentials are stored <strong>unencrypted</strong> in your browser (HTML5 local storage). '
		+ '<br/><br/>'
		+'Unselect the check box and log in to delete previously stored credentials.';

	var trStoreCredentials = $('<tr/>');
	var storeCredentials_checkbox;
	
	if(localStorage[this.loginFormRows[0].inputUrnPrefix.value+'_user'] != undefined){
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
	tdStoreCredentials.append("store credentials");
	trStoreCredentials.append(tdStoreCredentials);
	this.storeCredentials_checkbox = storeCredentials_checkbox;

	loginFormTableBody.append(trStoreCredentials);		
			
	var trRegister = $('<tr/>');
	trRegister.append($('<td style="padding-bottom:0px" colspan="4">No account yet? <a href="http://wisebed.eu/site/index.php/register/" target="_blank">Register here!</td>'));

	loginFormTableBody.append(trRegister);
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
		for (var j=0; i<this.loginFormRows.length; j++) {
			localStorage.removeItem(this.loginFormRows[j].inputUrnPrefix.value+'_user');
			localStorage.removeItem(this.loginFormRows[j].inputUrnPrefix.value+'_pass');
		}
	}

	this.updateLoginDataFromForm();
	doLogin(this.loginData);
};


/**
 * #################################################################
 * WiseGuiNodeTable
 * #################################################################
 */

var TableElem = function (data) {
	this.data = data;
	this.row = null;
	this.isVisible = true;
	this.checkbox = null;
};

/**
 * Model: Object[] headers: String[] rowProducer: fun(obj) -> String[]
 * preFilterFun: fun(obj) -> true | false preSelectFun: fun(obj) -> true | false
 * showCheckBoxes: true | false showFilterBox: true | false
 */
var Table = function (model, headers, rowProducer, preFilterFun, preSelectFun, showCheckBoxes, showFilterBox) {

	this.model = model;
	this.headers = headers;
	this.rowProducer = rowProducer;
	this.preFilterFun = preFilterFun;
	this.preSelectFun = preSelectFun;
	this.showCheckBoxes = showCheckBoxes;

	this.html = $("<div></div>");
	this.table = null;
	this.filter = null;
	this.data = [];
	this.selectionListeners = [];
	this.filterListeners = [];

	this.filter_input = null;
	this.input_checkbox_th = null;

	if(showFilterBox) {
		this.lastWorkingFilterExpr = null;
		this.filter_checkbox = null;
		this.generateFilter();
	}

	this.generateTable();

	if(this.preFilterFun) {
		this.setFilterFun(this.preFilterFun);
	}

	if(this.preSelectFun) {
		this.setSelectFun(this.preSelectFun);
	}

	return this;
};

Table.prototype.generateFilter = function () {
	var that = this;

	// Filter
	this.filter = $('<p style="margin-top:3px;"></p>');

	var img_help = $('<img class="WiseGuiNodeTable" style="float:right;cursor:pointer;margin-top:5px;">');
	img_help.attr("src", "img/famfamfam/help.png");

	var div_help = $('<div style="margin-right:95px;"></div>');
	var div_adv = $('<div style="float:right;margin-top:3px;margin-right:2px;">Advanced</div>');

	this.filter_checkbox = $('<input type="checkbox" style="float:right;margin-top:7px;margin-right:3px;">');
	this.filter.append(img_help, div_adv, this.filter_checkbox, div_help);

	var filter_input = $('<input type="text" placeholder="Filter displayed nodes...">');
	// Key up event if enter is pressed
	filter_input.keyup(function(e) {
		if ((e.keyCode || e.which) == 13) {
			var filter_fun = that.setFilterFun.bind(that);
			var val = filter_input.val();
			filter_fun(val);
		}
	});
	this.filter_input = filter_input;

	var helpTooltipIsVisable = false;
	img_help.click(function() {
		img_help.popover(helpTooltipIsVisable ? 'hide' : 'show');
		helpTooltipIsVisable = !helpTooltipIsVisable;
	});

	var helpText = '<h3>Normal mode</h3>';
	helpText += 'In normal mode, the filter is a full text search.';
	helpText += '<h3>Advanced mode</h3>';
	helpText += 'In advanced mode, the filter is using <a href="http://api.jquery.com/filter/" target="_blank">jQuery.filter()</a> on the given data structure.';

	if(this.model.length > 0) {
		helpText += '<br>The data structure looks as follows:';
		helpText += "<pre style=\"overflow:auto;height:50px;margin:0px;\">" + JSON.stringify(this.model[0], wiseMLNullFilter, '  ') + "</pre>";
	}

	helpText += '<h5>Some examples:</h5>';

	helpText += '<ul style="margin-bottom:0px;font-family: monospace;">';
	helpText += '<li>e.nodeType == "isense"';
	helpText += '<li>e.position.x == 25';
	helpText += '<li>e.id.indexOf("0x21") > 0';
	helpText += '<li>($(e.capability).filter(function (i) {return this.name.indexOf("temperature") > 0;}).length > 0)';
	helpText += '</ul>';

	img_help.popover({
		placement:'left',
		animation:true,
		trigger: 'manual',
		content: helpText,
		title: "Filter Help"
	});
	div_help.append(filter_input);
	this.html.append(this.filter);
};

Table.prototype.generateTable = function () {
	var that = this;

	// Prepare the TableElems
	$(this.model).each(
		function() {
			that.data.push(new TableElem(this));
		}
	);

	this.table = $('<table class="table table-bordered"></table>');

	/*
	 * Generate table header
	 */
	var thead = $('<thead></thead>');
	var tr_thead = $('<tr></tr>');
	thead.append(tr_thead);

	// Reusable stuff
	var th = $('<th class="header"></th>');
	var input_checkbox = $('<input type="checkbox"/>');

	// Append the checkbox to the header
	if(this.showCheckBoxes) {
		var th_checkbox = th.clone();
		var input_checkbox_th = input_checkbox.clone();

		input_checkbox_th.click(function() {
			var checked = $(this).is(':checked');
			if(that.table != null) {
				// .find("input")
				var inputs = that.table.find('tr:visible').find('input:checkbox');
				inputs.each(function(index, input) {
					$(this).attr('checked', checked);
					if(index>0) // first checkbox does not belong to a specific node and has no urn
					that.callSelectionListeners(input.attributes["urn"].nodeValue,!checked);
				});
			}
		});
		th_checkbox.append(input_checkbox_th);
		this.input_checkbox_th = input_checkbox_th;
		tr_thead.append(th_checkbox);
	}

	$.each(this.headers,
		function(key, value) {
			var th_local = th.clone();
			th_local.append(value);
			tr_thead.append(th_local);
		}
	);

	/*
	 * Generate the table body
	 */
	var tbody = $('<tbody></tbody>');

	if(this.rowProducer != null) {
		for ( var i = 0; i < this.data.length; i++) {

			var data = this.data[i].data;

			var row = null;
			if(this.rowProducer != null) {
				row = this.rowProducer.bind(data)(data);
			}

			var tr = $("<tr></tr>");

			if(this.showCheckBoxes) {
				var checkbox = $('<input type="checkbox"/>');
				checkbox.attr("name", i);
				checkbox.attr("urn", data.id);
				checkbox.click(function(){
					var checked = $(this).is(':checked');
					that.callSelectionListeners(this.attributes["urn"].nodeValue,!checked);
				});
				data.checkbox = checkbox;
				var td_checkbox = $('<td></td>');
				td_checkbox.append(checkbox);
				tr.append(td_checkbox);
			}

			for(var j = 0; j<row.length; j++) {
				var td = $('<td></td>');
				td.append(row[j]);
				tr.append(td);
			}
			this.data[i].row = tr;
			tbody.append(tr);
		}
	}

	this.table.append(thead);
	this.table.append(tbody);
	this.html.append(this.table);

	// add link for json representation of selected nodes
	var jsonLink = $('<a href="#" title="Opens a new window containing the selected NodeUrns as JSON">Get JSON representation</a>');
	jsonLink.click(function(e) {
		e.preventDefault();

		var obj = {"nodeUrns": $.map(that.getSelectedRows(), function(val,i) {
			return val.id;
		})}

		var json = JSON.stringify(obj);
		var w = window.open();
		$(w.document.body).html(json);
	});
	this.html.append(jsonLink);

	if(this.showCheckBoxes) {
		this.table.tablesorter({
			headers:{0:{sorter:false}},
			sortList: [[2,0]]
		});
	} else {
		this.table.tablesorter({sortList: [[1,0]]});
	}
};

Table.prototype.addSelectionListener = function (listener) {
	this.selectionListeners.push(listener);
};

Table.prototype.addFilterListener = function ( listener) {
	this.filterListeners.push(listener);
};

Table.prototype.callSelectionListeners = function(urn, deselected){
	var that = this;
	for (var i =0; i<that.selectionListeners.length;i++){
		that.selectionListeners[i](urn, deselected);
	}
};

Table.prototype.callFilterListeners = function(urns){
	var that = this;
	for (var i =0; i<that.filterListeners.length;i++){
		that.filterListeners[i](urns);
	}
};

Table.prototype.getSelectedRows = function () {

	var that = this;

	var selected = [];
	if(this.data != null && this.table != null) {
		this.table.find("input:checked").each(function() {
			var name = $(this).attr('name');
			// Ignore the checkbox from the header, which doesn't have any name
			if(typeof(name) != "undefined") {
				var index = parseInt(name);
				selected.push(that.data[index].data);
			}
		});
	}
	return selected;
};

Table.prototype.setFilterFun = function (fn) {

	this.preFilterFun = fn;

	for ( var i = 0; i < this.data.length; i++) {
		var d = this.data[i];
		d.isVisible = true; // Reset

		if(fn != null && typeof(fn) == "function") {
			d.isVisible = d.isVisible && fn.bind(d.data)(d.data);
		} else if(fn != null && typeof(fn) == "string" && fn.length > 0 && this.filter_checkbox.is(':checked')) {
			// Filter
			var errorOccured = false;

			var fil = function(e) {
				ret = true;
				try {
					ret = eval(fn);
				} catch (ex) {
					errorOccured = true;
					ret = null;
				}

				if(typeof(ret) != "boolean") {
					if(that.lastWorkingFilterExpr != null) {
						ret = eval(that.lastWorkingFilterExpr);
					} else {
						return true;
					}
				} else {
					return ret;
				}
			};

			d.isVisible = d.isVisible && fil(d.data);

			if(errorOccured) {
				WiseGui.showErrorAlert("Filter expression invalid.");
				return;
			} else {
				this.lastWorkingFilterExpr = fn;
			}
		}

		// Simple filter
		if(fn != null && typeof(fn) == "string" && fn.length > 0 && !this.filter_checkbox.is(':checked')) {
			if(this.rowProducer != null) {
				var row = this.rowProducer(d.data);
				if(implode(" ", row).toLowerCase().indexOf(fn.toLowerCase()) < 0) {
					d.isVisible = false;
				}
			}
		}

		if(d.isVisible) {
			d.row.show();
		} else {
			d.row.hide();
		}
	}

	if(this.showCheckBoxes) {
		this.input_checkbox_th.attr('checked', false);
	}
	var urns = [];
	for ( var i = 0; i < this.data.length; i++) {
		var d = this.data[i];
		if(d.isVisible==true){
			urns.push(d.data.id);}
		}
	this.callFilterListeners(urns);
};

Table.prototype.setSelectFun = function (fn) {

	this.preSelectFun = fn;

	for ( var i = 0; i < this.data.length; i++) {
		var data = this.data[i].data;
		var bool = false;
		if(fn != null) {
			bool = fn.bind(data)(data);
		}
		var checkbox = this.data[i].row.find('input:checkbox');
		checkbox.attr('checked', bool);
	}
};

Table.prototype.getFilterFun = function () {
	return this.preFilterFun;
};

Table.prototype.getSelectFun = function () {
	return this.preSelectFun;
};

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

/**
 * #################################################################
 * WiseGuiNodeTable
 * #################################################################
 */
var WiseGuiNodeTable = function (wiseML, parent, showCheckboxes, showFilter) {
	this.table = null;
	this.wiseML = wiseML;
	this.showCheckboxes = showCheckboxes;
	this.showFilter = showFilter;
	this.parent = parent;
	this.generateTable();
};

WiseGuiNodeTable.prototype.generateTable = function () {

	var that = this;

	// The header
	var header = [' ', 'Node URN','Type','Position','Sensors'];

	var nodeUrns = this.wiseML.setup.node.map(function (node) { return node.id;	});
	var connectionStatus = {};
	nodeUrns.forEach(function(nodeUrn) {
		connectionStatus[nodeUrn] = $('<div class="connectionStatus" />');
		connectionStatus[nodeUrn].append(new WiseGuiNodeStatusIcon(nodeUrn).view);
	});

	if(nodeUrns.length == 0){
		console.warn("No sensor nodes found");
		return;
	}

	wisebed.experiments.areNodesConnected(nodeUrns, function(result) {

		var attached = [];
		var detached = [];

		for (var node in result) {
			if (result.hasOwnProperty(node) && result[node].statusCode == 1) {
				attached.push(node);
			}
			else {
				detached.push(node);
			}
		}

		// emulate devicesAttachedEvent
		$(window).trigger('wisegui-devices-attached-event', {
			type : 'devicesAttached',
			timestamp : new Date().toISOString(),
			nodeUrns : attached
		});

		// emulate devicesDetachedEvent
		$(window).trigger('wisegui-devices-detached-event', {
			type : 'devicesAttached',
			timestamp : new Date().toISOString(),
			nodeUrns : detached
		});

	}, function(jqXHR, textStatus, errorThrown) {
		WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
	});

	// The row producer gives something like
	// ["", "id", "type", "(x,y,z)", "a,b,c"]
	var rowProducer = function (node) {
		var data = [];
		var capabilities = [];

		if(node.capability != null) {
			for(var j = 0; j < node.capability.length; j++) {
				parts = explode(":", node.capability[j].name);
				capabilities[j] = parts[parts.length-1];
			}
		}

		data.push(connectionStatus[node.id]);
		data.push(node.id);
		data.push(node.nodeType);

		if (node.position != null && node.position.outdoorCoordinates) {

			var c = node.position.outdoorCoordinates;

			if (c.latitude && c.longitude) {
				data.push('(' + c.latitude + ',' + c.longitude+ ')')
			} else if (c.x && c.y && c.z) {
				data.push('[' + c.x + ',' + c.y + ',' + c.z + ']');
			} else if (c.x && c.y) {
				data.push('[' + c.x + ',' + c.y + ',0]');
			} else {
				data.push(JSON.stringify({rho: c.rho, phi: c.phi, theta: c.theta}));
			}

		} else if (node.position != null && node.position.indoorCoordinates) {
			data.push(JSON.stringify(node.position.indoorCoordinates));
		} else {
			data.push('');
		}

		if(capabilities.length > 0) {
			data.push(implode(",", capabilities));
		} else {
			data.push('');
		}

		return data;
	};

	// Use the usual table
	var t = new Table (this.wiseML.setup.node, header, rowProducer, null, null, this.showCheckboxes, this.showFilter);
	this.table = t;

	// This vars store the predefined filters
	var predefined_filter_types = [];
	var predefined_filter_functions = [];

	// Add type filters
	$(this.wiseML.setup.node).each(
		function() {
			var t = this.nodeType;
			var text = "Only nodes of type " + t;
			if($.inArray(text, predefined_filter_types) < 0) {
				predefined_filter_types.push(text);
				var fn = function(e) {
					return e.nodeType == t;
				};
				predefined_filter_functions.push(fn);
			}
		}
	);

	// Other filters can be added here

	// Here the select will be generated
	var select = $('<select style="width:39%;background-color:#FFF;margin-left:1px;vertical-align:bottom;height:28px;"></select>');
	select.change(
		function () {
			var idx = parseInt($(this).val());
			var fn = predefined_filter_functions[idx];
			that.table.setFilterFun(fn);
		}
	);

	var option = $('<option value="">Nodes of every type</option>');
	select.append(option);

	var index = 0;
	$(predefined_filter_types).each(
		function() {
			var option = $('<option value="' + (index++) + '">' + this + '</option>');
			select.append(option);
		}
	);

	t.filter_input.css("width", "59%");
	t.filter_input.after(select);
	this.parent.append(t.html);
};

WiseGuiNodeTable.prototype.getSelectedNodes = function () {
	var ids = [];
	$(this.table.getSelectedRows()).each(function() {
		ids.push(this.id);
	});
	return ids;
};

WiseGuiNodeTable.prototype.applyFilter = function (fn) {
	this.table.setFilterFun(fn);
};

WiseGuiNodeTable.prototype.applySelected = function (fn) {
	this.table.setSelectFun(fn);
};


/**
 * #################################################################
 * WiseGuiReservationObserver
 * #################################################################
 */

var WiseGuiReservationObserver = function() {
	this.lastKnownReservations = [];
	this.isObserving           = false;
	this.schedule              = undefined;
};

WiseGuiReservationObserver.prototype.fetchReservationsAndProcess = function() {
	var self = this;
	console.log("WiseGuiReservationObserver fetching personal reservations");
	wisebed.reservations.getPersonal(
			null,
			null,
			function(reservations) {self.processReservationsFetched(reservations);},
			WiseGui.showAjaxError
	);
};

WiseGuiReservationObserver.prototype.processReservationsFetched = function(reservations) {

	var newReservations = [];

	for (var i=0; i<reservations.length; i++) {

		var knownReservation = false;

		for (var j=0; j<this.lastKnownReservations.length; j++) {
			if (wisebed.reservations.equals(reservations[i], this.lastKnownReservations[j])) {
				knownReservation = true;
				break;
			}
		}

		if (!knownReservation) {
			newReservations.push(reservations[i]);
		}
	}

	if (newReservations.length > 0) {
		$(window).trigger('wisegui-reservations-changed', [reservations]);
	}

	for (var k=0; k<newReservations.length; k++) {
		$(window).trigger('wisegui-reservation-added', newReservations[k]);
		this.lastKnownReservations.push(newReservations[k]);
	}
};

WiseGuiReservationObserver.prototype.startObserving = function() {

	var self = this;

	$(window).bind('wisegui-logged-in', function(e, data) {
		self.schedule = window.setInterval(function() {self.fetchReservationsAndProcess();}, 60 * 1000);
		self.fetchReservationsAndProcess();
		console.log('WiseGuiReservationObserver beginning to observe reservations');
	});

	$(window).bind('wisegui-logged-out', function(e, data) {
		self.stopObserving();
	});
};

WiseGuiReservationObserver.prototype.stopObserving = function() {

	console.log('WiseGuiReservationObserver.stopObserving()');

	if (this.schedule !== undefined) {
		window.clearInterval(this.schedule);
		this.schedule = undefined;
		console.log('WiseGuiReservationObserver stopped to observe');
	}
};

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
						  ' badge-info'
						+ ' badge-success'
						+ ' badge-warning'
						+ ' badge-important');
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
			  '<div class="alert alert-'+alert.severity+'">'
			+ '<button class="close" data-dismiss="alert">&times;</button>'
			+ '</div>'
	);
	alertDiv.append(alert.message);
	this.history.append(alertDiv);
	this.flash(alertDiv.clone());
};

WiseGuiNotificationsViewer.prototype.showBlockAlert = function(alert) {
	var blockAlertDiv = $(
			  '<div class="alert block-message alert-' + alert.severity + '">'
			+ '	<button class="close" data-dismiss="alert">x</button>'
			+ '	<div class="alert-actions">'
			+ '	</div>'
			+ '</div>'
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
		for (var i=0; i<alert.actions.length; i++) {
			actionsDiv.append(alert.actions[i]);
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
	this.view = $('<div class="WiseGuiNotificationsContainer">'
			+ '<div id="WiseGuiNotificationsHistory"></div>'
			+ '<div id="WiseGuiNotificationsRoster">'
			+ ' <div id="notification-flash" class="span11">&nbsp;</div>'
			+ '	<div class="span1" id="WiseGuiNotificationsButton">'
			+ '		<div class="btn-group">'
			+ '			<a class="btn btn-mini" id="roster-btn" href="#" title="show old notifications">'
			+ '			<span class="badge" id="notifications-counter">0</span>'
			+ '			<a class="btn btn-mini dropdown-toggle" data-toggle="dropdown" href="#" title="remove all notifications">'
			+ '    		<span>&#9650;</span>'
			+ '			</a>'
			+ '		<ul class="dropdown-menu" id="roster-dropdown">'
			+ '			<li><a id="roster-clear" href="#">Clear</a></li>'
			+ '		</ul>'
			+ '	</div>'
			+ '</div>'
			+ '</div>');
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

/**
 * #################################################################
 * WiseGuiNodeSelectionDialog
 * #################################################################
 */

var WiseGuiNodeSelectionDialog = function(experimentId, headerHtml, bodyHtml, preSelected, storageKeyPrefix) {

	this.experimentId = experimentId;
	this.table = null;

	this.preSelected = preSelected;
	this.storageKeyPrefix = storageKeyPrefix;

	this.dialogDivId = 'WiseGuiNodeSelectionDialog-' + Math.random();

	this.dialogDiv = $('<div id="'+this.dialogDivId+'" class="modal hide WiseGuiNodeSelectionDialog"></div>');

	var bodyHeader = $('	<div class="modal-header">'
			+ '		<h3>' + headerHtml + '</h3>'
			+ '	</div>');

	var body = $('	<div class="modal-body">'
			+ '		<p>' + bodyHtml + '</p>'
			+ '	</div>');

	var imgAjaxLoader = $('<img class="ajax-loader" width="32" height="32"/>');
	imgAjaxLoader.attr("src", "img/ajax-loader-big.gif");
	body.append(imgAjaxLoader);

	var bodyFooter = $(' <div class="modal-footer">'
			+ '		<a class="modal-cancel btn">Cancel</a>'
			+ '		<a class="modal-ok btn btn-primary">OK</a>'
			+ '	</div>');

	this.dialogDiv.append(bodyHeader, body, bodyFooter);

	this.nodeUrns = undefined;
	this.callbackCancel = undefined;
	this.callbackOK = undefined;
	this.callbacksReady = [];

	var self = this;
	wisebed.getWiseMLAsJSON(
			this.experimentId,
			function(wiseML) {
				self.constructDialogInternal(wiseML);
				self.callbacksReady.forEach(function(callback) { callback(); });
			},
			function(jqXHR, status, error) {
				self.hide();
				WiseGui.showAjaxError(jqXHR, status, error);
			}
	);
};

WiseGuiNodeSelectionDialog.prototype.setSelection = function(nodeUrns) {
	if (nodeUrns != null && nodeUrns.length > 0) {
		window.localStorage.setItem(this.storageKeyPrefix + this.experimentId, nodeUrns.join(","));
		this.table.applySelected(function(data) { return nodeUrns.indexOf(data.id) > -1; });
	} else {
		window.localStorage.removeItem(this.storageKeyPrefix + this.experimentId);
		this.table.applySelected(function() { return false; });
	}
};

WiseGuiNodeSelectionDialog.prototype.getSelection = function() {
	var nodeUrnsString = window.localStorage.getItem(this.storageKeyPrefix + this.experimentId);
	return nodeUrnsString == null ? [] : nodeUrnsString.split(",");
};

WiseGuiNodeSelectionDialog.prototype.areSomeSelected = function() {
	return this.getSelection().length > 0;
};

WiseGuiNodeSelectionDialog.prototype.areAllSelected = function() {
	return this.getSelection().length == this.nodeUrns.length;
};

WiseGuiNodeSelectionDialog.prototype.constructDialogInternal = function(wiseML) {

	this.nodeUrns = wiseML.setup.node.map(function(node) { return node.id; });

	this.dialogDiv.on('hide', function() {
		if (this.callbackCancel) {
			this.callbackCancel();
		}
	});

	this.dialogDiv.find('.ajax-loader').attr('hidden', 'true');
	this.table = new WiseGuiNodeTable(wiseML, this.dialogDiv.find('.modal-body').first(), true, true);

	// Apply preselected
	if(typeof(this.preSelected) == "function") {
		this.table.applySelected(this.preSelected);
	} else if (this.storageKeyPrefix) {
		this.setSelection(this.getSelection());
	}

	// Cancel clicked
	this.dialogDiv.find('.modal-cancel').first().bind(
			'click',
			{dialog : this},
			function(event) {
				// reset to last selection set
				event.data.dialog.setSelection(event.data.dialog.getSelection());
				event.data.dialog.dialogDiv.modal('hide');
				if (event.data.dialog.callbackCancel) {
					event.data.dialog.callbackCancel();
				}
			}
	);

	// OK clicked
	this.dialogDiv.find('.modal-ok').first().bind(
			'click',
			{dialog : this},
			function(event) {
				var dialog = event.data.dialog;
				var selectedNodes = dialog.table.getSelectedNodes();
				dialog.dialogDiv.modal('hide');
				if (dialog.storageKeyPrefix) {
					dialog.setSelection(selectedNodes);
				}
				if (event.data.dialog.callbackOK) {
					event.data.dialog.callbackOK(selectedNodes);
				}
			}
	);

	if (!document.body.contains(this.dialogDiv)) {
		$(document.body).append(this.dialogDiv);
	}
};

WiseGuiNodeSelectionDialog.prototype.hide = function() {
	this.dialogDiv.modal('hide');
};

WiseGuiNodeSelectionDialog.prototype.show = function(callbackOK, callbackCancel) {
	this.callbackOK = callbackOK;
	this.callbackCancel = callbackCancel;
	this.dialogDiv.modal('show');
};

WiseGuiNodeSelectionDialog.prototype.onReady = function(callback) {
	this.callbacksReady.push(callback);
};

/**
 * #################################################################
 * WiseGuiExperimentationView
 * #################################################################
 */

var WiseGuiExperimentationView = function(reservation) {
	
	var self = this;

	this.experimentId = reservation.experimentId;
	this.reservation = reservation;

	this.experimentationDivId    = 'WiseGuiExperimentationDiv-'+this.experimentId.replace(/=/g, '');
	this.progressBarId           = this.experimentationDivId+'-progress-bar';
	this.outputsTextAreaId       = this.experimentationDivId+'-outputs-textarea';
	this.sendDivId               = this.experimentationDivId+'-send';
	//this.channelPipelinesDivId   = this.experimentationDivId+'-channel-pipelines';
	this.flashDivId              = this.experimentationDivId+'-flash';
	this.resetDivId              = this.experimentationDivId+'-reset';
	this.scriptingEditorDivId    = this.experimentationDivId+'-scripting-editor';
	this.scriptingOutputDivId    = this.experimentationDivId+'-scripting-output';
	this.wisemlJsonDivId         = this.experimentationDivId+'-wiseml-json';
	this.wisemlXmlDivId          = this.experimentationDivId+'-wiseml-xml';

	this.view = $('<div class="WiseGuiExperimentationView"/>');

	this.buildView();
	this.loadWisemlViews();
};

WiseGuiExperimentationView.prototype.loadWisemlViews = function() {
	var self = this;
	wisebed.getWiseMLAsJSON(this.experimentId, function(wiseML) {
		var jsonTab = $('#' + self.wisemlJsonDivId);
		jsonTab.append($('<pre class="WiseGuiExperimentationViewWiseMLJSON">'+JSON.stringify(wiseML, wiseMLNullFilter, '  ')+'</pre>'));
		jsonTab.append($('<a href="'+wisebedBaseUrl + '/experiments/'+self.experimentId+'/network.json" target="_blank" class="btn btn-primary pull-right">Download</a>'));
	}, WiseGui.showAjaxError);
	wisebed.getWiseMLAsXML(this.experimentId, function(wiseML) {
		var xmlTab = $('#' + self.wisemlXmlDivId);
		xmlTab.append($('<pre class="WiseGuiExperimentationViewWiseMLXML">'+new XMLSerializer().serializeToString(wiseML).replace(/</g,"&lt;")+'</pre>'));
		xmlTab.append($('<a href="'+wisebedBaseUrl + '/experiments/'+self.experimentId+'/network.xml" target="_blank" class="btn btn-primary pull-right">Download</a>'));
	}, WiseGui.showAjaxError);
};

WiseGuiExperimentationView.prototype.buildView = function() {
	
	this.consoleView = new WiseGuiConsoleView(this.reservation);
	this.view.append(this.consoleView.view);

	this.view.append(
			  ' <div class="WiseGuiExperimentationViewControls"><h2>Controls</h2></div>'
			+ '	 <div>'
			+ '		<ul class="nav nav-tabs">'
			+ '			<li class="active"><a href="#'+this.flashDivId+'">Flash</a></li>'
			+ '			<li><a href="#'+this.resetDivId+'">Reset</a></li>'
			+ '			<li><a href="#'+this.sendDivId+'">Send Message</a></li>'
			//+ '			<li><a href="#'+this.channelPipelinesDivId+'">Pipelines</a></li>'
			+ '			<li><a href="#'+this.scriptingEditorDivId+'">Scripting Editor</a></li>'
			+ '			<li><a href="#'+this.scriptingOutputDivId+'">Scripting Output</a></li>'
			+ '         <li class="pull-right"><a href="#'+this.wisemlXmlDivId+'">WiseML (XML)</a></li>'
			+ '         <li class="pull-right"><a href="#'+this.wisemlJsonDivId+'">WiseML (JSON)</a></li>'
			+ '		</ul>'
			+ '		<div class="tab-content">'
			+ '			<div class="active tab-pane WiseGuiExperimentsViewFlashControl" id="'+this.flashDivId+'"></div>'
			+ '			<div class="tab-pane WiseGuiExperimentsViewResetControl" id="'+this.resetDivId+'"></div>'
			+ '			<div class="tab-pane WiseGuiExperimentsViewSendControl" id="'+this.sendDivId+'"/>'
			//+ '			<div class="tab-pane WiseGuiExperimentsViewChannelPipelinesControl" id="'+this.channelPipelinesDivId+'">'
			//+ '				<button class="btn span2 WiseGuiExperimentsViewGetChannelPipelinesButton">Get Channel Pipelines</a>'
			//+ '			</div>'
			+ '			<div class="tab-pane WiseGuiExperimentsViewScriptingControl" id="'+this.scriptingEditorDivId+'"/>'
			+ '			<div class="tab-pane WiseGuiExperimentsViewScriptingOutputTab" id="'+this.scriptingOutputDivId+'"/>'
			+ '			<div class="tab-pane WiseGuiExperimentsViewWisemlXmlTab" id="'+this.wisemlXmlDivId+'"/>'
			+ '			<div class="tab-pane WiseGuiExperimentsViewWisemlJsonTab" id="'+this.wisemlJsonDivId+'"/>'
			+ '		</div>'
			+ '	</div>'
			+ '</div>');

	var self = this;
	var tabs = this.view.find('.nav-tabs').first();

	tabs.find('a').click(function (e) {
		e.preventDefault();
		var navigationData = getNavigationData();
		navigationData.tab = e.target.hash.substring(1);
		window.location.hash = $.param(navigationData);
	});

	$(window).bind('wisegui-navigation-event', function(e, navigationData) {
		if (navigationData.tab) {
			tabs.find('a[href="#'+navigationData.tab+'"]').tab('show');
		}
	});
	
	this.flashView = new WiseGuiFlashView(this.reservation);
	this.view.find('#'+this.flashDivId).append(this.flashView.view);

	this.resetView = new WiseGuiResetView(this.reservation);
	this.view.find('#'+this.resetDivId).append(this.resetView.view);

	this.sendView = new WiseGuiSendView(this.reservation);
	this.view.find('#'+this.sendDivId).append(this.sendView.view);

	//this.getChannelPipelinesButton    = this.view.find('button.WiseGuiExperimentsViewGetChannelPipelinesButton').first();

	this.scriptingView = new WiseGuiScriptingView(this.reservation);
	this.view.find('#'+this.scriptingEditorDivId).append(this.scriptingView.editorView);
	this.view.find('#'+this.scriptingOutputDivId).append(this.scriptingView.outputView);

	/*
	this.getChannelPipelinesButton.bind('click', function() {
		wisebed.experiments.getNodeUrns(
				self.experimentId,
				function(nodeUrns) {
					wisebed.experiments.getChannelPipelines(
							self.experimentId,
							nodeUrns,
							function(channelPipelines) {
								console.log(channelPipelines);
							},
							WiseGui.showAjaxError
					);
				},
				WiseGui.showAjaxError
		);
	});
	*/
};

/**
 * #################################################################
 * WiseGuiOperationProgressView
 * #################################################################
 */

var WiseGuiOperationProgressView = function(nodeUrns, operationMaxValue, successMessage) {

	this.view = $('<div class="WiseGuiOperationProgressView"/>');
	this.successMessage = successMessage;
	this.visible = false;

	this.contents = {};

	for (var i=0; i<nodeUrns.length; i++) {

		var row = $('<table>'
				+ '	<tr>'
				+ '	<td class="span1 nodUrnTd">'+nodeUrns[i]+'</td>'
				+ '	<td class="span4 progressTd"><progress value="0" min="0" max="'+operationMaxValue+'"/></td>'
				+ '	<td class="span1 statusTd"></td>'
				+ '	<td class="span6 messageTd"></td>'
				+ '	</tr>'
				+ '</table>');

		this.contents[nodeUrns[i]] = {
			row         : row,
			progressBar : row.find('progress').first(),
			statusTd    : row.find('.statusTd').first(),
			messageTd   : row.find('.messageTd').first()
		};

		this.view.append(row);
	}
};

WiseGuiOperationProgressView.prototype.update = function(operationStatus) {

	var self = this;
	var allSuccessful = true;

	$.each(operationStatus, function(nodeUrn, nodeStatus) {
		var content = self.contents[nodeUrn];
		if (content) {
			if (nodeStatus.status == 'SUCCESS') {
				content.row.remove();
				delete self.contents[nodeUrn];
			} else {
				content.progressBar[0].value = nodeStatus.statusCode;
				content.statusTd.html(nodeStatus.status);
				content.messageTd.html(nodeStatus.message);
				allSuccessful = false;
			}
		}
	});

	if (allSuccessful && this.successMessage) {
		self.view.parent().remove();
		WiseGui.showSuccessAlert(this.successMessage);
	}

	if (!allSuccessful && !this.visible) {
		WiseGui.showInfoBlockAlert(this.view);
		this.visible = true;
	}
};

/**
 * #################################################################
 * Global Functions
 * #################################################################
 */

function checkLoggedIn(callback) {
	wisebed.isLoggedIn(callback, WiseGui.showAjaxError);
};

function doLogin(loginData) {

	var self = this;

	var callbackError = function(jqXHR, textStatus, errorThrown) {
		$(window).trigger('wisegui-login-error', {
			jqXHR       : jqXHR,
			textStatus  : textStatus,
			errorThrown : errorThrown
		});
	};

	var callbackDone = function() {
		$(window).trigger('wisegui-logged-in', {loginData : self.loginData});
		$(window).trigger('hashchange');
	};

	wisebed.login(loginData, callbackDone, callbackError);
};

function doLogout() {

	var callbackOK = function() {
		$(window).trigger('wisegui-logged-out');
		$('#WiseGuiLoginDialog').remove();
		navigateTo(undefined, 'WiseGuiTestbedDetailsMapView');
	};

	var callbackError = function(jqXHR, textStatus, errorThrown) {
		WiseGui.showErrorAlert("Logout failed.");
	};

	wisebed.logout(callbackOK, callbackError);
	
};

function wiseMLNullFilter(key,value) {
	if (value == null || value === undefined || (value instanceof Array && value.length == 0)) {
		return undefined;
	} else {
		return value;
	}
};

function loadTestbedDetailsContainer(navigationData, parentDiv) {

	parentDiv.append($('<h2 class="WiseGuiTestbedTitle">'+testbedDescription.name+'</h2>'));

	var tabsId                          = 'WiseGuiTestbedDetailsTabs';
	var mapTabDivId                     = 'WiseGuiTestbedDetailsMapView';
	var nodesTabDivId                   = 'WiseGuiTestbedDetailsNodes';
	var reservationsTabDivId            = 'WiseGuiTestbedDetailsReservations';
	var myReservationsTabDivId          = 'WiseGuiTestbedDetailsMyReservations';
	var federatableReservationsTabDivId = 'WiseGuiTestbedDetailsFederatableReservations';
	var wiseMLXMLTabDivId               = 'WiseGuiTestbedDetailsWiseMLXML';
	var wiseMLJSONTabDivId              = 'WiseGuiTestbedDetailsWiseMLJSON';

	var tabs = $(
			  '<ul class="nav nav-tabs" id="'+tabsId+'">'
			+ '	<li class="active"    ><a href="#'+mapTabDivId+'">Map</a></li>'
			+ '	<li                   ><a href="#'+nodesTabDivId+'">Nodes</a></li>'
			+ '	<li                   ><a href="#'+reservationsTabDivId+'">All Reservations</a></li>'
			+ '	<li                   ><a href="#'+myReservationsTabDivId+'">My Reservations</a></li>'
			+ '	<li                   ><a href="#'+federatableReservationsTabDivId+'">Federatable Reservations</a></li>'
			+ '	<li class="pull-right"><a href="#'+wiseMLXMLTabDivId+'">WiseML (XML)</a></li>'
			+ '	<li class="pull-right"><a href="#'+wiseMLJSONTabDivId+'">WiseML (JSON)</a></li>'
			+ '</ul>'
			+ '<div class="tab-content">'
			+ '	<div class="tab-pane active" id="'+mapTabDivId+'"/>'
			+ '	<div class="tab-pane       " id="'+nodesTabDivId+'"/>'
			+ '	<div class="tab-pane       " id="'+reservationsTabDivId+'"/>'
			+ '	<div class="tab-pane       " id="'+myReservationsTabDivId+'"/>'
			+ '	<div class="tab-pane       " id="'+federatableReservationsTabDivId+'"/>'
			+ ' <div class="tab-pane       " id="'+wiseMLXMLTabDivId+'"/>'
			+ '	<div class="tab-pane       " id="'+wiseMLJSONTabDivId+'"/>'
			+ '</div>');

	var mapTabContentDiv                     = tabs.find('#'+mapTabDivId).first();
	var nodesTabContentDiv                   = tabs.find('#'+nodesTabDivId).first();
	var reservationsTabContentDiv            = tabs.find('#'+reservationsTabDivId).first();
	var myReservationsTabContentDiv          = tabs.find('#'+myReservationsTabDivId).first();
	var federatableReservationsTabContentDiv = tabs.find('#'+federatableReservationsTabDivId).first();
	var wiseMLXMLTabContentDiv               = tabs.find('#'+wiseMLXMLTabDivId).first();
	var wiseMLJSONTabContentDiv              = tabs.find('#'+wiseMLJSONTabDivId).first();

	var myReservationsTab                    = tabs.find('a[href="#'+mapTabDivId+'"]').first();
	var myReservationsTab                    = tabs.find('a[href="#'+myReservationsTabDivId+'"]').first();
	var federatableReservationsTab           = tabs.find('a[href="#'+federatableReservationsTabDivId+'"]').first();

	parentDiv.append(tabs);
	myReservationsTab.hide();
	federatableReservationsTab.hide();

	var reloadMapsTab = function() {
		mapTabContentDiv.empty();
		wisebed.getWiseMLAsJSON(
			null,
			function(wiseML) {
				
				// init description over map
				if (wiseML.setup && wiseML.setup.description) {
					var mapDescription = wiseML.setup.description;
					var mapDescriptionRow = $('<div class="row"><div class="span12">' + mapDescription + '</div></div>');
					mapTabContentDiv.append(mapDescriptionRow);
				}

				// init map
				var mapRow = $('<div class="row"><div class="span12"></div></div>');
				mapTabContentDiv.append(mapRow);
				new WiseGuiGoogleMapsView(wiseML, mapRow.find('div').first());
			},
			WiseGui.showAjaxError
		);
	};

	var reloadNodesTab = function() {
		nodesTabContentDiv.empty();
		wisebed.getWiseMLAsJSON(
				null,
				function(wiseML) {
					new WiseGuiNodeTable(wiseML, nodesTabContentDiv, false, true);
				},
				WiseGui.showAjaxError
		);
	};

	var reloadReservationsTab = function() {
		reservationsTabContentDiv.empty();
		buildReservationTable(reservationsTabContentDiv);
	};

	var reloadMyReservationsTab = function() {
		if (isLoggedIn) {
			myReservationsTabContentDiv.empty();
			buildMyReservationTable(myReservationsTabContentDiv);
		}
	};

	var reloadFederatableReservationsTab = function() {
		if (testbedDescription.isFederator && isLoggedIn) {
			federatableReservationsTabContentDiv.empty();
			buildFederatableReservationTable(federatableReservationsTabContentDiv);
		}
	};

	var reloadWiseMLXMLTab = function() {
		wiseMLXMLTabContentDiv.empty();
		wisebed.getWiseMLAsXML(
				null,
				function(wiseML) {
					wiseMLXMLTabContentDiv.append($('<pre class="WiseGuiTestbedDetailsWiseMLXML">'+new XMLSerializer().serializeToString(wiseML).replace(/</g,"&lt;")+'</pre>'));
					wiseMLXMLTabContentDiv.append($('<a href="'+wisebedBaseUrl + '/experiments/network.xml" target="_blank" class="btn btn-primary pull-right">Download</a>'));
				},
				WiseGui.showAjaxError
		);
	};

	var reloadWiseMLJSONTab = function() {
		wiseMLJSONTabContentDiv.empty();
		wisebed.getWiseMLAsJSON(
				null,
				function(wiseML) {
					wiseMLJSONTabContentDiv.append($('<pre class="WiseGuiTestbedDetailsWiseMLJSON">'+JSON.stringify(wiseML, wiseMLNullFilter, '  ')+'</pre>'));
					wiseMLJSONTabContentDiv.append($('<a href="'+wisebedBaseUrl + '/experiments/network.json" target="_blank" class="btn btn-primary pull-right">Download</a>'));
				},
				WiseGui.showAjaxError
		);
	};

	var reloadFunctions = {};
	reloadFunctions[mapTabDivId]                     = reloadMapsTab;
	reloadFunctions[nodesTabDivId]                   = reloadNodesTab;
	reloadFunctions[reservationsTabDivId]            = reloadReservationsTab;
	reloadFunctions[myReservationsTabDivId]          = reloadMyReservationsTab;
	reloadFunctions[federatableReservationsTabDivId] = reloadFederatableReservationsTab;
	reloadFunctions[wiseMLXMLTabDivId]               = reloadWiseMLXMLTab;
	reloadFunctions[wiseMLJSONTabDivId]              = reloadWiseMLJSONTab;

	var self = this;
	$(window).bind('wisegui-navigation-event', function(e, navigationData) {
		if (navigationData.nav == 'overview' && navigationData.tab) {
			tabs.find('a[href="#'+navigationData.tab+'"]').tab('show');
			var reloadFunction = reloadFunctions[navigationData.tab];
			if (reloadFunction) {
				reloadFunction();
			}
		} else if (navigationData.nav == 'overview' && navigationData.tab == '') {
			reloadMapsTab();
		}
	});
	
	$(window).bind('wisegui-reservations-changed', function() {
		buildReservationTable(reservationsTabContentDiv);
	});
	
	$(window).bind('wisegui-logged-in', function() {
		myReservationsTab.show();
		buildMyReservationTable(myReservationsTabContentDiv);
	});
	
	$(window).bind('wisegui-logged-out', function() {
		myReservationsTab.hide();
		myReservationsTabContentDiv.empty();
	});

	$(window).bind('wisegui-reservations-changed', function() {
		if (isLoggedIn) {
			buildMyReservationTable(myReservationsTabContentDiv);
		}
	});
	
	if (testbedDescription.isFederator) {
		
		$(window).bind('wisegui-logged-in', function() {
			federatableReservationsTab.show();
			buildFederatableReservationTable(federatableReservationsTabContentDiv);
		});

		$(window).bind('wisegui-logged-out', function() {
			federatableReservationsTab.hide();
		});

		$(window).bind('wisegui-reservations-changed', function() {
			if (isLoggedIn) {
				buildFederatableReservationTable(federatableReservationsTabContentDiv);
			}
		});
	}

	tabs.find('a').click(function (e) {
	    e.preventDefault();
	    var navigationData = getNavigationData();
	    navigationData.tab = e.target.hash.substring(1);
	    window.location.hash = $.param(navigationData);
	});

	buildReservationTable(reservationsTabContentDiv);
	if (isLoggedIn) {
		buildFederatableReservationTable(federatableReservationsTabContentDiv);
	}
}

function buildFederatableReservationTable(tab) {
	wisebed.reservations.getFederatable(
			null,
			null,
			function(federatableReservations) { buildPersonalReservationsTable(tab, federatableReservations); },
			WiseGui.showAjaxError
	);
}

function buildMyReservationTable(parent) {
	wisebed.reservations.getPersonal(
			null,
			null,
			function(wisebedReservationList) {
				buildPersonalReservationsTable(parent, wisebedReservationList);
			},
			WiseGui.showAjaxError
	);
};

function buildPersonalReservationsTable(parent, reservations) {

	var tableHead = [
		{content: "From", style: "white-space: nowrap;"},
		{content: "Until", style: "white-space: nowrap;"},
		"Testbed Prefix(es)",
		{content: "Nodes", style: "white-space: nowrap;"},
		"Description",
		""
	];

	var tableRows = [];
	var nop = function(event){ event.preventDefault(); };
	var reservation, from, to, nodes, btn;

	for (var i=0; i<reservations.length; i++) {

		reservation = reservations[i];

		from  = $('<a href="#" rel="tooltip" title="'+reservation.from.toISOString()+'">' + reservation.from.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop);
		to    = $('<a href="#" rel="tooltip" title="'+reservation.to.toISOString()+'">' + reservation.to.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop);
		nodes = $('<a href="#" rel="tooltip" title="'+reservation.nodeUrns.join("<br/>")+'">'+ reservation.nodeUrns.length + ' nodes</a>').tooltip('show').click(nop);
		btn   = $('<a class="btn btn-primary">Open</a>').bind('click', reservation, function(e) {
			e.preventDefault();
			navigateTo(e.data.experimentId);
		});

		tableRows[i] = [];
		tableRows[i][0] = from;
		tableRows[i][1] = to;
		tableRows[i][2] = reservation.nodeUrnPrefixes.join("<br/>");
		tableRows[i][3] = nodes;
		tableRows[i][4] = reservation.description;
		tableRows[i][5] = btn;
	}

	var noEntriesMessage = 'No reservations available';
	var table = buildTable(tableHead, tableRows, noEntriesMessage);
	parent.empty();
	parent.append(table);
	if (tableRows.length > 0) {
		table.tablesorter({ sortList: [[0,1]] });
	}
}

function buildReservationTable(reservationsTab) {
	wisebed.reservations.getPublic(
			null,
			null,
			function(reservations) {

				var tableHead = [
					"From",
					"Until",
					"Testbed Prefix(es)",
					"Nodes"
				];

				var tableRows = [];
				var reservation;
				var nop = function(event){ event.preventDefault(); };
				var from, to, nodes;

				for (var i=0; i<reservations.length; i++) {

					reservation = reservations[i];
					from  = $('<a href="#" rel="tooltip" title="'+reservation.from.toISOString()+'">' + reservation.from.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop);
					to    = $('<a href="#" rel="tooltip" title="'+reservation.to.toISOString()+'">' + reservation.to.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop);
					nodes = $('<a href="#" rel="tooltip" title="'+reservation.nodeUrns.join("<br/>")+'">'+ reservation.nodeUrns.length + ' nodes</a>').tooltip('show').click(nop);

					tableRows[i]    = [];
					tableRows[i][0] = from;
					tableRows[i][1] = to;
					tableRows[i][2] = reservation.nodeUrnPrefixes.join("<br/>");
					tableRows[i][3] = nodes;
				}

				var noEntriesMessage = 'There are no reservations for the next week yet!';
				var table = buildTable(tableHead, tableRows, noEntriesMessage);
				reservationsTab.empty();
				reservationsTab.append(table);
				if (tableRows.length > 0) {
					table.tablesorter({ sortList: [[0,1]] });
				}
			},
			WiseGui.showAjaxError
	);
}


function buildTable(tableHead, tableRows, noEntriesMessage) {

	var table = $('<table class="table table-striped table-bordered"/>"');
	var thead = $('<thead/>');
	var theadRow = $('<tr/>');
	thead.append(theadRow);

	for (var i=0; i<tableHead.length; i++) {
		if (typeof tableHead[i] === 'object') {
			theadRow.append('<th style="'+tableHead[i].style+'">'+tableHead[i].content+'</th>');
		} else {
			theadRow.append('<th>'+tableHead[i]+'</th>');
		}
	}

	var tbody = $('<tbody/>');

	if(tableRows.length == 0 && noEntriesMessage) {
	    tbody.append('<tr><td colspan="'+tableHead.length+'">'+noEntriesMessage+'</td></tr>');
	}

	for (var k=0; k<tableRows.length; k++) {
		var row = $('<tr/>');
		tbody.append(row);
		for (var l=0; l<tableRows[k].length; l++) {
			var td = $(typeof tableHead[l] === 'object' ? '<td style="' + tableHead[l].style + '"/>' : '<td/>');
			row.append(td);
			td.append(tableRows[k][l]);
		}
	}

	table.append(thead, tbody);

	return table;
}

function loadExperimentContainer(navigationData, parentDiv) {

	wisebed.reservations.getByExperimentId(navigationData.experimentId, function(reservation) {

		var experimentationView = new WiseGuiExperimentationView(reservation);
		parentDiv.append(experimentationView.view);
		$(window).trigger('hashchange');

	}, WiseGui.showAjaxError);
}

function getNavigationKey(navigationData) {
	if (navigationData.nav == 'overview' && navigationData.experimentId == '') {
		return 'overview';
	} else if (navigationData.nav == 'experiment' && navigationData.experimentId != '') {
		return 'experimentId=' + navigationData.experimentId;
	}
	return undefined;
}

function getCreateContentFunction(navigationData) {
	if (navigationData.nav == 'overview' && navigationData.experimentId == '') {return loadTestbedDetailsContainer;}
	if (navigationData.nav == 'experiment' && navigationData.experimentId != '') {return loadExperimentContainer;}
	return undefined;
}

function showReservationsDialog() {
	var existingDialog = $("#WiseGuiReservationDialog");
	if (existingDialog.length != 0) {existingDialog.modal('show');}
	else {new WiseGuiReservationDialog();}
}

function navigateTo(experimentId, tab) {
	var navigationData = {
		nav          : (experimentId ? 'experiment' : 'overview'),
		experimentId : (experimentId || ''),
		tab          : (tab || '')
	};
	$.bbq.pushState(navigationData);
}

function getNavigationData(fragment) {

	var parsedFragment = $.deparam.fragment(fragment ? fragment : window.location.fragment);

	return {
		nav          : parsedFragment['nav']          || 'overview',
		experimentId : parsedFragment['experimentId'] || '',
		tab          : parsedFragment['tab']          || ''
	};
}

function createNavigationContainer() {

	var container = $('<div class="WiseGuiNavigationContainer" id="WiseGuiNavigationContainer"/>');
	
	$('#WiseGuiContainer .WiseGuiNotificationsContainer').before(container);

	var navigationViewer = new WiseGuiNavigationViewer();
	container.append(navigationViewer.view);
	return container;
}

function switchContentContainer(navigationData, navigationKey) {
	$('#WiseGuiContainer .WiseGuiContentContainer').hide();
	getOrCreateContentContainer(navigationData, navigationKey).show();
}

function getOrCreateContentContainer(navigationData, navigationKey) {
	
	if (contentContainers[navigationKey]) {
		return contentContainers[navigationKey];
	}

	var container = createContentContainer(navigationData);
	contentContainers[navigationKey] = container;
	return container;
}

function createContentContainer(navigationData) {
	
	var container = $('<div class="WiseGuiContentContainer"/>');
	container.hide();

	$('#WiseGuiContainer .WiseGuiNotificationsContainer').after(container);

	var createContentFunction = getCreateContentFunction(navigationData);
	if (createContentFunction === undefined) {
		console.warn("createContentFunction is undefined");
		console.warn(navigationData);
	} else {
		createContentFunction(navigationData, container);
	}

	return container;
}


function onHashChange(e) {

	var navigationData = getNavigationData(e.fragment);
	var navigationKey  = getNavigationKey(navigationData);

	switchContentContainer(navigationData, navigationKey);

	$(window).trigger('wisegui-navigation-event', navigationData);
}

var wisebed              = new Wisebed(wisebedBaseUrl, wisebedWebSocketBaseUrl);

var navigationContainer  = undefined;
var contentContainers    = {};

var loginObserver        = new WiseGuiLoginObserver();
var reservationObserver  = new WiseGuiReservationObserver();
var notificationsViewer  = new WiseGuiNotificationsViewer();

var testbedDescription   = null;
var eventWebSocket       = undefined;
var isLoggedIn           = false;

$(function () {

	$('#WiseGuiContainer').append(notificationsViewer.view);
	$('.modal').modal({ keyboard: true });

	$(window).bind('wisegui-logged-in', function()  { isLoggedIn = true;  });
	$(window).bind('wisegui-logged-out', function() { isLoggedIn = false; });

	if (eventWebSocket === undefined) {
		eventWebSocket = new wisebed.EventWebSocket(
			function(devicesAttachedEvent) {$(window).trigger('wisegui-devices-attached-event', devicesAttachedEvent);},
			function(devicesDetachedEvent) {$(window).trigger('wisegui-devices-detached-event', devicesDetachedEvent);},
			function() { console.log('EventWebSocket connection established'); },
			function() { console.log('EventWebSocket connection closed'); eventWebSocket = undefined; }
		);
	}

	wisebed.getTestbedDescription(
		function(td) {

			testbedDescription = td;

			navigationContainer = createNavigationContainer();

			var navigationData = {nav:'overview', experimentId:'', tab:''};
			getOrCreateContentContainer(navigationData, getNavigationKey(navigationData));

			reservationObserver.startObserving();
			loginObserver.startObserving();

			$(window).bind('hashchange', onHashChange);
			$(window).trigger('hashchange');

			// Test for 3rd party cookies
			var cookieCallbackError = function(jqXHR, textStatus, errorThrown) {
				WiseGui.showErrorAlert(
						'Your browser doesn\'t support 3rd party cookies. '
						+ 'Please enable them or you will not be able to login. '
						+ 'Otherwise you can go to <a href="' + wisebedBaseUrl + '">' + wisebedBaseUrl + '</a>');
			};
			wisebed.testCookie(function() {}, cookieCallbackError);
		},
		WiseGui.showAjaxError
	);
});
