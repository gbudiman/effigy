var uploader = function() {
	upload_button = null;
	upload_status = null;
	upload_payload = null;

	var attach = function() {
		upload_button = $('#upload');
		upload_status = $('#upload-status');
		upload_payload = $('#payload');
		
		upload_button.on('click', upload);
	}

	var upload = function() {
		upload_status.text('Transmitting...');
		$.ajax({
			url: '/uploader/transmit',
			method: 'POST',
			data: {
				payload: upload_payload.val(),
				target: $('#video-selector').val()
			}
			
		}).done(function(res) {
			upload_status.text('Upload ' + (res.success ? 'completed' : 'failed'));
		})
	}

	return {
		attach: attach,
		upload: upload
	}
}()

