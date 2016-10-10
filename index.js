var _ = require('underscore');
var debug = require('debug')('nit:crawler');

/**
*
* @param string url
* @param object selector
* @param object options
* @param object cheerio options
*/
function crawl(url, selector, options, cheerio){
	this.url = url;
	this.selector = selector;
	this.cheerio_options = cheerio;
	this.options = _.extend({
		scope : 'body',
		follow_links : {
				allow : false,
				selector : undefined,
				deep : undefined
		},
		filters : {}
	}, options);

	this.callabacks = {
		transform : [],
		load : [],
		error : []
	}

	this.fireTransform = function(res){
		return _.reduce(this.callabacks.transform, function(res, callback){
			return callback(res);
		}, res);
	}

	this.fireLoad = function(res){
		return _.each(this.callabacks.load, function(callback){
			callback(res);
		});
	}

	this.fireError = function(err){
		return _.each(this.callabacks.error, function(callback){
			callback(err);
		});
	}

	this.transform  = function (callback){
		if(!_.isFunction(callback)) debug('Invalid transform callback');
		else this.callabacks.transform.push(callback);
		return this;
	}

	this.load = function (callback){
		if(!_.isFunction(callback)) debug('Invalid load callback');
		else this.callabacks.load.push(callback);
		return this;
	}

	this.error = function (callback){
		if(!_.isFunction(callback)) debug('Invalid error callback');
		else this.callabacks.error.push(callback);
		return this;
	}

	this.fetch = run_fetch;
	return this;
}

/**
*
*/
function run_fetch(){
	debug('Begin Run Crawler');
	//TODO
	var request = require('request');
	var sha1 = require('js-sha1');
	var cheerio = require('cheerio');
	var visitedUrls = [];
	let cheerio_options = _.extend({}, this.cheerio_options);

	let _this = this;
	var endLoop = false;

	let _url = this.url;
	request(_url, function(res_err, response, html){
		if(res_err){
			_this.fireError(err, _this.url);
		}else{
			var $ = cheerio.load(html, cheerio_options);
			function findSelector(selec){
				//selector | filter1 | filter2
				let parts = _.map(selec.split('|'), function(v){
					return v.trim();
				});
				let selector = parts[0];
				//selector@attribute
				var attrs = selector.split('@');
				var matched_elems = $(_this.options.scope).find(attrs[0]);
				
				return _.map(matched_elems, function(match){
					var matched_v = undefined;
					if(attrs.length === 2) {
						if(_.has(match.attribs, attrs[1]))
							matched_v = _.property(attrs[1])(match.attribs);
						else matched_v = '';
					}
					else matched_v = match.text();

					return _.reduce(_.last(parts, parts.length - 1), function(v, filter){
						if(_.has(_this.options.filters, filter))
							return _this.options.filters[filter](v);
						else
							throw 'Filter ' + filter + ' not defined';
					}, matched_v);
				});
			};
			let data = _.mapObject(_this.selector, function(selec){
				return findSelector(selec);
			});

			if(endLoop) _this.fireLoad(_this.fireTransform(data));
		}
	});
}

module.exports = crawl;