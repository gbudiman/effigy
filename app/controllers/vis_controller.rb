class VisController < ApplicationController
	def get_meta
		video_title = request[:video_title]
		render json: {
			success: true
			#result: JSON.parse(IO.read(Rails.root.join('figs', video_title, 'ranked_keyframes.json'))),
			#mask: JSON.parse(IO.read(Rails.root.join('figs', video_title, 'masked', 'mask_info.json')))
		}
	end
end
