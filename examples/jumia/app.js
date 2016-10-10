var crawler = require('../../index');
var debug = require('debug')('nit:jumia');
var S = require('string');
var _ = require('underscore');
var fs = require('fs');
var isUrl = require('is-url');

debug('.....');
var c = crawler('https://www.jumia.ma/', {
			href : 'a@href | notEmpty | map_domaine | domaine'
		}, {
			follow_links : {
				allow : false,
				selector : 'a@href | notEmpty | map_domaine',
				deep : 1,
			},
			maps : {
				trim : function(v){
					return S(v).trim().s;
				},
				domaine : function (v){
					if(S(v).startsWith('/')){
						return 'https://www.jumia.ma' + v;
					}
					else return v;
				}
			},
			filters : {
				notEmpty : function (v) {
					return !S(v).isEmpty();
				},
				domaine : function(v){
					return S(v).startsWith('https://www.jumia.ma/') || S(v).startsWith('http://www.jumia.ma/');
				},
				isUrl : function(v){
					return isUrl(v);
				}
			}
		})
		.transform(function (res) {
			debug('Transform data');
			return 	_.map(res, function(page){
						return page.href;
					});
		})
		.load(function (res){
			debug('Load data');
			fs.writeFile(__dirname + '/output.json', JSON.stringify(res, null, 4));
		})
		.error(function(err, url){
			debug(err);
		})
		.fetch();
debug('End process');