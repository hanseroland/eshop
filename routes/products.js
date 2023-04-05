const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');


const FILE_TYPE_MAP = {
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg',
}

const storage = multer.diskStorage({
    destination:function (req,file,cb){
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Image invalide');

        if(isValid){
            uploadError = null
        }
        cb(null,'./public/uploads/')
    },
    filename:function(req,file,cb){

        const fileName = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null,`${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({storage:storage})

router.get('/',async (req,res)=>{
    let filter = {};
    if(req.query.categories){
         filter = {category:req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category');
    if(!productList){
        res.status(500).json({success:false});
    }
    res.status(200).send(productList);
});
 

router.get('/:id',async (req,res)=>{
    const product = await Product.findById(req.params.id).populate('category');
    if(!product){
        res.status(500).json({success:false});
    }
    res.status(200).send(product);
});


router.post('/', uploadOptions.single('image'), async (req,res)=>{
    const category = await Category.findById(req.body.category); 
    if(!category) return res.status(400).send('Catégorie invalide');

    const file = req.file;
    if(!file) return res.status(400).send('Aucun fichier')
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    let product = new Product({
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:`${basePath}${fileName}`,
        images:req.body.images,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        isFeatured:req.body.isFeatured,
    });
    product = await product.save();
    if(!product)
        return res.status(500).send('Le produit ne peut pas être créé');
    res.send(product);
   
});


router.put('/:id',uploadOptions.single('image'), async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Id produit invalide');
    }
    const category = await Category.findById(req.body.category); 
    if(!category) return res.status(400).send('Catégorie invalide');

    const product = await Product.findById(req.body.id); 
    if(!product) return res.status(400).send('Produit invalide');

    const file = req.file;
    let imagePath;

    if(file){
        const fileName = file.filename;
        const basePath =  `${req.protocol}://${req.get('host')}/public/uploads/`
        imagePath = `${basePath}${fileName}`
    }else{
        imagePath= product.image
    }


    const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id, 
        {
            name:req.body.name,
            description:req.body.description,
            richDescription:req.body.richDescription,
            image:imagePath,
            images:req.body.images,
            brand:req.body.brand,
            price:req.body.price,
            category:req.body.category,
            countInStock:req.body.countInStock,
            rating:req.body.rating,
            isFeatured:req.body.isFeatured,
        },
        {new:true}
    ); 

    if(!updatedProduct)
        return res.status(404).send('Le produit ne peut pas être mise à jour');
    res.send(updatedProduct);
});


router.delete('/:id', (req,res)=>{
   Product.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({success:true,message:'Produit supprimé'});
        }else{
            return res.status(404).json({success:false,message:'Produit non trouvée'});
        }
    }).catch(err=>{
        return res.status(400).json({success:false,error:err});
    });
   
});


router.get(`/get/count`,async (req,res)=>{
    const productCount = await Product.countDocuments();
    if(!productCount){
        res.status(500).json({success:false});
    }
    res.send({
        count:productCount
    });
});



router.get(`/get/featured/:count`,async (req,res)=>{
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({isFeatured:true}).limit(+count);
    if(!products){
        res.status(500).json({success:false});
    }
    res.send(products);
});


router.put('/gallery-images/:id',uploadOptions.array('images',10), async (req,res)=>{

    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Id produit invalide');
    }
   const files = req.files;
   let imagesPaths = [];
   const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
   if(files){
     files.map(file=>{
        imagesPaths.push(`${basePath}${file.filename}`);
     })
   }
    const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id, 
        {
            images:imagesPaths,
        },
        {new:true}
    ); 

    if(!updatedProduct)
        return res.status(404).send('Le produit ne peut pas être mise à jour');
    res.send(updatedProduct);
});




module.exports = router;