const express =require("express")
const { create, verifyEmail, resendEmailVerificationToken, forgetPassword, resetpassword, signIn,  } = require("../controllers/user")
const { uservalidator, validte, passwordvalidator, signValidator, emailverification, forgetpassword } = require("../middleware/validator")
const { isvalipasswordresettoken, isAuth } = require("../middleware/Authuser")

const router =express.Router()

router.post("/create",uservalidator,validte,create)
router.post("/verify-email",isAuth,emailverification,validte,verifyEmail)
router.post("/resend-emailverification-otp",resendEmailVerificationToken)
router.post("/forget-password",forgetpassword,validte,forgetPassword)
router.post("/reset-password",passwordvalidator,validte,isvalipasswordresettoken,resetpassword)
router.post("/signin",signValidator,validte,signIn)


module.exports =router
