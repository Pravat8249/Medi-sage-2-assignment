const express= require("express")
const router= express.Router()
const { createUser,  getUser, updateUser, deleteUser }= require("../controllers/controller")




//----------------------------------------------------UserApi----------------------------------------------------------//
router.post('/register', createUser)
router.get("/fetch", getUser)
router.put("/update/:userId", updateUser)
router.delete("/delete/:userId",deleteUser)




module.exports = router;