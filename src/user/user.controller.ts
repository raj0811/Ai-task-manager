import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto } from '../dto/dto';
import { JwtAuthGuard } from '../AuthGuards/user.auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('create')
    async createUser(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto);
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        return await this.userService.login(loginUserDto);
    }

    @Get('verifyLoginToken')
    async verifyLoginToken(@Body() token: string) {
        return await this.userService.verifyLoginToken(token);
    }

    @Get('get-user')
    @UseGuards(JwtAuthGuard)
    async getUser(@Req() req: any) {
        const id = req.user.id
        return this.userService.getUser(id)
    }
}
