import { Repository } from 'typeorm';

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    create: jest.fn(),
    save: jest.fn(),
  }),
);

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<object>;
};
