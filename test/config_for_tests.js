/** This module defines some parameters for all tests and is included as a config to tests
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module test/config-for-tests
 * @type {Object}
 */

// Please change the test base URL if you have different server:port
module.exports.baseURL = 'http://localhost:3000/';

// some helper objects and function to be send to node ********************************************
module.exports.videoURL = module.exports.baseURL + 'videos';
module.exports.codes = {
    success: 200,
    created: 201,
    wrongrequest: 400,
    notfound: 404,
    wrongmethod: 405,
    cannotfulfill: 406,
    wrongmedia: 415,
    nocontent: 204
};

module.exports.videoCorrectMin = {
    title: "404, the story of a page not found",
    src: "http://download.ted.com/talks/RennyGleeson_2012U-480p.mp4?apikey=489b859150fc58263f17110eeb44ed5fba4a3b22",
    length: 4*60
};

module.exports.videoCorrectMax = {
    title: "Gaming can make a better world (Jane McGongigal)",
    description: "Game Designer and Future researcher Jane McGonigal explains parts of her book about reality is Broken. She sums up how gaming and gamers can save our planet by solving the hard problems.",
    src: "http://download.ted.com/talks/JaneMcGonigal_2010-480p.mp4?apikey=489b859150fc58263f17110eeb44ed5fba4a3b22",
    length: 19*60+56,
    playcount: 3992659,
    ranking: 12345
};
module.exports.videoIncorrectNumber = {
    title: "The next web (Tim Berners-Lee)",
    description: "20 years ago, Tim Berners-Lee invented the World Wide Web. For his next project, he's building a web for open, linked data that could do for numbers what the Web did for words, pictures, video: unlock our data and reframe the way we use it together.",
    src: "http://download.ted.com/talks/TimBernersLee_2009-480p.mp4?apikey=489b859150fc58263f17110eeb44ed5fba4a3b22",
    length: 16*60+13,
    playcount: 1158984,
    ranking: -12
};

module.exports.videoCorrect3 = {
    title: "The next 5000 days of the web",
    description: "At the 2007 EG conference, Kevin Kelly shares a fun stat: The World Wide Web, as we know it, is only 5,000 days old. Now, Kelly asks, how can we predict what's coming in the next 5,000 days?",
    src: "http://download.ted.com/talks/KevinKelly_2007P-480p.mp4?apikey=489b859150fc58263f17110eeb44ed5fba4a3b22",
    length: 19*60+22,
    playcount: 1108247,
    ranking: 44
};

module.exports.videoCorrect4 = {
    title: "Let's talk parenting taboos",
    description: "Babble.com publishers Rufus Griscom and Alisa Volkman, in a lively tag-team, expose 4 facts that parents never, ever admit � and why they should. Funny and honest, for parents and nonparents alike.",
    src: "http://download.ted.com/talks/RufusGriscomandAlisaVolkman_2010W-480p.mp4?apikey=489b859150fc58263f17110eeb44ed5fba4a3b22",
    length: 17*60+1,
    playcount: 1843221,
    ranking: 100
};