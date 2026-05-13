import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsPhoneNumber,
  Max,
  IsEnum,
} from 'class-validator';

export class CreateWalletDTO {
  @IsString()
  @IsNotEmpty({ message: "l'id de l'utilisateur ne peut pas être vide" })
  uid!: string; // User ID
}

export class UpdateWalletDTO {
  @IsNumber()
  @IsOptional()
  @Min(0)
  funds?: number;
}

export class RefillWalletDTO {
  @IsString()
  @IsPhoneNumber('CM', {
    message: 'Votre numero de telephone doit être camerounais',
  })
  @IsNotEmpty({ message: 'le Numero de Téléphone ne doit pas être vide' })
  transaction_number!: string; // Numero de Téléphone

  @IsNumber()
  @Min(0)
  @Max(100000)
  amount!: number;

  @IsEnum(['cm.mtn', 'cm.orange'], {
    message: 'le service doit être soit de MTN ou ORANGE',
  })
  service!: ['cm.mtn', 'cm.orange'];
}

export class WithdrawalWalletDto extends RefillWalletDTO {}
