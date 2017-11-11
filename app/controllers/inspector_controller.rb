class InspectorController < ApplicationController
	def index
	end
	
	def fetch
		render json: IO.read(Rails.root.join('figs', 'pacific_rim', 'scenecls.txt'))
	end
end
