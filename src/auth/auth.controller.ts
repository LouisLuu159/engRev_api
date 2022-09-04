import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { LoginSignUpResponse } from './dto/login-signup-response';
import { LoginDto } from './dto/login.dto';
import { ResponseErrors } from 'src/common/constants/ResponseErrors';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'User Registration' })
  @ApiBadRequestResponse({ description: `Invalid registration's information` })
  @ApiBody({ type: CreateUserDto })
  async signUp(
    @Body() createUserDto: CreateUserDto,
  ): Promise<LoginSignUpResponse> {
    const new_user = await this.authService.signUp(createUserDto);
    const response = new LoginSignUpResponse();
    response.data = { email: new_user.email, full_name: new_user.full_name };
    response.activated = false;
    return response;
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({ description: 'Activate Account' })
  @ApiBadRequestResponse({ description: `Invalid Activate's information` })
  @ApiBody({ type: ActivateAccountDto })
  async activateAccount(
    @Body() payload: ActivateAccountDto,
  ): Promise<LoginSignUpResponse> {
    const new_user = await this.authService.verifyActivatingCode(
      payload.email,
      payload.otp,
    );
    const response = new LoginSignUpResponse();
    response.data = { email: new_user.email, full_name: new_user.full_name };
    response.activated = true;
    return response;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'User Login' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
  ): Promise<LoginSignUpResponse> {
    const response = await this.authService.checkLogin(request, loginDto);
    return response;
  }

  @Post('renew-token')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Renew Access Token' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired RefreshToken' })
  async renewAccessToken(@Req() req: Request) {
    const refreshToken = req.cookies!.Refresh;
    if (refreshToken) {
      const response = await this.authService.renewAccessToken(
        req,
        refreshToken,
      );

      return response;
    } else {
      throw new UnauthorizedException(
        ResponseErrors.UNAUTHORIZED.EXPIRED_TOKEN,
      );
    }
  }
}
