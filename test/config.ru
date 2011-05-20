require 'rubygems'
require 'bundler/setup'
# require 'sinatra'
require 'jbundle'

run lambda{|env|
  JBundle.config_from_file File.dirname(__FILE__) + '/../Jfile'
  [200, {'Content-Type' => 'application/x-javascript'}, [JBundle.build('catwalk.js').src]]
}