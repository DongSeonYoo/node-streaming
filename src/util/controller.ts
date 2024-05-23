import express from 'express';

const controller = (requestHandler: express.RequestHandler): express.RequestHandler => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

export default controller;
