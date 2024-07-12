import express, { Express } from 'express';
import cors from 'cors';
import http from 'http';

export async function startServer(host: string, port: number, routes: express.Router[]) {
    const app: Express = express();
    app.use(cors()).use(express.json()).options('*', cors());

    app.use(...routes);

    let server: http.Server;

    await new Promise<void>((res) => {
        server = app.listen(port, host, () => {
            res();
            console.log(`[server]: Server is running at http://${host}:${port}`);
        });
    });

    return {
        close: () => new Promise((res) => server.close(res)),
    };
}

export type Server = Awaited<ReturnType<typeof startServer>>;
