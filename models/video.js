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

module.exports = mongoose.model('Video', VideoSchema);
