class UploaderController < ApplicationController
	def index
	end

	def receive
		payload = request['payload']
		target = request['target']

		render json: {
			success: Uploader.write(payload: JSON.parse(payload), target: target)	
		}
	end
end
