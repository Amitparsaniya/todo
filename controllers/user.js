const { isValidObjectId } = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user");
const { generateOtp } = require("../utils/generateOtp");
const { generateRandomBytes } = require("../utils/passwordResetToken");
const { generateMailtranspoter } = require("../utils/mail");
const { sendError, sendScuccess } = require("../utils/helper");
const statusCode = require("../utils/statuscode");
const { errormessages } = require("../utils/errormessages");
const messages = require("../utils/sucessmessage");
const subject = require("../utils/emailmessages");

exports.create = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const isEmailExsist = await User.findOne({ email });
    if (isEmailExsist) {
      return sendError(
        res,
        errormessages.EMAIL_ALLREADY_EXSIST,
        statusCode.ERRORCODE
      );
    }

    const otp = generateOtp();
    const jwttoken = await jwt.sign({ email: email }, process.env.SECRET_KEY, {
      expiresIn: 300,
    });
    const user = new User({
      name,
      email,
      password,
      otp: otp,
      token: jwttoken,
    });

    console.log(otp);
    console.log(jwttoken);

    await user.save();

    var transport = generateMailtranspoter();
    transport.sendMail({
      from: process.env.VERIFICATION_EMAIL,
      to: user.email,
      subject: subject.EMAIL_VERIFICATION,
      html: `
            <p>Your Verification OTP</p>
            <h1>${otp}</h1>`,
    });
    sendScuccess(
      res,
      {
        message: messages.CREATE_NEW_USER,
        user: { _id: user._id, name: user.name, email: user.email },
      },
      statusCode.CREATE
    );
  } catch (error) {
    console.log(error);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!isValidObjectId(userId)) {
      return sendError(res, errormessages.INVALID_USER, statusCode.ERRORCODE);
    }

    const user = await User.findById(userId);

    console.log(/uu/, user);

    if (!user) {
      return sendError(res, errormessages.USER_NOT_FOUND, statusCode.ERRORCODE);
    }

    if (user.isVerified) {
      return sendError(
        res,
        errormessages.USER_ALLREADY_VERIFIED,
        statusCode.ERRORCODE
      );
    }

    // if (!req.user) {
    //   console.log("eeeee");
    //   user.otp = null;
    //   await user.save();
    // }

    // if (user.otp === null) {
    //    sendError(
    //     res,
    //     errormessages.TOKEN_NOT_FOUND,
    //     statusCode.ERRORCODE
    //   );
    // }

    const isMatched = await user.compareotp(otp);

    if (!isMatched) {
      return sendError(
        res,
        errormessages.OTP_NOT_MATCHED,
        statusCode.ERRORCODE
      );
    }

    user.isVerified = true;
    console.log(user.otp);
    user.otp = null;
    await user.save();

    var transport = generateMailtranspoter();

    transport.sendMail({
      from: process.env.VERIFICATION_EMAIL,
      to: user.email,
      subject: subject.WELCOME_EMAIL,
      html: ` 
            <h1>Welcome our app ${user.name}, Thanks for chossing us! </h1>`,
    });
    sendScuccess(res, messages.USER_EMAIL_VERIFIED, statusCode.SUCCESS);
  } catch (error) {
    console.log(error);
  }
};

exports.resendEmailVerificationToken = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!isValidObjectId(userId)) {
      return sendError(res, errormessages.INVALID_USER, statusCode.ERRORCODE);
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, errormessages.USER_NOT_FOUND, statusCode.ERRORCODE);
    }

    if (user.isVerified) {
      return sendError(
        res,
        errormessages.USER_ALLREADY_VERIFIED,
        statusCode.ERRORCODE
      );
    }

    console.log(user.token);
    let verifytoken;
    if (user.token) {
      verifytoken = jwt.verify(
        user.token,
        process.env.SECURITY_EMAIL,
        (error,result) => {
          if (error) {
            return "token expired";
          }
          return result
        }
      );
      if (verifytoken == "token expired") {
        const jwttoken = await jwt.sign(
          { email: user.email },
          process.env.SECRET_KEY,
          {
            expiresIn: 180,
          }
        );
        console.log(jwttoken);
        user.token = jwttoken;
        await user.save();
      }
    }
    
    if (verifytoken !== "token expired") {
      if (user.otpCounter >= 3) {
        user.otpCounter = 0;
        await user.save();
        return sendError(
          res,
          errormessages.LIMIT_REACHED,
          statusCode.ERRORCODE
        );
      }

      let otp = generateOtp();
      if (user.otpCounter == 1 || user.otpCounter == 2) {
        console.log(otp);
        user.otp = otp;
        user.otpCounter++;
        await user.save();
      }
    }

    // var transport = generateMailtranspoter();
    // transport.sendMail({
    //   from: process.env.VERIFICATION_EMAIL,
    //   to: user.email,
    //   subject: subject.EMAIL_VERIFICATION,
    //   html: `
    // <p>Your Verification OTP</p>
    // <h1>${otp}</h1>`,
    // });
    sendScuccess(
      res,
      { message: messages.OTP_SENT_TO_EMAIL },
      statusCode.SUCCESS
    );
  } catch (error) {
    console.log(error);
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(
        res,
        errormessages.EMAIL_IS_MISSING,
        statusCode.ERRORCODE
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return sendError(res, errormessages.USER_NOT_FOUND, statusCode.ERRORCODE);
    }

    if (user.token != null) {
      return sendError(
        res,
        errormessages.ALL_READY_SEND_TOKEN,
        statusCode.ERRORCODE
      );
    }

    const generateToken = await generateRandomBytes();
    user.token = generateToken;

    await user.save();

    const resetpasswordurl = `http://localhost:3000/reset-password?token=${generateToken}&id=${user._id}`;

    var transport = generateMailtranspoter();
    transport.sendMail({
      from: process.env.SECURITY_EMAIL,
      to: user.email,
      subject: subject.FORGET_PASSWORD,
      html: `
       <p>Click here to reset your password</p>      
        <a href="${resetpasswordurl}">Change Password</a>`,
    });
    sendScuccess(res, messages.FORGET_PASSWORD_LINK, statusCode.SUCCESS);
  } catch (error) {
    console.log(error);
  }
};
exports.resetpassword = async (req, res) => {
  try {
    const { newpassword, userId } = req.body;
    if (!isValidObjectId(userId)) {
      return sendError(res, errormessages.INVALID_USER, statusCode.ERRORCODE);
    }

    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, errormessages.USER_NOT_FOUND, statusCode.ERRORCODE);
    }

    const matched = await user.comparepassword(newpassword);

    // console.log(matched);

    if (matched) {
      return sendError(
        res,
        errormessages.PASSWORD_MATCH_WITH_OLDPASSWORD,
        statusCode.ERRORCODE
      );
    }

    user.password = newpassword;
    user.token = null;
    await user.save();

    var transport = generateMailtranspoter();

    transport.sendMail({
      from: process.env.SECURITY_EMAIL,
      to: user.email,
      subject: subject.PASSWORD_RESET_SUCCESSFULLY,
      html: ` 
      <h1>${user.name} your Password Reset Successfully</h1>
      <p>Now you can use new Password</p>`,
    });
    sendScuccess(res, messages.PASWORD_RESET_SUCCESSFULLY, statusCode.SUCCESS);
  } catch (error) {
    console.log(error);
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return sendError(
        res,
        errormessages.INVALID_LOGIN_CREDENTIALS,
        statusCode.ERRORCODE
      );
    }

    const matched = await user.comparepassword(password);

    if (!matched) {
      return sendError(
        res,
        errormessages.INVALID_LOGIN_CREDENTIALS,
        statusCode.ERRORCODE
      );
    }

    const jwttoken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);

    sendScuccess(
      res,
      {
        message: messages.SUCCESSFULLY_LOGIN,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: jwttoken,
        },
      },
      statusCode.SUCCESS
    );
  } catch (error) {
    console.log(error);
  }
};
