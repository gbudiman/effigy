class VisController < ApplicationController
	def get_meta
		video_title = request[:video_title]
		render json: {
			success: true,
			result: JSON.parse(IO.read(Rails.root.join('figs', video_title, 'ranked_keyframes.json')))
		}
	end
end
