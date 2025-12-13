import {
    Controller,
    Post,
    Get,
    Body,
    HttpCode,
    HttpStatus,
    ValidationPipe,
    UsePipes,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Custom interface to type the request object with user payload
interface RequestWithUser extends Request {
    user: {
        userId: string;
        email: string;
        role: string;
    };
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getCurrentUser(@Request() req: RequestWithUser): Promise<UserDto> {
        return this.authService.getCurrentUser(req.user.userId);
    }
}
