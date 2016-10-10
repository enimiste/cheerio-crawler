var _ = require('underscore');
var debug = require('debug')('nit:crawler');
var S = require('string');
var request = require('request');
var sha1 = require('js-sha1');
var cheerio = require('cheerio');

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
				selector : undefined
		},
		maps : {},
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

	this.fetch = run_fetch

	this.findSelector = findSelector;

	return this;
}

/**
*
*/
function run_fetch(){
	debug('Begin Run Crawler');
	
	var visitedUrls = [];
	let cheerio_options = _.extend({}, this.cheerio_options);

	let _this = this;
	var follow_links_opts = this.options.follow_links;
	var follow_links = follow_links_opts.allow;
	var endLoop = !follow_links;

	


	let _url = this.url;
	this.data = [];
	
	//get data for main selector
	request(_url, function(res_err, response, html){
		if(res_err){
			_this.fireError(res_err, _this.url);
		}else{
			var $ = cheerio.load(html, cheerio_options);
			
			let data = _.mapObject(_this.selector, function(selec){
				return _this.findSelector($, selec);
			});

			_this.data.push(data);

			if(endLoop) 
				_this.fireLoad(_this.fireTransform(_this.data));

			if(follow_links){
				//get next links to follow
				if(!_.isString(follow_links_opts.selector))
					throw 'Follow links selector should be a string';

				var links = _this.findSelector($, follow_links_opts.selector);
			}
		}
	});	
}

/**
*
* @param object $ cheerio instance
* @param string selector with piped maps
* @param array results
*/
function findSelector($, selec){
	//selector | filter1 | filter2
	let parts = _.map(selec.split('|'), function(v){
		return v.trim();
	});
	let selector = parts[0];
	//selector@attribute
	var attrs = selector.split('@');
	var matched_elems = $(this.options.scope).find(attrs[0]);
	var _this = this;
	let elems = matched_elems.map(function(i, el){
		let match = $(this);
		var matched_v = undefined;
		if(attrs.length === 2) {
			matched_v = match.attr(attrs[1]);
		}
		else {
			matched_v = match.text();
		}

		let actions = _.last(parts, parts.length - 1);
		var matched_v_v = matched_v;
		
		_.each(actions, function(action){
			if(matched_v_v !== undefined){
				if(S(action).startsWith('map_')){
					action = S(action).replaceAll('map_', '').s;
					//is a map function
					if(_.has(_this.options.maps, action)){
						action = _.property(action)(_this.options.maps);
						matched_v_v = action(matched_v_v);
					} else
						throw 'Map function not found : ' + action;
				} else {
					//is a filter function
					let take = true;
					if(_.has(_this.options.filters, action)){
						action = _.property(action)(_this.options.filters);
						take = action(matched_v_v);
					} else
						throw 'Filter function not found : ' + action;
					if(!take) matched_v_v = undefined;
				}
			}
		});
		return matched_v_v;
	}).get();
	return _.filter(
				elems
			,function(elem){
				return elem !== undefined;
			});
};

module.exports = crawl;