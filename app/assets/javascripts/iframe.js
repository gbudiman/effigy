var iframe = function() {
	var sel;
	var sbody;
	var video;

	var attach = function() {
		sel = $('#video-selector');
		sel.on('changed.bs.select', function() {
			video = sel.selectpicker('val');

			fetch();
		})
	}

	var fetch = function() {
		$.ajax({
			url: '/inspector/fetch',
			method: 'GET',
			data: {
				kind: 'iframe',
				video: video
			}
		}).done(function(res) {
			sbody = $('#iframe-tbody');
			//console.log(res)
			build_iframe(res);
		})
	}

	var build_iframe = function(res) {
		sbody.empty();
		wtext = '';

		//console.log(JSON.parse(res.near))
		near = JSON.parse(res.near)
		mid = JSON.parse(res.mid)
		far = JSON.parse(res.far)

		$.each(Object.keys(near).sort(), function(i, image_name) {
			var d_near = near[image_name] || 0;
			var d_mid = mid[image_name] || 0;
			var d_far = far[image_name] || 0;

			//var qs = eq_set(prev_set, curr_set);
			//if (qs.added_obj.size != 0 || qs.removed_obj.size != 0) {

			if (d_near > 0.4) {
				wtext += '<tr>'
							+    '<td>'
							+      '<img src="/assets/' + video 
							+ 							 '/' + image_name + '" class="figmini" />'
							+    '</td>'
							+    '<td>' + image_name + '</td>'
							+    '<td>' 
							+ 			'X'.repeat(parseInt(d_near * 100)) + '<br />'
							+ 	 '</td>'
							+  '</tr>';
			}

			//prev_ostr = ostr.length;
			//prev_set = curr_set;
			//}
			
		})

		sbody.append(wtext)
	}

	return {
		attach: attach,
		fetch: fetch
	}
}()