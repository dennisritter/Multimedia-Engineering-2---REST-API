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
describe('Task 2.a Filter', function() {
    var videoCorrect1Result = null;
    var videoCorrect2Result = null;
    var videoIDsCleanup = [];
    describe('/videos REST API Filtering', function() {
        // ask for correct filters
        it('should again create a video on post', function(done) {
            request(videoURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(videoCorrectMin)
                .expect('Content-Type', /json/)
                .expect(codes.created)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.properties(Object.getOwnPropertyNames(videoCorrectMin));
                    res.body.should.have.property('id').above(0);
                    videoCorrect1Result = res.body;
                    videoIDsCleanup.push(res.body.id);
                    done();
                });
        });
        it('should correctly filter videos by given keys title,src', function(done) {
                request(videoURL)
                .get('/'+videoCorrect1Result.id+'?filter=src,title')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.success)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.keys('src', 'title');
                    res.body.should.have.property('title', videoCorrectMin.title);
                    done();
                });
        });
        it('should again create a video on post', function(done) {
            request(videoURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(videoCorrectMax)
                .expect('Content-Type', /json/)
                .expect(codes.created)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.properties(Object.getOwnPropertyNames(videoCorrectMax));
                    res.body.should.have.property('id').above(0);
                    videoCorrect2Result = res.body;
                    videoIDsCleanup.push(res.body.id);
                    done();
                });
        });
        it('should detect bad filter parameters (not existing) and return status 400', function(done) {
            request(videoURL)
                .get('/'+videoCorrect2Result.id+'?filter=scr,title')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect(codes.wrongrequest)
                .end(function(err, res){
                    should.not.exist(err);
                    done();
                });

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
