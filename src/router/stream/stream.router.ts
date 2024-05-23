import { Request, Response, Router } from 'express';
import { NotFoundException } from 'jochong-exception';
import path from 'path';
import fs from 'fs';
import controller from '../../util/controller';

export const streamRouter = Router();

/**
 * GET /stream/:fileName
 * @description 클라이언트에서 스트리밍 요청 시 첫 번째 요청은 m3u8 파일을 전송하고, 이후 요청은 ts 파일을 전송.
 */
streamRouter.get(
  '/:fileName/*',
  controller((req: Request, res: Response) => {
    const { fileName } = req.params;
    const streamRequest = req.params[0];
    const lectureVideoPath = path.join(__dirname, '../../../lecture-video', fileName);

    fs.stat(lectureVideoPath, (err, stats) => {
      if (!stats || err) {
        throw new NotFoundException('해당하는 강의 영상이 존재하지 않습니다.');
      }

      /**
       * videojs가 .ts파일을 요청하지 않을 때
       *  - 해당하는 fileName의 m3u8 파일을 스트리밍
       * videojs가 m3u8파일을 읽고 .ts파일을 요청할 때
       *  - 해당하는 fileName의 ts 파일을 스트리밍
       */
      if (!streamRequest) {
        res.status(200).set('Content-Type', 'application/vnd.apple.mpegurl');
        const m3u8 = path.join(lectureVideoPath, fileName + '.m3u8');

        return res.sendFile(m3u8);
      } else {
        res.status(206).set('Content-Type', 'video/MP2T');
        const ts = path.join(lectureVideoPath, streamRequest);

        return fs.createReadStream(ts).pipe(res);
      }
    });
  }),
);
