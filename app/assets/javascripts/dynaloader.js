var dynaloader = function() {
	var pane;
	var rank;
	var srank;
	var zoom_position;
	var max_rank;
	var cumulative_figs_count;
	var ordered_position;
	var current_mouseover;
	var zoom_container;
	var zoom_level_text;
	var overlap_data;
	var frame_map;
	var frame_map_loaded;
	var frame_map_ready;
	var tapestry_loaded;
	var tapestry_ready;
	var global_mouseover_x;
	var last_mouseover_x;
	var last_mouseover_y;
	var video_player;
	var fixed_tapestry_height;
	var dict_width;
	var video_name;
	var frame_map_loader_message;
	var tapestry_loader_message;
	var idx_top;
	var idx_bottom;

	// animation-related
	var bounce_enabled;
	var bounce_time = 500;

	var attach = function() {
		pane = layout.get_pane();
		zoom_level_text = $('#zoom-level');
		zoom_container = $('#zoom-container');
		frame_map_loader_message = $('#frame-map-loader-message');
		tapestry_loader_message = $('#tapestry-loader-message');
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

	var set_zoom_text = function() {
		zoom_level_text.text(zoom_position);
	}

	var strip_extension = function(s) {
		return s.replace(/\.\w+$/, '');
	}

	var set_frame_loader_message = function(val) {
		if (!val) {
			frame_map_loader_message.text('').hide(400);
		} else {
			frame_map_loader_message.text('Loading Frame Map data...').show();
		}
	}

	var show_tapestry_loader_message = function(val) {
		if (val) {
			tapestry_loader_message.text('Downloading tapestry images...').show();
		} else {
			tapestry_loader_message.text('').hide(400);
		}
	}

	var populate_dict_width = function() {
		dict_width = [];
		for (var i = 0; i < max_rank; i++) {
			dict_width.push($('img[data-tapestry=' + i + ']').css('width'));
			if (i == 0) {
				fixed_tapestry_height = $('img[data-tapestry=' + i + ']').css('height');
			}
		}

		console.log(dict_width);
	}

	var load = function(v) {
		video_name = v;
		attach_zoom(false);
		setup_zoom();
		setup_seek();
		pane.empty().show();
		spawn_images();
		// setTimeout(function() {
			
		// }, 250);
		
		zoom_container.show();
		$('[data-tapestry=0]').show();
		load_frame_map();
		// pane.show();
		// pane.empty();
		// attach_zoom(false);
		// rank = {};
		// overlap_data = {};
		// cumulative_figs_count = {};
		// ordered_position = new Array();
		
		// $.each(d, function(key, data) {
		// 	var png_key = key.replace('jpg', 'png');
		// 	overlap_data[key] = m[png_key];
		// 	if (!(data.r in rank)) {
		// 		rank[data.r] = 0;
		// 	}

		// 	rank[data.r]++;
		// 	spawn_image(v, key, data);
		// 	if (cumulative_figs_count[data.r] == undefined) {
		// 		cumulative_figs_count[data.r] = 0;
		// 	}

		// 	ordered_position.push({ rank: data.r, frame: strip_extension(key) });
		// 	cumulative_figs_count[data.r]++;
		// })

		// figs_count_key = Object.keys(cumulative_figs_count).sort();
		// $.each(figs_count_key, function(i, x) {
		// 	position = parseInt(x);
		// 	previous_amount = (cumulative_figs_count[position - 1] || 0);

		// 	cumulative_figs_count[position] += previous_amount;
		// })

		// set_figmini_margin();
		// setup_caret();
		// setup_zoom();
		// setup_seek();
		// toggle_figs();
		// layout_pane();
	}

	var load_frame_map = function() {
		var v = video_name;
		var frame_map_regex = /frame_map_(\d+).csv/;
		frame_map = new Array([], [], [], []);
		idx_bottom = { 0: {}, 1: {}, 2: {}, 3: {} };
		idx_top = { 0: {}, 1: {}, 2: {}, 3: {} };
		frame_map_loaded = 0;
		frame_map_ready = false;

		var parse_raw_csv = function(z, level_index) {
			return new Promise(function(resolve, reject) {
				var data = new Array();
				var rows = z.split('\n');

				$.each(rows, function(row_index, row_data) {
					var row = new Array();
					$.each(row_data.split(','), function(col_index, _data) {
						var data = parseInt(_data);
						if (row_index == 0) {
							if (idx_top[level_index][data] == undefined) {
								idx_top[level_index][data] = col_index;
							}
						}

						if (row_index == rows.length - 2) {
							if (idx_bottom[level_index][data] == undefined) {
								idx_bottom[level_index][data] = col_index;
							}
						}

						row.push(data);
					})
					data.push(row);
				});

				resolve(data);
			})
			
		}

		set_frame_loader_message(true);

		new JSZip.external.Promise(function (resolve, reject) {
			JSZipUtils.getBinaryContent('/assets/' + v + '/tapestry/frame_map.zip', function(err, data) {
				if (err) { reject(err); }
				else { resolve(data); }
			})
		}).then(function(data) {
			return new Promise(function(resolve, reject) {
				var zip = new JSZip();

				zip.loadAsync(data).then(function(contents) {
					$.each(contents.files, function(filename) {
						var match = frame_map_regex.exec(filename);
						var level_index = parseInt(match[1]);
						zip.file(filename).async('text').then(function(content) {
							parse_raw_csv(content, level_index).then(function(data) {
								frame_map[level_index] = data;
								frame_map_loaded++;

								if (frame_map_loaded == 4) {
									resolve(true);
								}
							})
						})
					})
				})
			})
		}).then(function(data) {
			frame_map_ready = true;
			//console.log(frame_map);
			//console.log(idx_top);
			//console.log(idx_bottom);
			set_frame_loader_message(false);
		});
		// 	return JSZip.loadAsync(data);
		// }).then(function(data) {
		// 	console.log(data);
		// 	console.log(data.files);
		// 	//var zip = new JSZip();
		// 	//zip.loadAsync(data);

		// 	$.each(data.files, function(file_name, data) {
		// 		console.log(file_name);
		// 		data.file(file_name).async('string').then(function(content) {
		// 			console.log(content);
		// 		})
		// 	})
		// })
	}

	var set_figmini_margin = function() {
		//console.log(overlap_data);
		var index = 0;
		var keys = Object.keys(overlap_data);

		for (var k = 0; k < keys.length; k++) {
			var key = keys[k];

			//console.log(key);
			if (k < keys.length - 1) {
				var scaler = 96.0/352.0;
				var next_key = keys[k + 1];
				var next_id = '#' + next_key.replace('.jpg', '');
				var next_left = overlap_data[next_key].l;
				var curr_right = overlap_data[key].r;

				if (curr_right < next_left) {
					$(next_id).css('margin-left', (-1 * curr_right * scaler) + 'px');
				} else {
					$(next_id).css('margin-left', (-1 * next_left * scaler) + 'px');
				}
			}

		}

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
		var scrollpx = (caret_count - 1) * 96 + 77;

		return scrollpx - current_left;
	}

	var toggle_figs = function() {
		pane.find('img').hide();

		for (var rank = 0; rank <= zoom_position; rank++) {
			pane.find('img[rank="' + rank + '"]').show();
		}
	}

	var setup_zoom = function() {
		max_rank = 4;
		zoom_position = 0;
		set_zoom_text();
		attach_zoom(true);
	}

	var setup_seek = function() {
		video_player = layout.get_video_instance();
		// $('#pane').find('img').on('click', function() {
		// 	var t = parseFloat($(this).attr('time'));

		// 	video_player.currentTime = t;
		// 	video_player.play();
		// });
	}

	var zoom = function(dir) {
		var ulimit = max_rank;
		var trigger = function(act, pos) {
			var rank_value = pos;
			
			if (act == 'show') {
				//layout_pane();
				var scrollx = maintain_scroll();
				var group = $('img[data-tapestry=' + (rank_value + 1) + ']');
				group.show().css('opacity', 0)

				//pane.scrollLeft(scrollx);
				group.velocity({
					opacity: 1
				}, bounce_time, function() {
					bounce_enabled = true;
					
				})
			} else if (act == 'hide') {
				var scrollx = maintain_scroll();

				$('img[data-tapestry=' + rank_value + ']').velocity({
					opacity: 0
				}, bounce_time, function() {
					$(this).hide();
					bounce_enabled = true;
					//layout_pane();
					//pane.scrollLeft(scrollx);
				})
			}
		}

		var trigger_tapestry = function(direction) {
			

			if (direction == 'up' && zoom_position < max_rank - 1) {
				swap(direction);
				zoom_position++;
			} else if (direction == 'down' && zoom_position > 0) {
				swap(direction);
				zoom_position--;
			}

			set_zoom_text();
		}

		var swap = function(direction) {
			bounce_enabled = false;
			var before = zoom_position;
			var after = before;

			if (direction == 'up') { after++; }
			else { after--; }

			var post_width = $('img[data-tapestry=' + after + ']').css('width');

			
			var lock_x = last_mouseover_x;
			var lock_y = last_mouseover_y;
			var previous_figure = get_frame_at_cursor_position(before, lock_x, lock_y);
			var previous_width = parseFloat(dict_width[before]);
			var next_width = parseFloat(dict_width[after]);
			var scale = next_width / previous_width;
			var after_x = lock_x * scale;

			var prev_pixel = idx_top[before][previous_figure] || idx_bottom[before][previous_figure];
			var next_pixel = idx_top[after][previous_figure] || idx_bottom[after][previous_figure];
			
			var parent_offset = global_mouseover_x - $('#pane').parent().offset().left;
			var frame_offset = lock_x - prev_pixel;
			var diff = next_pixel - parent_offset + frame_offset;


			pane.css('background-image', 'url("/assets/' + video_name + '/tapestry/combined_image_new_' + after + '.jpg")');
			pane.css('background-position', (diff) + 'px 0px');
			//console.log(previous_figure);
			//console.log(global_mouseover_x);
			//console.log(parent_offset);
			//console.log(prev_pixel + ' -> ' + next_pixel + ' | lock_x = ' + lock_x);
			//console.log(diff);

			// console.log(fixed_tapestry_height);
			$('img[data-tapestry=' + before + ']').velocity({
				width: dict_width[after],
				height: fixed_tapestry_height,
				opacity: 0
			}, 1000, function() {
				//console.log(before + ' -> ' + after + ' -> ' + dict_width[after]);
				$(this).hide();
				$('img[data-tapestry=' + after + ']')
					.css('width', dict_width[after])
					.css('height', fixed_tapestry_height)
					.css('opacity', 1)
					.show();

				last_mouseover_x *= scale;

				pane.css('background-image', '');
				pane.css('background-position', '');
				//console.log('index = ' + after);
				//$('img[data-tapestry=' + after + ']').trigger('mousemove');

				bounce_enabled = true;
				if (!isNaN(diff)) {
					pane.animate({scrollLeft: diff}, 250);
					//pane.scrollLeft(diff);
				} else {
					console.log('lock_x = ' + lock_x + ' scale = ' + scale);
					pane.animate({scrollleft: lock_x * scale}, 250);
				}
			})
			// $('img[data-tapestry]').hide();
			// $('img[data-tapestry=' + zoom_position + ']').show();
		}

		if (bounce_enabled) {
			trigger_tapestry(dir);
		}

		// if (bounce_enabled && dir == 'up') {
		// 	if (zoom_position < ulimit) {
		// 		bounce_enabled = false;
		// 		//trigger('show', zoom_position++);
		// 		set_zoom_text();
		// 		return true;
		// 	}
		// } else if (bounce_enabled && dir == 'down') {
		// 	if (zoom_position > 0) {
		// 		bounce_enabled = false;
		// 		//trigger('hide', zoom_position--);
		// 		set_zoom_text();
		// 		return true;
		// 	}
		// }

		return false;
	}

	var spawn_images = function() {
		var v = video_name;
		tapestry_loaded = 0;
		tapestry_ready = false;
		show_tapestry_loader_message(true);
		// var pad = function(_x) {
		// 	var x = _x + 1;
		// 	var length = 8 - String(x).length;

		// 	return '0'.repeat(length) + String(x);
		// }

		for (var i = 0; i < 4; i++) {
			pane.append('<img src="assets/' + v + '/tapestry/combined_image_new_' + i + '.jpg"'
								+     ' data-tapestry=' + i
								+     ' style="display:none"'
								+ ' />')
		}
		$('img[data-tapestry]').on('load', function() {
			tapestry_loaded++;
			console.log('tapestry loaded = ' + tapestry_loaded);

			if (tapestry_loaded == 4) {
				tapestry_ready = true;
				show_tapestry_loader_message(false);
				populate_dict_width();
			}
		})

		attach_mousemove();
	}

	var attach_mousemove = function() {
		$('img[data-tapestry]').on('mousemove', function(event) {
			var parent_offset = $(this).offset();
			last_mouseover_x = parseInt(event.pageX - parent_offset.left);
			last_mouseover_y = parseInt(event.pageY - parent_offset.top);
			global_mouseover_x = parseInt(event.pageX);
			//console.log('X=' + loc_x + 'Y=' + loc_y);

		}).on('click', function() {
			if (frame_map_ready && tapestry_ready) {
				//console.log(zoom_position);
				//console.log(last_mouseover_y);
				var frame_index = frame_map[zoom_position][last_mouseover_y][last_mouseover_x];
				var timestamp = parseFloat(frame_index) / 20;
				video_player.currentTime = timestamp;
				video_player.play();
				console.log('Z = ' + zoom_position + ' | XY = (' + last_mouseover_x + ', ' + last_mouseover_y + ') => ' + frame_index);
			}
		})
	}

	var get_frame_at_cursor_position = function(pos, x, y) {
		return frame_map[pos][y][x];
	}

	return {
		attach: attach,
		load: load,
		get_rank: function() { return rank; }
	}
}()