require 'sinatra'
require 'dm-core'  
require 'dm-timestamps'  
require 'dm-validations'  
require 'dm-migrations'

DataMapper.setup :default, "sqlite://#{Dir.pwd}/database.db"

class Navigation 
 
    include DataMapper::Resource  
  
    property :id              , Serial, :required => true    
    property :created_at      , DateTime

end 

DataMapper.finalize.auto_upgrade!

post '/' do 

  newRow.created_at = Time.now  
  newRow.save  

end

get '/' do

   @title = "AIPD"
   erb :index

end


