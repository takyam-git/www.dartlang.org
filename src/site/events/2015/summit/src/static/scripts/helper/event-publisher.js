CDS.EventPublisher = (function() {

	"use strict";

	var eventSignals = {
		resize: new signals.Signal(),
		scroll: new signals.Signal(),
		keyup: new signals.Signal(),
		load: new signals.Signal()
	};
	var target = window;

	function onEvent(evt) {

		if (!eventSignals[evt.type])
			throw 'Unsupported event' + evt.type;

		eventSignals[evt.type].dispatch(evt);

		// It may well be that we have used some addOnce
		// listeners and these may have expired. If so, remove.
		if (eventSignals[evt.type].getNumListeners() > 0)
			return;

		target.removeEventListener(evt.type, onEvent);
	}

	function add(eventName, eventHandler) {
		if (!eventSignals[eventName])
			throw 'Unsupported event: ' + eventName;

		eventSignals[eventName].add(eventHandler);

		// If we have already subscribed for these events
		// we can afford to leave, otherwise subscribe.
		if (eventSignals[eventName].getNumListeners() > 1)
			return;

		target.addEventListener(eventName, onEvent);
	}

	function addOnce(eventName, eventHandler) {
		if (!eventSignals[eventName])
			throw 'Unsupported event: ' + eventName;

		eventSignals[eventName].addOnce(eventHandler);

		// If we have already subscribed for these events
		// we can afford to leave, otherwise subscribe.
		if (eventSignals[eventName].getNumListeners() > 1)
			return;

		target.addEventListener(eventName, onEvent);
	}

	function remove(name) {

		if (!eventSignals[eventName])
			throw 'Unsupported event: ' + eventName;

		eventSignals[eventName].remove(eventHandler);

		// If we still have listeners leave, otherwise remove
		// the event listener.
		if (eventSignals[eventName].getNumListeners() > 0)
			return;

		target.removeEventListener(eventName, onEvent);
	}

	return {
		add: add,
		addOnce: addOnce,
		remove: remove
	};


})();
