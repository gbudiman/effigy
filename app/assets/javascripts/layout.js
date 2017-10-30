var layout = function() {
	var video_selector;

	var attach = function() {
		attach_video_selector();
	}

	var attach_video_selector = function() {
		video_selector = $('#video-selector');
		dynaloader.attach();

		video_selector.on('changed.bs.select', function() {
			var video_title = video_selector.selectpicker('val');
			$.ajax({
				method: 'GET',
				url: 'get_meta',
				data: {
					video_title: video_title
				}
			}).done(function(res) {
				if (res.success) {
					dynaloader.load(video_title, res.result);
				}
			})
		})
	}

	return {
		attach: attach
	}
}()