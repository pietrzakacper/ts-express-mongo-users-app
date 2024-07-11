import { Database } from "../db";
import { UserDocument } from '../db/collections/users'
import z from 'zod'

const userDTOSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    created_at: z.date(),
});

const UserDTO = {
    fromDocument: (doc: UserDocument) => userDTOSchema.parseAsync({
        id: doc._id.toHexString(),
        name: doc.name,
        email: doc.email,
        created_at: doc.created_at
    })
}

type UserDTO = z.infer<typeof userDTOSchema>

export class UsersController {
    constructor(private db: Database) {}

    async list(): Promise<UserDTO[]> {
        const usersDocuments = await this.db.users.getAll()

        const userDTOsPromised = usersDocuments.map((doc) => UserDTO.fromDocument(doc))

        return Promise.all(userDTOsPromised)
    }
}