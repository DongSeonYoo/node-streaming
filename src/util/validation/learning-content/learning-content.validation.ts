import { ValidationChain, body, param } from 'express-validator';

/**
 * @body learningContent[{idx: number}] (학습 콘텐츠 인덱스 배열)
 */
export const contentArrayValidation: ValidationChain[] = [
  body('learningContent')
    .notEmpty()
    .withMessage('값이 입력되지 않았습니다')
    .isArray({ min: 1 })
    .withMessage('학습 콘텐츠를 1개 이상 지정해야 합니다'),
  body('learningContent.*.idx')
    .notEmpty()
    .withMessage('값이 입력되지 않았습니다')
    .isInt()
    .withMessage('정수가 아닙니다')
    .toInt(),
];

/**
 * @body title 학습 컨텐츠 제목
 */
export const contentTitleBodyValidation: ValidationChain = body('title')
  .notEmpty()
  .withMessage('값이 입력되지 않았습니다')
  .isString()
  .withMessage('문자열이 아닙니다')
  .isLength({ min: 1, max: 100 })
  .withMessage('1 ~ 100자로 입력해주세요');

/**
 * @param contentIdx 학습 컨텐츠 인덱스
 */
export const contentIdxParamValidation: ValidationChain = param('contentIdx')
  .notEmpty()
  .withMessage('값이 입력되지 않았습니다')
  .isInt()
  .withMessage('정수가 아닙니다')
  .toInt();

/**
 * @body contentIdx 학습 컨텐츠 인덱스
 */
export const contentIdxBodyValidation: ValidationChain = body('contentIdx')
  .notEmpty()
  .withMessage('값이 입력되지 않았습니다')
  .isInt()
  .withMessage('정수가 아닙니다')
  .toInt();
