class Video < ApplicationRecord
	def self.generate_similarity input_folder:, compare: nil
		if compare
			s1 = Rails.root.join('figs', input_folder, sprintf("fig%08d.jpg", compare[0]))
			s2 = Rails.root.join('figs', input_folder, sprintf("fig%08d.jpg", compare[1]))

			img1 = Phashion::Image.new(s1.to_s)
			img2 = Phashion::Image.new(s2.to_s)
			ap(img2.distance_from(img1))

		else
			figs = Dir[Rails.root.join('figs', input_folder, '*.jpg')].sort
			outpath = Rails.root.join('figs', input_folder, 'sims.txt')

			sims = { File.basename(figs[0]) => 80 }

			(1..figs.length-1).tqdm.each do |i|
				img1 = Phashion::Image.new(figs[i-1])
				img2 = Phashion::Image.new(figs[i])
				sims[File.basename(figs[i])] = img2.distance_from(img1)
			end

			File.open(outpath.to_s, 'w') do |file|
				file.write(sims.to_json)
			end
		end
		return true
	end

	def self.mux_av video:, audio:, out:
		video_file = Rails.root.join('public', 'videos', video)
		audio_file = Rails.root.join('public', 'videos', audio)
		out_file = Rails.root.join('public', 'videos', out)

		syscmd = ["ffmpeg",
							"-i #{video_file}",
							"-i #{audio_file}",
							'-c:v libx264 -c:a mp3',
							out_file].join(' ')

		ap syscmd
		system(syscmd)
	end

	def self.demo_mux_av
		#['Apple', 'Disney', 'Hussein_Day1_007', 'Michael_Day2_018', 'USCWeek'].each do |v|
		['Michael_Day2_018'].each do |v|
			base_path = Rails.root.join('public', 'videos', v).to_s
			Video.mux_av video: base_path + '.avi',
									 audio: base_path + '.wav',
									 out: base_path + '.mp4'
		end
	end

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

		ts = nil

		begin
			ts = parse_time_info meta: meta, timestamp: timestamp
			return generate_rank(ts: ts)
		rescue
			return JSON.parse(
							 File.read(
							 	 Rails.root.join('figs', video_title, 'json.txt').to_s))
		end
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
