import * as mongo from 'mongodb'
import z from 'zod'

const usersCollectionSchema = z.object({
    _id: z.instanceof(mongo.ObjectId),
    name: z.string(),
    email: z.string().email(),
    created_at: z.date(),
});

export type UserDocument = z.infer<typeof usersCollectionSchema>

export class UsersCollection {
    constructor(private db: mongo.Db) {}

    private get usersCollection() {
        return this.db.collection<UserDocument>('users')
    }

    async getAll(): Promise<UserDocument[]> {
        const rawUserDocuments = await this.usersCollection.find().toArray()

        const userDocuments = rawUserDocuments.map(doc => usersCollectionSchema.parseAsync(doc))

        return Promise.all(userDocuments)
    }
}