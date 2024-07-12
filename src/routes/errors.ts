import { Response } from 'express';
import { BadRequestError } from '../controllers/errors';
import { fromZodError } from 'zod-validation-error';
import z from 'zod'

export function handleValidationError(res: Response, error: z.ZodError<any>) {
    res.status(400)
    .send({ error: fromZodError(error).message })
    .end();
}

export function handleControllerError(res: Response) {
    return (err: Error) => {
        if (err instanceof BadRequestError) {
            res.status(400).send({ error: err.message, errorCode: err.code }).end();
            return;
        }

        res.status(500).send({ error: 'Internal server error' }).end();
    };
}
