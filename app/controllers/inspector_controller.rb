class InspectorController < ApplicationController
	def index
	end
	
	def fetch
		kind = request[:kind]
		video = request[:video]
		#render json: IO.read(Rails.root.join('figs', 'pacific_rim', 'scenecls.txt'))
		render json: {
			near: IO.read(Rails.root.join('figs', video, 'wnear.txt')),
			mid: IO.read(Rails.root.join('figs', video, 'wmid.txt')),
			far: IO.read(Rails.root.join('figs', video, 'wfar.txt'))
		}

	end
end
