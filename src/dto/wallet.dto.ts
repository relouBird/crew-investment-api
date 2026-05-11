import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

export class CreateWalletDTO {
  @IsString()
  @IsNotEmpty({ message: "l'email ne peut pas être vide" })
  uid!: string; // User ID
}

export class UpdateWalletDTO {
  @IsNumber()
  @IsOptional()
  @Min(0)
  funds?: number;
}