import express from 'express';
import { validationResult, ValidationChain } from 'express-validator';

const validate = (validations: ValidationChain[]): express.RequestHandler => {
  return async (req, res, next) => {
    const validationPromises = validations.map((validation) => validation.run(req));
    await Promise.all(validationPromises);

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).send({
      validationError: errors
        .array()
        .map((error) => `[${error['location']}] ${error['path']}: ${error['msg']}`),
    });
  };
};

export default validate;
