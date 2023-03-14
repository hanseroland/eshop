const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

router.get('/',async (req,res)=>{
    const categorieList = await Category.find();
    if(!categorieList){
        res.status(500).json({success:false});
    }
    res.status(200).send(categorieList);
});

router.get('/:id',async (req,res)=>{
    const category = await Category.findById(req.params.id);
    if(!category){
        res.status(500).json({success:false});
    }
    res.status(200).send(category);
});

router.post('/', async (req,res)=>{
    let category = new Category({
        name:req.body.name,
        color:req.body.color,
        icon:req.body.icon
    });
    category = await category.save();
    if(!category)
        return res.status(404).send('La categorie ne peut pas être créée');
    res.send(category);
   
});

router.put('/:id', async (req,res)=>{
    let category = await Category.findByIdAndUpdate(
    req.params.id, 
        {
            name:req.body.name,
            color:req.body.color,
            icon:req.body.icon
        },
        {new:true}
    ); 

    if(!category)
        return res.status(404).send('La categorie ne peut pas être mise à jour');
    res.send(category);
   
});

router.delete('/:id', (req,res)=>{
   Category.findByIdAndRemove(req.params.id).then(category=>{
        if(category){
            return res.status(200).json({success:true,message:'Catégorie supprimée'});
        }else{
            return res.status(404).json({success:false,message:'Catégorie non trouvée'});
        }
    }).catch(err=>{
        return res.status(400).json({success:false,error:err});
    });
   
});

module.exports = router;