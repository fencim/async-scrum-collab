import { LocalBaseService } from './localbase.services';
type SessionValue = object;

class SessionService extends LocalBaseService<SessionValue> {
  constructor() {
    super('session')
  }

}
export const sessionService = new SessionService();
