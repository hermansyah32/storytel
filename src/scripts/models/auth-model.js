import { login as apiLogin, register as apiRegister } from '../data/api';
import UserModel from './user-model';

export default class AuthModel {
  constructor({ token, user }) {
    this.token = token;
    this.user = user;
  }

  static async login({ email, password }) {
    const response = await apiLogin({ email, password });

    if (!response.error && response.loginResult) {
      const user = new UserModel({
        id: response.loginResult.userId,
        name: response.loginResult.name,
        email,
      });

      const auth = new AuthModel({
        token: response.loginResult.token,
        user,
      });

      return {
        error: response.error,
        message: response.message,
        data: auth
      };
    }

    return response;
  }

  static async register({ name, email, password }) {
    const response = await apiRegister({ name, email, password });
    return response;
  }
}
