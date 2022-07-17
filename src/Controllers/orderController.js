const cartModel = require("../models/cartModel")
const orderModel=require("../models/orderModel")
const { isValid,isValidBody } = require("../validator/validator")


const createOrder=(req,res)=>{
    try {
        const userId=req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" })
        let checkUser=await userModel.findById(userId)
        if(!checkUser)return res.status(400).send({ status: false, message: "user not found!" })
        
        let checkCart=await cartModel.findOne({userId}).select({items:1,totalPrice:1,totalItems:1,_id:0}).lean()
        if(!checkCart) return res.status(404).send({ status: false, message: "No cart,create one" })
        if(!checkCart.items.length) return res.status(404).send({ status: false, message: "No cart,create one" })

        let {items}=checkCart
        let totalQuantity=0
        items.forEach(e => {
            totalQuantity+=e.quantity
        });
        // let filter={userId,items,totalPrice,totalItems,totalQuantity}
        checkCart.totalQuantity=totalQuantity

        let order=await orderModel.create(checkCart)
        await cartModel.updateOne({userId},{items:[],totalPrice:0,totalItems:0})

        return res.status(201).send({ satus: false, message:"Order Successful",data:order })   

    } catch (error) {
        return res.status(500).send({ satus: false, error: error.message })   
        
    }
}


const updateOrder=async (req,res)=>{
    try {
        const userId=req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" })
        let checkUser=await userModel.findById(userId)
        if(!checkUser)return res.status(404).send({ status: false, message: "user not found!" })

        let data=req.body
        if(!isValidBody(data))return res.status(400).send({ status: false, message: "body can not be empty" })
        let {orderId,status}=data
        if (!isValidObjectId(orderId.toString())) return res.status(400).send({ status: false, message: "orderId not valid" })
        let checkOrder=await userModel.findOne({_id:orderId,isDeleted:false})
        if(!checkOrder)return res.status(404).send({ status: false, message:"Order not found!" })
        if(checkOrder.userId!=userId)return res.status(403).send({ status: false, message:"this Order not for this user" })

        if(!isValid(status))return res.status(400).send({ status: false, message:"status required" })
        if(!["pending", "completed", "cancelled"].includes(status))return res.status(400).send({ status: false, message:"valid status required" })

        let orderUpdate=await orderModel.findByIdAndUpdate(orderId,{status},{new:true}).select({__v:0})
        res.satus(200).send({ status: true, message:"Order Update Successful" ,data:orderUpdate})

        
    } catch (error) {
        return res.status(500).send({ satus: false, error: error.message })   
        
    }
}