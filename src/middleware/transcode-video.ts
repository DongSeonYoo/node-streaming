import { RequestHandler } from 'express';
import controller from '../util/controller';
import { BadRequestException } from 'jochong-exception';
import path from 'path';
import Ffmpeg from 'fluent-ffmpeg';
import ffmpegInstall from '@ffmpeg-installer/ffmpeg';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { getDurationToMs } from '../util/total-second';
import { toMs } from 'hh-mm-ss';

export const transcodeVideo: RequestHandler = controller(async (req, res, next) => {
  if (!req.file) {
    throw new BadRequestException('파일이 존재하지 않습니다');
  }

  try {
    const outputDirName = req.file.filePath;
    const outputDir = path.join(__dirname, '../../', 'lecture-video', outputDirName);

    const inputFileName = req.file.filePath + '.mp4';
    const inputFilePath = path.join(__dirname, '../../', 'lecture-video', inputFileName);
    let inputFileLength: number;

    const manifestPath = `${outputDir}/${outputDirName}.m3u8`;

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir);
    }

    const command = Ffmpeg(inputFilePath)
      .setFfmpegPath(ffmpegInstall.path)
      .outputOptions([
        '-profile:v baseline',
        '-level 3.0',
        '-start_number 0',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls',
      ]);

    command.on('start', (data) => {
      console.log('start transcoding file: ', inputFileName);
    });

    command.on('codecData', (data) => {
      inputFileLength = getDurationToMs(data.duration);
    });

    command.on('progress', (data) => {
      const currentTime = toMs(data.timemark);
      const progress = (currentTime / inputFileLength) * 100;

      console.log('progress: ', progress.toFixed(2) + '%');
      // 여기서 소켓 열고 내려주면 될듯?
    });

    command.on('end', () => {
      console.log('end transcoding file: ', inputFileName);
    });
    req.file.manifestPath = manifestPath;

    command.output(manifestPath).run();
  } catch (error) {
    throw error;
  } finally {
    // 작업이 종료되면 원본 mp4 파일 삭제
    const inputFilePath = path.join(
      __dirname,
      '../../',
      'lecture-video',
      req.file.filePath + '.mp4',
    );
    if (existsSync(inputFilePath)) {
      res.on('finish', () => {
        console.log('delete original mp4 file: ', inputFilePath);
        unlinkSync(inputFilePath);
      });
    }
  }

  return next();
});
