const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const expressJwt = require('express-jwt');
const errorHandler = require('./hepers/error-handler')
require('dotenv/config');
//const authJwt = require('./hepers/jwt');



const secret = process.env.PASS_SEC;
const api = process.env.API_URL;

//cors
app.use(cors());
app.options('*',cors());


//Middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
async function isRevoked(req,payload,done){
    if(!payload.isAdmin){
        done(null,true)
    }

    done();
}
app.use(expressJwt({
    secret:secret,
    algorithms:['HS256'],
    isRevoked:isRevoked
}).unless({
    path:[
        {url:/\/public\/uploads(.*)/, methods:['GET','OPTIONS']},
        {url:/\/api\/v1\/products(.*)/, methods:['GET','OPTIONS']},
        {url:/\/api\/v1\/categories(.*)/, methods:['GET','OPTIONS']},
       `${api}/users/login`,
       `${api}/users/register`,
       
    ]
})

);
app.use('/public/uploads',express.static(__dirname + '/public/uploads'));
app.use(errorHandler);



//routes


const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');
const categoriesRouter = require('./routes/categories');


// http://localhost:3000/api/v1/


app.use(`${api}/products`,productsRouter);
app.use(`${api}/users`,usersRouter);
app.use(`${api}/orders`,ordersRouter);
app.use(`${api}/categories`,categoriesRouter);

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URL)
.then(()=>console.log('DBconnection succès!'))//message à afficher si mongoDB fonctionne normalement
.catch((err)=>{
    console.log(err);
});

app.listen(process.env.PORT || 5000,() => {
    console.log(api);
    console.log('App listening on port http://localhost:5000');
});