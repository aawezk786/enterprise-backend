const mongoose = require('mongoose');

const testSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    vehicle_number : {type : String},
    file_name : {type : String}
});

module.exports = mongoose.model('Repo',testSchema);