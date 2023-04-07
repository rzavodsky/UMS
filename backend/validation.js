import { Validator } from 'express-json-validator-middleware'

export const { validate } = new Validator({ allErrors: true })

/// A middleware, which tries to convert all params to integers.
/// If any param can't be converted, sends a response with an error message.
export function validateIdParams(req, res, next) {
    const errors = []
    for (let key in req.params) {
        if (!key.toLocaleLowerCase().includes("id")) continue
        req.params[key] = parseInt(req.params[key], 10)
        if (isNaN(req.params[key])) {
            errors.push({
                key,
                message: `Param '${key}' needs to be an integer`,
            })
        }
    }

    if (errors.length !== 0) {
        return res.status(400).json({
            error: "Validation Error",
            messages: errors
        })
    }
    next()

}
