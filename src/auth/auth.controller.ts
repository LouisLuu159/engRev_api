import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
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
    const new_user = await this.authService.verifyCode(
      payload.email,
      payload.otp,
    );
    const response = new LoginSignUpResponse();
    response.data = { email: new_user.email, full_name: new_user.full_name };
    response.activated = true;
    return response;
  }
}
