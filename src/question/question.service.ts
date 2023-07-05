import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../entities/question';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  findById(id: number): Promise<Question | null> {
    return this.questionRepository.findOneBy({ id });
  }
}
