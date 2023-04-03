import mongoose from "mongoose";
const {Schema,model}= mongoose

const cartSchema=new Schema({
    name:{type:String, required: true},
    price:{type:Number,required:true},
})

const Cart = model("carrito",cartSchema);
export default Cart
