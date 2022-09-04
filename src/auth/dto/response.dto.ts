export class LoginSignUpResponse {
  data: {
    id?: string;
    email: string;
    full_name: string;
  };
  activated?: boolean;
  authToken?: string;
}

export class ForgotPasswordResponseDto {
  data: {
    email: string;
  };
  message: string;
}

export class ResetPasswordResponseDto {
  data: {
    id: string;
    email: string;
  };
  message: string;
}
