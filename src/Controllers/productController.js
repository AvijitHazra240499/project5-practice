 const productModel=require("../models/productModel")
const { isValid,isValidNumber, isValidBody, isValidString, isValidPhone, isValidEmail, isValidPassword, isValidStreet, isValidPincode, isValidField, isValidObjectId, isValidTitle, isValidSize } = require("../validator/validation")
const {uploadFile} = require("../aws/aws")


const createProduct=(res,req)=>{
    try {
        let files = req.files

        if (!(files&&files.length)) {
            return res.status(400).send({ status: false, message: " Please Provide The Profile Image" });}

        const uploadedBookImage = await uploadFile(files[0])

        const data=req.body
        let {title,description,price,currencyId,currencyFormat,style,availableSizes,installments}=data
        data.productImage=uploadedBookImage
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "title is required" })
        }
        if (!isValidString(title) && !isValidField(title)) {
            return res.status(400).send({ status: false, message: "title should't contains numbers and should only contains alhabets" })
        }
        const titleCheck=await productModel.findOne({title,isDeleted:false})
        if(titleCheck)return res.status(400).send({ status: false, message: "title already exist" })

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "description is required" })
        }
        if (!isValidString(description)) {
            return res.status(400).send({ status: false, message: "description should't contains numbers and should only contains alhabets" })
        }

        if (!isValid(price)) {
            return res.status(400).send({ status: false, message: "price is required" })
        }
        if (!isValidNumber(price)) {
            return res.status(400).send({ status: false, message: "price should be number" })
        }

        if (!isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "currencyId is required" })
        }
        if(!["INR"].includes(currencyId)) return res.status(400).send({ status: false, message: "plz provied valid currencyId" })

        if (!isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "currencyFormat is required" })
        }
        if(!["₹"].includes(currencyFormat))return res.status(400).send({ status: false, message: "currencyFormat ₹ only accepted here" })


        if (isValid(style)) {
            if (!isValidString(style)) {
                return res.status(400).send({ status: false, message: "style should't contains numbers and should only contains alhabets" })
            }
        }
        if (isValid(availableSizes)) {
            if (!isValidSize(availableSizes)) {
                return res.status(400).send({ status: false, message: "availableSizes should't contains numbers and should only contains alhabets" })
            }
        }
        if (isValid(installments)) {
            if (!isValidNumber(installments)) {
                return res.status(400).send({ status: false, message: "installments should be number" })
            }

        }
        data.deletedAt=null
        data.isDeleted=false
        data.isFreeShipping=false

        const productData=await productModel.create(data)

        return res.status(201).send({ satus: true, message:"create successful",data:productData })

    } catch (err) {
        return res.status(500).send({ satus: false, error: err.message })
        
    }
}


const getQueryProduct=(req,res)=>{
    try {
        const data=req.query
        let {size,name,priceGreaterThan,priceLessThan}=data
        let filter={isDeleted:false}
        if (isValid(size)) {
            if (!isValidSize(size)) {
                return res.status(400).send({ status: false, message: "size should't contains numbers and should only contains alhabets" })
            }

            filter.size=[...size.split(",").map(x => x.toUpperCase().trim())]
        }
        if (isValid(name)) {
            if (!isValidString(name) && !isValidField(name)) {
                return res.status(400).send({ status: false, message: "name should't contains numbers and should only contains alhabets" })
            }
            const titleCheck=await productModel.findOne({title:name,isDeleted:false})
            if(!titleCheck)return res.status(404).send({ status: false, message: "product not exsit with name "+name })

            return res.status(200).send({ status: true, data:titleCheck }) 
        }
        if (isValid(priceGreaterThan)) {
            if (!isValidNumber(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "priceGreaterThan should be number" })
            }
            filter.price["$gte"]=priceGreaterThan
        }
        if (isValid(priceLessThan)) {
            if (!isValidNumber(priceLessThan)) {
                return res.status(400).send({ status: false, message: "priceLessThan should be number" })
            }
            filter.price["$lte"]=priceLessThan
        }

        let sortedprice = data.priceSort

        if (sortedprice) {
        if (!sortedprice.match(/^(1|-1)$/))
        return res.status(400).send({ status: false, message: "priceSort must be 1 or -1" })
    }

        // const  productData=await productModel.find({$or:[{$or:[{price:{$gte:priceGreaterThan,$lte:priceLessThan}},{price:{$or:[{$gte:priceGreaterThan},{$lte:priceLessThan}]}}],size:{$in:size}},{$or:[
        //                                             {$or:[{price:{$gte:priceGreaterThan,$lte:priceLessThan}},{price:{$or:[{$gte:priceGreaterThan},{$lte:priceLessThan}]}}]},{size:{$in:size}}]}],isDeleted:false})
        const productData=await productModel.find(filter).sort({price:sortedprice})
        if (!getProduct.length) {
            return res.status(404).send({ status: false, message: "Product not found" })
          }
        
    } catch (err) {
        return res.status(500).send({ satus: false, error: err.message }) 
    }
}


const getProductById=(req,res)=>{
    try {
        const productId=req.params.productId
        if(!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId not valid" })
        let productkData= await userModel.findOne({_id:productId,isDeleted:false})
        if(!productkData) return res.status(404).send({ status: false, message: "product not exist" })

        return res.status(200).send({ status: true,data:productkData })


    } catch (error) {
        return res.status(500).send({ satus: false, error: err.message })   
    }
}


const updateProduct = (req,res)=>{
    try {
        const productId=req.params.productId
        if(!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId not valid" })
        let productkData= await userModel.findOne({_id:productId,isDeleted:false})
        if(!productkData) return res.status(404).send({ status: false, message: "product not exist" })

        const data=req.body
        let {title,description,price,currencyId,currencyFormat,style,availableSizes,installments}=data

        let filter={}
        let uploadedBookImage=null
        const files=req.files
        if ((files&&files.length)) {
            uploadedBookImage = await uploadFile(files[0])
            filter.productImage=uploadedBookImage
        }

        if (isValid(title)) {
            if (!isValidString(title) && !isValidField(title)) {
                return res.status(400).send({ status: false, message: "title should't contains numbers and should only contains alhabets" })
            }
            const titleCheck=await productModel.findOne({title,isDeleted:false})
            if(titleCheck)return res.status(400).send({ status: false, message: "title already exist" }) 
            filter.title=title
        }

        if (isValid(description)) {
            if (!isValidString(description)) {
                return res.status(400).send({ status: false, message: "description should't contains numbers and should only contains alhabets" })
            }
            filter.description=description
            
        }

        if (isValid(price)) {
            if (!isValidNumber(price)) {
                return res.status(400).send({ status: false, message: "price should be number" })
            }
            filter.price=price

        }

        if (isValid(currencyId)) {
            if(!["INR"].includes(currencyId)) return res.status(400).send({ status: false, message: "plz provied valid currencyId" })
            filter.currencyId=currencyId
            
        }

        if (isValid(currencyFormat)) {
            if(!["₹"].includes(currencyFormat))return res.status(400).send({ status: false, message: "currencyFormat ₹ only accepted here" }) 
            filter.currencyFormat=currencyFormat

        }
        if (isValid(style)) {
            if (!isValidString(style)) {
                return res.status(400).send({ status: false, message: "style should't contains numbers and should only contains alhabets" })
            }
            filter.style=style

        }
        if (isValid(availableSizes)) {
            if (!isValidSize(availableSizes)) {
                return res.status(400).send({ status: false, message: "availableSizes should't contains numbers and should only contains alhabets" })
            }
            filter.availableSizes=availableSizes

        }
        if (isValid(installments)) {
            if (!isValidNumber(installments)) {
                return res.status(400).send({ status: false, message: "installments should be number" })
            }
            filter.installments=installments
        }
        const updateData=await productModel.findByIdAndUpdate(productId,filter,{new:true})

        return res.status(200).send({ satus: true,message:"Update Successful",data:updateData })   
 
        
    } catch (err) {
        return res.status(500).send({ satus: false, error: err.message })   
        
    }
}


const deleteProductById=(req,res)=>{
    try {
        let productId=req.params.productId
        if(!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId not valid" })
        let productData= await userModel.findOne({_id:productId,isDeleted:false})
        if(!productData) return res.status(404).send({ status: false, message: "product not exist" })

        const deletedProduct=await productModel.findByIdAndUpdate(productId,{isDeleted:false,deletedAt:new Date},{new:true})

        return res.status(200).send({ satus: true, message:"Delete Successful", data:deletedProduct })   


    } catch (err) {
        return res.status(500).send({ satus: false, error: err.message })   
    }
}



