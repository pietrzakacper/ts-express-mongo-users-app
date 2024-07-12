import { Response } from "express"
import { BadRequestError } from "../controllers/errors"

export function handleControllerError(res: Response) {
    return (err: Error) => {
      if (err instanceof BadRequestError) {
        res.status(400).send({ error: err.message, errorCode: err.code }).end()
        return
      }
  
      res.status(500).send({ error: 'Internal server error' }).end()
    }
}