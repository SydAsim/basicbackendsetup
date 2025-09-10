

---

## 🔹 What are **utilities** in the backend?

* **Utilities (utils)** are **helper modules/files** in your project.
* They usually contain **reusable logic** that can be used across multiple parts of your backend, instead of repeating code everywhere.
* Think of them as **toolboxes**: you put common tools there (like custom error handlers, formatters, validators, etc.).

Example utilities you might find in a backend:

* `ApiError` → custom error handling.
* `asyncHandler` → wrapper for async functions to catch errors.
* `logger` → function to log info or errors.
* `jwtHelper` → function to sign/verify JWT tokens.
* `passwordHelper` → function to hash/compare passwords.

👉 Why?
Because you don’t want to **repeat logic** in every route or controller. Instead, you centralize it in **utils**.

---

## 🔹 Your `ApiError` class explained

You’re right — it’s a **custom error class** that extends Node.js’s built-in `Error`.
Here’s the step-by-step breakdown:

```js
class ApiError extends Error {
    constructor (
        statusCode,                   // HTTP status code (400, 404, 500 etc.)
        message = "Something went Wrong", // Error message
        errors = [],                  // Extra errors (like validation details)
        stack = ""                    // Error stack trace (optional)
    ) {
        super(message)                // Calls the parent Error constructor

        this.statusCode = statusCode  // Useful for sending HTTP responses
        this.data = message           // Stores message (but "data" might be misleading, usually it's "message")
        this.success = false          // Marks request as failed
        this.errors = errors          // Extra error details

        if (stack) {
            this.stack = stack        // If custom stack is passed, use it
        } else {
            Error.captureStackTrace(this, this.constructor)  
            // Otherwise, capture the stack trace of where error occurred
        }
    }
}
```

---

## 🔹 Why do we use this in the backend?

Because:

1. **Consistency**
   Every error thrown in your API has the **same structure**.
   Example API response:

   ```json
   {
     "success": false,
     "message": "User not found",
     "statusCode": 404,
     "errors": []
   }
   ```

2. **Better Debugging**
   The `stack` tells you exactly **where the error happened** in the code.

3. **Cleaner Code**
   Instead of writing:

   ```js
   res.status(404).json({ success: false, message: "Not Found" })
   ```

   everywhere, you can just:

   ```js
   throw new ApiError(404, "Not Found")
   ```

   and let your global error middleware handle it.

---

✅ So in short:

* **Utilities** = shared helper functions/classes.
* **ApiError** = custom error wrapper to standardize backend error handling.
* **Stack trace** = helps you debug by showing where the error came from.

---
