import * as mongo from 'mongodb';
import z from 'zod';
import { getValidDocuments } from '../utils';

const usersCollectionSchema = z.object({
    _id: z.instanceof(mongo.ObjectId),
    name: z.string(),
    email: z.string().email(),
});

export type UserDocument = z.infer<typeof usersCollectionSchema>;

type NewUser = Omit<UserDocument, '_id'>;

export class UsersCollection {
    constructor(private db: mongo.Db) {}

    private get usersCollection() {
        return this.db.collection<UserDocument>('users');
    }

    async create(newUser: NewUser): Promise<UserDocument> {
        const newUserDocument: UserDocument = {
            ...newUser,
            _id: new mongo.ObjectId(),
        };
        const result = await this.usersCollection.insertOne(newUserDocument);

        newUserDocument._id = result.insertedId;

        return usersCollectionSchema.parseAsync(newUserDocument);
    }

    async getAll(): Promise<UserDocument[]> {
        const rawUserDocuments = await this.usersCollection.find().toArray();

        const userDocuments = rawUserDocuments.map((doc) => usersCollectionSchema.parseAsync(doc));

        return getValidDocuments(userDocuments);
    }
}
