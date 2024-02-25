import { ILogCounter } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { BaseResource, CbResponse } from './base.resource';

class LogCounterResource extends BaseResource<ILogCounter> {
  async getCountOf(filter: Record<string, string>, cache?: boolean) {
    if (cache) {
      return (await this.getLocalData('count#' + JSON.stringify(filter)))
        || this.getData('count#' + JSON.stringify(filter));
    } else {
      return this.getData('count#' + JSON.stringify(filter));
    }
  }
  getSumOf(field: string, filter: Record<string, string>) {
    return this.getData('sumOf' + field + '#' + JSON.stringify(filter));
  }
  getMeanOf(field: string, filter: Record<string, string>) {
    return this.getData('meanOf' + field + '#' + JSON.stringify(filter));
  }
  protected getKeyOf(v: ILogCounter): string {
    return v.variable + '#' + JSON.stringify(v.filter);
  }
  protected streamCb(): void {
    throw 'Not Implemented';
  }
  protected async getCb(aggregateFilter: string): Promise<boolean | void | ILogCounter> {
    const [aggregate, filters] = aggregateFilter.split('#', 2
    );
    const filter = JSON.parse(filters);
    if (/^count/.test(aggregate)) {
      const count = await firebaseService.count('logs', filter);
      return {
        key: aggregateFilter, filter, value: count, variable: aggregate
      }
    } else {
      const aggregated = await firebaseService.aggregate('logs', {
        [aggregate]: aggregate
          .replace(/^(sumOf|averageOf|meanOf|totalOf)/, '')
          .replace(/^\w/, v => v.toLowerCase())
      });
      return {
        key: aggregateFilter,
        filter,
        value: typeof aggregated == 'number' ? aggregated :
          ((aggregated?.[aggregate] || 0)),
        variable: aggregate
      }
    }
  }
  protected async createCb(): Promise<boolean | void | ILogCounter> {
    throw 'Not Implemented';
  }
  protected async deleteCb(): Promise<boolean | void | ILogCounter> {
    throw 'Not Implemented';
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(): Promise<void | ILogCounter[]> {
    const locals = await this.findAll();
    if (locals.contents) {
      return await Promise.all(
        locals.contents.map(async (record) => {
          const result = await this.getCb(record.key);
          return (typeof result == 'object') ? result : record;
        })
      )
    }
    return [];
  }
  protected async updateCb(): Promise<boolean | void | ILogCounter> {
    throw 'Not Implemented';
  }
  protected async patchCb(): Promise<CbResponse<ILogCounter>> {
    throw 'Not Implemented';
  }
  constructor() {
    super('log-counter')
  }
}
export const logCounterResource = new LogCounterResource();
