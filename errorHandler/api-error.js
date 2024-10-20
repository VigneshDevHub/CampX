const { StatusCodes } = require('http-status-codes')


class ApiError {
    constructor(code, message){
        this.code = code
        this.message = message
    }

    static notFound(){
        return new ApiError(StatusCodes.NOT_FOUND,`Requested Resource/Route Could not be Found`)
    }

    static badRequest(message){
        return new ApiError(StatusCodes.BAD_REQUEST, message)
    }

    static internalError(){
        return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR,`Internal Server error`)
    }

}

module.exports = ApiError