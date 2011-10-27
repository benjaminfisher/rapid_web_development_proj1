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

DataMapper.finalize.auto_upgrade!

nav = Navigation.create department: "Web Design & Interactive Media", location: "/wdim"

get '/' do

   @title = "AIPD"
   erb :index

end


