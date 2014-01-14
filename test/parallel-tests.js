'use strict';

require('chai').should();
var expect = require('chai').expect;

var async = require('..');

describe('raptor-async parallel' , function() {

    it('should handle empty object of work', function(done) {

        var work = {};

        async.parallel(work, function(err, results) {
            expect(results).to.deep.equal({});
            done();
        });

    });

    it('should handle empty array of work', function(done) {

        var work = [];

        async.parallel(work, function(err, results) {
            expect(results).to.deep.equal([]);
            done();
        });

    });

    it('should return array results in correct order', function(done) {
        
        this.timeout(2000);

        var work = [];

        work[0] = function(callback) {
            setTimeout(function() {
                callback(null, 0);
            }, 1000);
        };

        work[1] = function(callback) {
            setTimeout(function() {
                callback(null, 1);
            }, 500);
        };

        work[2] = function(callback) {
            setTimeout(function() {
                callback(null, 2);
            }, 0);
        };

        async.parallel(work, function(err, results) {
            expect(results).to.deep.equal([0, 1, 2]);
            done();
        });

    });

    it('should return mapped results', function(done) {
        
        this.timeout(2000);

        var work = {};

        work.a = function(callback) {
            setTimeout(function() {
                callback(null, 0);
            }, 1000);
        };

        work.b = function(callback) {
            setTimeout(function() {
                callback(null, 1);
            }, 500);
        };

        work.c = function(callback) {
            setTimeout(function() {
                callback(null, 2);
            }, 0);
        };

        async.parallel(work, function(err, results) {
            expect(results).to.deep.equal({a: 0, b: 1, c: 2});
            done();
        });

    });

    it('should throw error if callback for job is invoked more than once', function(done) {
        
        var uncaughtException;

        var mochaExceptionHandler = process.listeners('uncaughtException').pop();
        process.removeListener('uncaughtException', mochaExceptionHandler);

        process.once('uncaughtException', function(err) {
            // errors for invoking callback more than once will be thrown as errors
            // since they fall into the unexpected exception category
            uncaughtException = err;
            process.on('uncaughtException', mochaExceptionHandler);
        });

        this.timeout(2000);

        var work = {};

        work.a = function(callback) {
            setTimeout(function() {
                callback(null, 0);
            }, 1000);
        };

        work.b = function(callback) {
            setTimeout(function() {
                callback(null, 1);
                callback(null, 'oops!');
            }, 500);
        };

        work.c = function(callback) {
            setTimeout(function() {
                callback(null, 2);
            }, 0);
        };

        async.parallel(work, function(err, results) {
            expect(results).to.deep.equal({a: 0, b: 1, c: 2});
            expect(uncaughtException.toString()).to.equal('Error: callback for async operation with key "b" invoked more than once');
            done();
        });

    });

    it('should handle errors for arrays as input', function(done) {

        this.timeout(2000);

        var work = [];

        work[0] = function(callback) {
            setTimeout(function() {
                callback(null, 0);
            }, 1000);
        };

        work[1] = function(callback) {
            setTimeout(function() {
                callback(null, 1);
            }, 500);
        };

        work[2] = function(callback) {
            setTimeout(function() {
                callback('This throws an error');
            }, 0);
        };

        async.parallel(work, function(err, results) {
            expect(results).to.deep.equal([0, 1, undefined]);
            expect(err.toMap()).to.deep.equal({2: 'This throws an error'});
            expect(err.toString()).to.equal('Errors encountered during async operation:\n2: This throws an error');
            done();
        });

    });

    it('should handle errors for object as input', function(done) {

        this.timeout(2000);

        var work = {};

        work.a = function(callback) {
            setTimeout(function() {
                callback(null, 0);
            }, 1000);
        };

        work.b = function(callback) {
            setTimeout(function() {
                callback(null, 1);
            }, 500);
        };

        work.c = function(callback) {
            setTimeout(function() {
                callback('This throws an error');
            }, 0);
        };

        async.parallel(work, function(err, results) {
            expect(results).to.deep.equal({a: 0, b: 1, c: undefined});
            expect(err.toMap()).to.deep.equal({c: 'This throws an error'});
            expect(err.toString()).to.equal('Errors encountered during async operation:\nc: This throws an error');
            done();
        });

    });

});

