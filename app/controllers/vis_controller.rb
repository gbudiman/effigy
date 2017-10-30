class VisController < ApplicationController
	def get_meta
		video_title = request[:video_title]
		render json: {
			success: true,
			result: Video.generate_metadata(video_title: video_title)
		}
	end
end
