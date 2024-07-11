import { Request, Response, Router } from 'express';
import { UsersController } from '../controllers';

export function usersRoutes(usersController: UsersController) {
  const router = Router()

  router.post('/users', (_req: Request, res: Response) => {
    res.send({}).status(201);
  });
  router.get('/users', async (_req: Request, res: Response) => {
    const users = await usersController.list();

    res.send(users).status(200);
  })

  return router
}