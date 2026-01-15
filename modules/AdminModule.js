const db = require('mongoose');
const { Schema } = db

const Admin = new Schema({
    adminId: {
        type: Number,
        required: true,
        unique:true,
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required:true,
    },
})

module.exports = db.model('admin', Admin);