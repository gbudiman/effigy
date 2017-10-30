class Video < ApplicationRecord
	def self.generate_figs input_video:, start: 0, length: 600
		video_name = File.basename input_video
		output_folder = Rails.root.join('figs',
																		video_name.split(/\./)[0..-2].join('.'))

		FileUtils.rm_rf output_folder
		FileUtils.mkdir output_folder

  	syscmd = ["ffmpeg",
					  "-ss #{start}",
						"-i #{input_video}",
						"-t #{length}",
						'-vf select="eq(pict_type\,I),showinfo"',
						'-vsync', 
						"vfr \"#{output_folder}/fig%08d.jpg\"",
						"2> #{output_folder}/meta.txt"
					].join(' ')

		ap syscmd
		system(syscmd)
		File.open("#{output_folder}/timestamp.txt", 'w') do |f|
  		f.write("start = #{start}")
  	end
	end

	def self.generate_metadata video_title:
		meta = Rails.root.join('figs', video_title, 'meta.txt')
		timestamp = Rails.root.join('figs', video_title, 'timestamp.txt')

		ts = parse_time_info meta: meta, timestamp: timestamp
		return generate_rank(ts: ts)
		
	end

	def self.generate_rank ts:
		ranks = Array.new

		ts.each do |t|
			ranks.push({
				t: t,
				r: 1 + rand(10)
			})
		end

		return ranks
	end

	def self.parse_time_info meta:, timestamp:
		time_offset = 0
		marks = Array.new

		File.open(timestamp, 'r') do |f|
			f.each_line do |l|
				if l.match(/^start\s+\=\s+(\d+)/)
					time_offset = $1.to_f
				end
			end
		end

		File.open(meta, 'r') do |f|
			f.each_line do |l|
				if l.match(/pts_time\:([\d+\.]+)/)
					marks.push($1.to_f + time_offset)
				end
			end
		end

		return marks
	end
end
