const express = require('express');
const app = express();
const morgan = require('morgan');    
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const userRoutes = require('./api/routes/users');
// const productRoutes = require('./api/routes/products');
// const orderRoutes = require('./api/routes/orders');
const repoRoutes = require('./routes/repo');

mongoose.connect(
    'mongodb+srv://zewaa:'
    + process.env.MONGO_ATLAS_PW +
    '@enterprices.ss028.mongodb.net/enterprise?retryWrites=true&w=majority',
    {
    useUnifiedTopology:true,
    useNewUrlParser : true,
    useCreateIndex: true
    }
).then(res=>{console.log("Database Connected")});

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(express.urlencoded({extended : false}));
app.use(express.json());

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
    if(req.method == 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({});
    } 
    next(); 
});

// app.use('/products',productRoutes); 
// app.use('/orders',orderRoutes);
// app.use('/user',userRoutes);
// app.use('/uploads',express.static('uploads'));
app.use('/repo',repoRoutes);

app.use((req,res,next)=>{
    const error = new Error('Not Found');
    error.status= 404;
    next(error);
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error : {
            message : error.message
        }
    })
})

module.exports = app;