import { Repository, DeleteResult, DeepPartial } from 'typeorm';
import { Quiz } from '../src/entities/quiz';
import { FindOptions } from '@nestjs/schematics';
import { QuizInput } from '../src/quiz/types/quiz.input';

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

  jest.spyOn(quizRepository, 'create').mockImplementation((quiz: Quiz) => {
    let quizId = quiz.id;
    if (quizId == undefined) {
      quizId = repositoryContents.size;
    }
    const savedQuiz = {
      ...quiz,
      id: quizId,
      questions: [],
    };
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
    .spyOn(quizRepository, 'findBy')
    .mockImplementation(async (findOptions: FindOneByFindOptions) => {
      const foundEntity = repositoryContents.get(findOptions.id);
      if (foundEntity != undefined) {
        return [foundEntity];
      }

      const values = Array.from(repositoryContents.values());
      return values.filter((quiz) => {
        for (const option in findOptions) {
          if (findOptions[option] === quiz[option]) {
            return true;
          }
          return false;
        }
      });
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
