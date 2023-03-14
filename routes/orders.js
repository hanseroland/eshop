const {Order} = require('../models/order');
const express = require('express');
const router = express.Router();

router.get('/',async (req,res)=>{
    const orderList = await Order.find();
    if(!orderList){
        res.status(500).json({success:false});
    }
    res.send(orderList);
});

router.post('/post', async (req,res)=>{
    const order = await new Order({
        name:req.body.name,
        image:req.body.image,
        countInStock:req.body.countInStock
    });
    order.save().then((createOrder=>{
        res.status(201).json(createOrder)
    })).catch((err)=>{
        res.status(500).json({
            error:err,
            sucess:false
        })
    });
   
});

module.exports = router;