class apiResponse {
    constructor(statusCode = 200, message = 'Request successful', data = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 400;
    }
}

export default apiResponse;
