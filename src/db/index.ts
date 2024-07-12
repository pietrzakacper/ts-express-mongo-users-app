import { UsersCollection } from './collections/users';
import { connectToMongDb, initCollections } from './mongo-db';

export async function initDb(uri: string, dbName: string) {
    const db = await connectToMongDb(uri, dbName);

    await initCollections(db);

    return {
        users: new UsersCollection(db),
    };
}

export type Database = Awaited<ReturnType<typeof initDb>>;
