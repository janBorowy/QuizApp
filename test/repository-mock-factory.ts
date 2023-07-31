import { Repository } from 'typeorm';

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    findBy: jest.fn(),
  }),
);

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<object>;
};
