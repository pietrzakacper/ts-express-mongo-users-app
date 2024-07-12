import * as mongo from 'mongodb';

export async function connectToMongDb(uri: string, dbName: string): Promise<mongo.Db> {
    const client = new mongo.MongoClient(uri, {
        serverApi: {
            version: mongo.ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    });

    await client.connect();
    const db = client.db(dbName);

    return db;
}

// This function is used to initialize the database with the collections and indexes that we need
// It should be safe to call this function multiple times, as it will only create the collections and indexes if they don't exist
export async function initCollections(db: mongo.Db): Promise<void> {
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
}
