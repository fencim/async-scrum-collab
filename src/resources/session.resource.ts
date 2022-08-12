import { BaseResource } from './base.resource';
type SessionValue = object;

class SessionResource extends BaseResource<SessionValue> {
  protected async getCb(): Promise<boolean | void | object> {
    //
  }
  protected createCb() {
    //
  }
  protected async deleteCb(): Promise<boolean> {
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(): Promise<void> {
    //
  }
  protected updateCb(): void | Promise<boolean | void | object> {
    //
  }
  protected patchCb(): Promise<boolean | void | object> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('session')
  }

}
export const sessionResource = new SessionResource();
