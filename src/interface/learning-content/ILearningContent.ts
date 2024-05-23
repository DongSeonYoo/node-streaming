import { LEARNING_CONTENT_TYPE } from '@prisma/client';

export interface ILearningContent {
  idx: number;
  title: string;
  type: LEARNING_CONTENT_TYPE;
  order: number | null;
  blockedAt: Date | null;
  createdAt: Date;
}

export namespace ILearningContent {
  export interface ICreateLearningContent extends Pick<ILearningContent, 'title'> {}

  export interface IUpdateLearningContent {
    contentIdx: ILearningContent['idx'];
    title: ILearningContent['title'];
  }

  export interface IDetailLearningContent extends Omit<ILearningContent, 'order'> {}

  export interface ISummaryLearningContent
    extends Omit<IDetailLearningContent, 'blockedAt' | 'curriculumIdx'> {}
}
