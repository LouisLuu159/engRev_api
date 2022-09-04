import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
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
import { Request } from 'express';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';

import { ResponseErrors } from 'src/common/constants/ResponseErrors';

import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import {
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  VerifyCodeDto,
} from './dto/request.dto';
import { LoginSignUpResponse } from './dto/response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

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
  @ApiOkResponse({ description: 'Activate Account' })
  @ApiBadRequestResponse({ description: `Invalid Activate's information` })
  @ApiBody({ type: VerifyCodeDto })
  async activateAccount(
    @Body() payload: VerifyCodeDto,
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

  @Post('log-out')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ description: 'Log out' })
  @ApiUnauthorizedResponse({ description: 'Invalid authorization' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async logout(@Req() request) {
    const refreshToken = request.cookies!.Refresh;
    await this.userService.deleteRefreshToken(request.user.id, refreshToken);
    request.res.cookie('Authentication', '', {
      httpOnly: true,
      maxAge: 0,
      sameSite: 'none',
    });

    request.res.cookie('Refresh', '', {
      httpOnly: true,
      maxAge: 0,
      sameSite: 'none',
    });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Forgot Password' })
  @ApiBadRequestResponse({ description: `Email is invalid` })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.handleForgotPassword(body.email);
    return {
      data: { email: body.email },
      message: 'Password reset mail is sent',
    };
  }

  @Post('verify-forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Verify Forgot Password Code' })
  @ApiBadRequestResponse({ description: `Email is invalid` })
  @ApiBody({ type: VerifyCodeDto })
  async verifyForgotPassword(
    @Req() request: Request,
    @Body() body: VerifyCodeDto,
  ) {
    const response = await this.authService.verifyForgotPasswordCode(
      request,
      body,
    );
    return response;
  }

  @Put('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Verify Forgot Password Code' })
  @ApiBadRequestResponse({ description: `Email is invalid` })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Req() request: Request, @Body() body: ResetPasswordDto) {
    const response = await this.authService.handleResetPassword(request, body);
    return response;
  }
}
