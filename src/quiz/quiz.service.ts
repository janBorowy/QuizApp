import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz';
import { Repository } from 'typeorm';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  find(query): Promise<Quiz[]> {
    return this.quizRepository.find(query);
  }

  findById(id: number): Promise<Quiz | null> {
    return this.quizRepository.findOneBy({ id });
  }

  save(quiz: Quiz): Promise<Quiz> {
    return this.quizRepository.save(quiz);
  }
}
