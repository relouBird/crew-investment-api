// ─── ME CHANGE PASSWORD ─────────────────────────────────────────────────────

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsPhoneNumber,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
  IsNotEmpty,
  MinLength,
  Matches,
  IsEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MeChangePasswordDto {
  @IsString({
    message: "l'ancien mot de passe doit être une chaîne de caractères",
  })
  @IsNotEmpty({ message: "l'ancien mot de passe ne peut pas être vide" })
  @ApiProperty({
    description: "l'ancien mot de passe",
    example: 'Relou123',
    required: true,
  })
  password!: string;

  @IsString({
    message: 'le nouveau mot de passe doit être une chaîne de caractères',
  })
  @IsNotEmpty({ message: 'le nouveau mot de passe ne peut pas être vide' })
  @MinLength(8, {
    message: 'le mot de passe doit contenir au moins 8 caractères',
  })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message:
      'le mot de passe doit contenir au moins une majuscule et un chiffre',
  })
  @ApiProperty({
    description: 'le nouveau mot de passe',
    example: 'NewRelou456',
    minLength: 8,
    required: true,
  })
  new_password!: string;

  @IsString({ message: 'la confirmation doit être une chaîne de caractères' })
  @IsNotEmpty({
    message: 'la confirmation du mot de passe ne peut pas être vide',
  })
  @ApiProperty({
    description: 'confirmation du nouveau mot de passe',
    example: 'NewRelou456',
    required: true,
  })
  confirm_new_password!: string;
}

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
export class NotificationsDto {
  @ApiProperty({
    description: 'Notifications pour les résultats de paris',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  betResults?: boolean;

  @ApiProperty({
    description: 'Notifications par email',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  email?: boolean;

  @ApiProperty({
    description: 'Notifications pour les promotions',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  promotions?: boolean;

  @ApiProperty({
    description: 'Notifications push',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  push?: boolean;
}

// ─── ME UPDATE INFOS ──────────────────────────────────────────────────────
export class MeUpdateInfosDto {
  @ApiProperty({
    description: "Le pays de l'utilisateur",
    example: 'Cameroun',
    required: false,
  })
  @IsEmpty({ message: 'Le pays peut etre une chaine vide.' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: "L'adresse email de l'utilisateur",
    example: 'ulrich@gmail.com',
    required: false,
  })
  @IsEmail({}, { message: "L'email doit être une adresse valide" })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: "L' ID unique genéré...",
    example: '567483',
    required: false,
  })
  @IsString({ message: "Nombre aleatoire generé pour l'utilisateur" })
  @IsOptional()
  generatedId?: string;

  @ApiProperty({
    description: "Si l'email a été verifié  ",
    example: false,
    required: false,
  })
  @IsBoolean({ message: 'Doit être soit vrai ou faux' })
  @IsOptional()
  email_verified?: boolean;

  @ApiProperty({
    description: "Le prénom de l'utilisateur",
    example: 'Ulrich',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: "Le nom de famille de l'utilisateur",
    example: 'Murel',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: "Le nom complet de l'utilisateur",
    example: 'Ulrich Kwamou',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "Le numéro de téléphone de l'utilisateur",
    example: '+237699041345',
    required: false,
  })
  @IsPhoneNumber(undefined, {
    message: 'Le numéro de téléphone doit être valide',
  })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: "L'Authentification à double-facteurs  de l'utilisateur",
    example: false,
    required: false,
  })
  @IsBoolean({
    message: "L'Authentification à double-facteurs doit être valide",
  })
  @IsOptional()
  twoFactorEnabled?: boolean;

  @ApiProperty({
    description: "Préférences de notifications de l'utilisateur",
    type: NotificationsDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => NotificationsDto)
  @IsOptional()
  notifications?: NotificationsDto;
}
