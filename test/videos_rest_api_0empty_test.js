/** This is a testfile to be run wit mocha.
 *  Remember to start your node server before and edit config_for_tests for a proper baseURL.
 *
 *
 *
 *
 *     This test only works for an EMPTY app data store. Restart node then.
 *
 *
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 */
"use strict";

var should = require('should');
require('should-http');
var request = require('supertest');
var cfg = require('./config_for_tests');

var baseURL = cfg.baseURL; // please change it in file config_for_tests.js
var videoURL = cfg.videoURL;


// some helper objects and function to be send to node ********************************************
var videoURL = baseURL + 'videos';
var codes = cfg.codes;
var videoCorrectMin = cfg.videoCorrectMin;
var videoCorrectMax = cfg.videoCorrectMax;

// start of tests ********************************************************************************
describe('Clean /video REST API with empty store', function() {
    var videoIDsCleanup = []; // will be used as temp-store in test...to cleanup videos at the end
    
    it('should send status 204 and empty body on first request (empty database store)', function (done) {
        request(videoURL)
            .get('/')
            .set('Accept-Version', '1.0')
            .set('Accept', 'application/json')
            .expect(codes.nocontent)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.be.empty('ERR: make sure to run tests on fresh node server restart!');
                done();
            })
    });
    // check header fields
    it('should detect wrong Accept header and give status 406', function (done) {
        request(videoURL)
            .post('/')
            .set('Accept-Version', '1.0')
            .set('Accept', 'text/plain')
            .set('Content-Type', 'application/json')
            .send(videoCorrectMin)
            .expect('Content-Type', /json/)
            .expect(codes.cannotfulfill)
            .end(function (err, res) {
                if (!err && res.body && res.body.id) {
                  videoIDsCleanup.push(res.body.id); // remember for delete at end...
                }
                done();
            })
    });
    it('should detect wrong Content-Type header and give status 415', function (done) {
        request(videoURL)
            .post('/')
            .set('Accept-Version', '1.0')
            .set('Accept', 'application/json')
            .set('Content-Type', 'text/plain')
            .send(JSON.stringify(videoCorrectMin))
            .expect('Content-Type', /json/)
            .expect(codes.wrongmedia)
            .end(function (err, res) {
                if (!err && res.body && res.body.id) {
                    videoIDsCleanup.push(res.body.id); // remember for delete at end...
                }
                done();
            })
    });

    // delete the  posted videos at end if not already deleted...
    after(function(done) {
        var numDone = videoIDsCleanup.length;
        for (var i = 0; i < videoIDsCleanup.length; i++) {
            request(videoURL)
                .delete('/' + videoIDsCleanup[i])
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect(true)
                .end(function() {
                    if (--numDone === 0) {
                        done();
                    }
                });
        };
        if (numDone === 0) {
            done();
        }
    });
});
