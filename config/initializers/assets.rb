# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path
# Add Yarn node_modules folder to the asset load path.
Rails.application.config.assets.paths << Rails.root.join('node_modules')
Rails.application.config.assets.paths << Rails.root.join('figs')

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
Rails.application.config.assets.precompile += %w( velocity.min.js
																									bootstrap-select.min.css
																									bootstrap-select.min.js
																									layout.js
																									dynaloader.js
																									inspector.js
																									uploader.js
																									iframe.js
																									jszip.min.js
																									jszip-utils.min.js )
