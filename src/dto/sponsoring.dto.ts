import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateSponsoringDto {
  @ApiProperty({
    description: "ID du parrain (sponsor)",
    example: 'uuid-du-parrain',
  })
  @IsUUID('4', { message: "L'identifiant du parrain doit être un UUID valide" })
  sponsorId!: string;

  @ApiProperty({
    description: "ID du filleul (sponsored)",
    example: 'uuid-du-filleul',
  })
  @IsUUID('4', { message: "L'identifiant du filleul doit être un UUID valide" })
  sponsoredId!: string;

  @ApiProperty({
    description: 'Indique si le premier dépôt a été effectué par le filleul',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  firstDeposit?: boolean;
}

export class UpdateSponsoringDto extends PartialType(CreateSponsoringDto) {}