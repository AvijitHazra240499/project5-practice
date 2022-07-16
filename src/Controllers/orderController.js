const orderModel=require("../models/orderModel")


const createOrder=(req,res)=>{
    try {
        const productId=req.userId
        
    } catch (error) {
        return res.status(500).send({ satus: false, error: error.message })   
        
    }
}