import { Request, Response } from 'express';
import { stat } from 'fs';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const splittedPath = request.originalUrl.split('/')
    const paramType = splittedPath[splittedPath.length - 2];
    
    if (paramType === "transfers") {
      const { user_id } = request.params
      const { id: sender_id } = request.user
      const { amount, description } = request.body

      const createStatement = container.resolve(CreateStatementUseCase);
  
      const statement = await createStatement.execute({
        user_id,
        sender_id,
        type: OperationType.TRANSFER,
        amount,
        description
      });
  
      return response.status(201).json(statement);
    }

    const { id: user_id } = request.user;
      const { amount, description } = request.body;

      const sender_id = user_id
  
      const type = splittedPath[splittedPath.length - 1] as OperationType;

      const createStatement = container.resolve(CreateStatementUseCase);
  
      const statement = await createStatement.execute({
        user_id,
        sender_id,
        type,
        amount,
        description
      });
  
      return response.status(201).json(statement);
  }
}
