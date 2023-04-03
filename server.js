//npm innit -y ,npm i express ,i socket.io, init -y , i ejs,express cookie-parser, express-session,connect-mongo ,mongoose,passport,passport-local,bcrypt
//minimist,dotenv, i compression, i log4js,i autocannon,i nodemailer,i twilio
const cluster =require("cluster")
const numCpus=require("os").cpus().length
const express=require('express')
const {createServer}= require('http')
require("./config/auth")
const passport=require("passport")
const compression=require("compression")
import { routerCarrito } from "./routes/carrito.js";
//const log4js=require("log4js")
//const mongoStore=require("connect-mongo")
//const { ContenedorMongo } = require('./controller/contenedorMongoDb')
//const { connectToDb } = require('./config/connectToDb')
const { ContenedorArchivo } = require('./controller/contenedorArchivos')
const expressSession=require("express-session")
const { urlMongo, config } = require('./config/enviorment')
const sendMail=require("./helper/sendEmail")
require("dotenv").config()
export const productosDao= new ContenedorMongo("Productos")

//export const productosA= new ContenedorArchivo("productos")
/*
const listadoProd={
        name: "computadora",
        price: 400,
        thumbnail: "https://cdn3.iconfinder.com/data/icons/feather-5/24/monitor-64.png",
        
}
*/
//productosA.save(listadoProd)
const modo=config.modo

log4js.configure({//creamos los tipos de loggers
    appenders:{
     console:{type:"console"},
     consoleLogger:{type:"logLevelFilter",appender:"console",level:"info"},
     
     warningFile:{type:"file",filename:"warning.log"},
     warningFileLogger:{type:"logLevelFilter",appender:"warningFile",level:"warning"},
      
     errorFile:{type:"file",filename:"error.log"},
     errorFileLogger:{type:"logLevelFilter",appender:"errorFile",level:"error"}, 
    },
    categories:{
        default:{
            appenders:["consoleLogger","warningFileLogger","errorFileLogger"],
            level:"all",
        }
    }
    

})
const logger=log4js.getLogger()

if (cluster.isPrimary && modo==="cluster"){
    for(let i=0;i<numCpus;i++){
        cluster.fork()
    }
    cluster.on("exit",(worker,code,signal)=>{
        cluster.fork()
    })
}else{
const app= express()
app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
const server=createServer(app)

app.use(expressSession({
    store: mongoStore.create({mongoUrl:urlMongo}),
    secret:"secreto",
    resave: true,
    saveUninitialized:true,
    cookie:{maxAge:10000},
    rolling:true,
}))

app.use(passport.initialize())
app.use(passport.session())
app.set('views', './public')
app.set('view engine', 'ejs')
app.use('/carrito',routerCarrito)    
app.get('/datos',async (req,res)=>{
    if(req.session.username){
    const produc=await productosDao.getAll()
    //const produc=await productosA.getAll()
    const nombre=req.session.username
    res.render('form.ejs',{produc,nombre})
    const enviarMail=await sendMail(process.env.EMAIL,"se ha registrado un nuevo usuario","nuevo registro")//cuando un usuario se registra se envia un mail a mi correo
    if (enviarMail==="succes"){
        console.log("se envio el mail")
        logger.info("se envio el mail")
    }else{
        console.log("no se pudo enviar el mail")
        logger.warning("no se pudo enviar el mail")
    }
    return  
    }
    res.redirect("/login.html")
})


app.post('/signup',passport.authenticate("signup",{failureRedirect:"/login.html"}),async (req,res)=>{
   req.session.username=req.user.username
   user=req.user
   console.log(user)
  res.redirect("/datos")
})

app.post('/login',passport.authenticate("login",{failureRedirect:"/login.html"}), async (req,res)=>{
    req.session.username=req.user.username
    
    
  
    res.redirect("/datos")
})

app.get("/logout",async(req,res)=>{
    req.session.destroy(()=>{
        res.send("hasta luego")
    })
})
app.get("*",(req,res)=>{
    const {url,method}=req
    logger.warn(`Ruta ${method} ${url} no implementada`)
    res.send(`Ruta ${method} ${url} no implementada`)
})


   server.listen(config.puerto,(req,res)=>logger.info("funciona"))
 
}


