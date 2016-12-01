/** This is a testfile to be run wit mocha.
 *  Remember to start your node server before and edit config_for_tests for a proper baseURL.
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
describe.skip('Task 1.a CRUD', function() {
    var videoCorrect1Result = null;
    var videoCorrect2Result = null;
    var videoIDsCleanup = [];
    describe('/videos REST API POST', function() {
        // good POSTs
        it('should save a proper POST (and add all missing fields) and sends back the complete object with id, timestamp etc.', function(done) {
            request(videoURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(videoCorrectMin)
                .expect('Content-Type', /json/)
                .expect(codes.created)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.properties(Object.getOwnPropertyNames(videoCorrectMin));
                    res.body.should.have.property('id').above(0);
                    videoCorrect1Result = res.body; // (not part of test) remember result for cleanup later
                    videoIDsCleanup.push(res.body.id); // (not part of test) remember result for cleanup later
                    done();
                })
        });
        it('should save a proper POST (with all fields) and send back the object with id and timestamp', function(done) {
            request(videoURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(videoCorrectMax)
                .expect('Content-Type', /json/)
                .expect(codes.created)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.properties(Object.getOwnPropertyNames(videoCorrectMax));
                    res.body.should.have.property('id');
                    res.body.id.should.be.above(0);
                    res.body.should.have.property('playcount', videoCorrectMax.playcount);
                    res.body.should.have.property('ranking', videoCorrectMax.ranking);
                    videoCorrect2Result = res.body;
                    videoIDsCleanup.push(res.body.id);
                    done();
                })
        });

        // bad POSTs
        it('should detect a post to wrong URL with id and answer with code 405', function(done) {
            request(videoURL)
                .post('/123')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(videoCorrectMax)
                .expect(codes.wrongmethod)
                .end(function(err, res) {
                    should.not.exist(err);
                    if (res.body && res.body.id) {  // usually your body should be empty if correct implemented
                        videoIDsCleanup.push(res.body.id);
                    }
                    done();
                })
        });
        // bad POST, body contains nonsense (not JSON)
        it('should detect a post with bad body and send status 400', function(done) {
            request(videoURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send('this is not proper JSON')
                .expect(codes.wrongrequest)
                .end(function(err, res) {
                    should.not.exist(err);
                    if (res.body && res.body.id) { // usually your body should be empty if correct implemented
                        videoIDsCleanup.push(res.body.id);
                    }
                    done();
                })
        });
    });
    // *******************************************************
    describe('/videos REST API PUT', function() {
        // good PUTs
        it('should save a proper PUT with required fields and change in .length', function(done) {
            videoCorrect1Result.length = 4*60+2;
            request(videoURL)
                .put('/'+videoCorrect1Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(videoCorrect1Result)
                .expect('Content-Type', /json/)
                .expect(codes.success)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.properties(Object.getOwnPropertyNames(videoCorrect1Result));
                    res.body.should.have.property('id', videoCorrect1Result.id);
                    res.body.should.have.property('length', videoCorrect1Result.length);
                    done();
                })
        });
        it('should save a proper PUT with all fields and change in .ranking', function(done) {
            videoCorrect2Result.ranking = 13;
            request(videoURL)
                .put('/'+videoCorrect2Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(videoCorrect2Result)
                .expect('Content-Type', /json/)
                .expect(codes.success)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.properties(Object.getOwnPropertyNames(videoCorrect2Result));
                    res.body.should.have.property('id', videoCorrect2Result.id);
                    res.body.should.have.property('ranking', videoCorrect2Result.ranking);
                    done();
                })
        });

        // bad PUTs
        it('should detect a PUT to wrong URL (without id) and answer with code 405', function(done) {
            request(videoURL)
                .put('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(videoCorrect1Result)
                .expect(codes.wrongmethod)
                .end(function(err, res) {
                    should.not.exist(err);
                    done();
                })
        });
        // bad PUT, body contains nonsense (not JSON)
        it('should detect a PUT with bad body and send status 400', function(done) {
            request(videoURL)
                .put('/'+videoCorrect1Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send('this is not proper JSON')
                .expect(codes.wrongrequest)
                .end(function(err, res) {
                    should.not.exist(err);
                    done();
                })
        });
    });
    // *******************************************************
    describe('/videos REST API DELETE', function() {
        // good DELETEs
        it('should properly delete and answer with code 204', function(done) {
            request(videoURL)
                .delete('/'+videoCorrect1Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.nocontent)
                .end(function(err, res) {
                    should.not.exist(err);
                    done();
                })
        });
        // bad DELETEs
        it('should properly detect if a resource does not exist for delete and answer with code 404', function(done) {
            request(videoURL)
                .delete('/'+videoCorrect1Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.notfound)
                .end(function(err, res) {
                    should.not.exist(err);
                    done();
                })
        });
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
