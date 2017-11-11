class Uploader < ApplicationRecord
	def self.write payload:, target:
		File.open(Rails.root.join('figs', target, 'json.txt'), 'w') do |f|
			f.write(payload)
		end

		return true
	end
end
