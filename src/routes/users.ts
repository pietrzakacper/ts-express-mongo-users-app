import { Request, Response, Router } from 'express';
import { UsersController } from '../controllers';
import z from 'zod';
import { handleControllerError } from './errors';
import { fromZodError } from 'zod-validation-error';
const newUserBodySchema = z.object({
  name: z.string(),
  email: z.string(),
})

const listUsersQuerySchema = z.object({
  created: z.union([z.literal('asc'), z.literal('desc')]).default('asc'),
})

export function usersRoutes(usersController: UsersController) {
  const router = Router()

  router.post('/users', async (req: Request, res: Response) => {
    const body = newUserBodySchema.safeParse(req.body)
    if (!body.success) {
      res.status(400).send({ error: fromZodError(body.error).message }).end()
      return
    }

    const { name, email } = body.data

    await usersController.create({ name, email })
      .then(user => res.send(user).status(201))
      .catch(handleControllerError(res));
  });

  router.get('/users', async (req: Request, res: Response) => {
    const query = listUsersQuerySchema.safeParse(req.query)
    if (!query.success) {
      res.status(400).send({ error: fromZodError(query.error).message }).end()
      return
    }

    await usersController.list(query.data.created)
      .then(users => res.send(users).status(200))
      .catch(handleControllerError(res));
  })

  return router
}