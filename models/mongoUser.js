import mongoose from "mongoose";
const {Schema,model}= mongoose

const chatSchema=new Schema({
    username:{type:String, required: true},
    password:{type:String,required:true},
    email:{type:String,required:true},
    direccion:{type:String,required:true},
    edad:{type:Number,required:true},
    telefono:{type:String,required:true},
    avatar:{type:String,required:true},
})

const User = model("user",chatSchema);
export default User
