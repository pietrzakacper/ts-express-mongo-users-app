import { Database } from "../db";
import { UserDocument } from '../db/collections/users'
import z from 'zod'
import { BadRequestError } from "./errors";

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
        created_at: doc._id.getTimestamp()
    })
}

type UserDTO = z.infer<typeof userDTOSchema>

export class UsersController {
    constructor(private db: Database) {}

    async create(newUser: {name: string, email: string}): Promise<UserDTO> {
        const newUserDocument = await this.db.users.create(newUser).catch((err) => {
            if(isEmailInUseError(err)) {
                throw new BadRequestError(`Email already in use: ${newUser.email}`, 'email-exists')
            }

            console.error('Failed to create user:', err)
            throw new Error('Error creating user in the database')
        })

        return UserDTO.fromDocument(newUserDocument)
    }

    async list(sortByCreated: 'asc' | 'desc'): Promise<UserDTO[]> {
        const usersDocuments = await this.db.users.getAll()

        const userDTOsPromised = usersDocuments.map((doc) => UserDTO.fromDocument(doc))
        const userDTOs = await Promise.all(userDTOsPromised)

        const ascByCreated = (a: UserDTO, b: UserDTO) => a.created_at.getTime() - b.created_at.getTime()
        const descByCreated = (a: UserDTO, b: UserDTO) => b.created_at.getTime() - a.created_at.getTime()

        userDTOs.sort(sortByCreated === 'asc' ? ascByCreated : descByCreated)

        return userDTOs
    }
}

function isEmailInUseError(err: any): boolean {
    return err.errorResponse?.code === 11000 && typeof err.errorResponse?.keyPattern?.email === 'number'
}