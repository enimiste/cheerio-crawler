var crawler = require('../../index');
var debug = require('debug')('nit:jumia');
var S = require('string');
var _ = require('underscore');

debug('.....');
var c = crawler('url here', {
			title : 'cherrio selector'
		}, {
			follow_links : {
				allow : true,
				selector : 'cherrio selector',
				deep : 1
			},
			filters : {
				trim : function(v){
					return S(v).trim().s;
				},
			}
		})
		.transform(function (res) {
			debug('Transform data');
			return res;
		})
		.load(function (res){
			debug('Load data');
		})
		.error(function(err, url){
			debug(err);
		})
		.fetch();
debug('End process');