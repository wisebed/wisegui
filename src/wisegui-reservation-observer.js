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

module.exports = WiseGuiReservationObserver;
