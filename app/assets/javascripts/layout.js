var layout = function() {
	var video_selector;
	var video_player;
	var pane;

	var attach = function() {
		attach_video_selector();

		$(window).on('resize', function() {
			layout_video_window();
			layout_pane();
		})
		layout_video_window();
		layout_pane();
	}

	var attach_video_selector = function() {
		video_selector = $('#video-selector');
		video_player = $('#video-player');
		pane = $('#pane');
		dynaloader.attach();

		video_selector.on('changed.bs.select', function() {
			var video_title = video_selector.selectpicker('val');
			var video_file = video_selector.find('option:selected').attr('file');

			video_player.empty().append('<source src="/videos/' + video_file + '">');
			layout_video_window();
			

			$.ajax({
				method: 'GET',
				url: 'get_meta',
				data: {
					video_title: video_title
				}
			}).done(function(res) {
				
				if (res.success) {
					dynaloader.load(video_title, res.result);
					layout_pane();
				}
			})
		})
	}

	var layout_video_window = function() {
		var width = video_player.parent().parent().width();
		video_player.css('max-width', width + 'px');
	}

	var layout_pane = function() {
		//var height = $(window).height() * 0.3;
		//pane.css('max-height', height + 'px');
	}


	return {
		attach: attach,
		get_pane: function() { return pane; },
		get_video_instance: function() { return video_player.get(0); }
	}
}()