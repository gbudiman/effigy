var dynaloader = function() {
	var pane;
	var rank;
	var srank;
	var zoom_position;

	// animation-related
	var bounce_enabled;
	var bounce_time = 500;

	var attach = function() {
		pane = $('#pane');
	}

	var attach_zoom = function(val) {
		if (val) {
			pane.bind('mousewheel', function(e) {
				if (e.originalEvent.wheelDelta / 120 > 0) {
					zoom('up');
				} else {
					zoom('down');
				}
			})
		} else {
			pane.unbind('mousewheel');
		}

		bounce_enabled = val;
	}

	var load = function(v, d) {
		pane.empty();
		attach_zoom(false);
		rank = {};
		
		$.each(d, function(key, data) {
			if (!(data.r in rank)) {
				rank[data.r] = 0;
			}

			rank[data.r]++;
			spawn_image(v, key, data);
		})

		setup_zoom();
	}

	var setup_zoom = function() {
		srank = Object.keys(rank).map(function(x) { return parseInt(x); });
		zoom_position = srank.length - 1;
		attach_zoom(true);
	}

	var zoom = function(dir) {
		var ulimit = srank.length - 1;
		var trigger = function(act, pos) {
			var rank_value = srank[pos];

			if (act == 'show') {
				$('img[rank=' + (rank_value + 1) + ']').show().css('opacity', 0).velocity({
					opacity: 1
				}, bounce_time, function() {
					bounce_enabled = true;
				})
			} else if (act == 'hide') {
				$('img[rank=' + rank_value + ']').velocity({
					opacity: 0
				}, bounce_time, function() {
					$(this).hide();
					bounce_enabled = true;
				})
			}
		}

		if (bounce_enabled && dir == 'up') {
			if (zoom_position < ulimit) {
				bounce_enabled = false;
				trigger('show', zoom_position++);
			}
		} else if (bounce_enabled && dir == 'down') {
			if (zoom_position > 1) {
				bounce_enabled = false;
				trigger('hide', zoom_position--);
			}
		}
	}

	var spawn_image = function(v, key, data) {
		var pad = function(_x) {
			var x = _x + 1;
			var length = 8 - String(x).length;

			return '0'.repeat(length) + String(x);
		}

		pane.append('<img src="assets/' + v + '/fig' + pad(key) + '.jpg"'
							+     ' rank=' + data.r
							+     ' time=' + data.t
							+     ' class=figmini'
							+ ' />')
	}

	return {
		attach: attach,
		load: load,
		get_rank: function() { return rank; }
	}
}()