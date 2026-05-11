// dto/bet/create-bet.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsDateString,
  ValidateNested,
  Min,
  Max,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BetPrediction } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBetTeamDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  crest!: string;

  @IsString()
  @IsNotEmpty()
  tla!: string;
}

export class CreateBetDTO {
  @ValidateNested()
  @Type(() => CreateBetTeamDTO)
  homeTeam!: CreateBetTeamDTO;

  @ValidateNested()
  @Type(() => CreateBetTeamDTO)
  awayTeam!: CreateBetTeamDTO;

  @IsDateString()
  start_at!: string;

  @IsDateString()
  end_at!: string;

  @IsNumber()
  @Min(0)
  @Max(500)
  winPercentage!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  lossPercentage!: number;

  @IsBoolean()
  isActive!: boolean;
}

export class UpdateBetDTO {
  @IsString()
  @IsOptional()
  score?: string;

  @IsString()
  @IsOptional()
  winner?: string;

  @ValidateNested()
  @Type(() => CreateBetTeamDTO)
  @IsOptional()
  homeTeam?: CreateBetTeamDTO;

  @ValidateNested()
  @Type(() => CreateBetTeamDTO)
  @IsOptional()
  awayTeam?: CreateBetTeamDTO;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isEnded?: boolean;

  @IsDateString()
  @IsOptional()
  start_at?: string;

  @IsDateString()
  @IsOptional()
  end_at?: string;

  @IsNumber()
  @Min(0)
  @Max(500)
  @IsOptional()
  winPercentage?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  lossPercentage?: number;
}

export class CreateUserBetDTO {
  @IsString()
  @IsNotEmpty()
  uid!: string;

  @IsString()
  @IsNotEmpty()
  matchId!: string;

  @IsEnum(BetPrediction, {
    message: "la prediction doit être 'home' | 'away' | 'draw",
  })
  @ApiProperty({
    description: 'le type de compte',
    example: 'guest',
    enum: BetPrediction,
    required: true,
  })
  @IsNotEmpty()
  prediction!: BetPrediction;

  @IsNumber()
  @Min(0)
  potentialGain!: number;

  @IsNumber()
  @Min(0)
  potentialLoss!: number;
}

export class UpdateUserBetDTO {
  @IsEnum(BetPrediction, {
    message: "la prediction doit être 'home' | 'away' | 'draw",
  })
  @ApiProperty({
    description: 'le type de compte',
    example: 'guest',
    enum: BetPrediction,
    required: true,
  })
  @IsNotEmpty()
  prediction!: BetPrediction;

  @IsBoolean()
  @IsOptional()
  win?: boolean;

  @IsBoolean()
  @IsOptional()
  isDelete?: boolean;

  @IsBoolean()
  @IsOptional()
  isPayed?: boolean;

  @IsNumber()
  @IsOptional()
  potentialGain?: number;

  @IsNumber()
  @IsOptional()
  potentialLoss?: number;
}
