// This class creates a standard structure for successful API responses (while ApiError handled failures).
class ApiResponse {
    constructor (
        statusCode,
        data,
        message = "Success")
        {
        this.statusCode = statusCode   // HTTP status code (200, 201, etc.)
        this.data = data   // Actual payload (user info, posts, etc.
        this.message = message  // Default message if not provided
        this.success =  statusCode < 400  //true if 400false if error
    }

}
                                               
// Informational responses (100 – 199)
// Successful responses (200 – 299)
// Redirection messages (300 – 399)
// Client error responses (400 – 499)
// Server error responses (500 – 599)