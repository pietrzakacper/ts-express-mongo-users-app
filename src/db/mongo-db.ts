import * as mongo from 'mongodb'

export async function connectToMongDb(uri: string, dbName: string): Promise<mongo.Db> {
  const client = new mongo.MongoClient(uri, {
    serverApi: {
      version: mongo.ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  await client.connect()
  const db = client.db(dbName)

  return db
}