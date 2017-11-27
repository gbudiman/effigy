Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root                         to: 'vis#index'
  get     '/get_meta'         ,to: 'vis#get_meta'
  get     '/inspector'        ,to: 'inspector#index'
  get     '/inspector/fetch'  ,to: 'inspector#fetch'
  get     '/inspector/iframe' ,to: 'inspector#iframe'
  get     '/uploader'					,to: 'uploader#index'
  post    '/uploader/transmit',to: 'uploader#receive'
end
