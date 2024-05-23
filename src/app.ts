import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import env from './config/env';
import cors from 'cors';
import path from 'path';
import lectureVideoRouter from './router/lecture-video/lecture-video.router';
import express from 'express';
import { NotFoundException } from 'jochong-exception';
import { errorHandling } from './middleware/error-handling';
import { streamRouter } from './router/stream/stream.router';

const app = express();

// 전역 미들웨어 설정
app.use(express.json());
app.use(express.static('static/'));
app.use(cookieParser());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// 미리 준비된 정적파일 라우팅
app.get('/lecture', (req, res) => {
  return res.sendFile(path.join(__dirname + '../../static/index.html'));
});

app.use('/learning-content/lecture-video', lectureVideoRouter);
app.use('/stream', streamRouter);

// 404 처리 미들웨어
app.use((req, res) => {
  throw new NotFoundException('API does not exist');
});

// 전역 에러 핸들링 미들웨어
app.use(errorHandling());

export default app;
