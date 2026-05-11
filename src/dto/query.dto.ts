import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";


// query model dataset
export class QueryDatasetDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ required: false, description: "Recherche par nom" })
    search?: string;

    @IsOptional()
    @ApiProperty({ required: false, description: "Numéro de la page" })
    page?: string;

    @IsOptional()
    @ApiProperty({ required: false, description: "Nombre d'éléments par page" })
    limit?: string;
}
