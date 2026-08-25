import { isUserAuthenticated } from '../utils/auth';

export default function authMiddleware() {
  return isUserAuthenticated();
}