var dynaloader = function() {
	var pane;
	var rank;
	var srank;
	var zoom_position;
	var max_rank;
	var cumulative_figs_count;
	var ordered_position;
	var current_mouseover;

	// animation-related
	var bounce_enabled;
	var bounce_time = 500;

	var attach = function() {
		pane = layout.get_pane();
	}

	var attach_zoom = function(val) {
		if (val) {
			pane.bind('mousewheel', function(e) {
				if (e.originalEvent.wheelDelta / 120 > 0) {
					zoom('up');
				} else {
					zoom('down');
				}

				if (!bounce_enabled) {
					e.preventDefault();
				}

			})
		} else {
			pane.unbind('mousewheel');
		}

		bounce_enabled = val;
	}

	var strip_extension = function(s) {
		return s.replace(/\.\w+$/, '');
	}

	var load = function(v, d) {
		pane.empty();
		attach_zoom(false);
		rank = {};
		cumulative_figs_count = {};
		ordered_position = new Array();
		
		$.each(d, function(key, data) {
			if (!(data.r in rank)) {
				rank[data.r] = 0;
			}

			rank[data.r]++;
			spawn_image(v, key, data);
			if (cumulative_figs_count[data.r] == undefined) {
				cumulative_figs_count[data.r] = 0;
			}

			ordered_position.push({ rank: data.r, frame: strip_extension(key) });
			cumulative_figs_count[data.r]++;
		})

		figs_count_key = Object.keys(cumulative_figs_count).sort();
		$.each(figs_count_key, function(i, x) {
			position = parseInt(x);
			previous_amount = (cumulative_figs_count[position - 1] || 0);

			cumulative_figs_count[position] += previous_amount;
		})

		setup_caret();
		setup_zoom();
		setup_seek();
		toggle_figs();
		layout_pane();
	}

	var setup_caret = function() {
		pane.find('img').on('mouseover', function() {
			current_mouseover = $(this).attr('id');
		}).on('mouseout', function() {
			current_mouseover = null;
		})
	}

	var maintain_scroll = function() {
		if (current_mouseover == null) return;
		//console.log(ordered_position);
		//console.log(current_mouseover);
		//console.log('finding all frames at rank ' + zoom_position + ' or lower');
		var caret_count = 0;
		$.each(ordered_position, function(_junk, v) {
			if (v.rank <= zoom_position) {
				caret_count++;
			}

			if (v.frame == current_mouseover) {
				return false;
			}
		});

		var current_left = $('#' + current_mouseover).position().left;
		var scrollpx = (caret_count - 1) * 96 + 61;
		console.log('current_left = ' + current_left + ' scrollpx = ' + scrollpx);
		//console.log(caret_count);
		//console.log(scrollpx - current_left);
		//pane.scrollLeft(scrollpx - current_left);
		//$('#pane').scrollLeft(scrollpx - current_left);
		return scrollpx - current_left;
	}

	var toggle_figs = function() {
		pane.find('img').hide();

		for (var rank = 0; rank <= zoom_position; rank++) {
			pane.find('img[rank="' + rank + '"]').show();
		}
	}

	var layout_pane = function() {
		//console.log("zoom p = " + zoom_position);
		//var items_count = cumulative_figs_count[zoom_position];
		//pane.css('width', (96 * items_count + 64) + 'px');
	}

	var setup_zoom = function() {
		srank = Object.keys(rank).map(function(x) { return parseInt(x); });
		max_rank = srank.length - 1;
		zoom_position = 0;
		attach_zoom(true);
	}

	var setup_seek = function() {
		var video_player = layout.get_video_instance();
		$('#pane').find('img').on('click', function() {
			var t = parseFloat($(this).attr('time'));

			video_player.currentTime = t;
			video_player.play();
		});
	}

	var zoom = function(dir) {
		var ulimit = max_rank;
		var trigger = function(act, pos) {
			var rank_value = pos;
			
			if (act == 'show') {
				layout_pane();
				var scrollx = maintain_scroll();
				var group = $('img[rank=' + (rank_value + 1) + ']');
				group.show().css('opacity', 0)

				pane.scrollLeft(scrollx);
				group.velocity({
					opacity: 1
				}, bounce_time, function() {
					bounce_enabled = true;
					
				})
			} else if (act == 'hide') {
				var scrollx = maintain_scroll();

				$('img[rank=' + rank_value + ']').velocity({
					opacity: 0
				}, bounce_time, function() {
					$(this).hide();
					bounce_enabled = true;
					layout_pane();
					pane.scrollLeft(scrollx);
				})
			}
		}

		if (bounce_enabled && dir == 'up') {
			if (zoom_position < ulimit) {
				bounce_enabled = false;
				trigger('show', zoom_position++);

				return true;
			}
		} else if (bounce_enabled && dir == 'down') {
			if (zoom_position > 0) {
				bounce_enabled = false;
				trigger('hide', zoom_position--);

				return true;
			}
		}

		return false;
	}

	var spawn_image = function(v, key, data) {
		var pad = function(_x) {
			var x = _x + 1;
			var length = 8 - String(x).length;

			return '0'.repeat(length) + String(x);
		}

		pane.append('<img src="assets/' + v + '/' + key + '"'
							+     ' rank=' + data.r
							+     ' time=' + data.t
							+     ' id=' + strip_extension(key)
							+     ' class=figmini'
							+ ' />')
	}

	return {
		attach: attach,
		load: load,
		get_rank: function() { return rank; }
	}
}()