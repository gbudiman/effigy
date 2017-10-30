var dynaloader = function() {
	var pane;
	var rank;
	var srank;
	var zoom_position;

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
				$('img[rank=' + rank_value + ']').show();
			} else if (act == 'hide') {
				$('img[rank=' + rank_value + ']').hide();
			}
		}

		console.log(dir + ' ' + zoom_position + '/' + ulimit);

		if (dir == 'up') {
			if (zoom_position < ulimit) {
				console.log(zoom_position + ' -> ' + (zoom_position + 1));
				trigger('show', zoom_position++);
			}
		} else if (dir == 'down') {
			if (zoom_position > 0) {
				console.log(zoom_position + ' -> ' + (zoom_position - 1));
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