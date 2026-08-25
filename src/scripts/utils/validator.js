export default class Validator {
  static isRequired(value) {
    if (value === null || value === undefined) return false;
    return value.toString().trim().length > 0;
  }

  static isValidEmail(email) {
    if (!this.isRequired(email)) return false;
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }

  static isValidPassword(password, minLength = 8) {
    if (!password) return false;
    return password.length >= minLength;
  }
}
