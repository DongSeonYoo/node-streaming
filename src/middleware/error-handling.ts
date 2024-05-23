import { NextFunction, Request, Response } from 'express';
import { Exception } from 'jochong-exception';

export const errorHandling = () => {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err);

    if (err instanceof Exception) {
      return res.status(err.status).send(err.response);
    }

    if (err.status === 400 && 'body' in err) {
      return res.status(400).send({
        message: 'JSON 형식이 올바르지 않습니다',
      });
    }

    return res.status(500).send({
      message: '서버에서 에러가 발생하였습니다.',
    });
  };
};
