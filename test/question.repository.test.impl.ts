import { Repository, DeleteResult, DeepPartial } from 'typeorm';
import { Quiz } from '../src/entities/quiz';
import { FindOptions } from '@nestjs/schematics';
import { QuizInput } from '../src/quiz/types/quiz.input';
import { Question } from '../src/entities/question';
import { QuestionInput } from '../src/quiz/types/question.input';

interface FindOneByFindOptions extends FindOptions {
  id: number;
}

export function loadTestQuestionRepositoryImplementation(
  questionRepository: Repository<Question>,
  repositoryContents: Map<number, Question>,
) {
  jest
    .spyOn(questionRepository, 'save')
    .mockImplementation(async (question: Question) => {
      let questionId = question.id;
      if (questionId == undefined) {
        questionId = repositoryContents.size;
      }
      const savedQuestion = {
        ...question,
        id: questionId,
      };
      await repositoryContents.set(questionId, savedQuestion);
      return savedQuestion;
    });

  jest
    .spyOn(questionRepository, 'create')
    .mockImplementation((question: Question) => {
      let questionId = question.id;
      if (questionId == undefined) {
        questionId = repositoryContents.size;
      }
      const savedQuestion = {
        ...question,
        id: questionId,
      };
      return savedQuestion;
    });

  jest
    .spyOn(questionRepository, 'findOneBy')
    .mockImplementation(async (findOptions: FindOneByFindOptions) => {
      const foundEntity = repositoryContents.get(findOptions.id);
      if (foundEntity == undefined) {
        return null;
      }
      return foundEntity;
    });

  jest
    .spyOn(questionRepository, 'findBy')
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
    .spyOn(questionRepository, 'delete')
    .mockImplementation(async (questionId: number): Promise<DeleteResult> => {
      const existed = repositoryContents.delete(questionId);
      return DeleteResult.from({
        raw: existed,
        records: [],
      });
    });
}
