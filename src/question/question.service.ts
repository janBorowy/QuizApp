import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../entities/question';
import { Repository } from 'typeorm';
import { DatabaseFacade } from '../database/database.facade';

@Injectable()
export class QuestionService {
  constructor(
    @Inject(DatabaseFacade)
    private databaseFacade: DatabaseFacade,
  ) {}
}
