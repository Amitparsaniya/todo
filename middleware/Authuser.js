const { isValidObjectId } = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { errormessages } = require("../utils/errormessages");
const { sendError } = require("../utils/helper");
const statusCode = require("../utils/statuscode");

exports.isvalipasswordresettoken = async (req, res, next) => {
  const { userId, token } = req.body;

  if (!isValidObjectId(userId) || !token.trim()) {
    return sendError(res, errormessages.INVALID_REQUEST, statusCode.ERRORCODE);
  }

  const user = await User.findById(userId);

  if (!user) {
    return sendError(
      res,
      errormessages.UNAUTHORIZED_ACCESS,
      statusCode.ERRORCODE
    );
  }

  const matched = await user.comparetoken(token);

  if (!matched) {
    return sendError(
      res,
      errormessages.UNAUTHORIZED_ACCESS,
      statusCode.ERRORCODE
    );
  }

  req.resettoken = user;
  next();
};

exports.isAuth = async (req, res, next) => {
  try {
    const token = req.headers?.authorization;
    if (!token) {
      return sendError(
        res,
        errormessages.UNAUTHORIZED_ACCESS,
        statusCode.ERRORCODE
      );
    }
    const jwttoken = token.split("Bearer ")[1];
    const user =  jwt.verify(
      jwttoken,
      process.env.SECRET_KEY,
      (error, result) => {
        if(error){
          return "token expired"
        }
        return result
      })
      const founduser = await User.findOne({email:user.email})
      if(user=="token expired"){
        return sendError(res,"token expired ok!")
      }


      
      console.log(/decode/,founduser);
        req.user = founduser || undefined;
          // console.log(error,"error");
          // console.log(result,"result");
          // return sendError(res, "token was expired!", statusCode.ERRORCODE);
        
        // return decode
        // if (decodetoken =="token expired" ) {
        //   console.log("decodetoken");
        //   const { email } = decodetoken;
        //   const user = User.findOne({ email: email });
        //   if (!user) {
        //     console.log("trigger");
        //     return sendError(
        //       res,
        //       errormessages.UNAUTHORIZED_ACCESS,
        //       statusCode.ERRORCODE
        //     );
        //   }
        // }
      
    
  next()
    // console.log(user);

    //     const {TokenExpiredError}= jwt
    // if (TokenExpiredError) {
    //   // console.log(user);
    //   // user.otp = null;
    //   // await user.save();
    //   return sendError(
    //     res,
    //     errormessages.UNAUTHORIZED_ACCESS_TOKEN_EXP,
    //     statusCode.ERRORCODE
    //   );
    // }
  } catch (error) {
    console.log(/e/, error);
  }
};
