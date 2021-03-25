const mongoose = require('mongoose');

const testSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    customer_name: { type: String },
    rc_number : { type : String },
    chassis_number : {type : String},
    engine_number : {type :String},
    file_name : {type : String}
});

module.exports = mongoose.model('Repo',testSchema);