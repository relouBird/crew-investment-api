import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  Matches,
} from 'class-validator';

// ─── Enum ─────────────────────────────────────────────────────────────────────

// ─── AUTH REGISTER ────────────────────────────────────────────────────────────

export class RegisterDto {
  @IsEmail({}, { message: "l'email doit être valide" })
  @IsNotEmpty({ message: "l'email ne peut pas être vide" })
  @ApiProperty({
    description: "l'email de l'utilisateur",
    example: 'birdy@gmail.com',
    required: true,
  })
  email!: string;

  @IsString({ message: 'le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'le mot de passe ne peut pas être vide' })
  @MinLength(8, {
    message: 'le mot de passe doit contenir au moins 8 caractères',
  })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message:
      'le mot de passe doit contenir au moins une majuscule et un chiffre',
  })
  @ApiProperty({
    description: "le mot de passe de l'utilisateur",
    example: 'Relou123',
    minLength: 8,
    required: true,
  })
  password!: string;

  @IsString({ message: 'la confirmation doit être une chaîne de caractères' })
  @IsNotEmpty({
    message: 'la confirmation du mot de passe ne peut pas être vide',
  })
  @ApiProperty({
    description: 'confirmation du mot de passe',
    example: 'Relou123',
    required: true,
  })
  password_confirmation!: string;

  @IsEnum(UserType, { message: "le type doit être 'guest' ou 'admin'" })
  @ApiProperty({
    description: 'le type de compte',
    example: 'guest',
    enum: UserType,
    required: true,
  })
  type!: UserType;
}

// ─── AUTH REGISTER BY ID ──────────────────────────────────────────────────────
// Même body que RegisterDto, l'ID est passé en paramètre de route (:id)

export class RegisterByIdDto extends RegisterDto {}

// ─── AUTH LOGIN ───────────────────────────────────────────────────────────────

export class LoginDto {
  @IsEmail({}, { message: "l'email doit être valide" })
  @IsNotEmpty({ message: "l'email ne peut pas être vide" })
  @ApiProperty({
    description: "l'email de l'utilisateur",
    example: 'birdy@gmail.com',
    required: true,
  })
  email!: string;

  @IsString({ message: 'le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'le mot de passe ne peut pas être vide' })
  @ApiProperty({
    description: "le mot de passe de l'utilisateur",
    example: 'Relou123',
    required: true,
  })
  password!: string;
}

// ─── AUTH SEND OTP / RESEND OTP ───────────────────────────────────────────────
// Les deux endpoints ont le même body { email }

export class SendOtpDto {
  @IsEmail({}, { message: "l'email doit être valide" })
  @IsNotEmpty({ message: "l'email ne peut pas être vide" })
  @ApiProperty({
    description: "l'email auquel envoyer le code OTP",
    example: 'birdy@gmail.com',
    required: true,
  })
  email!: string;
}

// ─── AUTH VERIFY OTP ──────────────────────────────────────────────────────────

export class VerifyOtpDto {
  @IsEmail({}, { message: "l'email doit être valide" })
  @IsNotEmpty({ message: "l'email ne peut pas être vide" })
  @ApiProperty({
    description: "l'email de l'utilisateur",
    example: 'birdy@gmail.com',
    required: true,
  })
  email!: string;

  @IsString({ message: 'le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'le mot de passe ne peut pas être vide' })
  @ApiProperty({
    description: "le mot de passe de l'utilisateur",
    example: 'Relou123',
    required: true,
  })
  password!: string;

  @IsString({ message: 'le code OTP doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'le code OTP ne peut pas être vide' })
  @MinLength(6, { message: 'le code OTP doit contenir 6 caractères' })
  @MaxLength(6, { message: 'le code OTP doit contenir 6 caractères' })
  @ApiProperty({
    description: 'le code OTP à vérifier',
    example: '710847',
    minLength: 6,
    maxLength: 6,
    required: true,
  })
  otp!: string;
}

// ─── AUTH RESET PASSWORD ──────────────────────────────────────────────────────

export class ResetPasswordDto {
  @IsEmail({}, { message: "l'email doit être valide" })
  @IsNotEmpty({ message: "l'email ne peut pas être vide" })
  @ApiProperty({
    description: "l'email de l'utilisateur",
    example: 'birdy@gmail.com',
    required: true,
  })
  email!: string;

  @IsString({ message: 'le code OTP doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'le code OTP ne peut pas être vide' })
  @MinLength(6, { message: 'le code OTP doit contenir 6 caractères' })
  @MaxLength(6, { message: 'le code OTP doit contenir 6 caractères' })
  @ApiProperty({
    description: 'le code OTP à vérifier',
    example: '710847',
    minLength: 6,
    maxLength: 6,
    required: true,
  })
  otp!: string;
}

// ─── AUTH CHANGE PASSWORD ─────────────────────────────────────────────────────

export class ChangePasswordDto {
  @IsEmail({}, { message: "l'email doit être valide" })
  @IsNotEmpty({ message: "l'email ne peut pas être vide" })
  @ApiProperty({
    description: "l'email de l'utilisateur",
    example: 'birdy@gmail.com',
    required: true,
  })
  email!: string;

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
  password!: string;

  @IsString({ message: 'la confirmation doit être une chaîne de caractères' })
  @IsNotEmpty({
    message: 'la confirmation du mot de passe ne peut pas être vide',
  })
  @ApiProperty({
    description: 'confirmation du nouveau mot de passe',
    example: 'NewRelou456',
    required: true,
  })
  password_confirmation!: string;
}
