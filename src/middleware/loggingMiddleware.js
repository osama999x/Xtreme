const { createLogger, transports, format } = require("winston");
const { v4: uuidv4 } = require("uuid");
const catchAsync = require("../utils/catchAsync");
const moment = require("moment");
const { Buffer } = require("buffer");

const loggingMiddleware = catchAsync(async (req, res, next) => {
    const logFormat = format.combine(format.timestamp(), format.json());
    const logger = createLogger({
        level: "info",
        format: logFormat,
        transports: [
            new transports.File({
                filename: `public/logs/${moment().format("DD-MM-YYYY")}-http.log`,
                level: "info",
            }),
        ],
    });

    const id = uuidv4();
    const start = Date.now();
    const { method, url, headers, body, params, query } = req;
    logger.info({
        id,
        type: "request",
        method,
        url,
        headers,
        body,
        params,
        query,
        time: moment().format("DD-MM-YYYY hh:mm:ss"),
    });

    const oldWrite = res.write;
    const oldEnd = res.end;
    let responseBody = {};

    const chunks = [];

    res.write = function (...restArgs) {
        chunks.push(Buffer.from(restArgs[0]));
        oldWrite.apply(res, restArgs);
    };
    res.end = function (...restArgs) {
        if (restArgs[0]) {
            chunks.push(Buffer.from(restArgs[0]));
        }

        try {
            const responseText = Buffer.concat(chunks).toString("utf8");

            if (responseText && responseText.trim().startsWith('{') && responseText.trim().endsWith('}')) {
                responseBody = JSON.parse(responseText);
            } else {
                responseBody = responseText;
            }
        } catch (err) {
            console.error("Error parsing JSON response:", err);
        }

        oldEnd.apply(res, restArgs);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        const { statusCode, statusMessage } = res;

        logger.info({
            id,
            type: "response",
            method,
            url,
            duration,
            statusCode,
            statusMessage,
            body: responseBody,
        });
    });

    next();
});

module.exports = loggingMiddleware;
