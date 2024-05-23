import multer from 'multer';
import path from 'path';
import env from '../../config/env';
import controller from '../../util/controller';
import { RequestHandler } from 'express';
import { createRandomNumberString } from '../../util/radnom';
import { BadRequestException } from 'jochong-exception';
import { MulterErrorMessage } from '.';
import { IFieldName } from '../../interface/upload/IField';

const allowedMimeType = ['video/avi', 'video/mp4'];

const getMulterContig = (): multer.Options => {
  return {
    storage: multer.diskStorage({
      destination(req, file, callback) {
        const destinationPath = path.join(__dirname, '../../../', env.VIDEO_DIRECTORY_PATH);

        return callback(null, destinationPath);
      },

      filename(req, file, callback) {
        const fileExtension = path.extname(file.originalname);

        const fileName = `${new Date().getTime()}-${createRandomNumberString(6)}`;
        file.filePath = `${fileName}`;

        return callback(null, fileName + fileExtension);
      },
    }),

    fileFilter(req, file, callback) {
      if (!allowedMimeType.includes(file.mimetype)) {
        return callback(new Error('지원하지 않는 파일 형식입니다'));
      }

      return callback(null, true);
    },
    limits: {
      fileSize: 5 * 100 * 1024 * 1024, // 500mb 제한
      files: 1,
    },
  };
};

export const uploadVideo = (options: { filedName: IFieldName }): RequestHandler => {
  const { filedName } = options;

  return controller(async (req, res, next) => {
    multer(getMulterContig()).single(filedName)(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return next(new BadRequestException(MulterErrorMessage[err.code]));
        }

        if (err.message === '지원하지 않는 파일 형식입니다') {
          return next(new BadRequestException(err.message));
        }

        return next(err);
      }

      return next();
    });
  });
};
