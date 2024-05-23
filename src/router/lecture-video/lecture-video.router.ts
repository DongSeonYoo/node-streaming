import controller from '../../util/controller';
import validate from '../../middleware/validate';
import { uploadVideo } from '../../middleware/upload/video-uploader';
import { BadRequestException } from 'jochong-exception';
import { transcodeVideo } from '../../middleware/transcode-video';
import { ILectureVideo } from '../../interface/learning-content/lecture-video/ILectureVideo';
import { learningContentService, lectureVideoService } from '../../service';
import { videoLengthBodyValidation } from '../../util/validation/learning-content/lecture-video.validation';
import { LEARNING_CONTENT_TYPE } from '@prisma/client';
import { Router } from 'express';

const lectureVideoRouter = Router();

/**
 * POST /learning-content/video
 * 강의 영상 생성
 */
lectureVideoRouter.post(
  '/',
  uploadVideo({ filedName: 'video' }),
  validate([videoLengthBodyValidation]),
  transcodeVideo,
  controller(async (req, res, next) => {
    const file = req.file;
    if (!file) {
      throw new BadRequestException('파일이 존재하지 않습니다');
    }
    console.log(file.filePath);

    const createLectureVideoInput: ILectureVideo.ICreateLectureVideo = {
      title: req.body.title,
      url: file.filePath,
      videoLength: req.body.videoLength,
    };

    const lectureVideoIdx = await lectureVideoService.createLectureVideo(createLectureVideoInput);

    console.log('createdLectureVideoIdx: ', lectureVideoIdx);

    return res.send({
      lectureVideoIdx,
    });
  }),
);

/**
 * 강의 영상 인덱스 가져오기
 * GET /learning-content/lecture-video/:videoIdx
 */
lectureVideoRouter.get(
  '/:videoIdx',
  controller(async (req, res, next) => {
    const videoIdx = Number(req.params.videoIdx);
    console.log(videoIdx);

    await learningContentService.findLearningContentByIdx(
      videoIdx,
      LEARNING_CONTENT_TYPE.LectureVideo,
    );

    const lectureVideoUrl = await lectureVideoService.getLectureVideo(videoIdx);

    console.log(lectureVideoUrl);
    return res.send({
      lectureVideoUrl,
    });
  }),
);

export default lectureVideoRouter;
