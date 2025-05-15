"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { TErrorSources, TGenericErrorResponse } from '../interface/error';
const handleZodError = (err) => {
    const errorSources = err.issues.map((issue) => {
        return {
            path: issue?.path[issue.path.length - 1],
            message: issue.message,
        };
    });
    const statusCode = 400;
    return {
        statusCode,
        message: 'Validation Error',
        errorSources,
    };
};
exports.default = handleZodError;
