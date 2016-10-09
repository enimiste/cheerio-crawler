var _ = require('underscore');
var debug = require('debug')('nit:crawler');

function fetch(url, selector, options){
	let opts = _.extend({
		follow_links : {
				selector : undefined,
				domaine : undefined,
				allow : false,
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

	this.run = function (){
		//TODO
	}
	return this;
}



module.exports = fetch;