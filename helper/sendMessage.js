const twilio =require("twilio")
require("dotenv").config()
const sendMessage=async(to,body)=>{//body seria el mensaje a enviar y to seria el numero del usuario
    try{
        const client=twilio(process.env.SID,process.env.AUTH_TOKEN)
        const message=await client.messages.create({
            body,
            from:process.env.TELEFONO,
            to,
        })
        return{
            result:"succes",
            messageId:message.sid
        }
    }catch(err){
        return{
            result:"error",
            error:err.message
        }
    }
}

module.exports=sendMessage