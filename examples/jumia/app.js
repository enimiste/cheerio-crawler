var crawler = require('../../index');
var debug = require('debug')('nit:jumia');
var S = require('string');
var _ = require('underscore');

debug('Run');
var c = crawler('https://www.jumia.ma/', {
			href : 'a@href'
		}, {
			follow_links : {
				selector : 'a@href',
				domaine : 'www.jumia.ma',
				allow : true,
				deep : 1
			},
			filters : {
				trim : function(v){
					return S(v).trim().s;
				}
			}
		})
		.transform(function (res) {
			debug('Transform data');
			return res;
		})
		.load(function (res){
			debug('Load data');
		})
		.error(function(err){
			debug(err);
		})
		.run();
debug('End process');