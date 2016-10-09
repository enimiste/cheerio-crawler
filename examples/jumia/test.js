var crawler = require('../../index');
var debug = require('debug')('nit:jumia');
var S = require('string');
var _ = require('underscore');
var fs = require('fs');
var isUrl = require('is-url');

debug('.....');
var c = crawler('https://www.jumia.ma/', {
			img : 'img@src',
			href : 'a@href'
		}, {
			follow_links : {
				allow : false,
				selector : '',
				deep : 1,
			},
			filters : {}
		})
		.transform(function (res) {
			debug('Transform data');
			return res;
		})
		.load(function (res){
			debug('Load data');
			fs.writeFile(__dirname + '/test.json', JSON.stringify(res, null, 4));
		})
		.error(function(err, url){
			debug(err);
		})
		.fetch();
debug('End process');