import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';

import { TransactionType, TransactionStatus } from '@prisma/client';


export class CreateTransactionDTO {
  @IsString()
  @IsNotEmpty()
  creator_id!: string; // User ID

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(TransactionType, {
    message: "le type doit être 'deposit' ou 'withdrawal'",
  })
  type!: TransactionType;
}

export class UpdateTransactionDTO {
  @IsEnum(TransactionStatus, {
    message: "le status doit être 'done' ou 'failed'",
  })
  @IsOptional()
  status?: TransactionStatus;
}
