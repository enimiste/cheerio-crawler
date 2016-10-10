var crawler = require('../../index');
var debug = require('debug')('nit:jumia');
var S = require('string');
var _ = require('underscore');
var fs = require('fs');
var isUrl = require('is-url');

debug('.....');
var c = crawler('https://www.jumia.ma/', {
			href : 'a@href | trim | domaine'
		}, {
			follow_links : {
				allow : false,
				selector : 'a@href | domaine',
				deep : 1,
			},
			filters : {
				trim : function(v){
					return S(v).trim().s;
				},
				domaine : function(v){
					return (S(v).startsWith('https://www.jumia.ma/') || S(v).startsWith('http://www.jumia.ma/')) ? v : '';
				}
			}
		})
		.transform(function (res) {
			debug('Transform data');
			return 	_.map(res, function(page){
						return _.chain(page.href)
								.map(function(v){
									if(S(v).startsWith('/')){
										return 'https://www.jumia.ma' + v;
									}
									else return v;
								})
								.filter(function(v){
									return isUrl(v);
								});
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