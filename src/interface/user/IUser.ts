import { Role } from './IRole';
import { IAdmin } from './IAdmin';
import { IStudent } from './IStudent';
import { ITeacher } from './ITeacher';
import { ICurriculum } from '../curriculum/ICurriculum';
import { ILearningContent } from '../learning-content/ILearningContent';

export interface IUser {
  idx: number;
  loginId: string;
  password: string;
  name: string;
  phoneNumber: string;
  role: Role;
  blockedAt: Date | null;
  createdAt: Date;
}

export namespace IUser {
  export type IStatus = boolean;

  export type ILoggedInUserProfile =
    | IAdmin.IAdminProfile
    | ITeacher.ITeacherProfile
    | IStudent.IStudentProfile;

  export interface IUserProgress {
    idx: ICurriculum['idx'];
    progress: number;
    learningContent: { idx: number; isComplete: boolean }[];
  }
}
