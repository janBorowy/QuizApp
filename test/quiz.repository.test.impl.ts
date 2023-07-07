import { Repository, DeleteResult } from 'typeorm';
import { Quiz } from '../src/entities/quiz';
import { FindOptions } from '@nestjs/schematics';

interface FindOneByFindOptions extends FindOptions {
  id: number;
}

export function loadTestQuizRepositoryImplementation(
  quizRepository: Repository<Quiz>,
  repositoryContents: Map<number, Quiz>,
) {
  jest.spyOn(quizRepository, 'save').mockImplementation(async (quiz: Quiz) => {
    let quizId = quiz.id;
    if (quizId == undefined) {
      quizId = repositoryContents.size;
    }
    const savedQuiz = {
      ...quiz,
      id: quizId,
    };
    await repositoryContents.set(quizId, savedQuiz);
    return savedQuiz;
  });

  jest
    .spyOn(quizRepository, 'findOneBy')
    .mockImplementation(async (findOptions: FindOneByFindOptions) => {
      const foundEntity = repositoryContents.get(findOptions.id);
      if (foundEntity == undefined) {
        return null;
      }
      return foundEntity;
    });

  jest
    .spyOn(quizRepository, 'delete')
    .mockImplementation(async (quizId: number): Promise<DeleteResult> => {
      const existed = repositoryContents.delete(quizId);
      return DeleteResult.from({
        raw: existed,
        records: [],
      });
    });
}
