import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterUserDto) {
    const { email, username, password, role } = registerDto;
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      username,
      password: hashedPassword,
      role,
    });

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginUserDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    
    // Include user profile data (excluding sensitive info)
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      },
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    
    // Include user profile data (excluding sensitive info)
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      },
    };
  }

  async updateProfileImage(userId: number, profileImageUrl: string) {
    const user = await this.usersService.update(userId, { profileImageUrl });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      message: 'Profile image uploaded successfully',
      profileImageUrl: user.profileImageUrl,
      userId: user.id,
    };
  }

  async getUserProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Return user profile without sensitive data
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
    };
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const rawAccess = process.env.JWT_EXPIRES_IN;
    const rawRefresh = process.env.JWT_REFRESH_EXPIRES_IN;
    const accessExpires = rawAccess && !Number.isNaN(Number(rawAccess)) ? Number(rawAccess) : rawAccess || '15m';
    const refreshExpires = rawRefresh && !Number.isNaN(Number(rawRefresh)) ? Number(rawRefresh) : rawRefresh || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as any, {
        secret: process.env.JWT_SECRET,
        expiresIn: accessExpires as any,
      } as any),
      this.jwtService.signAsync(payload as any, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: refreshExpires as any,
      } as any),
    ]);

    await this.usersService.update(user.id, { refreshToken });

    return {
      accessToken,
      refreshToken,
    };
  }
}
