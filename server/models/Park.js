const mongoose = require("mongoose")
const Schema = mongoose.Schema
const parkSchema = new Schema({
    fullName:{
        type:String
    },
    description:{
        type:String
    }
})
const Park = mongoose.model("Park", parkSchema)

module.exports = Park