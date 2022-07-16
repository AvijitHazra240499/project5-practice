const cartModel=require("../models/cartModel")
const productModel = require("../models/productModel")
const { isValidBody } = require("../validator/validator")



const createCart=(req,res)=>{
    try {
        let userId=req.params.userId
        if(!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" })
        let userData= await userModel.findOne({_id:userId,isDeleted:false})
        if(!userData) return res.status(404).send({ status: false, message: "user not exist" })

        let cartId=req.body.cartId

        let cartData=null
        if(cartId){
        if(!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "cartId not valid" })
        cartData= await userModel.findOne({_id:userId,isDeleted:false}).lean()
        if(!cartData) return res.status(404).send({ status: false, message: "cart not exist,create one" })

    }
        if(!isValidBody(req.body))return res.status(400).send({ status: false, message: "body can't be empty" })
        let {productId,quantity}=req.body
        let filter={}

        if(!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId not valid" })
        let productData= await productModel.findOne({_id:productId,isDeleted:false})
        if(!productData) return res.status(404).send({ status: false, message: "product not exist" })
        

        if(!isValid(quantity)) quantity = 1
        if(quantity < 1 || !Number.isInteger(Number(quantity)) || isNaN(quantity)) return res.status(400).send({status:false,message:"Quantity of item(s) should be a an integer & > 0."})
        

        if(cartData){
            cartData.totalPrice=(productData.price*quantity)+cartData.totalPrice
            cartData.items.push({productId,quantity})
            cartData.totalIstem=cartData.items.length
            cartData.save()

        return res.status(201).send({ satus: true, data:cartData })   

        }else{
            filter.userId=userId
            filter.items.productId=productId
            filter.items.quantity=quantity
            filter.totalPrice=productData.price*quantity
            filter.totalItems=1

            let cartData=await cartModel.create(filter)
        return res.status(201).send({ satus: true, data:cartData })   

        }

        

    } catch (error) {
        return res.status(500).send({ satus: false, error: error.message })   

    }
}


