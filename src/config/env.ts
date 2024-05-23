import dotenv from 'dotenv';

dotenv.config();

const env = {
  //mode
  MODE: process.env.MODE as string,

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN as string,

  //server port
  HTTP_PORT: Number(process.env.HTTP_PORT),

  // session secret key
  SESSION_SECRET_KEY: process.env.SESSION_SECRET_KEY as string,

  // jwt secret key
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY as string,

  // redis url
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',

  // login expired time
  LOGIN_TTL: Number(process.env.LOGIN_TTL),

  // AWS configuration
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
  AWS_SECRET_ACCESS_KEY_ID: process.env.AWS_SECRET_ACCESS_KEY_ID as string,
  AWS_S3_BUCKET_NAME: process.env.AWS_BUCKET_NAME as string,

  COOKIE_NAME: 'connect.sid',

  // lecture video path
  VIDEO_DIRECTORY_PATH: process.env.VIDEO_DIRECTORY_PATH as string,

  // admin login info
  ADMIN_LOGIN_ID: process.env.ADMIN_LOGIN_ID as string,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
  ADMIN_PHONE_NUMBER: process.env.ADMIN_PHONE_NUMBER as string,

  // lecture watch second
  DEFAULT_VIDEO_WATCH_SECOND: Number(process.env.DEFAULT_VIDEO_WATCH_SECOND) as number,
};

export default env;
