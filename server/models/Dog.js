const mongoose = require('mongoose');

const DogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    breed: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    age: {
        type: Number,
        min: 1,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const DogModel = mongoose.model('Dog', DogSchema);
module.exports = DogModel
