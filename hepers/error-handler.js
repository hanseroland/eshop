function errorHandler(err,req,res,next){
    //err jwt authentification
    if(err.name === 'UnauthorizedError'){
       return res.status(401).json({message:"Utilisateur non authaurisé - non admin"});
    }

    //err de validation
    if(err.name === 'ValidationError'){
       return res.status(401).json({message:err});
    }
    //err générale
    return res.status(500).json(err)
}

module.exports = errorHandler;