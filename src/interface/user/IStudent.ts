import { IClass } from '../class/IClass';
import { ICurriculum } from '../curriculum/ICurriculum';
import { IInstitute } from '../institute/IInstitute';
import { ILearningContent } from '../learning-content/ILearningContent';
import { ITeacher } from './ITeacher';
import { IUser } from './IUser';

export interface IStudent extends IUser {}

export namespace IStudent {
  export interface ICreateStudent
    extends Pick<IStudent, 'loginId' | 'password' | 'name' | 'phoneNumber'> {}

  export interface IUpdateStudent extends ICreateStudent {
    studentIdx: IStudent['idx'];
  }

  export interface ISummaryStudent
    extends Pick<IStudent, 'idx' | 'name' | 'blockedAt' | 'createdAt'> {
    class: {
      name: IClass['name'];
      teacher: ITeacher['name'] | null;
      institute: IInstitute['name'] | null;
    } | null;
  }

  export interface IDetailStudent extends IStudent.ISummaryStudent {
    loginId: IStudent['loginId'];
    password: IStudent['password'];
    phoneNumber: IStudent['phoneNumber'];
  }

  export interface IStudentSearchResult extends Pick<IStudent, 'idx' | 'name' | 'loginId'> {}

  export interface IChangeUserState {
    studentIdx: IStudent['idx'];
    block: IUser.IStatus;
  }

  export interface IStudentProfile
    extends Pick<IStudent, 'idx' | 'loginId' | 'role' | 'name' | 'createdAt'> {}

  export interface IStudentCurriculum
    extends Pick<
      ICurriculum,
      'idx' | 'title' | 'summary' | 'description' | 'imagePath' | 'blockedAt'
    > {}

  export interface ICurriculumProgress {
    idx: ICurriculum['idx'];
    progress: number;
    contentList: ICompleteLearningContent[];
  }

  export interface ICompleteLearningContent {
    idx: ILearningContent['idx'];
    completedAt: Date | null;
  }
}
