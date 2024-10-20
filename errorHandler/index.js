const ApiError = require('./api-error.js')
const { StatusCodes } = require('http-status-codes')


const errorHandler = (error, req, res, next) =>{
    
    //Default Message
    let message = "Request Failed, Try again Later"
    let errCode = StatusCodes.INTERNAL_SERVER_ERROR

    if(error instanceof ApiError){
        message = error.message
        errCode = error.code
    }

    else if(error instanceof Error){

        if(error.name === 'ValidationError'){
            message = error.message
            errCode = StatusCodes.UNPROCESSABLE_ENTITY
        }

        else if(error.name === 'MongoServerError'){
            if(error.errorResponse.code === 11000){
                message = "Resourca already Exists"
                errCode = StatusCodes.CONFLICT
            }
        }

        else if(error.name === 'CastError'){
            message = "Malformatted Id"
            errCode = StatusCodes.BAD_REQUEST
        }

        else if(error.name === 'JsonwebTokenError'){
            message = 'Invalid Token'
            errCode = StatusCodes.UNAUTHORIZED
        }

        else if(error.name = 'TokenExpiredError'){ //If tokens are used
            message = 'Token Has Expired, Login Again!',
            errCode = StatusCodes.UNAUTHORIZED
        }

        else if(
            error instanceof TypeError ||
            error instanceof EvalError ||
            error instanceof SyntaxError ||
            error instanceof RangeError ||
            error instanceof ReferenceError ||
            error instanceof URIError 
        ){
            message = error.message
            errCode = StatusCodes.BAD_REQUEST
        }
    }

    return res.status(errCode).send({
        status: 'Failed/Error',
        message
    })
}

module.exports = {
    errorHandler
}