import ApiError from "../utils/ApiError.js";

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return next(
            new ApiError(
                400,
                result.error.issues[0].message
            )
        );
    }

    req.body = result.data;

    next();
};

export default validate;