import { Quiz } from './entities/quiz';
import { Question } from './entities/question';
import { QuizService } from './quiz/quiz.service';

export class SimpleDataUtil {
  public static quizSingleAnswer = this.createQuizSingleAnswer();

  public static populateQuizThroughProvider(provider: QuizService) {
    provider.save(this.quizSingleAnswer);
  }

  private static createQuizSingleAnswer(): Quiz {
    const quiz = new Quiz();
    quiz.createdBy = 'Dariusz Wiewiórko';
    quiz.name = 'Polish History Quiz';

    const question11 = new Question();
    question11.description = 'When was the Battle of Grunwald fought?';
    question11.type = 'single';
    question11.possibleScore = 1;

    quiz.questions = [question11];
    return quiz;
  }
}
