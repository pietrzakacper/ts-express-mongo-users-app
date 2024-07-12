import { Request, Response, Router } from 'express';
import { UsersController } from '../controllers';
import z from 'zod';
import { handleControllerError, handleValidationError } from './errors';

const newUserReqSchema = z.object({
    body: z.object({
        name: z.string(),
        email: z.string(),
    })
});

const listUsersReqSchema = z.object({
    query: z.object({
        created: z.union([z.literal('asc'), z.literal('desc')]).default('asc'),
    }),
});

export function usersRoutes(usersController: UsersController) {
    const router = Router();

    router.post('/users', async (req: Request, res: Response) => {
        const validationResult = newUserReqSchema.safeParse(req);
        if (!validationResult.success) {
            handleValidationError(res, validationResult.error);
            return;
        }

        const { name, email } = validationResult.data.body;

        await usersController
            .create({ name, email })
            .then((user) => res.send(user).status(201))
            .catch(handleControllerError(res));
    });

    router.get('/users', async (req: Request, res: Response) => {
        const validationResult = listUsersReqSchema.safeParse(req);
        if (!validationResult.success) {
            handleValidationError(res, validationResult.error);
            return;
        }

        const { query } = validationResult.data

        await usersController
            .list(query.created)
            .then((users) => res.send(users).status(200))
            .catch(handleControllerError(res));
    });

    return router;
}
