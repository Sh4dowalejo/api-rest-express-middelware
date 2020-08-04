const express = require('express'); //Express permite las funcionalidades para GET,POST,PUT,DELECT y entre otras 
const config = require('config');// Config middleware que contiene la organizacion de configuraciones de desarrollo
const debugInicio = require('debug')('app:inicio'); //debug(depurar) permite probar ciertas configuraciones del proyecto cuando estamos desarrollando
                                //(debug)(app.nombreADefinir)                    

const Joi = require('@hapi/joi');
const morgan = require('morgan'); //Middleware de tercero "Morgan" permite registrar las peticiones http 

//const logger = require('./logger');  - Middelware propio creado
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public')); //Express nos permite publicar archivos estaticos desde afuera(a traves de url) o dentro

//Configuracion de entornos

console.log("Aplicacion: "+ config.get('nombre'));
console.log("BD Server: "+ config.get('configDB.host'));


//Validacion que solo se habilita morgan cuando esta trabajando con development

//comando para cambiar de configuracion: export NODE_ENV=development  or  export NODE_ENV=production
if(app.get('env')==="development"){
    app.use(morgan('tiny')); //Formato de registro de peticiones. Para saber mas en pagina express -> recursos middleware
    //console.log('Morgan Iniciado...');
    debugInicio('Morgan Habilidado');
}








//app.use(logger); - Inicializacion de middelware

//Middelware propio simple

//Permite procesar antes de que el servidor responda
//app.use(function(req,res,next) {
    
    //console.log('Logging...');
    //next();
//});




//Data
const usuarios = [
    {id:1,nombre:'Alejandro'},
    {id:2, nombre:'Pablo'},
    {id:3, nombre:'Carol'},
];

app.get('/',(req,res)=>{
    res.send('index');
});
app.get('/api/usuarios/', (req,res)=>{

    res.send(usuarios);
});
app.post('/api/usuarios', (req,res)=>{

    /* //Usando el metodo queryscript
    let body = req.body;
    console.log(body.nombre);
    res.json({body}); */
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()});
    
    //Agregamos en una estructura de datos 
    //Si el valor(value es corrector), la validacion esquema Joi que retorna un diccionario de
    //datos que dentro existe una clave value y el valor es el ingresado(nombre)
    const {error,value} = schema.validate({ nombre:req.body.nombre });
    
    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            //cargando el nombre
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }else{

        //accedemos al error y extraemos el mensaje que retorna la validacion esquema Joi
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
    

    

});

app.put('/api/usuarios/:id',(req,res)=>{


    //Debemos buscar el usuario objeto a modificar si existe
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        //Retorna un status 404 cuando el usuario no existe
        res.status(404).send('Usuario no fue encontrado');
       return;
    }
    
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });

    const {error,value} = validarUsuario(req.body.nombre);

    if(error){
        const mensaje = error.details[0].message; 
        res.status(400).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);

});

const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`Èscuchando en el puerto ${port}...`);
});

function existeUsuario(id) {
    return (usuarios.find(u=>u.id===parseInt(id)));
}

//funcion que valida el nombre del usuario con el esquema Joi (libreria)
function validarUsuario(nom) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()});

    return (schema.validate({ nombre:nom }));
}