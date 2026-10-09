/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, Min } from "class-validator";

export class CreateStockDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    quantity?: number;
}
