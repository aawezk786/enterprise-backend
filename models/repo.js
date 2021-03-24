const mongoose = require('mongoose');

const testSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    customer_name: { type: String },
    rc_number : { type : String ,default : null},
    chassis_number : {type : String,default : null},
    engine_number : {type :String,default : null},
    file_name : {type : String}
});

module.exports = mongoose.model('Repo',testSchema);