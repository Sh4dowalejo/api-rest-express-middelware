function log(req,res,next) {
    console.log('Loggear...');
    next();

}
//Exportar la unica funcion de logger
module.exports = log;