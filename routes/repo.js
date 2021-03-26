const express = require('express');
const router = express.Router();
const multer = require('multer');
const Repo = require('../models/repo');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const async = require('async');
const config = require('../config');
const client = require('twilio')(config.ACCOUNT_SID, config.AUTH_TOKEN);
const { signAccessToken } = require('../helpers/checkAuth');
const createError = require('http-errors');
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
     const RCNo = record.RCNO;
    const test = new Repo({
        _id: new mongoose.Types.ObjectId(),
        vehicle_number : RCNo
    });
    test.save().then(result => {
        
    }).catch(err => {
       next(err)
    });
    })
    res.status(201).json({
        statusCode : 201,
        message: "success",
        totalVehicleCount : data.length
    });
    

   
});

router.get('/',(req,res,next) => {
    var condition = req.query.rc;
    var regex = new RegExp(condition.toLowerCase(), 'i');
    async.parallel([
        function (callback) {
            Repo.countDocuments({vehicle_number : regex}, (err, count) => {
                let totalrepos = count;
                callback(err, totalrepos);
            });
        },
        function (callback) {
            Repo.find({vehicle_number : regex}).select('-file_name -__v -_id' )
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
            parameters: condition,
            totalVehicleCount : totalrepos,
            data : repos
        });
    });
});

router.get('/sendOtp',async (req, res, next) => {
    await client
      .verify
      .services(config.SERVICE_ID)
      .verifications
      .create({
        to: `+919004879919`,
        channel: "sms"
      }).then(data => {
        res.status(200).json({
          statusCode : 200,
          message: "VERIFICATION SEND SUCCESSFULLY",
          data
        });
      }).catch(err => {
        next(err)
      });
  });

router.get('/verifyOtp', async(req, res, next) => {
  const accessToken = await signAccessToken("9004879919")
  let isAdmin;
  if(req.query.adminCode == "admin"){
    isAdmin = true;
  }else{
    isAdmin = false;
  }
    if ((req.query.code).length === 6) {
      client
        .verify
        .services(config.SERVICE_ID)
        .verificationChecks
        .create({
          to: `+919004879919`,
          code: req.query.code
        })
        .then(data => {
          if (data.status === "approved") {
            
            res.status(200).json({
              statusCode : 200,
              message: "USER IS VERIFIED!!",
              data : {
                accessToken : accessToken,
                isAdmin : isAdmin
              }
            })
          }else throw createError.NotAcceptable('Enter Correct Otp');
        }).catch(err => {
          next(createError.NotFound('OTP EXPIRED PLEASE SEND OTP AGIAN'))
        });
    } else {
      res.status(400).json({
        statusCode : 400,
        message: "WRONG CODE :(",
        code : req.query.code
      })
    }
  });

  router.post('/vehicle/add',(req,res,next)=>{
    const vehicle = new Repo({
        _id: new mongoose.Types.ObjectId(),
        vehicle_number : req.body.vehicle_number
    })
    vehicle.save()
        .then(data => {
            res.status(201).json({
                statusCode: 201,
                message: "Created Successfully",
                data: data
            });
        }).catch(err => { next(err) });
  });

  router.delete('/vehicle/delete/:id',async (req,res,next)=>{
    const deletedProduct = await Repo.findByIdAndRemove(req.params.id);
    if(!deletedProduct){
        next(createError.NotAcceptable("Something went wrong"));
    }
            res.status(200).json({
                statusCode: 200,
                message: "Vehicle Deleted Successfully",
                data: deletedProduct
            });
  });

module.exports = router;
