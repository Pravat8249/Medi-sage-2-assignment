const userModel = require("../models/userModel");
const { uploadFile } = require("../awsS3/aws")

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const mongoose = require('mongoose')

//-----------------------------------------------basic Validations-------------------------------------------------------------//

//check for the requestbody cannot be empty --
const isValidRequestBody = function (value) {
    return Object.keys(value).length > 0
}

//validaton check for the type of Value --
const isValid = (value) => {
    if (typeof value == 'undefined' || typeof value == null) return false;
    if (typeof value == 'string' && value.trim().length == 0) return false;
    if (typeof value != 'string') return false
    return true
}




//-------------------------------------------------API-1 [/register]--------------------------------------------------//

const createUser = async function (req, res) {
    try {
        let requestBody = req.body
        let image = req.files;


        //validation for request body and its keys --
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: "invalid request parameters.plzz provide user details" })
            return
        }

        //Validate attributes --
        let {  name, email, phone, password } = requestBody

    
      

        if (!isValid(name)) {
            res.status(400).send({ status: false, message: "name is required" })
            return
        }

        //this will validate the type of name including alphabets and its property withe the help of regex.
        if (!/^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/.test(name)) {
            return res.status(400).send({ status: false, message: "Please enter valid user name." })
        }

        //Email Validation --
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "plzz enter email" })
        }
        const emailPattern = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})/       //email regex validation for validate the type of email.

        if (!email.match(emailPattern)) {
            return res.status(400).send({ status: false, message: "This is not a valid email" })
        }

        email = email.toLowerCase().trim()
        const emailExt = await userModel.findOne({ email: email })
        if (emailExt) {
            return res.status(409).send({ status: false, message: "Email already exists" })
        }


        //Phone Validations--
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "plzz enter mobile" })
        }

        //this regex will to set the phone no. length to 10 numeric digits only.
        if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone)) {
            return res.status(400).send({ status: false, message: "Please enter valid 10 digit mobile number." })
        }

        const phoneExt = await userModel.findOne({ phone: phone })
        if (phoneExt) {
            return res.status(409).send({ status: false, message: "phone number already exists" })
        }

        //Password Validations
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "plzz enter password" })
        }
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "plzz enter valid password" })
        }
       
        let images = await uploadFile(image[0])
        requestBody.userImage=images

   
    

  //Creation of data--
        let saveData = await userModel.create(requestBody)
        return res.status(201).send({ status: true, message: "success", data: saveData })
    }

    //catch errors will throw whenever you skip something into your piece of code 
    //or did'nt handle error properly for those key-vales who has been in required format.
    catch (err) {
        return res.status(500).send({ status: "error", message: err.message })
    }
}


//-------------------Fetch User-----------------------------------------

const getUser=async function(req,res){
   
    try{
         

        const{page,limit}=req.query

        if(!page) page=1;
        if(!limit) limit=10;

        const skip=(page-1)*10

        const products=await userModel.find().skip(skip).limit(limit);

        res.status(200).send({status:true,page:page,limit:limit,products:products})



    }
    catch(err){
        console.log(err.message)
        return res.status(500).send({status:"error",msg:err.message})
    }

}


//------------------------------------Update User--------------------------------

const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        console.log(userId)
        let data = req.body
    
        let image = req.files
        let getName = await userModel.findOne({ name: data.name })
        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "The given userId is not a valid objectId" })

        if (Object.keys(data).length == 0 && file == undefined)
            return res.status(400).send({ status: false, message: "Please provide user detail(s) to be updated." })

        let err = isValid(data, image, getName)
        if (err)
            return res.status(400).send({ status: false, message: err })

        if (image.length > 0) {
            let uploadedFileURL = await uploadFile(image[0])
            data.userImage = uploadedFileURL
            console.log(uploadedFileURL)
        }
      

        let updateduser = await userModel.findOneAndUpdate({ _id: userId, isDeleted: false },data, { new: true })
        if (!updateduser)
            return res.status(404).send({ status: false, message: "user not found." })

        return res.status(200).send({ status: true, message: "user details updated successfully.", data: updateduser })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



//------------------------------------Delete User--------------------------------
const deleteUser = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" });
        }
        const deletedDetails = await userModel.findOneAndUpdate(
            { _id: userId, isDeleted: false },
            { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })

        if (!deletedDetails) {
            return res.status(404).send({ status: false, message: 'user does not exist' })
        }
        return res.status(200).send({ status: true, message: 'user deleted successfully.' })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
module.exports = { createUser,  getUser, updateUser, deleteUser }

