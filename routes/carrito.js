import { Router } from "express"
import { usuariosA } from "../config/auth.js"
import { ContenedorArchivo } from "../controller/contenedorArchivos.js"
import { ContenedorMongo } from "../controller/contenedorMongoDb.js"
import sendMail from "../helper/sendEmail.js"
import sendMessage from "../helper/sendMessage.js"
import { productosA, productosDao } from "../server.js"

const routerCarrito= Router()
//const carritoA= new ContenedorArchivo
const carrito=new ContenedorMongo
//creamos las rutas para el carrito
routerCarrito.post('/',async(req,res)=>{
    //se crea el carro apartir de lo que este en el body de postman
    await connectToDb()
    const carritoAgregar=req.body
    //let cart=carritoA.save(carritoAgregar)
    let cart=carrito.save(carritoAgregar)
    res.status(200).json(cart)
})

routerCarrito.get('/:id/productos',async(req,res)=>{
    //se muesrtan los id de los productos dentro del carro
    await connectToDb()
    const id=req.params.id
    const cart=carrito.getAll()
    //const cart=carritoA.getAll()
    let productosCarrito = cart.find(item => item.id == id)
    res.status(200).json(productosCarrito.productos)   
})
routerCarrito.post('/:id/productos/:id_prod',async(req,res)=>{//se ingresan productos en el carrito si es que existen
    await connectToDb()
    const idCarrito=req.params.id
    const idProducto=req.params.id_prod
    //const cart=carritoA.getAll()
    const cart=carrito.getAll()
    //let productos=productosA.getAll()
    let productos=productosDao.getAll()
    let prodFind = productos.find(item => item.id == idProducto)//se busca si el producto existe
    let carro = cart.find(item => item.id == idCarrito)//se verifica si el carro existe
    if(prodFind && carro){//si existen los 2 se ingresa el id del producto dentro del carro
    carro.productos.push(prodFind.id)
    carro.productos.push(prodFind.name)
    res.status(200).json(carro)
    }else res.status(404).json({error:-2,descripcion:`ruta/${idCarrito}/productos/${idProducto} metodo post no implementada`})
})
routerCarrito.delete('/:id/productos/:id_prod',async(req,res)=>{//se borra el producto seleccionado si esta en el carrito
    await connectToDb()
    const idCarrito=req.params.id
    const idProducto=req.params.id_prod
    //const cart=carritoA.getAll()
    const cart=carrito.getAll()
    let carro = cart.find(item => item.id == idCarrito)//se busca si el carro existe
    let productos=carro.productos//se guardan todos los productos que tenga el carro en una variable
    
    let prodFind = productos.find(item => item == idProducto)//se verifica que el carro tenga el producto
    
    if(prodFind && carro){//si existe el carro y el producto esta dentro del carro,se borra el producto pedido
        let indice=productos.indexOf(prodFind)
        carro.productos.splice(indice,1)
        res.status(200).json(carro)
    }else res.status(404).json({error:-2,descripcion:`ruta/${idCarrito}/productos/${idProducto} metodo delete no implementada`})
})

routerCarrito.get("/checkout",async(req,res)=>{
    //const cart=carritoA.getAll()
    const cart=carrito.getAll()
    const listaProd=cart.name
    const usuario= usuariosA.getAll()
    const enviarMail=await sendMail(process.env.EMAIL,listaProd,"orden de compra")//cuando un usuario se registra se envia un mail a mi correo
    if (enviarMail==="succes"){
        console.log("se envio el mail")
    }else{
        console.log("no se pudo enviar el mail")
    }
    const enviarMensaje=await sendMessage(process.env.TELEFONO,listaProd)//se envia un mensaje avisando que el usuario hizo una compra
    if (enviarMensaje==="succes"){
        console.log("se envio el Mensaje")
    }else{
        console.log("no se pudo enviar el mensaje")
    }
    const enviarMensajeUsuario=await sendMessage(usuario.numero,"pedido recibido")//se envia un mensaje diciendole al usuario que se recibio su pedido
    if (enviarMensaje==="succes"){
        console.log("se envio el Mensaje")
    }else{
        console.log("no se pudo enviar el mensaje")
    }
})
export{routerCarrito}