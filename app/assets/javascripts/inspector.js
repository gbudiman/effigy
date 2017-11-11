var inspector = function() {
	var sbody;

	var fetch = function() {
		$.ajax({
			url: '/inspector/fetch',
			method: 'GET'
		}).done(function(res) {
			sbody = $('#scenecls-tbody');
			build_inspector(res);
		})
	}

	var build_inspector = function(res) {
		sbody.empty();
		wtext = '';
		console.log(res);

		$.each(Object.keys(res).sort(), function(i, image_name) {
			data = res[image_name];
			wtext += '<tr'
					  +      ' class="' + (data.io == 'indoor' ? 'row-indoor' : 'row-outdoor') + '"'
						+  '>'
						+    '<td>'
						+      '<img src="assets/pacific_rim/' + image_name + '" class="figmini" />'
						+    '</td>'
						+    '<td>'
						+      '<img src="assets/pacific_rim/sam/' + image_name + '" class="figmini" />'
						+    '</td>'
						+    '<td>' 
						+ 			'<div>' + data.scene_category + '</div>'
						+       '<div style="height:4px;'
						+           ' width:' + (parseFloat(data.scene_confidence)) * 100 + '%;'
						+           ' background-color:#933"> '
						+    '</td>'
					  +  '</tr>';
		})

		sbody.append(wtext);
	}

	return {
		fetch: fetch
	}
}()