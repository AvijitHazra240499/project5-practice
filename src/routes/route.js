const express = require('express');
const router = express.Router();













// if incorrect url

router.post("*", (req,res) =>{

    return res.status(404).send({ message:"Page Not Found"})
})

router.post("*", (req,res) =>{
     return res.status(404).send({ message:"Page Not Found"})
})


router.get("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})

router.put("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})

router.get("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})

router.put("*", (req,res) =>{

    return res.status(404).send({ message:"Page Not Found"})
})
 
router.delete("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})

module.exports = router;