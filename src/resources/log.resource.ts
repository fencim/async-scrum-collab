import { ILoggable } from 'src/entities';
import { CbResponse } from './base.resource';
import { FbBaseResource } from './fb-base.resource';

class LogResource extends FbBaseResource<ILoggable> {
  protected getKeyOf(v: ILoggable): string {
    const initial = `${v.project}${v.date}${v.type}${v.operator || ''}`;
    const key = ('key' in v.data) && v.data['key'] || ('id' in v.data) && v.data['id'] || 'no-key';
    return initial + this.hashName(initial + key);
  }
  protected async deleteCb(): Promise<boolean | void | ILoggable> {
    throw 'Not Implemented';
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async updateCb(): Promise<boolean | void | ILoggable> {
    throw 'Not Implemented';
  }
  protected async patchCb(): Promise<CbResponse<ILoggable>> {
    throw 'Not Implemented';
  }
  constructor() {
    super('logs')
  }
}
export const logResource = new LogResource();
