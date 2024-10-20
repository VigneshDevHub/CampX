const ApiError = require('./api-error.js')


export const Notfound = (req,res,next) =>{
    next(ApiError.notFound())
}