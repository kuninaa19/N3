import express from "express";
import socket from "./socket_io";
import loaders from "./loaders";
import config from "./conf/config";
import logger from "./loaders/logger";

async function startServer() {
    const app = express();

    await loaders(app);

    const server = app.listen(config.port, () => {
        logger.info('Server listening on port : %o', config.port);
    })
        .on("error", (err) => {
            logger.error(err);
            process.exit(1);
        });

    socket(server);
}

startServer();