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
		var message = $('<h2>Error while loading data!</h2>'
				+ '<h3>jqXHR</h3>'
				+ '<pre>'+JSON.stringify(jqXHR, null, '  ')+'</pre>'
				+ '<h3>textStatus</h3>'
				+ '<pre>'+textStatus+'</pre>'
				+ '<h3>errorThrown</h3>'
				+ '<pre>'+errorThrown+'</pre>');
		self.showErrorBlockAlert(message);
	};
};

var WiseGuiNavigationViewer = function(navigationData) {

	this.navigationData       = navigationData;

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

WiseGuiNavigationViewer.prototype.buildViewForTestbed = function() {

	// create all buttons and attach them
	this.primaryMenu.append(
			  '<li class="WiseGuiNavBackButton"><a href="#">Back</a></li>'
	);

	this.backButtonLi         = this.primaryMenu.find('li.WiseGuiNavBackButton').first();
	this.backButton           = this.backButtonLi.find('a').first();
	this.experimentDropDown   = new WiseGuiExperimentDropDown(this.navigationData.testbedId);
	this.primaryMenu.append(this.experimentDropDown.view);

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
	this.experimentDropDown.view.hide();
	this.loginButtonLi.hide();
	this.logoutButtonLi.hide();
	this.reservationsButtonLi.hide();

	// bind actions to buttons
	var self = this;

	this.backButton.bind('click', function(e) {
		e.preventDefault();
		if (self.navigationData.experimentId) {
			navigateTo(self.navigationData.testbedId);
		} else {
			navigateTo();
		}
	});

	this.reservationsButton.bind('click', function(e) {
		e.preventDefault();
		showReservationsDialog(self.navigationData.testbedId);
	});

	this.logoutButton.bind('click', function(e) {
		e.preventDefault();
		getLoginDialog(self.navigationData.testbedId).doLogout();
	});

	this.loginButton.bind('click', function(e) {
		e.preventDefault();
		getLoginDialog(self.navigationData.testbedId).show();
	});

	// bind to login and logout events
	$(window).bind('wisegui-logged-in', function(e, data) {
		if (data.testbedId == self.navigationData.testbedId) {
			self.onLoggedInEvent();
		}
	});

	$(window).bind('wisegui-logged-out', function(e, data) {
		if (data.testbedId == self.navigationData.testbedId) {
			self.stopObservationOf();
		}
	});
};

WiseGuiNavigationViewer.prototype.onLoggedInEvent = function() {
	this.loginButtonLi.hide();
	this.logoutButtonLi.show();
	this.reservationsButtonLi.show();
	this.experimentDropDown.view.show();
};

WiseGuiNavigationViewer.prototype.stopObservationOf = function() {
	this.loginButtonLi.show();
	this.logoutButtonLi.hide();
	this.reservationsButtonLi.hide();
	this.experimentDropDown.view.hide();
};

WiseGuiNavigationViewer.prototype.buildViewForTestbedOverview = function() {
	this.primaryMenu.append('<li class="active"><a href="#nav=overview">Testbed Overview</a></li>');
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
			+ ' 		<h1>About</h1>'
			+ '		</div>'
			+ '		<div class="modal-body">'
			+ '			This is an open-source project published under the terms of the BSD license.<br/>'
			+ ' 		The sources are freely available from'
			+ '			<a href="https://github.com/wisebed/rest-ws" target="_blank">github.com/wisebed/rest-ws</a>'
			+ ' 		and'
			+ '			<a href="https://github.com/wisebed/wisegui" target="_blank">github.com/wisebed/wisegui</a>'			
			+ ' 		<br/>'
			+ ' 		<br/>'
			+ '			&copy; <a href="http://www.itm.uni-luebeck.de/people/bimschas/" target="_blank">Daniel Bimschas</a>,'
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

	if (this.navigationData.nav == 'overview') {
		this.buildViewForTestbedOverview();
	} else if (this.navigationData.nav == 'testbed') {
		this.buildViewForTestbed();
	}

};

/**
 * #################################################################
 * WiseGuiLoginObserver
 * #################################################################
 *
 * Listens to WiseGui events 'wisegui-logged-in' and 'wisegui-logged-out'. The
 * former carries an object
 *  { testbedId : "uzl", loginData : { authenticationData : [ { urnPrefix :
 * 'urn:wisebed:uzl1:', username : 'bla', password : 'blub' } ] } }
 */
var WiseGuiLoginObserver = function() {
	this.isObserving = false;
	this.loginData   = {};
	this.schedules   = {};
	this.interval    = 10 * 60 * 1000;
};

WiseGuiLoginObserver.prototype.renewLogin = function(testbedId) {

	console.log('WiseGuiLoginObserver trying to renew login for ' + testbedId);

	var self = this;
	Wisebed.login(
			testbedId,
			this.loginData[testbedId],
			function(){
				console.log('WiseGuiLoginObserver successfully renewed login for ' + testbedId);
			},
			function(jqXHR, textStatus, errorThrown) {
				console.log('WiseGuiLoginObserver failed renewing login for ' + testbedId);
				self.stopObservationOf(testbedId);
				WiseGui.showAjaxError();
			}
	);
};

WiseGuiLoginObserver.prototype.startObservationOf = function(testbedId, loginData) {

	console.log('WiseGuiLoginObserver starting observation of testbed ' + testbedId);

	var self = this;
	this.loginData[testbedId] = loginData;
	this.schedules[testbedId] = window.setInterval(
			function() { self.renewLogin(testbedId); },
			self.interval
	);
};

WiseGuiLoginObserver.prototype.stopObservationOf = function(testbedId) {

	if (this.schedules[testbedId]) {

		console.log('WiseGuiLoginObserver stopping observation of testbed ' + testbedId);
		window.clearInterval(this.schedules[testbedId]);
		delete this.schedules[testbedId];
	}
};

WiseGuiLoginObserver.prototype.startObserving = function() {

	this.isObserving = true;

	var self = this;

	$(window).bind('wisegui-logged-in', function(e, data) {
		if (data.loginData) {
			self.startObservationOf(data.testbedId, data.loginData);
		}
	});

	$(window).bind('wisegui-logged-out', function(e, data) { self.stopObservationOf(data); });

	$(window).bind('wisegui-navigation-event', function(e, data) {
		if (data.testbedId) {
			getLoginDialog(data.testbedId).isLoggedIn(function(isLoggedIn) {
				if (isLoggedIn) {
					$(window).trigger('wisegui-logged-in', {testbedId:data.testbedId});
				} else {
					$(window).trigger('wisegui-logged-out', {testbedId:data.testbedId});
				}
			});
		}
	});
};

WiseGuiLoginObserver.prototype.stopObserving = function() {

	this.isObserving = false;

	$(this.schedules, function(testbedId, schedule) {
		window.clearInterval(schedule);
	});
	this.schedules = {};

	console.log('LoginObserver stopped observing');
};


/**
 * #################################################################
 * WiseGuiLoadConfigurationDialog
 * #################################################################
 */

var WiseGuiLoadConfigurationDialog = function(testbedId, callback) {

	this.testbedId = testbedId;
	this.callback = callback;
	this.table = null;
	this.view = $('<div id="WisebedLoadDialog-'+this.testbedId+'" class="modal hide"></div>');
	this.buildView();
	this.show();
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

	var that = this;

	function errorHandling(error) {
		okButton.removeAttr("disabled");
		cancelButton.removeAttr("disabled");

		var val = dialogBody.find("input:checked").val();
		if(val == "url") {
			input_url.addClass("error");
		} else if (val == "file") {
			input_file.addClass("error");
		}
		alert(error);
	}

	function callCallback(data) {
		if(data.configurations != null) {
			if(typeof(that.callback) == "function") {
				that.hide();
				that.callback(data.configurations);
			} else {
				errorHandling("No configurations available in the file.");
			}
		} else {
			errorHandling("Configuration is null");
		}
	}

	function loadFromURL() {

		var callbackError = function(jqXHR, textStatus, errorThrown) {
			errorHandling("Configuration error: " + jqXHR.responseText);
		};

		var callbackDone = function(data, textStatus, jqXHR) {
			callCallback(data);
		};

		Wisebed.experiments.getConfiguration($.trim(input_url.val()), callbackDone.bind(that), callbackError.bind(that));
	}

	function loadFromFile() {

		var that = this;

		// TODO: Why does jQuery not work here?
		// var files = input_file.attr('files');
		// var f = input_file.files[0];
		var files = document.getElementById('input_file_' + that.testbedId).files;
		var f = files[0];

		if(f != "") {
			var fr = new FileReader();
			fr.onloadend = function(progressEvent) {
				try {
					var data = JSON.parse(fr.result);
					that.hide();
					callCallback(data);
				} catch(e) {
					errorHandling("Error:" + e);
				}
			};
			fr.readAsText(f);
		} else {
			errorHandling("No file choosen");
		}
	}
	/*
	 * Header
	 */
	var dialogHeader = $('<div class="modal-header"><h3>Load a configuration for Testbed ' + this.testbedId + '</h3></div>');

	/*
	 * Body
	 */
	var dialogBody = $('<div class="modal-body" style="height:70px;overflow:auto;padding:5px"/>');

	// var url =
	// "?url=http://wisebed.eu/experiments/iseraerial/iseraerial.json";
	var url = "";

	var label_url = $('<label for="type_url_' + this.testbedId + '" style="width:50px;">URL:</label>');
	var input_checkbox_url  = $('<input style="margin:9px 5px 0px 5px;" type="radio" name="type_' + this.testbedId + '" id="type_url_' + this.testbedId + '" value="url" checked>');
	var input_url = $('<input type="text" value="' + url + '" id="input_url_' + this.testbedId + '" style="width:600px"/>');

	var label_file = $('<label for="type_file_' + this.testbedId + '" style="width:50px;">File:</label>');
	var input_checkbox_file = $('<input style="margin:9px 5px 0px 5px;" type="radio" name="type_' + this.testbedId + '" id="type_file_' + this.testbedId + '"value="file">');
	var input_file = $('<input type="file" id="input_file_' + this.testbedId + '"/>');

	input_url.focusin(
		function() {
			input_checkbox_file.attr('checked', false);
			input_checkbox_url.attr('checked', true);
		}
	);

	input_file.focusin(
		function() {
			input_checkbox_url.attr('checked', false);
			input_checkbox_file.attr('checked', true);
		}
	);



	dialogBody.append(input_checkbox_url, label_url, input_url, $("<br>"), input_checkbox_file, label_file, input_file);

	/*
	 * Footer
	 */
	var dialogFooter = $('<div class="modal-footer"/>');

	var okButton = $('<input class="btn btn-primary" value="Load" style="width:35px;text-align:center;">');
	var cancelButton = $('<input class="btn" value="Cancel" style="width:45px;text-align:center;">');
	okButton.bind('click', this, function(e) {
		okButton.attr("disabled", "true");
		cancelButton.attr("disabled", "true");

		// Check, which radio button is uses

		var val = dialogBody.find("input:checked").val();
		if(val == "url") {
			loadFromURL.bind(that)();
		} else if (val == "file") {
			loadFromFile.bind(that)();
		}
	});

	cancelButton.bind('click', this, function(e) {
		that.callback(null);
		e.data.hide();
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

var WiseGuiReservationDialog = function(testbedId) {
	this.testbedId = testbedId;
	this.table = null;
	this.view = $('<div id="WisebedReservationDialog-'+this.testbedId+'" class="modal hide reservation"></div>');
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

	var dialogHeader = $('<div class="modal-header"><h3>Make a reservation for Testbed ' + this.testbedId + '</h3></div>');

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
	var input_date_start = $('<input type="text" value="' + date_start + '" id="input_date_start_'+this.testbedId+'" style="width:75px"/>');
	var input_time_start = $('<input type="text" value="' + time_start + '" id="input_time_start_'+this.testbedId+'" style="width:40px"/>');
	var input_date_end =   $('<input type="text" value="' + date_end + '" id="input_date_end__'+this.testbedId+'" style="width:75px"/>');
	var input_time_end =   $('<input type="text" value="' + time_end + '" id="input_time_end_'+this.testbedId+'" style="width:40px"/>');
	var input_desciption = $('<input type="text" id="description_'+this.testbedId+'" style="width:330px"/>');

	var p_nodes = $("<p></p>");

	var tabs = $('<ul class="nav nav-tabs">'
			+ '	<li class="active"><a href="#WisebedTestbedMakeReservationList" data-toggle="tab">List</a></li>'
			+ '	<li><a href="#WisebedTestbedMakeReservationMap" data-toggle="tab">Map</a></li>'
			+ '</ul>'
			+ '<div class="tab-content">'
			+ '	<div class="tab-pane active" id="WisebedTestbedMakeReservationList"></div>'
			+ '	<div class="tab-pane" id="WisebedTestbedMakeReservationMap"></div>'
			+ '</div>');	
	
	tabs.find('#WisebedTestbedMakeReservationList').append(p_nodes);

	var showTable = function (wiseML) {
		that.table = new WiseGuiNodeTable(wiseML, p_nodes, true, true);
	};
	
	var createMap = function() {
		Wisebed.getWiseMLAsJSON(that.testbedId, null, showMap,
				function(jqXHR, textStatus, errorThrown) {
					console.log('TODO handle error in WiseGuiReservationDialog');
					WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
				}
		);
	}

	Wisebed.getWiseMLAsJSON(this.testbedId, null, showTable,
			function(jqXHR, textStatus, errorThrown) {
				console.log('TODO handle error in WiseGuiReservationDialog');
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}, createMap
	);

	 //Show specialized google map for reservation 
	var showMap = function(wiseML){
		var wiseMlParser = new WiseMLParser(wiseML, tabs.find('#WisebedTestbedMakeReservationMap'));
		wiseMlParser.map.enableKeyDragZoom();
		wiseMlParser.map.selectedURNs = [];
		that.wiseMlParser = wiseMlParser;
		
		$.each(wiseMlParser.markersArray, function (index, marker) {
			
		google.maps.event.clearListeners(marker, 'click');
		google.maps.event.addListener(marker, 'click', function (){
			 if(marker.getIcon().url == 'img/node.png'){
				 wiseMlParser.map.selectURNs([marker.urn]);
			 }else{
				 wiseMlParser.map.selectURNs([marker.urn], true);
			 }
		     var selectedFun =function(data) {
					var nodeids = wiseMlParser.map.selectedURNs;
					for(var i = 0; i < nodeids.length; i++) {
						if(data.id == nodeids[i]) return true;
					}
					return false;
				};
	            
	           that.table.applySelected(selectedFun);
		});
		

        });
		
		wiseMlParser.map.selectURNs = function(urns, deselect){
			var image;
			if(!deselect){ 
				image = new google.maps.MarkerImage(
						'img/node_selected.png',
		      			  new google.maps.Size(25,19),
		      			  new google.maps.Point(0,0),
		      			  new google.maps.Point(13,19)
		      			);
			}else{
				image = new google.maps.MarkerImage(
		      			  'img/node.png',
		      			  new google.maps.Size(25,19),
		      			  new google.maps.Point(0,0),
		      			  new google.maps.Point(13,19)
		      			);
			}
			
			//loop over markers and set new image
			$.each(wiseMlParser.markersArray, function (index, marker) {
				if(urns.indexOf(marker.urn)>-1)
                    marker.setIcon(image);
            });
			
			//loop over selected urns and insert them to model if necessary
			$.each(urns, function(index, urn){
				var index = wiseMlParser.map.selectedURNs.indexOf(urn);
					if(index==-1){
						if(!deselect){
							wiseMlParser.map.selectedURNs.push(urn);
						}else{
							wiseMlParser.map.selectedURNs.splice(index,1);
						}
					}else{
						if(deselect) wiseMlParser.map.selectedURNs.splice(index,1);
					}	
			});
		};
		

		//Filter out all markers but the ones with the urns given
		wiseMlParser.map.filter = function(urns){
			//loop over markers and set new image
			var markersArray = wiseMlParser.markersArray;
			$.each(markersArray, function (index, marker) {
				if(urns.indexOf(marker.urn)==-1){
		            marker.setMap(null);
				}else{
					marker.setMap(wiseMlParser.map);
				}
		    });
		};
		
		that.table.table.addSelectionListener(wiseMlParser.map.selectURNs);
		that.table.table.addFilterListener(wiseMlParser.map.filter);
		
		var dz = wiseMlParser.map.getDragZoomObject();
		
		google.maps.event.addListener(dz, 'dragend', function(bounds) {       
            var selectedURNs = [];
            var deselectedURNs = [];
            
            // get nodes that have been (de-)selected
            $.each(wiseMlParser.markersArray, function (index, marker) {
                if (bounds.contains(marker.getPosition()) && marker.getMap() != null) {
                    if(marker.getIcon().url == 'img/node.png'){
                    selectedURNs.push(marker.urn);
                    }else{
                    	deselectedURNs.push(marker.urn);
                    }
                }
            });
            
            // update the map
            wiseMlParser.map.selectURNs(selectedURNs);
            wiseMlParser.map.selectURNs(deselectedURNs, true);
            
            
            //remove all deselected nodes
            wiseMlParser.map.selectedURNs = wiseMlParser.map.selectedURNs.diff(deselectedURNs);
            //update selection in table
            var selectedFun =function(data) {
				var nodeids = wiseMlParser.map.selectedURNs;
				for(var i = 0; i < nodeids.length; i++) {
					if(data.id == nodeids[i]) return true;
				}
				return false;
			};
            
           that.table.applySelected(selectedFun);
    });
		
		tabs.find('li a[href=#WisebedTestbedMakeReservationMap]').on('shown', function(e) {
			google.maps.event.trigger(that.wiseMlParser.map, 'resize');
			that.wiseMlParser.setBounds();
		});
	};

	tabs.find('#WisebedTestbedMakeReservationMap').append("<h4>Click on single nodes or Shift+Click for bounding box</h4>");

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

    var showError = function (msg) {
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
			showError("Start date incorrect.");
			return;
		} else if (dateEnd.length != 3) {
			input_date_end.addClass("error");
			showError("End date incorrect.");
			return;
		} else if (timeStart.length != 2) {
			input_time_start.addClass("error");
			showError("Start time incorrect.");
			return;
		} else if (timeEnd.length != 2){
			input_time_end.addClass("error");
			showError("End time incorrect.");
			return;
		}

		var from = new Date(dateStart[2], dateStart[1]-1, dateStart[0], timeStart[0], timeStart[1], 0);
		var to = new Date(dateEnd[2], dateEnd[1]-1, dateEnd[0], timeEnd[0], timeEnd[1], 0);

		if(to <= from) {
			input_date_start.addClass("error");
			input_date_end.addClass("error");
			input_time_start.addClass("error");
			input_time_end.addClass("error");
			showError("End date must after the start date.");
			return;
		} else if(nodes.length <= 0) {
			showError("You must select at least one node");
			return;
		}

		var callbackError = function(jqXHR, textStatus, errorThrown) {
			showError(jqXHR.responseText);
		};

		var callbackDone = function() {

			okButton.removeAttr("disabled");
			cancelButton.removeAttr("disabled");

			that.hide();
			// Refresh the experiments tab in the menu
			$(window).trigger('wisegui-navigation-event', getNavigationData());
			// Refresh the reservation table
			$(window).trigger('wisegui-reservation-table-' + that.testbedId);
		};

		Wisebed.reservations.make(
			that.testbedId,
			from,
			to,
			input_desciption.val(),
			nodes,
			callbackDone,
			callbackError);
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
var WiseGuiLoginDialog = function(testbedId) {

	this.testbedId = testbedId;
	this.loginFormRows = [];
	this.loginData = { authenticationData : [] };

	this.view = $('<div id="WisebedLoginDialog-'+this.testbedId+'" class="modal hide"></div>');
	$(document.body).append(this.view);

	this.okButton = null;
	this.cancelButton = null;

	var self = this;
	Wisebed.getTestbeds(function(testbeds){self.buildView(testbeds);}, WiseGui.showAjaxError);
};

WiseGuiLoginDialog.prototype.doLogin = function() {

	var self = this;

	var callbackError = function(jqXHR, textStatus, errorThrown) {
		if (jqXHR.status == 403) {
			self.onLoginError();
		} else {
			console.log(jqXHR);
			WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
		}
	};

	var callbackDone = function() {
		self.onLoginSuccess();
		window.setTimeout(function() {self.hide();}, 1000);
		$(window).trigger('wisegui-logged-in', {testbedId : self.testbedId, loginData : self.loginData});
		$(window).trigger('hashchange');
	};

	Wisebed.login(self.testbedId, self.loginData, callbackDone, callbackError);
};

WiseGuiLoginDialog.prototype.onLoginError = function() {

	var that = this;

	$.each(this.loginFormRows, function(index, elem) {
		$(elem.inputUsername).removeClass('success');
		$(elem.inputPassword).removeClass('success');
		$(elem.inputUsername).addClass('error');
		$(elem.inputPassword).addClass('error');
		that.okButton.removeAttr("disabled");
		that.cancelButton.removeAttr("disabled");
	});
};

WiseGuiLoginDialog.prototype.onLoginSuccess = function() {
	$.each(this.loginFormRows, function(index, elem) {
		$(elem.inputUsername).removeClass('error');
		$(elem.inputPassword).removeClass('error');
		$(elem.inputUsername).addClass('success');
		$(elem.inputPassword).addClass('success');
	});
};

WiseGuiLoginDialog.prototype.isLoggedIn = function(callback) {
	Wisebed.isLoggedIn(this.testbedId, callback, WiseGui.showAjaxError);
};

WiseGuiLoginDialog.prototype.doLogout = function() {

	var that = this;

	var callbackOK = function() {
		delete loginDialogs[that.testbedId];
		$(window).trigger('wisegui-logged-out', {testbedId : that.testbedId});
		$('#WisebedLoginDialog-'+this.testbedId).remove();
	};

	var callbackError = function(jqXHR, textStatus, errorThrown) {
		WiseGui.showErrorAlert("Logout failed.");
	};

	Wisebed.logout(this.testbedId, callbackOK, callbackError);
	
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

WiseGuiLoginDialog.prototype.buildView = function(testbeds) {

	var that = this;

	var dialogHeader = $('<div class="modal-header"><h3>Login to Testbed "' + testbeds.testbedMap[this.testbedId].name + '"</h3></div>');

	var dialogBody = $('<div class="modal-body WiseGuiLoginDialog"/>'
			+ '		<form id="WisebedLoginDialogForm-'+this.testbedId+'">'
			+ '		<table class="table" id="WisebedLoginDialogFormTable-'+this.testbedId+'">'
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

	var loginFormTableBody = this.view.find('#WisebedLoginDialogFormTable-'+this.testbedId+' tbody');
	var urnPrefixes = testbeds.testbedMap[this.testbedId].urnPrefixes;

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

WiseGuiLoginDialog.prototype.startLogin= function(testbeds) {
	this.okButton.attr("disabled", "true");
	this.cancelButton.attr("disabled", "true");

	if(this.storeCredentials_checkbox[0].checked){
		for (var i=0; i<this.loginFormRows.length; i++) {
			localStorage[this.loginFormRows[i].inputUrnPrefix.value+'_user'] = this.loginFormRows[i].inputUsername.value;
			localStorage[this.loginFormRows[i].inputUrnPrefix.value+'_pass'] = this.loginFormRows[i].inputPassword.value;
			}
	}else{
		for (var i=0; i<this.loginFormRows.length; i++) {
			localStorage.removeItem(this.loginFormRows[i].inputUrnPrefix.value+'_user');
			localStorage.removeItem(this.loginFormRows[i].inputUrnPrefix.value+'_pass');
			}

	}
	this.updateLoginDataFromForm();
	this.doLogin();
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
 * showCheckBoxes: true | false showFiterBox: true | false
 */
var Table = function (model, headers, rowProducer, preFilterFun, preSelectFun, showCheckBoxes, showFiterBox) {
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
	this.dataArray = [];

	this.filter_input = null;
	this.input_checkbox_th = null;

	if(showFiterBox) {
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
	img_help.attr("src", wisebedBaseUrl + "/img/famfamfam/help.png");

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
		helpText += "<pre style=\"overflow:auto;height:50px;margin:0px;\">" + JSON.stringify(this.model[0], null, '  ') + "</pre>";
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
			sortList: [[1,0]]
		});
	} else {
		this.table.tablesorter({sortList: [[0,0]]});
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
	var header = ['Node URN','Type','Position','Sensors'];

	// The row producer gived something like
	// ["id", "type", "(x,y,z)", "a,b,c"]
	var rowProducer = function (n) {
		var cap = [];
		if(n.capability != null) {
			for(var j = 0; j < n.capability.length; j++) {
				parts = explode(":", n.capability[j].name);
				cap[j] = parts[parts.length-1];
			}
		}
		data = [];
		data.push(n.id);
		data.push(n.nodeType);
		if(n.position != null) {
			data.push('(' + n.position.x + ',' + n.position.y + ',' + n.position.z + ')');
		} else {
			data.push('null');
		}
		if(cap.length > 0) {
			data.push(implode(",", cap));
		} else {
			data.push("null");
		}
		return data;
	};

	// Use the usual table
	var t = new Table (this.wiseML.setup.node, header, rowProducer, null, null, this.showCheckboxes, this.showFilter);
	this.table = t;

	// This vars stores the predefined filters
	var predefinied_filter_types = [];
	var predefinied_filter_functions = [];

	// Add type filters
	$(this.wiseML.setup.node).each(
		function() {
			var t = this.nodeType;
			var text = "Only nodes of type " + t;
			if($.inArray(text, predefinied_filter_types) < 0) {
				predefinied_filter_types.push(text);
				var fn = function(e) {
					return e.nodeType == t;
				};
				predefinied_filter_functions.push(fn);
			}
		}
	);

	// Other filters can be added here

	// Here the select will be generated
	var select = $('<select style="width:39%;background-color:#FFF;margin-left:1px;vertical-align:bottom;height:28px;"></select>');
	select.change(
		function () {
			var idx = parseInt($(this).val());
			var fn = predefinied_filter_functions[idx];
			that.table.setFilterFun(fn);
		}
	);

	var option = $('<option value="">Nodes of every type</option>');
	select.append(option);

	var index = 0;
	$(predefinied_filter_types).each(
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
	this.lastKnownReservations = {};
	this.isObserving           = false;
	this.schedules             = {};
};

WiseGuiReservationObserver.prototype.fetchReservationsAndProcess = function(testbedId) {
	var self = this;
	Wisebed.reservations.getPersonal(
			testbedId,
			null,
			null,
			function(reservations) {self.processReservationsFetched(testbedId, reservations.reservations);},
			null
	);
};

WiseGuiReservationObserver.prototype.processReservationsFetched = function(testbedId, reservations) {

	var newReservations = [];

	for (var i=0; i<reservations.length; i++) {

		var knownReservation = false;

		if (!this.lastKnownReservations[testbedId]) {
			this.lastKnownReservations[testbedId] = [];
		}

		for (var j=0; j<this.lastKnownReservations[testbedId].length; j++) {
			if (Wisebed.reservations.equals(reservations[i], this.lastKnownReservations[testbedId][j])) {
				knownReservation = true;
				break;
			}
		}

		if (!knownReservation) {
			newReservations.push(reservations[i]);
		}
	}

	if (newReservations.length > 0) {
		$(window).trigger('wisegui-reservations-changed-'+testbedId, {reservations:reservations});
	}

	for (var k=0; k<newReservations.length; k++) {

		$(window).trigger('wisegui-reservation-added-'+testbedId, newReservations[k]);

		// schedule events for reservation started and ended in order to e.g.
		// display user notifications
		var nowInMillis = new Date().valueOf();
		if (nowInMillis < newReservations[k].from) {

			var triggerReservationStarted = (function(reservation) {
				return function() {$(window).trigger('wisegui-reservation-started-'+testbedId, reservation);};
			})(newReservations[k]);

			setTimeout(triggerReservationStarted, (newReservations[k].from - nowInMillis));
		}

		if (nowInMillis < newReservations[k].to) {

			var triggerReservationEnded = (function(reservation) {
				return function() {$(window).trigger('wisegui-reservation-ended-'+testbedId, reservation);};
			})(newReservations[k]);

			setTimeout(triggerReservationEnded, (newReservations[k].to - nowInMillis));
		}

		this.lastKnownReservations[testbedId].push(newReservations[k]);
	}
};

WiseGuiReservationObserver.prototype.startObserving = function() {

	var self = this;

	$(window).bind('wisegui-logged-in', function(e, data) {
		self.startObservationOf(data.testbedId);
	});

	$(window).bind('wisegui-logged-out', function(e, data) {
		self.stopObservationOf(data.testbedId);
	});
};

WiseGuiReservationObserver.prototype.stopObserving = function() {

	var self = this;
	$.each(this.schedules, function(testbedId, schedule) { self.stopObservationOf(testbedId);});

	console.log('WiseGuiReservationObserver stopped observing');
};
WiseGuiReservationObserver.prototype.startObservationOf = function(testbedId) {
	var self = this;
	this.schedules[testbedId] = window.setInterval(function() {self.fetchReservationsAndProcess(testbedId);}, 60 * 1000);
	this.fetchReservationsAndProcess(testbedId);
	console.log('WiseGuiReservationObserver beginning to observe reservations for testbedId "'+testbedId+'"');
};

WiseGuiReservationObserver.prototype.stopObservationOf = function(testbedId) {
	if (this.schedules[testbedId]) {
		window.clearInterval(this.schedules[testbedId]);
		delete this.schedules[testbedId];
		console.log('WiseGuiReservationObserver stopped to observe reservations for testbedId "'+testbedId+'"');
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
						  'badge-info'
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
	var alertDiv = $('<div class="alert alert-'+alert.severity+'">'
			+ '<button class="close" data-dismiss="alert">&times;</button>'
			+ '</div>');
	alertDiv.append(alert.message);
	this.history.append(alertDiv);
	this.flash(alertDiv.clone());
};

WiseGuiNotificationsViewer.prototype.showBlockAlert = function(alert) {
	var blockAlertDiv = $('<div class="alert block-message alert-'+alert.severity+'">'
			+ '	<button class="close" data-dismiss="alert">x</button>'
			+ '	<div class="alert-actions">'
			+ '	</div>'
			+ '</div>');
	if (alert.message instanceof Array) {
		for (var i=0; i<alert.message.length; i++) {
			blockAlertDiv.append(alert.message[i]);
		}
	} else {
		blockAlertDiv.append(alert.message);
	}
	var actionsDiv = blockAlertDiv.find('.alert-actions');
	if (alert.actions) {
		for (var i=0; i<alert.actions.length; i++) {
			actionsDiv.append(alert.actions[i]);
			actionsDiv.append(' ');
		}
	}
	var flashDiv = $('<div class="alert alert-'+alert.severity+'">New Block Alert. Click there &#8594;</div>');
	this.flash(flashDiv);
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
 * WiseGuiExperimentDropDown
 * #################################################################
 *
 * Consumes wisegui events of type 'wisegui-reservation-ended',
 * 'wisegui-reservation-started', 'wisegui-reservation-added'.
 *
 */

var WiseGuiExperimentDropDown = function(testbedId) {

	this.testbedId = testbedId;
	this.view = null;

	var self = this;

	$(window).bind('wisegui-reservations-changed-'+testbedId, function(e, reservations) {
		self.onReservationsChangedEvent(reservations.reservations);
	});

	$(window).bind('wisegui-navigation-event', function(e, navigationData) {

		var sameTestbedId = navigationData.testbedId == self.testbedId;
		if (sameTestbedId) {
			getLoginDialog(self.testbedId).isLoggedIn(function(isLoggedIn) {
				if (isLoggedIn) {
					self.update();
				}
			});
		}
	});

	this.buildView();
};

WiseGuiExperimentDropDown.prototype.update = function() {
	var self = this;
	Wisebed.reservations.getPersonal(this.testbedId, null, null, function(reservations) {
		self.onReservationsChangedEvent(reservations.reservations);
	});
};

WiseGuiExperimentDropDown.prototype.onReservationsChangedEvent = function(reservations) {

	// this.view.find('.dropdown-menu li').remove();
	var menu = this.view.find('.dropdown-menu');
	menu.empty();

	for (var i=0; i<reservations.length; i++) {

		var reservation = reservations[i];

		var dateNow = new Date();
		var dateFrom = new Date(reservation.from);
		var dateTo = new Date(reservation.to);

		var fromStr = $.format.date(dateFrom, "yyyy-MM-dd HH:mm");
		var toStr = $.format.date(dateTo, "yyyy-MM-dd HH:mm");

		// Skip old reservations
		if(dateTo < dateNow) continue;

		var li = $('<li><a href="#">' + fromStr + ' - ' + toStr + ' | ' + reservation.userData + '</a></li>');
		var self = this;
		li.find('a').bind('click', reservation, function(e) {
			e.preventDefault();
			navigateToExperiment(self.testbedId, e.data);
		});

		menu.append(li);
	}

	if(menu.children().length == 0) {
		var li = $('<li style="padding:4px 15px">No reservations available</li>');
		this.view.find('.dropdown-menu').append(li);
		return;
	}

};

WiseGuiExperimentDropDown.prototype.buildView = function() {
	this.view = $('<li class="dropdown">'
			+ '	<a href="#" class="dropdown-toggle" data-toggle="dropdown">My Reservations</a>'
			+ '	<ul class="dropdown-menu">'
			+ '	</ul>'
			+ '</li>');

	var li = $('<li style="padding:4px 15px">No reservations available</li>');
	this.view.find('.dropdown-menu').append(li);
};

/**
 * #################################################################
 * WiseGuiNodeSelectionDialog
 * #################################################################
 */

var WiseGuiNodeSelectionDialog = function(testbedId, experimentId, headerHtml, bodyHtml, preSelected) {

	this.testbedId = testbedId;
	this.experimentId = experimentId;
	this.table = null;

	this.preSelected = preSelected;

	this.dialogDivId = 'WiseGuiNodeSelectionDialog-' + Math.random();

	this.dialogDiv = $('<div id="'+this.dialogDivId+'" class="modal hide WiseGuiNodeSelectionDialog"></div>');

	var bodyHeader = $('	<div class="modal-header">'
			+ '		<h3>' + headerHtml + '</h3>'
			+ '	</div>');

	var body = $('	<div class="modal-body">'
			+ '		<p>' + bodyHtml + '</p>'
			+ '	</div>');

	var imgAjaxLoader = $('<img class="ajax-loader" width="32" height="32"/>');
	imgAjaxLoader.attr("src", wisebedBaseUrl + "/img/ajax-loader-big.gif");
	body.append(imgAjaxLoader);

	var bodyFooter = $(' <div class="modal-footer">'
			+ '		<a id="modal-cancel" class="btn">Cancel</a>'
			+ '		<a id="modal-ok" class="btn btn-primary">OK</a>'
			+ '	</div>');

	this.dialogDiv.append(bodyHeader, body, bodyFooter);
};

WiseGuiNodeSelectionDialog.prototype.show = function(callbackOK, callbackCancel) {

	$(document.body).append(this.dialogDiv);
	var self = this;

	function showDialogInternal(wiseML) {

		self.dialogDiv.modal('show');
		
		self.dialogDiv.on('hide', function() {
			if (callbackCancel) {
				callbackCancel();
			}
		});

		self.dialogDiv.find('.ajax-loader').attr('hidden', 'true');
		self.table = new WiseGuiNodeTable(wiseML, self.dialogDiv.find('.modal-body').first(), true, true);

		// Apply preselected
		if(typeof(self.preSelected) == "function") {
			self.table.applySelected(self.preSelected);
		}

		// Cancel clicked
		self.dialogDiv.find('#modal-cancel').first().bind(
				'click',
				{dialog : self},
				function(event) {
					event.data.dialog.dialogDiv.modal('hide');
					event.data.dialog.dialogDiv.remove();
					if (callbackCancel) {
						callbackCancel();
					}
				}
		);
		
		// OK cklicked
		self.dialogDiv.find('#modal-ok').first().bind(
				'click',
				self,
				function(event) {
					event.data.dialogDiv.modal('hide');
					event.data.dialogDiv.remove();
					callbackOK(event.data.table.getSelectedNodes());
				}
		);
	}

	Wisebed.getWiseMLAsJSON(this.testbedId, this.experimentId, showDialogInternal,
			function(jqXHR, textStatus, errorThrown) {
				console.log('TODO handle error in WiseGuiNodeSelectionDialog');
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
};

/**
 * #################################################################
 * WiseGuiTestbedsView
 * #################################################################
 */

var WiseGuiTestbedsView = function(testbeds) {

	this.testbeds = testbeds;
	this.view = $('<table class="WisebedOverviewTable table table-striped">'
			+ '	<thead>'
			+ '		<tr>'
			+ '			<th>Name</td>'
			+ '			<th>URN prefixes</td>'
			+ '			<th>Session Management Endpoint URL</td>'
			+ '		</tr>'
			+ '	</thead>'
			+ '	<tbody>'
			+ '	</tbody>'
			+ '</table>');
	this.buildView();
};

WiseGuiTestbedsView.prototype.buildView = function() {
	var self = this;
	$.each(testbeds.testbedMap, function(key, value) {
		var tr = $('<tr/>');
		var tdName = $('<td><a href="#nav=testbed&testbedId='+key+'">'+value.name+'</a></td>');
		var tdUrnPrefixes = $('<td>'+value.urnPrefixes+'</td>');
		var tdSessionManagementEndpointUrl = $('<td>'+value.sessionManagementEndpointUrl+'</td>');
		tr.append(tdName, tdUrnPrefixes, tdSessionManagementEndpointUrl);
		self.view.find('tbody').append(tr);
	});
};

/**
 * #################################################################
 * WiseGuiExperimentationView
 * #################################################################
 */

var WiseGuiExperimentationView = function(testbedId, experimentId) {

	this.testbedId = testbedId;
	this.experimentId = experimentId;
	this.columns = {
			'time' : true,
			'urn' : true,
			'message' : true
	};
	
	this.experimentationDivId    = 'WisebedExperimentationDiv-'+testbedId+'-'+experimentId.replace(/=/g, '');
	this.outputsTextAreaId       = this.experimentationDivId+'-outputs-textarea';
	this.sendDivId               = this.experimentationDivId+'-send';
	this.flashDivId              = this.experimentationDivId+'-flash';
	this.resetDivId              = this.experimentationDivId+'-reset';
	this.scriptingEditorDivId    = this.experimentationDivId+'-scripting-editor';
	this.scriptingOutputDivId    = this.experimentationDivId+'-scripting-output';

	this.view = $('<div class="WiseGuiExperimentationView"/>');

	this.flashConfigurations     = [];
	this.outputsFilterNodes      = [];
	this.outputsNumMessages      = 100;
	this.outputsRedrawLimit      = 200;
	this.outputs                 = [];
	this.outputsFollow           = true;
	this.outputsMakePrintable    = true;
	this.outputsType             = 'ascii';
	this.sendSelectedNodeUrns    = [];
	this.resetSelectedNodeUrns   = [];
	this.socket                  = null;
	this.userScript      = {};
	
	var self = this;
	this.throttledRedraw = $.throttle(self.outputsRedrawLimit, function(){	self.redrawOutput();});

	this.buildView();
	this.connectToExperiment();
};

WiseGuiExperimentationView.prototype.redrawOutput = function() {
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

WiseGuiExperimentationView.prototype.printMessage = function(message) {

	// remove messages that are too much
	if (this.outputs.length > this.outputsNumMessages) {
		var elementsToRemove = this.outputs.length - this.outputsNumMessages-1;
		this.outputs.splice(0, elementsToRemove);
	}
	while (this.outputsTable.children().length > this.outputsNumMessages-1) {
        this.outputsTable.children().first().remove();
    }

	// add row
	this.outputsTable.append(this.generateRow(message));

	// scroll down if active
	if (this.outputsFollow) {
		var scrollArea = this.outputsTable.parent().parent();
		scrollArea.scrollTop(scrollArea[0].scrollHeight);
	}
};

WiseGuiExperimentationView.prototype.generateRow = function(message) {
	//no ouput if message source in not in whitelist
	if (   this.outputsFilterNodes.length != 0
			&& $.inArray(message.sourceNodeUrn, this.outputsFilterNodes) == -1 ) {
		return '';
	}
	
	var self = this;
	var col = function(text) {
		return $('<td>').append(text);
	};
	var row = $('<tr></tr>');
	var cols = {
			'time' : message.timestamp,
			'urn' : message.sourceNodeUrn,
			'message' : self.formatBase64(message.payloadBase64)
	};
	$.each(cols, function(key, val) {
		if (self.columns[key])
			row.append(col(val));
	});
	
	return row;
};

WiseGuiExperimentationView.prototype.formatBase64 = function(base64) {
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

WiseGuiExperimentationView.prototype.onWebSocketMessageEvent = function(event) {
	var self = this;
	var message = JSON.parse(event.data);

	if (!message.type) {
		console.log('Received message with unknown content: ' + event.data);
		return;
	}

	var paused = this.view.find('#pause-output').is('.active');
	
	if (message.type == 'upstream'  && !paused) {

		// append new message if in whitelist or whitelist empty
			if (   self.outputsFilterNodes.length == 0
					|| $.inArray(message.sourceNodeUrn, self.outputsFilterNodes) != -1 ) {
				self.outputs[self.outputs.length] = message;
				// queue throtteled redraw (keeps GUI responsive)
				setTimeout(function(){self.throttledRedraw();}, 5);
				//self.printMessage(message);
		};
		
	} else if (message.type == 'notification') {
		var blockAlertActions = null;
		var blockAlertMessage = $(
				  '<div>'
				+ '	<strong>Backend notification from testbed "' + this.testbedId + '" at ' + message.timestamp + ':</strong><br/>'
				+  	message.message
				+ '</div>');

		if (getNavigationData().experimentId != this.experimentId) {

			var goToExperimentButton = $('<button class="btn btn-primary">Go to experiment</button>');
			blockAlertActions = [goToExperimentButton];

			var self = this;
			goToExperimentButton.bind('click', this, function(e, data) {
				navigateTo(self.testbedId, self.experimentId);
			});

		}

		WiseGui.showInfoBlockAlert(blockAlertMessage, blockAlertActions);
	}
};

WiseGuiExperimentationView.prototype.onWebSocketOpen = function(event) {

};

WiseGuiExperimentationView.prototype.onWebSocketClose = function(event) {

};

WiseGuiExperimentationView.prototype.connectToExperiment = function() {

	window.WebSocket = window.MozWebSocket || window.WebSocket;

	if (window.WebSocket) {

		var self = this;

		this.socket = new WebSocket(wisebedWebSocketBaseUrl + '/ws/experiments/'+this.experimentId);
		this.socket.onmessage = function(event) {self.onWebSocketMessageEvent(event);};
		this.socket.onopen = function(event) {self.onWebSocketOpen(event);};
		this.socket.onclose = function(event) {self.onWebSocketClose(event);};

	} else {
		alert("Your browser does not support Web Sockets.");
	}
};

WiseGuiExperimentationView.prototype.send = function(targetNodeUrns, payloadBase64) {

	for (var i=0; i<targetNodeUrns.length; i++) {
		var message = {
			targetNodeUrn : targetNodeUrns[i],
			payloadBase64 : payloadBase64
		};
		this.socket.send(JSON.stringify(message));
	}
};

/** ******************************************************************************************************************* */

WiseGuiExperimentationView.prototype.buildView = function() {
	var self = this;
	this.view.append('<div class="WiseGuiExperimentationViewOutputs">'
			+ '	<div class="row">'
			+ '		<div class="span6"><h2>Live Data</h2></div>'
			+ '		<div class="span6">'
			+ '			<div class="btn-toolbar btn-toolbar2  pull-right">'
			+ '				<div class="btn-group">'
			+ '					<button id="pause-output" class="btn" data-toggle="button" title="Pause receiving messages."><i class="icon-pause"></i></button>'
			+ '				</div>'
			+ '				<div class="btn-group">'
			+ '					<button id="clear-output" class="btn" title="Clear output."><i class="icon-remove"></i></button>'
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
			+ '		<div class="span12"><div class="well" style="height:300px; overflow:auto;">'
			+ '			<table class="table WiseGuiExperimentViewOutputsTable">'
			+ '				<tbody></tbody>'
			+'			</table>'
			+ '		</div></div>'
			+ '	</div>'
			+ '<div class="WiseGuiExperimentationViewControls">'
			+ '	<h2>Controls</h2></div>'
			+ '	<div>'
			+ '		<ul class="nav nav-tabs">'
			+ '			<li class="active"><a href="#'+this.flashDivId+'">Flash</a></li>'
			+ '			<li><a href="#'+this.resetDivId+'">Reset</a></li>'
			+ '			<li><a href="#'+this.sendDivId+'">Send Message</a></li>'
			+ '			<li><a href="#'+this.scriptingEditorDivId+'">Scripting Editor</a></li>'
			+ '			<li><a href="#'+this.scriptingOutputDivId+'">Scripting Output</a></li>'
			+ '		</ul>'
			+ '		<div class="tab-content">'
			+ '			<div class="active tab-pane WiseGuiExperimentsViewFlashControl" id="'+this.flashDivId+'">'
			+ '				<div class="row">'
			+ '					<div class="span3">'
			+ '						<button class="btn WiseGuiExperimentsViewFlashControlAddSet"> + </button>'
			+ '						<button class="btn WiseGuiExperimentsViewFlashControlRemoveSet"> - </button>'
			+ '						<button class="btn WiseGuiExperimentsViewFlashControlLoadConfiguration">Load</button>'
			+ '						<button class="btn WiseGuiExperimentsViewFlashControlSaveConfiguration">Save</button>'
			+ '					</div>'
			+ '					<div class="span3">'
			+ '						<button class="btn btn-primary WiseGuiExperimentsViewFlashControlFlashNodes span2">Flash</button>'
			+ '					</div>'
			+ '				</div>'
			+ '				<div class="row">'
		  	+ '					<div class="span12">'
			+ '						<table class="table table-striped">'
			+ '							<thead>'
			+ '								<tr>'
			+ '									<th>Set</th>'
			+ '									<th>Selected Nodes</th>'
			+ '									<th>Image File</th>'
			+ '									<th class="span5"></th>'
			+ '								</tr>'
			+ '							</thead>'
			+ '							<tbody>'
			+ '							</tbody>'
			+ '						</table>'
		  	+ '					</div>'
			+ '				</div>'
			+ '			</div>'
			+ '			<div class="tab-pane WiseGuiExperimentsViewResetControl" id="'+this.resetDivId+'">'
		  	+ '				<div class="row">'
		  	+ '					<div class="span4">'
			+ '						<button class="btn WiseGuiExperimentsViewResetControlSelectNodeUrns span4">Select Nodes</button>'
			+ '					</div>'
		  	+ '					<div class="span4">'
			+ '						<button class="btn btn-primary WiseGuiExperimentsViewResetControlResetNodeUrns span4" disabled>Reset Nodes</button>'
			+ '					</div>'
		  	+ '				</div>'
			+ '			</div>'
		 	+ '			<div class="tab-pane WiseGuiExperimentsViewSendControl" id="'+this.sendDivId+'">'
		  	+ '				<div class="row">'
			+ '					<button class="btn WiseGuiExperimentsViewSendControlSelectNodeUrns span2">Select Nodes</button>'
			+ '					<div class="span2">'
			+ '						<select class="WiseGuiExperimentsViewSendControlSelectMode span2">'
			+ '							<option value="binary">Binary</option>'
			+ '							<option value="ascii">ASCII</option>'
			+ '						</select>'
			+ '					</div>'
			+ '					<div class="span4">'
		  	+ '						<input type="text" class="WiseGuiExperimentsViewSendControlSendMessageInput span4"/>'
			+ '					</div>'
			+ '					<div class="span2">'
		  	+ '						<button class="btn btn-primary WiseGuiExperimentsViewSendControlSendMessage span2">Send message</button><br/>'
		  	+ '					</div>'
		  	+ '				</div>'
		  	+ '				<div class="row">'
			+ '					<div class="offset4 span8">'
			+ '						<div class="inputs-list">'
			+ '							<label class="checkbox inline"><input class="WiseGuiExperimentsViewSendControlLineFeed" type="checkbox"> always append line feed</label>'
			+ '						</div>'
			+ '					</div>'
		  	+ '				</div>'
		  	+ '			</div>'
			+ '			<div class="tab-pane WiseGuiExperimentsViewScriptingControl" id="'+this.scriptingEditorDivId+'">'
			+ '				<div class="row" style="padding-bottom:10px;">'
			+ '					<div class="span6">'
			+ '						<a class="btn span2 WiseGuiExperimentsViewScriptingHelpButton" href="#" data-toggle="modal" data-target="#scriptingHelpModal">Help</a>'
			+ '					</div>'
			+ '					<div class="span6" style="text-align:right;">'
			+ '						<button class="btn btn-danger span2 WiseGuiExperimentsViewScriptingStopButton">Stop</button>'
			+ '						<button class="btn btn-success span2 WiseGuiExperimentsViewScriptingStartButton">Start</button>'
			+ '					</div>'
			+ '				</div>'
			+ '				<div class="row">'
			+ '					<div class="span12 WiseGuiExperimentsViewScriptingControlEditorRow"></div>'
			+ '				</div>'
			+ '			</div>'
			+ '			<div class="tab-pane WiseGuiExperimentsViewScriptingOutputTab" id="'+this.scriptingOutputDivId+'"/>'
			+ '		</div>'
			+ '	</div>'
			+ '</div>');
	
	this.outputsNumMessagesInput      = this.view.find('#num-outputs').first();
	this.outputsRedrawLimitInput      = this.view.find('#redraw-limit').first();
	this.outputsTable                 = this.view.find('table.WiseGuiExperimentViewOutputsTable tbody').first();
	this.outputsClearButton           = this.view.find('.btn#clear-output').first();
	this.outputsFollowCheckbox        = this.view.find('#auto-scroll').first();
	this.outputsFilterButton          = this.view.find('.btn#filter-nodes').first();
	this.outputsColumnDropdown        = this.view.find('#column-dropdown');
	this.outputsViewDropdown          = this.view.find('#view-dropdown');
	this.outputsMakePrintableCheckbox = this.view.find('#make-printable');
	
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

	this.flashAddSetButton            = this.view.find('button.WiseGuiExperimentsViewFlashControlAddSet').first();
	this.flashRemoveSetButton         = this.view.find('button.WiseGuiExperimentsViewFlashControlRemoveSet').first();
	this.flashLoadConfigurationButton = this.view.find('button.WiseGuiExperimentsViewFlashControlLoadConfiguration').first();
	this.flashSaveConfigurationButton = this.view.find('button.WiseGuiExperimentsViewFlashControlSaveConfiguration').first();
	this.flashFlashButton             = this.view.find('button.WiseGuiExperimentsViewFlashControlFlashNodes').first();
	this.flashConfigurationsTableBody = this.view.find('div.WiseGuiExperimentsViewFlashControl table tbody').first();

	this.resetNodeSelectionButton     = this.view.find('button.WiseGuiExperimentsViewResetControlSelectNodeUrns').first();
	this.resetResetButton             = this.view.find('button.WiseGuiExperimentsViewResetControlResetNodeUrns').first();

	this.sendNodeSelectionButton      = this.view.find('button.WiseGuiExperimentsViewSendControlSelectNodeUrns').first();
	this.sendModeSelect               = this.view.find('select.WiseGuiExperimentsViewSendControlSelectMode').first();
	this.sendMessageInput             = this.view.find('input.WiseGuiExperimentsViewSendControlSendMessageInput').first();
	this.sendSendButton               = this.view.find('button.WiseGuiExperimentsViewSendControlSendMessage').first();
	this.sendLineFeedCheckbox         = this.view.find('input.WiseGuiExperimentsViewSendControlLineFeed').first()[0];

	// ******* start ACE displaying error workaround ********
	// ace editor is not correctly displayed if parent tab is hidden when creating it. therefore we need to workaround
	// by attaching it to the body (invisible on z-index -1), making the div an ace editor, removing the z-index and
	// moving the element in the dom to its final destination
	this.scriptingOutputDiv           = this.view.find('div.WiseGuiExperimentsViewScriptingOutputTab').first();
	this.scriptingEditorRow           = this.view.find('div.WiseGuiExperimentsViewScriptingControlEditorRow').first();
	this.scriptingEditorStopButton    = this.view.find('button.WiseGuiExperimentsViewScriptingStopButton').first();
	this.scriptingEditorStartButton   = this.view.find('button.WiseGuiExperimentsViewScriptingStartButton').first();
	this.scriptingEditorHelpButton    = this.view.find('button.WiseGuiExperimentsViewScriptingHelpButton').first();
	this.scriptingEditorDiv           = $('<div class="WiseGuiExperimentsViewScriptingEditor" style="z-index:-1;">'
			+ 'WiseGuiUserScript = function() {\n'
			+ '  console.log("WiseGuiUserScript instantiated...");\n'
			+ '  this.testbedId = null;\n'
			+ '  this.experimentId = null;\n'
			+ '  this.webSocket = null;\n'
			+ '  this.outputDiv = null;\n'
			+ '  this.outputTextArea = null;\n'
			+ '};\n'
			+ '\n'
			+ 'WiseGuiUserScript.prototype.start = function(env) {\n'
			+ '  console.log("Starting user script...");\n'
			+ '  this.testbedId = env.testbedId;\n'
			+ '  this.experimentId = env.experimentId;\n'
			+ '  this.outputDiv = env.outputDiv;\n'
			+ '  this.outputDiv.empty();\n'
			+ '  this.outputTextArea = $("&lt;textarea class=\'span12\' style=\'height:500px\'/>");\n'
			+ '  this.outputDiv.append(this.outputTextArea);\n'
			+ '  \n'
			+ '  var self = this;\n'
			+ '  this.webSocket = new Wisebed.WebSocket(\n'
			+ '      this.testbedId,\n'
			+ '      this.experimentId,\n'
			+ '      function() {self.onmessage(arguments);},\n'
			+ '      function() {self.onopen(arguments);},\n'
			+ '      function() {self.onclosed(arguments);}\n'
			+ '  );\n'
			+ '  // TODO implement me\n'
			+ '};\n'
			+ '\n'
			+ 'WiseGuiUserScript.prototype.stop = function() {\n'
			+ '  console.log("Stopping user script...");\n'
			+ '  this.webSocket.close();\n'
			+ '  // TODO implement me\n'
			+ '};\n'
			+ '\n'
			+ 'WiseGuiUserScript.prototype.onmessage = function(message) {\n'
			+ '  console.log(message);\n'
			+ '  this.outputTextArea.html(this.outputTextArea.html() + "\\n" + JSON.stringify(message));\n'
			+ '  // TODO implement me\n'
			+ '};\n'
			+ '\n'
			+ 'WiseGuiUserScript.prototype.onopen = function(event) {\n'
			+ '  console.log(event);\n'
			+ '  this.outputTextArea.html(this.outputTextArea.html() + "\\nConnection opened!");\n'
			+ '  // TODO implement me\n'
			+ '};\n'
			+ '\n'
			+ 'WiseGuiUserScript.prototype.onclosed = function(event) {\n'
			+ '  console.log(event);\n'
			+ '  this.outputTextArea.html(this.outputTextArea.html() + "\\nConnection closed!");\n'
			+ '  // TODO implement me\n'
			+ '};\n'
			+ '</div>');

	$(document.body).append(this.scriptingEditorDiv);

	this.scriptingEditor = ace.edit(this.scriptingEditorDiv[0]);
	this.scriptingEditor.setTheme("ace/theme/textmate");
	var JavaScriptMode = require("ace/mode/javascript").Mode;
	this.scriptingEditor.getSession().setMode(new JavaScriptMode());
	this.scriptingEditorDiv.attr('style', '');
	this.scriptingEditorRow.append(this.scriptingEditorDiv);
	// ******* end ACE displaying error workaround ********

	var self = this;

	// bind actions for flash tab buttons
	this.flashAddSetButton.bind('click', self, function(e) {
		self.addFlashConfiguration();
	});

	this.flashRemoveSetButton.bind('click', self, function(e) {
		self.removeFlashConfiguration();
	});

	this.flashLoadConfigurationButton.bind('click', self, function(e) {
		self.loadFlashConfiguration(self.flashLoadConfigurationButton);
	});

	this.flashSaveConfigurationButton.bind('click', self, function(e) {
		self.saveFlashConfiguration();
	});

	this.flashFlashButton.bind('click', self, function(e) {
		self.executeFlashNodes();
	});

	this.addFlashConfiguration();

	// bind actions for reset tab buttons
	this.resetNodeSelectionButton.bind('click', self, function(e) {
		e.data.showResetNodeSelectionDialog();
	});

	this.resetResetButton.bind('click', self, function(e) {
		e.data.executeResetNodes();
	});

	// bind actions for send message tab buttons
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
		self.outputsMakePrintable = this.outputsMakePrintableCheckbox.is('checked');
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
	
	this.outputsFilterButton.click(function(e) {
		
		var nodeSelectionDialog = new WiseGuiNodeSelectionDialog(
				self.testbedId,
				self.experimentId,
				'Select Nodes',
				'Please select the nodes you want to see output from. If no nodes are selected, every output will be shown.',
				self.preselectNodes(self.outputsFilterNodes)
		);

		self.outputsFilterButton.attr('disabled', true);
		nodeSelectionDialog.show(
			function(nodeUrns) {
				// TODO filterActive should also be false if all nodes are selected
				var filterActive = nodeUrns.length > 0;
				self.outputsFilterButton.attr('disabled', false);
				self.outputsFilterNodes = nodeUrns;
				self.redrawOutput();
				self.outputsFilterButton.toggleClass('btn-info', filterActive);
			}, function() {
				self.outputsFilterButton.attr('disabled', false);
			}
		);
	});

	this.sendNodeSelectionButton.bind('click', self, function(e) { self.onSendMessageNodeSelectionButtonClicked(); });
	this.sendSendButton.bind('click', self, function(e) { self.onSendMessageButtonClicked(e); });

	this.sendMessageInput.bind('keyup', self, function(e) { self.updateSendControls(e.which); });
	this.sendMessageInput.popover({
		placement : 'bottom',
		trigger   : 'manual',
		animation   : true,
		content   : 'The message must consist of comma-separated bytes in base_10 (no prefix), base_2 (prefix 0b) or base_16 (prefix 0x).<br/>'
				+ '<br/>'
				+ 'Example: <code>0x0A,0x1B,0b11001001,40,80</code>',
		title     : "Message Format"
	});
	this.sendMessageInput.focusin(function() {
		if (self.getSendMode() == 'binary') {
			self.sendMessageInput.popover("show");
		}
	});
	this.sendMessageInput.focusout(function() {
		if (self.getSendMode() == 'binary') {
			self.sendMessageInput.popover("hide");
		}
	});
	this.updateSendControls();

	this.scriptingEditorHelpModal = '<div id="scriptingHelpModal" class="modal hide">'
				+ '<div class="modal-header">'
				+ '  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
				+ '	 <h1>How to use the scripting environment?</h1>'
				+ '</div>'
				+ '<div class="modal-body">'
				+ 'The scripting environment allows the user to write arbitrary JavaScript code into the editor. This '
				+ 'functionality can e.g., be used to connect to the currently running experiment via WebSockets and '
				+ 'process the messages received from the sensor nodes to e.g., build visualizations or statistical '
				+ 'evaluations during the runtime of the experiment while data is flowing.'
				+ ''
				+ '<h3>Using lifecycle callbacks</h3>'
				+ 'If a script conforms to a certain class name and function skeleton the scripting environment '
				+ 'provides additional support for object-oriented scripting and lifecycle hooks. To get this support '
				+ 'base your script on the skeleton below:'
				+ ''
				+ '<pre>\n'
				+ 'WiseGuiUserScript = function() {\n'
				+ '  console.log("WiseGuiUserScript instantiated...");\n'
				+ '};\n'
				+ 'WiseGuiUserScript.prototype.start = function(env) {\n'
				+ '  console.log("WiseGuiUserScript started...");\n'
				+ '};\n'
				+ 'WiseGuiUserScript.prototype.stop = function() {\n'
				+ '  console.log("WiseGuiUserScript stopped...");\n'
				+ '};\n'
				+ '</pre>'
				+ ''
				+ 'This way the environment can "start" the users script by calling '
				+ '<code>var userScript = new WiseGuiUserScriptClass(); userScript.start(env)</code> where '
				+ '<code>env</code> is a JavaScript object containing informations about the enironment (see below).<br/>'
				+ '<br/>'
				+ 'When the user stops the script the environment will call <code>userScript.stop()</code>, remove '
				+ 'the <code>&lt;script></code> tag from the DOM, and clean up by calling <code>delete userScript;</code> '
				+ 'and <code>delete WiseGuiUserScript;</code>.<br/>'
				+ ''
				+ '<h3>How does the scripting environment look like?</h3>'
				+ 'The <code>env</code> variable that is passed to the <code>start()</code> function of the users script '
				+ 'contains information about the environment/context in which the script is executed. Below you see an '
				+ 'example <code>env</code> content:'
				+ ''
				+ '<pre>'
				+ '{\n'
				+ '  testbedId    : \'uzl\',\n'
				+ '  experimentId : ABCD1234567890EF,\n'
				+ '  outputDivId  : \'WiseGuiExperimentsViewScriptingOutputTab-ABCD1234567890EF\',\n'
				+ '  outputDiv    : {...}\n'
				+ '}'
				+ '</pre>'
				+ '<code>env.testbedId</code> and <code>env.experimentId</code> can e.g., be used to call the '
				+ 'functions of wisebed.js to e.g., connect to the currently running experiments using WebSockets. '
				+ '<code>env.outputDivId</code> is the ID of the <code>&lt;div></code>DOM element that represents the '
				+ '"Scripting Output" tab so you can access it using <code>document.getElementById(env.outputDivId)</code> '
				+ 'or using the jQuery-based variant <code>$(env.outputDivId)</code> (which is identical to '
				+ '<code>env.outputDiv</code>).<br/>'
				+ '<br/>'
				+ 'Please note that your script may use all JavaScript libraries currently loaded in the document such '
				+ 'as jQuery or Twitter Bootstrap GUI elements and scripts.'
				+ ''
				+ '<h3>How is the code executed?</h3>'
				+ 'The scripting environment takes the code from the editor and attaches it the current documents DOM '
				+ 'using a <code>&lt;script></code> tag whereby the user-supplied script is automatically executed '
				+ '(i.e. evaluated). So either you include function calls to your self-written functions in your script '
				+ 'or base your script on the template as described above to make sure something is actually executed.'
				+ ''
				+ '<h3>Please be aware...</h3>'
				+ '... that there\'s no way yet to really clean up after running a user-provided '
				+ 'JavaScript script. Therefore, if your script doesn\'t cleanly shut down or breaks something the only '
				+ 'thing that definitely helps is to reload the browser tab to set the application back to a clean state!'
				+ '</div>'
				+ '</div>';
	$(document.body).append(this.scriptingEditorHelpModal);
	
	this.scriptingEditorStopButton.attr('disabled', true);
	this.scriptingEditorStartButton.bind('click', self, function(e) { self.startUserScript(); });
	this.scriptingEditorStopButton.bind('click', self, function(e) { self.stopUserScript(); });
};

/**********************************************************************************************************************/

WiseGuiExperimentationView.prototype.startUserScript = function() {

	this.stopUserScript();

	this.scriptingEditorStartButton.attr('disabled', true);

	this.userScriptDomElem = document.createElement('script');
	this.userScriptDomElem.text = this.scriptingEditor.getSession().getValue();
	this.userScriptDomElem.id = 'WiseGuiUserScriptDomElem';
	document.body.appendChild(this.userScriptDomElem);

	this.scriptingEditorStartButton.attr('disabled', true);
	this.scriptingEditorStopButton.attr('disabled', false);

	if (typeof(WiseGuiUserScript) == 'function') {

		this.userScript = new WiseGuiUserScript();

		if (typeof(this.userScript) == 'object') {

			if ('start' in this.userScript && typeof(this.userScript.stop) == 'function') {
				this.userScript.start({
					testbedId    : this.testbedId,
					experimentId : this.experimentId,
					outputDivId  : this.scriptingOutputDivId,
					outputDiv    : this.scriptingOutputDiv
				});
			}

		} else {
			alert("error");
		}
	}
};

WiseGuiExperimentationView.prototype.stopUserScript = function() {

	this.scriptingEditorStopButton.attr('disabled', true);
	this.scriptingEditorStartButton.attr('disabled', false);

	if (this.userScript && "stop" in this.userScript && typeof(this.userScript.stop) == "function") {
		this.userScript.stop();
	}

	var userScriptDomElem = document.getElementById('WiseGuiUserScriptDomElem');
	if (this.userScriptDomElem && userScriptDomElem) {
		document.body.removeChild(userScriptDomElem);
	}

	if (this.userScript) {
		delete this.userScript;
	}

	if (typeof(WiseGuiUserScript) != 'undefined') {
		delete WiseGuiUserScript;
	}

};

/**********************************************************************************************************************/

WiseGuiExperimentationView.prototype.onSendMessageNodeSelectionButtonClicked = function() {

	var self = this;
	var nodeSelectionDialog = new WiseGuiNodeSelectionDialog(
			this.testbedId,
			this.experimentId,
			'Select Node URNs',
			'Please select the nodes to which you want to send a message.',
			self.preselectNodes(self.sendSelectedNodeUrns)
	);

	nodeSelectionDialog.show(function(selectedNodeUrns){
		self.sendSelectedNodeUrns = selectedNodeUrns;
		self.updateSendControls();
	});
};

WiseGuiExperimentationView.prototype.isSendMessageInputValid = function() {
	return this.parseSendMessagePayloadBase64() != null;
};

WiseGuiExperimentationView.prototype.updateSendControls = function(keycode) {

	var sendButtonText = this.sendSelectedNodeUrns.length == 1 ?
			"1 node selected" :
			this.sendSelectedNodeUrns.length + ' nodes selected';
	this.sendNodeSelectionButton.html(sendButtonText);

	var isSendMessageInputValid = this.isSendMessageInputValid();

	if (isSendMessageInputValid) {
		this.sendMessageInput.removeClass('error');
	} else {
		this.sendMessageInput.addClass('error');
	}

	var areSendMessageNodesSelected = this.sendSelectedNodeUrns instanceof Array && this.sendSelectedNodeUrns.length > 0;

	var valid = isSendMessageInputValid && areSendMessageNodesSelected;
	this.sendSendButton.attr('disabled', !valid);
	
	// send on Enter
	if (valid && keycode==13) {
		this.onSendMessageButtonClicked();
	}
	
};

WiseGuiExperimentationView.prototype.onSendMessageButtonClicked = function(e) {

	var self = this;
	this.sendSendButton.attr('disabled', true);

	Wisebed.experiments.send(
			this.testbedId,
			this.experimentId,
			this.sendSelectedNodeUrns,
			this.parseSendMessagePayloadBase64(),
			function(result) {
				var progressView = new WiseGuiOperationProgressView(
						self.sendSelectedNodeUrns, 1,
						"The message was sent successfully to all nodes."
				);
				progressView.update(result);
				self.sendSendButton.attr('disabled', false);
			},
			function(jqXHR, textStatus, errorThrown) {
				self.sendSendButton.attr('disabled', false);
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
};

WiseGuiExperimentationView.prototype.parseSendMessagePayloadBase64 = function() {

	var messageBytes;
	var messageString = this.sendMessageInput[0].value;

	if (messageString === undefined || '') {
		return null;
	}
	
	if (this.sendLineFeedCheckbox.checked) {
		messageString += '\n';
	}

	messageBytes = this.getSendMode() == 'binary' ?
			this.parseByteArrayFromString(messageString) :
			this.parseByteArrayFromAsciiString(messageString);

	return messageBytes == null ? null : base64_encode(messageBytes);
};

WiseGuiExperimentationView.prototype.getSendMode = function() {
	return this.sendModeSelect[0].options[this.sendModeSelect[0].selectedIndex].value;
};

WiseGuiExperimentationView.prototype.parseByteArrayFromAsciiString = function(messageString) {

	if (messageString == null || messageString == '') {
		return null;
	}

	var messageBytes = new Array();
	for(var i = 0; i < messageString.length; i++) {
		messageBytes[i] = messageString.charCodeAt(i);
	}

	return messageBytes;
};

WiseGuiExperimentationView.prototype.parseByteArrayFromString = function(messageString) {

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

/**********************************************************************************************************************/

WiseGuiExperimentationView.prototype.getFlashFormData = function() {

	var flashFormData = {
		configurations : []
	};

	for (var i=0; i<this.flashConfigurations.length; i++) {
		flashFormData.configurations.push(this.flashConfigurations[i].config);
	}

	return flashFormData;
};

WiseGuiExperimentationView.prototype.saveFlashConfiguration = function(button) {

	var json = {
		configurations : []
	};

	for (var i=0; i<this.flashConfigurations.length; i++) {
		json.configurations.push(this.flashConfigurations[i].config);
	}
	var jsonString = JSON.stringify(json);

	//if(window.MozBlobBuilder) {
	//	var uriContent = "data:application/octet-stream;base64," + btoa(json);
	//	//window.open(uriContent, 'configuration.json');
	//	window.location = uriContent;
	//} else {
		var bb = new BlobBuilder();
		bb.append(jsonString);
		saveAs(bb.getBlob("text/plain;charset=utf-8"), "configuration.json");
	//}
};

WiseGuiExperimentationView.prototype.loadFlashConfiguration = function(button) {

	button.attr("disabled", "true");

	// @param: Type is conf-object
	function configCallback(conf) {
		button.removeAttr("disabled");

		if(conf == null) return;

		// Reset
		this.flashConfigurationsTableBody.empty();
		this.flashConfigurations = [];

		// Iterate all configurations
		for(var i = 0; i < conf.length; i++) {
			that.addFlashConfiguration(conf[i]);
		}
	}

	new WiseGuiLoadConfigurationDialog(this.testbedId, configCallback.bind(this));
};

// @see: http://stackoverflow.com/a/5100158/605890
WiseGuiExperimentationView.prototype.dataURItoBlob = function(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var bb = new BlobBuilder();
    bb.append(ab);
    return bb.getBlob(mimeString);
};

WiseGuiExperimentationView.prototype.addFlashConfiguration = function(conf) {

	// build and append the gui elements
	var nodeSelectionButton   = $('<button class="btn nodeSelectionButton span3">Select Nodes</button>');
	var imageFileInput        = $('<input type="file" style="opacity: 0; width: 0px; position:absolute; top:-100px;"/>');
	var imageFileButton       = $('<button class="btn fileSelectionButton span3">Select Image</button>');
	var imageFileInfoLabel    = $('<div/>');
	var tr                    = $('<tr/>');

	var setNumberTd           = $('<td>' + (this.flashConfigurations.length + 1) + '</td>');
	var nodeSelectionButtonTd = $('<td/>');
	var imageFileInputTd      = $('<td/>');
	var imageFileInfoLabelTd  = $('<td/>');

	nodeSelectionButtonTd.append(nodeSelectionButton);

	imageFileInputTd.append(imageFileInput);
	imageFileInputTd.append(imageFileButton);
	imageFileInfoLabelTd.append(imageFileInfoLabel);

	tr.append(setNumberTd, nodeSelectionButtonTd, imageFileInputTd, imageFileInfoLabelTd);
	this.flashConfigurationsTableBody.append(tr);

	// build and remember the configuration
	var configuration = {
		nodeSelectionButton : nodeSelectionButton,
		imageFileInput      : imageFileInput,
		imageFileButton     : imageFileButton,
		imageFileLabel      : imageFileInfoLabel,
		tr                  : tr,
		config              : { nodeUrns : null, image : null }
	};

	if(typeof(conf) == "object") {
		// Set the image
		if(conf.image != null) {
			configuration.config.image = conf.image;
			var blob = this.dataURItoBlob(configuration.config.image);
			imageFileInfoLabel.append(
					'<strong>' + blob.name + '</strong> (' + (blob.type || 'n/a') + ')<br/>'
					+ blob.size + ' bytes'
			);
		}
		// Set the node URNs
		if(conf.nodeUrns != null) {

			var checkNodes = function(data) {

				var reservedNodeUrns = [];
				for(var i = 0; i < data.setup.node.length; i++) {
					reservedNodeUrns.push(data.setup.node[i].id);
				}

				var preSelectedNodeUrns = [];
				for(var k = 0; k < conf.nodeUrns.length; k++) {
					if($.inArray(conf.nodeUrns[k], reservedNodeUrns) >= 0) {
						preSelectedNodeUrns.push(conf.nodeUrns[k]);
					}
				}

				configuration.config.nodeUrns = preSelectedNodeUrns;

				var nodeSelectionButtonText = configuration.config.nodeUrns.length == 1 ?
						'1 node selected' :
						configuration.config.nodeUrns.length + ' nodes selected';

				nodeSelectionButton.html(nodeSelectionButtonText);
			};

			Wisebed.getWiseMLAsJSON(this.testbedId, this.experimentId, checkNodes,
					function(jqXHR, textStatus, errorThrown) {
						console.log('TODO handle error in WiseGuiExperimentationView');
						WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
					}
			);
		}
	}

	this.flashConfigurations.push(configuration);

	// bind actions to buttons
	var self = this;

	nodeSelectionButton.bind('click', function() {

		var nodeSelectionDialog = new WiseGuiNodeSelectionDialog(
				self.testbedId,
				self.experimentId,
				'Select Nodes',
				'Please select the nodes you want to flash.',
				self.preselectNodes(configuration.config.nodeUrns)
		);

		nodeSelectionButton.attr('disabled', true);
		nodeSelectionDialog.show(
			function(nodeUrns) {
				nodeSelectionButton.attr('disabled', false);
				configuration.config.nodeUrns = nodeUrns;
				nodeSelectionButton.html((nodeUrns.length == 1 ? '1 node selected' : (nodeUrns.length + ' nodes selected')));
			}, function() {
				nodeSelectionButton.attr('disabled', false);
			}
		);
	});

	imageFileButton.bind('click', function() {
		configuration.imageFileInput.click();
	});

	imageFileInput.bind('change', function() {

		var imageFile       = imageFileInput[0].files[0];
		var imageFileReader = new FileReader();

		imageFileReader.onerror = function(progressEvent) {
			configuration.config.image = null;
			WiseGui.showWarningAlert('The file "' + imageFile.name+ '" could not be read!');
		};

		imageFileReader.onloadend = function(progressEvent) {
			configuration.config.image = imageFileReader.result;
			imageFileInfoLabel.empty();
			imageFileInfoLabel.append(
					'<strong>' + imageFile.name + '</strong> (' + (imageFile.type || 'n/a') + ')<br/>'
					+ imageFile.size + ' bytes'

					// last modified: ' +
					// imageFile.lastModifiedDate.toLocaleDateString()
					//
					// Crashes in FF. Even if the File interface specifies a
					// lastModifiedDate,
					// it is not working/existing in FF.
					//
					// @see https://github.com/wisebed/rest-ws/issues/32
			);
		};

		imageFileReader.readAsDataURL(imageFile);

	});

	return configuration;
};

WiseGuiExperimentationView.prototype.removeFlashConfiguration = function() {
	if (this.flashConfigurations.length > 1) {
		var configuration = this.flashConfigurations.pop();
		configuration.tr.remove();
		return configuration;
	}
	return null;
};

WiseGuiExperimentationView.prototype.setFlashButtonDisabled = function(disabled) {
	this.flashFlashButton.attr('disabled', disabled);
};

WiseGuiExperimentationView.prototype.executeFlashNodes = function() {

	var flashFormData = this.getFlashFormData();

	var allNodeUrns = [];
	$.each(flashFormData.configurations, function(index, configuration) {
		$.each(configuration.nodeUrns, function(index, nodeUrn) {
			allNodeUrns.push(nodeUrn);
		});
	});

	var progressViewer = new WiseGuiOperationProgressView(
			allNodeUrns, 100,
			"All nodes were successfully flashed."
	);

	this.setFlashButtonDisabled(true);
	var self = this;
	var progressViewerShown = false;
	Wisebed.experiments.flashNodes(
			this.testbedId,
			this.experimentId,
			flashFormData,
			function(result) {
				if (!progressViewerShown) {
					WiseGui.showInfoBlockAlert(progressViewer.view);
					progressViewerShown = true;
				}
				self.setFlashButtonDisabled(false);
				progressViewer.update(result);
			},
			function(progress) {
				if (!progressViewerShown) {
					WiseGui.showInfoBlockAlert(progressViewer.view);
					progressViewerShown = true;
				}
				progressViewer.update(progress);
			},
			function(jqXHR, textStatus, errorThrown) {
				self.setResetButtonDisabled(false);
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
};

/** ******************************************************************************************************************* */

WiseGuiExperimentationView.prototype.updateResetSelectNodeUrns = function(selectedNodeUrns) {
	this.resetSelectedNodeUrns = selectedNodeUrns;
	this.setResetButtonDisabled(selectedNodeUrns.length == 0);
	this.resetNodeSelectionButton.html((selectedNodeUrns.length == 1 ? '1 node selected' : selectedNodeUrns.length + ' nodes selected'));
};

WiseGuiExperimentationView.prototype.showResetNodeSelectionDialog = function() {

	this.setResetSelectNodesButtonDisabled(true);
	var self = this;
	Wisebed.getWiseMLAsJSON(
			this.testbedId,
			this.experimentId,
			function(wiseML) {

				self.setResetSelectNodesButtonDisabled(false);

				// TODO: Refactor, also used in addFlashConfiguration
				if(self.resetSelectedNodeUrns != null && self.resetSelectedNodeUrns.length > 0) {
					preSelected = function(data) {
						var nodeids = self.resetSelectedNodeUrns;
						for(var i = 0; i < nodeids.length; i++) {
							if(data.id == nodeids[i]) return true;
						}
						return false;
					};
				}

				var selectionDialog = new WiseGuiNodeSelectionDialog(
						self.testbedId,
						self.experimentId,
						'Reset Nodes',
						'Please select the nodes you want to reset.',
						self.preselectNodes(self.resetSelectedNodeUrns)
				);

				selectionDialog.show(function(selectedNodeUrns) {
					self.updateResetSelectNodeUrns(selectedNodeUrns);
				});

			}, function(jqXHR, textStatus, errorThrown) {
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
};

WiseGuiExperimentationView.prototype.setResetSelectNodesButtonDisabled = function(disabled) {
	this.resetResetButton.attr('disabled', disabled);
};

WiseGuiExperimentationView.prototype.setResetButtonDisabled = function(disabled) {
	this.resetResetButton.attr('disabled', disabled);
};

WiseGuiExperimentationView.prototype.executeResetNodes = function() {

	this.setResetButtonDisabled(true);
	var self = this;
	Wisebed.experiments.resetNodes(
			this.testbedId,
			this.experimentId,
			this.resetSelectedNodeUrns,
			function(result) {
				var progressView = new WiseGuiOperationProgressView(
						self.resetSelectedNodeUrns, 1,
						"All nodes were successfully reset."
				);
				progressView.update(result);
				self.setResetButtonDisabled(false);
			},
			function(jqXHR, textStatus, errorThrown) {
				self.setResetButtonDisabled(false);
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
};

/*
 * This function returns a function which is used as a pre-selection filter within the
 * node selction table. It takes a list of nodes as argument.
 */
WiseGuiExperimentationView.prototype.preselectNodes = function(nodes) {
	if(nodes != null && nodes.length > 0) {
		return function(data) {
			return ($.inArray(data.id, nodes) >= 0);
		};
	}
	// preselected function is null. Thus, it will not be executed
	return null;
};

/**
 * #################################################################
 * WiseGuiOperationProgressView
 * #################################################################
 */

var WiseGuiOperationProgressView = function(nodeUrns, operationMaxValue, successMessage) {

	this.view = $('<div class="WiseGuiOperationProgressView"/>');
	this.successMessage = successMessage;

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
			}
		}
	});

	var contentsEmpty = true;
	$.each(this.contents, function(nodeUrn, nodeStatus) {
		contentsEmpty = false;
	});

	if (contentsEmpty && this.successMessage) {
		self.view.parent().remove();
		WiseGui.showSuccessAlert(this.successMessage);
	}
};

/**
 * ################################################################# Global
 * Functions #################################################################
 */

function loadTestbedDetailsContainer(navigationData, parentDiv) {

	parentDiv.append($('<h1>Testbed Details "'+testbeds.testbedMap[navigationData.testbedId].name+'"</h1>'));

	var tabs = $('<ul class="nav nav-tabs">'
			+ '	<li class="active"><a href="#WisebedTestbedDetailsOverview-'+navigationData.testbedId+'">Description</a></li>'
			+ '	<li><a href="#WisebedTestbedDetailsNodes-'+navigationData.testbedId+'">Nodes</a></li>'
			+ '	<li><a href="#WisebedTestbedDetailsReservations-'+navigationData.testbedId+'">Reservations</a></li>'
			+ '	<li><a href="#WisebedTestbedDetailsWiseMLJSON-'+navigationData.testbedId+'">WiseML (JSON)</a></li>'
			+ '	<li><a href="#WisebedTestbedDetailsWiseMLXML-'+navigationData.testbedId+'">WiseML (XML)</a></li>'
			+ '</ul>'
			+ '<div class="tab-content">'
			+ '	<div class="tab-pane active" id="WisebedTestbedDetailsOverview-'+navigationData.testbedId+'"/>'
			+ '	<div class="tab-pane" id="WisebedTestbedDetailsNodes-'+navigationData.testbedId+'"/>'
			+ '	<div class="tab-pane" id="WisebedTestbedDetailsReservations-'+navigationData.testbedId+'"/>'
			+ '	<div class="tab-pane" id="WisebedTestbedDetailsWiseMLJSON-'+navigationData.testbedId+'"/>'
			+ '	<div class="tab-pane" id="WisebedTestbedDetailsWiseMLXML-'+navigationData.testbedId+'"/>'
			+ '</div>');

	parentDiv.append(tabs);

	Wisebed.getWiseMLAsJSON(
			navigationData.testbedId,
			null,
			function(wiseML) {

				var overviewTab = $('#WisebedTestbedDetailsOverview-'+navigationData.testbedId);
				overviewTab.append('<div class="row">'
						+ '	<div class="span12">' + wiseML.setup.description + '</div>'
						+ '</div>'
						+ '<div class="row">'
						+ '	<div class="span12 WisebedTestbedDetailsOverviewMap gMap"></div>'
						+ '</div>');
				var overviewTabMapRow = overviewTab.find('.WisebedTestbedDetailsOverviewMap');

				var jsonTab = $('#WisebedTestbedDetailsWiseMLJSON-'+navigationData.testbedId);
				jsonTab.append($('<pre class="WiseGuiTestbedDetailsWiseMLJSON">'+JSON.stringify(wiseML, null, '  ')+'</pre>'));

				var nodesTab = $('#WisebedTestbedDetailsNodes-'+navigationData.testbedId);
				var nodesTabDiv = $('<div class="WiseGuiTestbedDetailsNodesTable"/>');
				nodesTab.append(nodesTabDiv);
				new WiseGuiNodeTable(wiseML, nodesTabDiv, false, true);

				// Show google map
				var wiseMlParser = new WiseMLParser(wiseML, overviewTabMapRow);

				tabs.find('li a[href=#WisebedTestbedDetailsOverview-'+navigationData.testbedId+']').bind('change', function(e) {
					google.maps.event.trigger(wiseMlParser.map, 'resize');
				});
			},
			WiseGui.showAjaxError
	);

	Wisebed.getWiseMLAsXML(
			navigationData.testbedId,
			null,
			function(wiseML) {
				var xmlTab = $('#WisebedTestbedDetailsWiseMLXML-'+navigationData.testbedId);
				xmlTab.append($('<pre class="WiseGuiTestbedDetailsWiseMLXML">'+new XMLSerializer().serializeToString(wiseML).replace(/</g,"&lt;")+'</pre>'));
			},
			WiseGui.showAjaxError
	);

	var reservationsTab = $('#WisebedTestbedDetailsReservations-'+navigationData.testbedId);

	// we need this to be able to refresh the table
	$(window).bind('wisegui-reservation-table-' + navigationData.testbedId,
		function() {
			buildReservationTable(reservationsTab, navigationData);
		}
	);

	// Build the table
	buildReservationTable(reservationsTab, navigationData);
}


function buildReservationTable(reservationsTab, navigationData) {

	var now = new Date();
	var tomorrowSameTime = new Date();
	tomorrowSameTime.setDate(now.getDate() + 7);

	Wisebed.reservations.getPublic(
			navigationData.testbedId,
			now,
			tomorrowSameTime,
			function(data) {

				var reservations = data.reservations;
				var tableHead = ["From", "Until", "User Data", "Node URNs"];
				var tableRows = [];
				for (var i=0; i<reservations.length; i++) {
					tableRows[i] = [];
					tableRows[i][0] = new Date(reservations[i].from).toString();
					tableRows[i][1] = new Date(reservations[i].to).toString();
					tableRows[i][2] = reservations[i].userData;

					var nodesContainer = $('<div>'
							+ reservations[i].nodeURNs.length + ' nodes.<br/>'
							+ '<a href="#">Show URNs</a>'
							+ '</div>');

					var nodesLink = nodesContainer.find('a');
					nodesLink.first().bind(
							'click',
							{link:nodesLink, container:nodesContainer, reservation:reservations[i]},
							function(e) {
								e.preventDefault();
								e.data.link.remove();
								e.data.container.append(
										e.data.reservation.nodeURNs.join("<br/>")
								);
							}
					);
					tableRows[i][3] = nodesContainer;
				}

				var noEntriesMessage = 'There are no reservations for the next week yet!';
				var table = buildTable(tableHead, tableRows, noEntriesMessage);
				reservationsTab.empty();
				reservationsTab.append(table);
				if (tableRows.length > 0) {
					table.tablesorter({ sortList: [[0,0]] });
				}
			},
			WiseGui.showAjaxError
	);
}


function buildTable(tableHead, tableRows, noEntriesMessage) {

	var table = $('<table class="table table-striped"/>"');
	var thead = $('<thead/>');
	var theadRow = $('<tr/>');
	thead.append(theadRow);

	for (var i=0; i<tableHead.length; i++) {
		theadRow.append('<th>'+tableHead[i]+'</th>');
	}

	var tbody = $('<tbody/>');

	if(tableRows.length == 0 && noEntriesMessage) {
	    tbody.append('<tr><td colspan="'+tableHead.length+'">'+noEntriesMessage+'</td></tr>');
	}

	for (var k=0; k<tableRows.length; k++) {
		var row = $('<tr/>');
		tbody.append(row);
		for (var l=0; l<tableRows[k].length; l++) {
			var td = $('<td/>');
			row.append(td);
			td.append(tableRows[k][l]);
		}
	}

	table.append(thead, tbody);

	return table;
}

function loadExperimentContainer(navigationData, parentDiv) {

	var experimentationView = new WiseGuiExperimentationView(navigationData.testbedId, navigationData.experimentId);
	parentDiv.append(experimentationView.view);
}

function loadTestbedOverviewContainer(navigationData, parentDiv) {

	var testbedsView = new WiseGuiTestbedsView(testbeds);
	parentDiv.append(testbedsView.view);
}

function getNavigationKey(navigationData) {
	if (navigationData.nav == 'overview') {
		return 'overview';
	} else if (navigationData.nav == 'testbed' && navigationData.experimentId == '') {
		return 'testbedId=' + navigationData.testbedId;
	} else if (navigationData.nav == 'testbed' && navigationData.experimentId != '') {
		return 'testbedId=' + navigationData.testbedId + '&experimentId=' + navigationData.experimentId;
	}
	return undefined;
}

function getCreateContentFunction(navigationData) {
	if (navigationData.nav == 'overview') {return loadTestbedOverviewContainer;}
	if (navigationData.nav == 'testbed' && navigationData.experimentId == '') {return loadTestbedDetailsContainer;}
	if (navigationData.nav == 'testbed' && navigationData.experimentId != '') {return loadExperimentContainer;}
	return undefined;
}

function showReservationsDialog(testbedId) {
	var existingDialog = $("#WisebedReservationDialog-"+testbedId);
	if (existingDialog.length != 0) {existingDialog.modal('show');}
	else {new WiseGuiReservationDialog(testbedId);}
}

function getLoginDialog(testbedId) {
	var loginDialog = loginDialogs[testbedId];
	if (!loginDialog) {
		loginDialog = new WiseGuiLoginDialog(testbedId);
		loginDialogs[testbedId] = loginDialog;
	}
	return loginDialog;
}

function navigateToExperiment(testbedId, reservation) {

	Wisebed.experiments.getUrl(
			testbedId,
			reservation,
			function(experimentUrl){

				var experimentId = experimentUrl.substr(experimentUrl.lastIndexOf('/') + 1);
				navigateTo(testbedId, experimentId);

			},
			WiseGui.showAjaxError
	);
}

function navigateTo(testbedId, experimentId) {
	var navigationData = {
		nav          : (testbedId ? 'testbed' : 'overview'),
		testbedId    : testbedId || '',
		experimentId : experimentId || ''
	};
	$.bbq.pushState(navigationData);
}

function getNavigationData(fragment) {

	var parsedFragment = $.deparam.fragment(fragment ? fragment : window.location.fragment);

	return {
		nav          : parsedFragment['nav']          || 'overview',
		testbedId    : parsedFragment['testbedId']    || '',
		experimentId : parsedFragment['experimentId'] || ''
	};
}

function switchNavigationContainer(navigationData, navigationKey) {

	$('#WisebedContainer .WiseGuiNavigationContainer').hide();

	if (!navigationContainers[navigationKey]) {
		navigationContainers[navigationKey] = createNavigationContainer(navigationData);
	}

	$(navigationContainers[navigationKey]).show();
}

function createNavigationContainer(navigationData) {

	var containerDivId = 'WiseGuiNavigationContainer-' + (navigationData.testbedId ?
			('testbed-' + navigationData.testbedId) : 'testbeds');
	var container = $('<div class="WiseGuiNavigationContainer" id="'+containerDivId+'"/>');

	container.hide();

	$('#WisebedContainer .WiseGuiNotificationsContainer').before(container);

	var navigationViewer = new WiseGuiNavigationViewer(navigationData);
	container.append(navigationViewer.view);

	return container;
}

function switchContentContainer(navigationData, navigationKey) {

	$('#WisebedContainer .WisebedContentContainer').hide();

	if (!contentContainers[navigationKey]) {
		contentContainers[navigationKey] = createContentContainer(navigationData);
	}

	$(contentContainers[navigationKey]).show();
}

function createContentContainer(navigationData) {

	var containerDivId = 'WisebedContentContainer-' + (navigationData.testbedId ?
			('testbed-' + navigationData.testbedId) : 'testbeds');
	var container = $('<div class="WisebedContentContainer" id="'+containerDivId+'"/>');

	container.hide();

	$('#WisebedContainer .WiseGuiNotificationsContainer').after(container);

	var createContentFunction = getCreateContentFunction(navigationData);
	createContentFunction(navigationData, container);

	$('.nav-tabs a').click(function (e) {
	    e.preventDefault();
	    $(this).tab('show');
	    });

	return container;
}


function onHashChange(e) {

	var navigationData = getNavigationData(e.fragment);
	var navigationKey  = getNavigationKey(navigationData);

	switchNavigationContainer(navigationData, navigationKey);
	switchContentContainer(navigationData, navigationKey);

	$(window).trigger('wisegui-navigation-event', navigationData);
}

var navigationContainers = {};
var contentContainers    = {};
var loginDialogs         = {};

var loginObserver        = new WiseGuiLoginObserver();
var reservationObserver  = new WiseGuiReservationObserver();
var notificationsViewer  = new WiseGuiNotificationsViewer();

var testbeds             = null;

$(function () {

	$('#WisebedContainer').append(notificationsViewer.view);
	
	$('.modal').modal({
		keyboard: true
	});

	Wisebed.getTestbeds(
			function(testbedsLoaded) {


				testbeds = testbedsLoaded;

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
				Wisebed.testCookie(function() {}, cookieCallbackError);
			},
			WiseGui.showAjaxError
	);
});
