require 'sinatra'
require 'dm-core'  
require 'dm-timestamps'  
require 'dm-validations'  
require 'dm-migrations'

DataMapper.setup :default, "sqlite://#{Dir.pwd}/database.db"

class Navigation 
 
    include DataMapper::Resource  
  
    property :id              , Serial, :required => true
    property :department      , String   
    property :location        , String

end 

DataMapper.finalize.auto_migrate!

Navigation.create department: "Visual Game Programming", location: "/vgp"
Navigation.create department: "Web Design & Interactive Media", location: "/wdim"

configure do

    set :navList, Navigation.all

end

get '/' do

   @title = "AIPD"
   erb :index

end

get '/vgp' do

   @title = "AIPD | Visual Game Programming"
   erb :vgp

end


