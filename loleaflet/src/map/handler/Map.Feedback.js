/* -*- js-indent-level: 8 -*- */
/*
 * L.Map.Feedback.
 */

L.Map.mergeOptions({
	feedback: true,
	feedbackTimeout: 2000
});

L.Map.Feedback = L.Handler.extend({

	addHooks: function () {
		window.localStorage.setItem('WSDFeedbackEnabled', 'true');
		this._map.on('docloaded', this.onDocLoaded, this);
		L.DomEvent.on(window, 'message', this.onMessage, this);
	},

	removeHooks: function () {
		L.DomEvent.off(window, 'message', this.onMessage, this);
	},

	onDocLoaded: function () {
		setTimeout(L.bind(this.onFeedback, this), this._map.options.feedbackTimeout);
	},

	onFeedback: function () {
		if (window.localStorage.getItem('WSDFeedbackEnabled')) {
			if (this._iframeDialog && this._iframeDialog.hasLoaded())
				this._iframeDialog.remove();

			this._iframeDialog = L.iframeDialog(window.feebackLocation);
		}
	},

	onError: function () {
		window.localStorage.removeItem('WSDFeedbackEnabled');
		this._iframeDialog.remove();
	},

	onMessage: function (e) {
		var data = e.data;

		if (data == 'feedback-show') {
			this._iframeDialog.show();
		}
		else if (data == 'feedback-never') {
			window.localStorage.removeItem('WSDFeedbackEnabled');
			this._iframeDialog.remove();
		} else if (data == 'feedback-later') {
			this._iframeDialog.remove();
			setTimeout(L.bind(this.onFeedback, this), this._map.options.feedbackTimeout);
		} else if (data == 'feedback-submit') {
			window.localStorage.removeItem('WSDFeedbackEnabled');
			this._iframeDialog.remove();
		}
	}
});
if (window.feebackLocation && window.isLocalStorageAllowed) {
	L.Map.addInitHook('addHandler', 'feedback', L.Map.Feedback);
}