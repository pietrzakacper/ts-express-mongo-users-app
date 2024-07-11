import express, { Express } from 'express';
import cors from 'cors';

export function startServer(host: string, port: number, routes: express.Router[]) {
  const app: Express = express();
  app.use(cors())
    .use(express.json())
    .options('*', cors());

  for(const route of routes) {
    app.use(route);
  }
  
  app.listen(port, host, () => {
    console.log(`[server]: Server is running at http://${host}:${port}`);
  });
}

