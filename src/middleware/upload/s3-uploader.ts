import env from '../../config/env';
import controller from '../../util/controller';
import path from 'path';
import s3Storage from 'multer-s3';
import multer, { MulterError } from 'multer';
import { BadRequestException, InternalServerErrorException } from 'jochong-exception';
import { S3Client } from '@aws-sdk/client-s3';
import { createRandomNumberString } from '../../util/radnom';
import { IFieldName } from '../../interface/upload/IField';
import { MulterErrorMessage } from './';

const allowedMimeType = ['image/jpg', 'image/png', 'image/jpeg'];

const s3: S3Client = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY_ID,
  },
});

const getMulterConfig = (options: {
  fieldName: string;
  limitFileSize?: number;
}): multer.Options => {
  const { fieldName, limitFileSize } = options;

  return {
    storage: s3Storage({
      s3,
      bucket: env.AWS_S3_BUCKET_NAME,
      acl: 'public-read-write',
      contentType: s3Storage.AUTO_CONTENT_TYPE,
      key: (req, file, callback) => {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${fieldName}/${new Date().getTime()}-${createRandomNumberString(
          6,
        )}${fileExtension}`;

        callback(null, fileName);
      },
    }),
    fileFilter(req, file, callback) {
      if (!allowedMimeType.includes(file.mimetype)) {
        callback(new Error('지원하지 않는 파일 형식입니다.'));
      }

      callback(null, true);
    },
    limits: {
      fileSize: limitFileSize || 100 * 1024 * 1024, // 100mb 제한
      files: 1,
    },
  };
};

const s3Uploader = (options: { fieldName: IFieldName }) => {
  const { fieldName } = options;

  return controller(async (req, res, next) => {
    multer(getMulterConfig({ fieldName })).single(fieldName)(req, res, (err: any) => {
      if (err instanceof MulterError) {
        return next(new BadRequestException(MulterErrorMessage[err.code]));
      }

      // 임시
      if (err) {
        if (err.message === '지원하지 않는 파일 형식입니다.') {
          return next(new BadRequestException(err.message));
        }
        console.log(err);
        return next(new InternalServerErrorException('파일 업로드 중 문제가 발생했습니다'));
      }

      next();
    });
  });
};

export default s3Uploader;
