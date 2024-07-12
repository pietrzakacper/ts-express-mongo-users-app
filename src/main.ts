import * as dotenv from 'dotenv';
import { startServer } from './http-server';
import { usersRoutes } from './routes';
import { UsersController } from './controllers';
import { Database, initDb } from './db';

async function main() {
    dotenv.config();

    const config = {
        host: process.env['HOST'] ?? 'localhost',
        port: process.env['PORT'] ? parseInt(process.env['PORT']) : 3111,
        db_uri: process.env['DB_URI'] ?? 'mongodb://localhost:27017',
        db_name: process.env['DB_NAME'] ?? 'local',
    };

    let db: Database;
    try {
        db = await initDb(config.db_uri, config.db_name);
    } catch (err) {
        console.error('Failed to connect to the database', err);
        process.exit(1);
    }

    console.info('Connected to the database successfully!');

    const routes = [usersRoutes(new UsersController(db))];

    await startServer(config.host, config.port, routes);
}

main();
