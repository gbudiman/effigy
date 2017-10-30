require 'fileutils'

namespace :video do
  desc "Extract I-frames from video"
  # Invoke: rake video:to_figs"[input.mp4, 90, 250]"
  # Note no space after to_figs
  # _start_s and _length_s are optional, specified in seconds
  task :to_figs, [:input_video, :start_s, :length_s] => [:environment] do |task, args|
  	args.with_defaults(start_s: 0, length_s: 600)
  	
  	input_video = args[:input_video]
  	input_video_name = File.basename input_video
  	start_s = args[:start_s]
  	length_s = args[:length_s]

  	output_folder = Rails.root.join('figs',
  																	input_video_name.split(/\./)[0..-2].join('.'))

  	FileUtils.rm_rf output_folder
  	FileUtils.mkdir output_folder

  	syscmd = ["ffmpeg",
  						  "-ss #{start_s}",
  							"-i #{input_video}",
  							"-t #{length_s}",
  							'-vf select="eq(pict_type\,I),showinfo"',
  							'-vsync', 
  							"vfr \"#{output_folder}/fig%08d.jpg\"",
  							"2> #{output_folder}/meta.txt"
  						].join(' ')

  	
		ap syscmd
		system(syscmd)
		File.open("#{output_folder}/timestamp.txt", 'w') do |f|
  		f.write("start = #{start_s}")
  	end
  end

end
