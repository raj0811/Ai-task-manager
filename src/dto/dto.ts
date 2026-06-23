import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsOptional()
    role?: string;
}

export class LoginUserDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;
}