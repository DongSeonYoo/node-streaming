import { ILearningContent } from '../ILearningContent';

export interface ILectureVideo extends ILearningContent {
  url: string;
  videoLength: number;
}

export namespace ILectureVideo {
  // export interface ICreateLectureVideo extends Pick<ILectureVideo, 'title' | 'url' | 'type'> {}
  export interface ICreateLectureVideo extends ILearningContent.ICreateLearningContent {
    url: ILectureVideo['url'];
    videoLength: ILectureVideo['videoLength'];
  }

  export interface IUpdateLectureVideo extends Pick<ILearningContent, 'title'> {
    contentIdx: ILearningContent['idx'];
    url?: ILectureVideo['url'];
  }
}
