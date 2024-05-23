import { body } from 'express-validator';

/**
 * @body videoLength 강의 영상 길이
 */
export const videoLengthBodyValidation = body('videoLength')
  .notEmpty()
  .withMessage('값이 입력되지 않았습니다')
  .isInt()
  .withMessage('정수가 아닙니다')
  .toInt();
