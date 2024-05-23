import env from '../../../config/env';
import { Service } from 'typedi';
import { ILectureVideo } from '../../../interface/learning-content/lecture-video/ILectureVideo';
import { LEARNING_CONTENT_TYPE } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Service()
export class LectureVideoService {
  private readonly contentType = LEARNING_CONTENT_TYPE.LectureVideo;
  private readonly DEFAULT_WATCH_SECOND = env.DEFAULT_VIDEO_WATCH_SECOND;

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 1. 학습 콘텐츠 생성
   * 2. 강의 영상 생성
   */
  async createLectureVideo(
    lectureVideoInput: ILectureVideo.ICreateLectureVideo,
  ): Promise<ILectureVideo['idx']> {
    const createLectureVideoTx = await this.prismaService.$transaction(async (tx) => {
      // 1. 학습 콘텐츠 생성
      const createLearningContent = await tx.learningContent.create({
        data: {
          title: lectureVideoInput.title,
          type: this.contentType,
        },
        select: {
          idx: true,
        },
      });

      // 2. 강의 영상 생성
      const createLectureVideo = await tx.lectureVideo.create({
        data: {
          idx: createLearningContent.idx,
          url: lectureVideoInput.url,
          videoLength: lectureVideoInput.videoLength,
        },
        select: {
          idx: true,
        },
      });

      // 트랜잭션 종료
      return createLectureVideo;
    });

    return createLectureVideoTx.idx;
  }

  async getLectureVideo(videoIdx: ILectureVideo['idx']): Promise<ILectureVideo['url']> {
    const lectureVideoUrl = await this.prismaService.lectureVideo.findUniqueOrThrow({
      select: {
        url: true,
      },
      where: {
        idx: videoIdx,
        LearningContent: {
          deletedAt: null,
        },
      },
    });

    return lectureVideoUrl.url;
  }
}
