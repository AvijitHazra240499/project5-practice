const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const { isValidBody } = require("../validator/validator")



const createCart = async(req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" })

        let userData = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!userData) return res.status(404).send({ status: false, message: "user not exist" })

        let cartId = req.body.cartId

        let cartData = null
        if (cartId) {
            if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "cartId not valid" })
            cartData = await userModel.findOne({ _id: userId, isDeleted: false }).lean()
            if (!cartData) return res.status(404).send({ status: false, message: "cart not exist,create one" })

        }
        if (!isValidBody(req.body)) return res.status(400).send({ status: false, message: "body can't be empty" })
        let { productId, quantity } = req.body
        let filter = {}

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId not valid" })
        let productData = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productData) return res.status(404).send({ status: false, message: "product not exist" })


        if (!isValid(quantity)) quantity = 1
        if (quantity < 1 || !Number.isInteger(Number(quantity)) || isNaN(quantity)) return res.status(400).send({ status: false, message: "Quantity of item(s) should be a an integer & > 0." })


        if (cartData) {
            cartData.totalPrice = (productData.price * quantity) + cartData.totalPrice
            cartData.items.push({ productId, quantity })
            cartData.totalIstem = cartData.items.length
            cartData.save()

            return res.status(201).send({ satus: true, data: cartData })

        } else {
            filter.userId = userId
            filter.items.productId = productId
            filter.items.quantity = quantity
            filter.totalPrice = productData.price * quantity
            filter.totalItems = 1

            let cartData = await cartModel.create(filter)
            return res.status(201).send({ satus: true, data: cartData })

        }



    } catch (error) {
        return res.status(500).send({ satus: false, error: error.message })

    }
}

const updatecart = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" })
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "plz provide the data" })

        let { cartId, productId, removeProduct } = data

        const existUser = await userModel.findById({ userId })
        if (!existUser) {
            return res.status(400).send({ status: false, message: "user does't exist" })
        }
        const existCart = await cartModel.findOne({ _id: cartId, isDeleted: false })
        if (!existCart) {
            return res.status(400).send({ status: false, message: "cart does't exist" })
        }

        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, message: "plz enter cartId" })
        }
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "cartId not valid" })

        if (existCart.userId != userId) { //alternative of userId is existuser._id
            return res.status(400).send({ status: false, message: "this cart does't match with this userId" })
        }

        if (!isValid(productId)) {
            return res.status(400).send({ status: false, message: "plz enter productId" })
        }
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId not valid" })
        let checkproduct=await productModel.findOne({_id:productId,isDeleted:false})
        if(!checkproduct){
            return res.status(400).send({ status: false, message:"productId does't exist" })  
        }

        if(isValid(removeProduct)){
            return res.status(400).send({status:false,msg:"removeproduct is required"})
          }
          if (isValidNumber(removeProduct)) {
            return res.status(400).send({ status: false, message: 'removeProduct should be a valid number' })
        }
          if (!(removeProduct == 0 ||  removeProduct == 1)) {
           return res.status(400).send({ status: false, message: 'removeProduct should be 0 or 1' })
       }
       let quan=null
    //    (existCart.items).forEach(e => {   
    //     if(e.productId==productId){
    //      quan=e.quantity
    //     }
    //    });
      for(let i=0;i<existCart.items.length;i++){
        if(existCart.items[i].productId==productId){
            quan=i
            break

        }
      }

      let totalProductprice=checkproduct.price*existCart.items[quan].quantity

      let{items}=existCart
      
        if (removeProduct === 0) {
            const updateProductItem = await cartModel.findOneAndUpdate({ userId: userId }, { $pull: { items: { productId: productId } }, totalPrice: searchCart.totalPrice - totalProductprice, totalItems: searchCart.totalItems - 1 }, { new: true })
        
            return res.status(200).send({ status: true, msg: 'Successfully removed product', data: updateProductItem })

        }
        if (removeProduct === 1) {
            if (items[quan].quantity === 1 && removeProduct === 1) {
                const removedProduct = await cartModel.findOneAndUpdate({ userId: userId }, { $pull: { items: { productId: productId } }, totalPrice: existCart.totalPrice - totalProductprice, totalItems: existCart.totalItems - 1 }, { new: true })
                return res.status(200).send({ status: true, msg: 'Successfully removed product and cart is empty', data: removedProduct })
            }
            items[quan].quantity = items[quan].quantity - 1
            const updatedCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: items, totalPrice: existCart.totalPrice - getPrice }, { new: true });
            return res.status(200).send({ status: true, msg: 'Quantity of product decreases by 1', data: updatedCart })
        }
    


    } catch (err) {
        return res.status(500).send({ satus: false, error: error.message })
    }
}



const getCart=async (req,res)=>{
    try {
        let userId=req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" })
        let checkUserId=await cartModel.findOne({userId})
        if(!checkUserId) return res.status(404).send({ status: false, message: "No cart,create one" })
        res.satus(200).send({ status: true, data:checkUserId })
        

    } catch (error) {
        return res.status(500).send({ satus: false, error: error.message })
    }
}


const deleteCart=async (req,res)=>{
    try {
        let userId=req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" })
        let checkUser=await userModel.findById(userId)
        if(!checkUser)return res.status(400).send({ status: false, message: "user not found!" })
        let checkUserId=await cartModel.findOne({userId})
        if(!checkUserId) return res.status(404).send({ status: false, message: "No cart,create one" })
        if(!checkUserId.items.length) return res.status(404).send({ status: false, message: "No cart,create one" })
        const removedProduct = await cartModel.findOneAndUpdate({ userId: userId }, {items:[], totalItems:0,totalPrice:0}, { new: true })
        return res.status(200).send({ status: true, message: "Delete Successful!",data:removedProduct })
       

    } catch (error) {
        return res.status(500).send({ satus: false, error: error.message })
        
    }
}