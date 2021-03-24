const express = require('express');
const router = express.Router();
const multer = require('multer');
const Repo = require('../models/repo');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const async = require('async');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + ' ' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
   
    cb(null, true);

};

const upload = multer({
storage: storage,
fileFilter: fileFilter
});

router.post('/add',upload.single('file_name'),(req, res, next) => {
   
    console.log(req.file.path);
    const wb = xlsx.readFile(req.file.path);
    const ws = wb.SheetNames;
    const we = wb.Sheets[ws];
    const data = xlsx.utils.sheet_to_json(we);
    
    console.log(data.length);  
    
    data.map((record)=>{
     const CustomerName =   record.CustomerName;
     const RCNo = record.RCNo;
     const EngineNo = record.EngineNo;
     const ChassisNo = record.ChassisNo;
    const test = new Repo({
        _id: new mongoose.Types.ObjectId(),
        customer_name: CustomerName,
        rc_number : RCNo,
        chassis_number : ChassisNo,
        engine_number :  EngineNo,
        file_name :   req.file.path
       
    });
    test.save().then(result => {
        
    }).catch(err => {
       next(err)
    });
    })
    res.status(201).json({
        statusCode : 201,
        message: data.length + "  " +'Updated Successfully',
    });
    

   
});

router.get('/',(req,res,next) => {
    let query = req.body;
    let mysort;
    // if (req.body.priceDefined) {
    //     query['price'] = { $gte: (query.priceDefined[0]), $lte: (query.priceDefined[1]) }
    //     delete query['priceDefined']
    // }
    // if(req.body.start_date){
    //     query['start_date'] = { $gte : searchKeyword}
    //     console.log(query)
    // }
    // if(req.query.sortBy == 'asc'){
    //     mysort = {price : 1}
    // }else if(req.query.sortBy == 'desc'){
    //     mysort = {price : -1}
    // }else{
    //     mysort = {createdAt : -1}
    // }
    async.parallel([
        function (callback) {
            Repo.countDocuments(query, (err, count) => {
                let totalrepos = count;
                callback(err, totalrepos);
            });
        },
        function (callback) {
            Repo.find({})
                .exec((err, repos) => {
                    if (err) return next(err);
                    callback(err, repos);
                });
        }
    ], function (err, result) {
        console.log(err)
        if (err) return next(err);
        let totalrepos = result[0];
        let repos = result[1];
        res.status(200).json({
            statusCode: 200,
            message: "success",
            parameters: req.body,
            totalrepos : totalrepos,
            data : repos
        });
    });
});


module.exports = router;