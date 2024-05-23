import Container from 'typedi';
import { RedisService } from './redis.service';
import { LectureVideoService } from './learning-content/lecture-video/lectureVideo.service';
import { LearningContentService } from './learning-content/learning-content.service';

export const learningContentService = Container.get(LearningContentService);
export const lectureVideoService = Container.get(LectureVideoService);
export const redisService = Container.get(RedisService);
