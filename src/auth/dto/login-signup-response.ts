export class LoginSignUpResponse {
  data: {
    email: string;
    full_name: string;
  };
  activated?: boolean;
  authToken?: string;
}
