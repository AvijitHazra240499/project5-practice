const userModel = require("../models/userModel")
const { isValid, isValidBody, isValidString, isValidPhone, isValidEmail, isValidPassword, isValidStreet, isValidPincode, isValidField, isValidObjectId, isValidTitle, isValidSize } = require("../validator/validation")
const aws = require("../aws/aws")
const bcrypt = require("bcrypt")


const createUser = async (req, res) => {
    try {
        let data = req.body
        let files = req.files

        if (!isValidBody(data)) {
            return res.status(400).send({ status: false, message: "oops you forgot to enter data" })
        }
        const { fname, lname, email, profileImage, phone, password, address } = data
        if (!fname) {
            return res.status(400).send({ status: true, message: "fname is required" })
        }
        if (!isValidString(fname) && !isValidField(fname)) {
            return res.status(400).send({ status: true, message: "fname should't contains numbers and should only contains alhabets" })
        }
        if (!lname) {
            return res.status(400).send({ status: true, message: "lname is required" })
        }
        if (!isValidString(lname) && !isValidField(lname)) {
            return res.status(400).send({ status: true, message: "lname should't contains numbers and should only contains alhabets" })
        }
        if (!email) {
            return res.status(400).send({ status: false, message: "email is required" })
        }
        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid email format" })
        }

        let uniqueEmail = await userModel.findOne({ email, isDeleted: false })
        if (uniqueEmail) {
            return res.status(404).send({ status: false, message: "emailId already registered " })
        }
        if (!files.length) {
            return res.status(400).send({ status: false, message: "profileImage is required " })
        }
        if (!phone) {
            return res.status(400).send({ status: false, message: "phone number is required" })
        }
        if (!isValidPhone(phone)) {
            return res.status(400).send({ status: false, message: "Invalid phone number" })
        }
        let uniquephone = await userModel.findOne({ phone, isDeleted: false })
        if (uniquephone) {
            return res.status(404).send({ status: false, message: "phone number is already exist" })
        }

        if (!password) {
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
            if (!street) {
                return res.status(400).send({ status: false, message: "plz enter street" })
            }

            if (!isValidStreet(street)) {
                return res.status(400).send({ satus: false, message: "Invalid Street" })
            }

            if (!city) {
                return res.status(400).send({ status: false, message: "plz enter city" })
            }
            if (!isValidString(city)) {
                return res.status(400).send({ status: false, message: "Invalid city" })
            }
            if (!pincode) {
                return res.status(400).send({ status: false, message: "plz enter pincode" })
            }
            if (!isValidPincode(pincode)) {
                return res.status(400).send({ status: false, message: "Invalid pincode" })
            }
        }

      flipcart(shipping)
      flipcart(billing)

       let savedata = await userModel.create(data)
        return res.status(201).send({ satus: true, message: "user succefully created",data:savedata })

    } catch (err) {
        return res.status(500).send({ satus: false, error: err.message })
    }
}