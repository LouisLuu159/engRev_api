export class LoginSignUpResponse {
  data: {
    id?: string;
    email: string;
    full_name: string;
  };
  activated?: boolean;
  authToken?: string;
}
