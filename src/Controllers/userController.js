const userModel = require("../models/userModel")
const { isValid, isValidBody, isValidString, isValidPhone, isValidEmail, isValidPassword, isValidStreet, isValidPincode, isValidField, isValidObjectId, isValidTitle, isValidSize } = require("../validator/validation")
const aws = require("../aws/aws")
const bcrypt = require("bcrypt")




const createUser = async (req, res) => {
    try {
        let formData = req.body
        let files = req.files

        if (!(files&&files.length)) {
            return res.status(400).send({ status: false, message: " Please Provide The Profile Image" });}

        const uploadedBookImage = await uploadFile(files[0])

        if (!isValidBody(data)) {
            return res.status(400).send({ status: false, message: "oops you forgot to enter data" })
        }
        let { fname, lname, email, profileImage, phone, password, address } = formData
        profileImage=uploadedBookImage
        if (!isValid(fname)) {
            return res.status(400).send({ status: true, message: "fname is required" })
        }
        if (!isValidString(fname) && !isValidField(fname)) {
            return res.status(400).send({ status: true, message: "fname should't contains numbers and should only contains alhabets" })
        }
        if (!isValid(lname)) {
            return res.status(400).send({ status: true, message: "lname is required" })
        }
        if (!isValidString(lname) && !isValidField(lname)) {
            return res.status(400).send({ status: true, message: "lname should't contains numbers and should only contains alhabets" })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }
        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid email format" })
        }

        let uniqueEmail = await userModel.findOne({ email, isDeleted: false })
        if (uniqueEmail) {
            return res.status(404).send({ status: false, message: "emailId already registered " })
        }
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "phone number is required" })
        }
        if (!isValidPhone(phone)) {
            return res.status(400).send({ status: false, message: "Invalid phone number" })
        }
        let uniquephone = await userModel.findOne({ phone, isDeleted: false })
        if (uniquephone) {
            return res.status(404).send({ status: false, message: "phone number is already exist" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "password number is required" })
        }
        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Invalid password" })
        }
        if (!isValidBody(address)) {
            return res.status(400).send({ status: false, message: "oops you forgot to enter address" })
        }

        let { shipping, billing } = address
        let flipcart = function (value) {
            if (!isValidBody(value)) {
                return res.status(400).send({ status: false, message: `oops you forgot to enter ${value}` })
            }
            let { street, city, pincode } = value
            if (!isValid(street)) {
                return res.status(400).send({ status: false, message: "plz enter street" })
            }

            if (!isValidStreet(street)) {
                return res.status(400).send({ satus: false, message: "Invalid Street" })
            }

            if (!isValid(city)) {
                return res.status(400).send({ status: false, message: "plz enter city" })
            }
            if (!isValidString(city)) {
                return res.status(400).send({ status: false, message: "Invalid city" })
            }
            if (!isValid(pincode)) {
                return res.status(400).send({ status: false, message: "plz enter pincode" })
            }
            if (!isValidPincode(pincode)) {
                return res.status(400).send({ status: false, message: "Invalid pincode" })
            }
        }

      flipcart(shipping)
      flipcart(billing)

       let savedata = await userModel.create(formData)
        return res.status(201).send({ satus: true, message: "user succefully created",data:savedata })

    } catch (err) {
        return res.status(500).send({ satus: false, error: err.message })
    }
}




const getUser = async (req, res) => {
    try{
        let userId=req.params.userId
        if(!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" })
        let checkUser= await userModel.findById(userId)
        if(!checkUser) return res.status(404).send({ status: false, message: "user not exist" })

        return res.status(200).send({ status: true,data:checkUser })

    }catch(err){
        return res.status(500).send({ satus: false, error: err.message })

    }
}


const updateUserById = async (req, res) => {
    try {
        let userId=req.params.userId
        if(!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId not valid" })
        let checkUser= await userModel.findById(userId)
        if(!checkUser) return res.status(404).send({ status: false, message: "user not exist" })


        if (!(files&&files.length)) {
            return res.status(400).send({ status: false, message: " Please Provide The Profile Image" });}

        const uploadedBookImage = await uploadFile(files[0])

        let formData=req.body

        let { fname, lname, email, phone, password, address }=formData
        let filter={ profileImage:uploadedBookImage}
        if (isValid(fname)) {
            if (!isValidString(fname) && !isValidField(fname)) {
                return res.status(400).send({ status: true, message: "fname should't contains numbers and should only contains alhabets" })
            }
            filter.fname=fname
            
        }
        if (isValid(lname)) {
            if (!isValidString(lname) && !isValidField(lname)) {
                return res.status(400).send({ status: true, message: "lname should't contains numbers and should only contains alhabets" })
            }
            filter.lname=lname
            
        }
        if (isValid(email)) {
            if (!isValidString(email) ) {
                return res.status(400).send({ status: true, message: "lname should't contains numbers and should only contains alhabets" })
            }
            if (!isValidEmail(email)) {
                return res.status(400).send({ status: false, message: "Invalid email format" })
            }
            let uniqueEmail = await userModel.findOne({ email, isDeleted: false })
            if (uniqueEmail) {
                return res.status(404).send({ status: false, message: "emailId already registered " })
            }
            filter.email=email
            
        }

        if (isValid(phone)) {
            if (!isValidPhone(phone)) {
                return res.status(400).send({ status: false, message: "Invalid phone number" })
            }
            let uniquephone = await userModel.findOne({ phone, isDeleted: false })
            if (uniquephone) {
                return res.status(404).send({ status: false, message: "phone number is already exist" })
            }
            
            filter.lname=lname
            
        }

        if (isValid(password)) {
            if (!isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "Invalid password" })
            }
            filter.password=password

            
        }
        if (isValidBody(address)) {

        let { shipping, billing } = address
        let flipcart = function (value) {
            if (!isValidBody(value)) {
                return res.status(400).send({ status: false, message: `oops you forgot to enter ${value}` })
            }
            let { street, city, pincode } = value
            let obj={}
            if (isValid(street)) {
                if (!isValidStreet(street)) {
                    return res.status(400).send({ satus: false, message: "Invalid Street" })
                }
                obj.street=street
            }


            if (isValid(city)) {
                if (isValidString(city)) {
                    return res.status(400).send({ status: false, message: "Invalid city" })
                }
                obj.city=city
            }
            if (isValid(pincode)) {
                if (!isValidPincode(pincode)) {
                    return res.status(400).send({ status: false, message: "Invalid pincode" })
                }
                obj.pincode=pincode

            }
            address[value]={...obj}
        }

      flipcart(shipping)
      flipcart(billing)

      filter.address={...address}

        }

        const updateData=await userModel.findByIdAndUpdate(userId,filter,{new:true})

        return res.status(200).send({ satus: true,message:"Update Successful",data:updateData })  

        
    } catch (err) {
        return res.status(500).send({ satus: false, error: err.message })  
    }
}