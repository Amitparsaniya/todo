// const User = require("../models/user");
// const cron = require("node-cron");
// const userdata = async ()=>{
//     try{
//     const timeuser = await User.find({ otp: { $exists: true } })
//     // console.log(timeuser);
//       cron.schedule("*/60 * * * *", () => {
//         const date = new Date().toISOString();
//         timeuser.forEach(async(user) => {
//           const userOtpExpireTime = user.otpexpiretime;
//           // console.log(/date/, date);
//           // console.log(/newdate/, userOtpExpireTime.toISOString());
//           if (date > userOtpExpireTime.toISOString()) {
//             user.token = null;
//             user.otp = null;
//             await user.save();
//             // console.log("running !!!!!");
//           }
//         });
//       });
//     }catch(error){
//         console.log(error);
//     }
// }
// userdata()