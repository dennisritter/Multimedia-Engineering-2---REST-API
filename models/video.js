/**
 * Created by dennisritter on 16.12.16.
 *
 * The mongoose model for a Video.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VideoSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: false, default: ""},
    src: {type: String, required: true},
    length: {type: Number, required: true, min: 0},
    playcount: {type: Number, required: false, min: 0, default: 0},
    ranking: {type: Number, required: false, min: 0, default: 0}
}, {
   timestamps: {createdAt: 'timestamp'}
});

module.export = mongoose.model('Video', VideoSchema);

// _id (String, von Außen nicht setzbar, automatisch bei POST)
//  title (String, required)
//  description (String, optional, default '' [leerer String])
//  src (String, required)
//  length (Number; nicht negative Zahl für Sekundenangabe, required)
//  timestamp (String, nicht von Außen setzbar, automatisch bei POST)
//  playcount (Number; nicht negative Zahl, optional, default 0)
//  ranking (Number; nicht negative Zahl, optional, default 0)
