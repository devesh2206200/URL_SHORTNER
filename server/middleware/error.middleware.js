const errorHandler = (err, req, res, next) => {
    console.error("========== FULL ERROR ==========");
    console.error(err);
    console.error(err.stack);

    res.status(err.statusCode || 500).json({
        success: false,
        statusCode: err.statusCode || 500,
        message: err.message,
        stack: err.stack,
    });
};

export default errorHandler;