import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto, LoginUserDto } from 'src/dto/dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken'
@Injectable()
export class UserService {
    constructor(private readonly databaseService: DatabaseService) { }

    async create(createUserDto: CreateUserDto): Promise<{
        msg: string,
        email: string,
        name: string,
        number: string,
        userId: string
    }> {
        try {
            const existinguser = await this.databaseService.userModel.findOne({ email: createUserDto.email });
            if (existinguser) {
                throw new BadRequestException("User Already Exist")
            }
            const user = await this.databaseService.userModel.create(createUserDto);
            return { msg: "User Created Successfully", email: user.email, name: user.name, number: user.number, userId: user._id.toString() }
        } catch (e) {
            throw new BadRequestException(e.message)

        }

    }

    async login(
        loginUserDto: LoginUserDto
    ): Promise<{
        msg: string,
        token: string
    }> {
        try {
            const user = await this.databaseService.userModel.findOne({ email: loginUserDto.email });
            if (!user) {
                throw new BadRequestException("User Not Found")
            }
            const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
            if (!isMatch) {
                throw new BadRequestException("Invalid Password")
            }
            const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '24h' } as any);
            return { msg: "User Login Successfully", token }
        } catch (e) {
            throw new BadRequestException(e.message)
        }
    }

    async verifyLoginToken(token: string) {
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);


            return decodedToken;
        } catch (e) {
            throw new BadRequestException("Invalid Token")
        }
    }
    async getUser(id: string) {
        try {
            const user = await this.databaseService.userModel.findById(id).select('-password -createdAt -updatedAt -__v');
            if (!user) {
                throw new BadRequestException("User Not Found")
            }
            return user
        } catch (e) {
            throw new BadRequestException(e.message)
        }
    }
}
