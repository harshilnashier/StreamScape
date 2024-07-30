class ApiResponse {
    constructor(StatusCode,data,message="Success"){
        this.StatusCode=StatusCode
        this.data=data
        this.message=message

        // standard code establishing we assume greater than 400 to be error
        // status code here are in reference to the server wether an HTTP has been successfully completed
        
        this.success=StatusCode<400
    }
}

export {ApiResponse}