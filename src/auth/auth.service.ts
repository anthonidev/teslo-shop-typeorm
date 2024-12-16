import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interface/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userReposiotry: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async create(createAuthDto: CreateUserDto) {
    try {
      const { password, ...rest } = createAuthDto;
      const user = this.userReposiotry.create({
        ...rest,
        password: await bcrypt.hashSync(password, 10),
      });
      await this.userReposiotry.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async login(dto: LoginUserDto) {
    try {
      const { email, password } = dto;
      const user = await this.userReposiotry.findOne({
        where: { email },
        select: ['email', 'password', 'id'],
      });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return { ...user, token: this.getJwtToken({ id: user.id }) };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async checkAuthStatus(user: User) {
    return { ...user, token: this.getJwtToken({ id: user.id }) };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBError(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException('User already exists');
    }
    throw new InternalServerErrorException();
  }
}
