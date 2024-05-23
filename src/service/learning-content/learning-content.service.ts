import { Service } from 'typedi';
import { PrismaService } from '../prisma.service';
import { ILearningContent } from '../../interface/learning-content/ILearningContent';
import { LEARNING_CONTENT_TYPE } from '@prisma/client';
import { NotFoundException } from 'jochong-exception';

@Service()
export class LearningContentService {
  constructor(private readonly prismaService: PrismaService) {}

  async getContentByIdx(
    contentIdx: ILearningContent['idx'],
  ): Promise<ILearningContent.IDetailLearningContent> {
    const learningContentResult = await this.prismaService.learningContent.findUniqueOrThrow({
      select: {
        idx: true,
        curriculumIdx: true,
        title: true,
        type: true,
        blockedAt: true,
        createdAt: true,
      },
      where: {
        idx: contentIdx,
        deletedAt: null,
      },
    });

    return {
      idx: learningContentResult.idx,
      title: learningContentResult.title,
      type: learningContentResult.type,
      blockedAt: learningContentResult.blockedAt,
      createdAt: learningContentResult.createdAt,
    };
  }

  /**
   *
   * @param idx 찾을 학습 컨텐츠 인덱스
   * @param contentType 찾을 학습 컨텐츠 타입
   *
   * 해당하는 학습 컨텐츠가 존재하지 않을경우 NotFoundException 발생
   */
  async findLearningContentByIdx(
    idx: ILearningContent['idx'],
    contentType?: LEARNING_CONTENT_TYPE,
  ): Promise<void> {
    const findLearningContent = await this.prismaService.learningContent.findUnique({
      select: {
        idx: true,
      },
      where: {
        idx,
        type: contentType,
        deletedAt: null,
      },
    });

    if (!findLearningContent) {
      throw new NotFoundException(`해당하는 학습 컨텐츠가 존재하지 않습니다`);
    }

    return;
  }
}
