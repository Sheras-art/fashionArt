class apiError extends Error {
    constructor(
        statuscode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statuscode = statuscode,
        this.data = null,
        this.message = message,
        this.error = errors,
        this.stack = stack,
        this.success = false

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { apiError }