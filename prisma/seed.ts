import env from '../src/config/env';
import { Prisma, PrismaClient } from '@prisma/client';
import { Role } from '../src/interface/user/IRole';

const prisma = new PrismaClient();

const adminSeed = {
  idx: 1,
  loginId: env.ADMIN_LOGIN_ID,
  password: env.ADMIN_PASSWORD,
  name: 'admin',
  phoneNumber: env.ADMIN_PHONE_NUMBER,
};

const studentSeedArr = [
  {
    idx: 2,
    loginId: 'student2',
    password: '1234Asd..',
    name: '학생2',
    phoneNumber: '01011111112',
  },
  {
    idx: 3,
    loginId: 'student3',
    password: '1234Asd..',
    name: '학생3',
    phoneNumber: '01011111113',
  },
];

const teacherSeedArr = [
  {
    idx: 4,
    loginId: 'teacher1',
    password: '1234Asd..',
    email: 'teacherEmail1@namver.com',
    name: '선생1',
    phoneNumber: '01011111115',
    class: [
      {
        idx: 1,
      },
    ],
  },
  {
    idx: 5,
    loginId: 'teacher2',
    password: '1234Asd..',
    email: 'teacherEmail2@namver.com',
    name: '선생2',
    phoneNumber: '01011111116',
    class: [
      {
        idx: 2,
      },
    ],
  },
];

const classSeedArr = [
  {
    idx: 1,
    name: '1학년 1반',
    student: [
      {
        idx: 2,
      },
    ],
  },
  {
    idx: 2,
    name: '2학년 2반',
    student: [
      {
        idx: 3,
      },
    ],
  },
];

const instituteSeed = {
  idx: 1,
  name: 'institute1',
  manager: 'institute1Manager',
  managerPhoneNumber: '01036261552',
  teacher: [{ idx: 4 }],
  startedAt: new Date(),
  endAt: new Date(),
};

async function main() {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 0. 관리자 생성
    await tx.user.upsert({
      where: {
        idx: adminSeed.idx,
      },
      create: {
        ...adminSeed,
        role: Role.ADMIN,
      },
      update: {},
    });
    // 1. 학생 계정 생성
    await createUserAndStudent(tx);

    // 2. 반 생성
    await createClassAndConnectStudent(tx);

    // 3. 선생 계정 생성
    await createUserAndTeacher(tx);

    // 4. 기관 생성
    await createInstituteAndConnectTeacher(tx);

    // 5. 학습 컨텐츠 생성 (퀴즈)
    // 6. 문의 생성
    // 7. 배너 생성
    // 8. 질문 생성
    // 9. 답변 생성
  });
}

async function createUserAndStudent(tx: Prisma.TransactionClient) {
  // 1-1. 유저 생성
  const createdUserIdxArr = await Promise.all(
    studentSeedArr.map(async (studentSeed) => {
      const createdUser = await tx.user.upsert({
        where: {
          idx: studentSeed.idx,
        },
        create: {
          ...studentSeed,
          role: Role.STUDENT,
        },
        update: {
          ...studentSeed,
          role: Role.STUDENT,
        },
        select: {
          idx: true,
        },
      });
      return createdUser;
    })
  );

  // 1-2. 학생 연결
  for (const studentArr of createdUserIdxArr) {
    await tx.student.upsert({
      where: {
        userIdx: studentArr.idx,
      },
      create: {
        userIdx: studentArr.idx,
      },
      update: {
        userIdx: studentArr.idx,
      },
    });
  }
}

async function createUserAndTeacher(tx: Prisma.TransactionClient) {
  // 1. 유저 생성
  const createdUserArr = await Promise.all(
    teacherSeedArr.map(async (teacher) => {
      return await tx.user.upsert({
        where: {
          idx: teacher.idx,
        },
        create: {
          idx: teacher.idx,
          loginId: teacher.loginId,
          name: teacher.name,
          password: teacher.password,
          phoneNumber: teacher.phoneNumber,
          role: Role.TEACHER,
        },
        update: {
          idx: teacher.idx,
          loginId: teacher.loginId,
          name: teacher.name,
          password: teacher.password,
          phoneNumber: teacher.phoneNumber,
          role: Role.TEACHER,
        },
        select: {
          idx: true,
        },
      });
    })
  );

  // 2. 선생 연결
  const teacherCreatedArr = await Promise.all(
    teacherSeedArr.map(async (teacher, i) => {
      return await tx.teacher.upsert({
        where: {
          userIdx: createdUserArr[i].idx,
        },
        create: {
          userIdx: teacher.idx,
          email: teacher.email,
        },
        update: {
          userIdx: teacher.idx,
          email: teacher.email,
        },
        select: {
          userIdx: true,
        },
      });
    })
  );

  // 3. 반과 선생님 연결
  // 반 테이블의 teacherIdx에 생성한 선생님 인덱스를 넣어줘야 함.
  teacherCreatedArr.map(async (teacher, i) => {
    await tx.class.updateMany({
      data: {
        teacherIdx: teacher.userIdx,
      },
      where: {
        idx: {
          in: teacherSeedArr[i].class.map((e) => e.idx),
        },
      },
    });
  });
}

async function createClassAndConnectStudent(tx: Prisma.TransactionClient) {
  // 1. 반 생성
  const createdClassArr = await Promise.all(
    classSeedArr.map(async (classSeed) => {
      const createdClass = await tx.class.upsert({
        where: {
          idx: classSeed.idx,
        },
        create: {
          idx: classSeed.idx,
          name: classSeed.name,
        },
        update: {
          idx: classSeed.idx,
          name: classSeed.name,
        },
        select: {
          idx: true,
        },
      });

      return createdClass;
    })
  );

  // 2. 학생 연결
  for (const classSeedItem of classSeedArr) {
    for (const student of classSeedItem.student) {
      await tx.student.upsert({
        where: {
          userIdx: student.idx,
        },
        create: {
          userIdx: student.idx,
          classIdx: createdClassArr[classSeedItem.idx - 1].idx,
        },
        update: {
          userIdx: student.idx,
          classIdx: createdClassArr[classSeedItem.idx - 1].idx,
        },
      });
    }
  }
}

async function createInstituteAndConnectTeacher(tx: Prisma.TransactionClient) {
  const createInstituteResult = await tx.institute.upsert({
    where: {
      idx: instituteSeed.idx,
    },
    create: {
      idx: instituteSeed.idx,
      name: instituteSeed.name,
      managerName: instituteSeed.manager,
      managerPhoneNumber: instituteSeed.managerPhoneNumber,
      startedAt: instituteSeed.startedAt,
      endAt: instituteSeed.endAt,
    },
    update: {
      idx: instituteSeed.idx,
      name: instituteSeed.name,
      managerName: instituteSeed.manager,
      managerPhoneNumber: instituteSeed.managerPhoneNumber,
      startedAt: instituteSeed.startedAt,
      endAt: instituteSeed.endAt,
    },
  });

  await tx.teacher.updateMany({
    data: {
      instituteIdx: createInstituteResult.idx,
    },
    where: {
      userIdx: {
        in: instituteSeed.teacher.map((teacher) => teacher.idx),
      },
    },
  });

  return;
}

main()
  .then(() => {
    console.log('Seed complete');
  })
  .catch((e) => {
    console.error(e);
  });
