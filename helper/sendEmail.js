const nodemailer=require("nodemailer")
require("dotenv").config()

const sendMail=async(to,body,asunto)=>{
    const transporter=nodemailer.createTransport({
        host:process.env.HOST,
        prort:587,
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASS,

        }
    })

try{
    const info= await transporter.sendMail({
        from:process.env.EMAIL,//email mio
        to,//email del usuario
        subject: asunto,
        text: body,//texto que se envia
        html:`<h1>${body}<h1>`,
        attachments:[{filename:"package.json",path:"./package.json"}],
    })
    return{
        result:"succes",
        messageId:info.accepted.messageId,
    }
}catch(err){
    return{
        result:"error",
        message:err.message,
    }
}
}
module.exports=sendMail