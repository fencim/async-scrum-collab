import { IBaseEntity } from 'src/entities/base.entity';
import { BaseResource, CbResponse } from './base.resource';
import { Entity, Filters } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { QueryOptions, firebaseService } from 'src/services/firebase.service';

type ModelName = Parameters<typeof firebaseService.findAll>[0];
export abstract class FbBaseResource<T extends (IBaseEntity & { key: string })> extends BaseResource<T> {
  count(filters?: Filters<Entity>) {
    return firebaseService.count(this.entity as ModelName, filters as Record<string, string>);
  }
  streamWith(filters?: Filters<Entity> | undefined, options?: QueryOptions): Observable<T[]> {
    return super.streamWith(filters, options);
  }
  protected streamCb(filters?: Filters<Entity> | undefined, options?: {
    limits?: number, orderBy?: string;
    order?: 'asc' | 'desc'
  }): void | Observable<T[]> {
    return firebaseService.streamWith<T>(this.entity as ModelName, filters && this.arrayFilter(filters) ||
      (typeof filters == 'object' && filters as { [key: string]: string }) || {}, options);
  }
  protected matchesFilter(a: T, filters?: Filters | undefined): boolean {
    if (!filters || typeof filters !== 'object') return !!a;
    const conditions = Object.keys(filters);
    let $eval = true;
    for (const condition of conditions) {
      if (!/ /.test(condition)) {
        const op1 = filters[condition];
        const op2 = (a as unknown as Record<string, string>)[condition];
        $eval = $eval && op1 == op2;
      } else {
        const [prop, operator] = condition.split(' ');
        const op1 = filters[condition];
        const op2 = (a as unknown as Record<string, string>)[prop];
        switch (operator) {
          case '<':
            $eval = $eval && String(op1).localeCompare(String(op2)) < 0;
            break;
          case '<=':
            $eval = $eval && String(op1).localeCompare(String(op2)) <= 0;
            break;
          case '==':
            $eval = $eval && op1 == op2;
            break;
          case '!=':
            $eval = $eval && op1 != op2;
            break;
          case '>=':
            $eval = $eval && String(op1).localeCompare(String(op2)) >= 0;
            break;
          case '>':
            $eval = $eval && String(op1).localeCompare(String(op2)) > 0;
            break;
          case 'array-contains':
            $eval = $eval && Array.isArray(op1) && !!op1.find(i => i == op2);
            break;
          case 'in':
            $eval = $eval && Array.isArray(op2) && !!op2.find(i => i == op1);
            break;
          case 'not-in':
            $eval = $eval && Array.isArray(op2) && !op2.find(i => i == op1);
            break;
          case 'array-contains-any':
            $eval = $eval && Array.isArray(op2) && Array.isArray(op1)
              && !!op2.find(i => op1.find(j => j == i));
            break;
          default:
            $eval = false;
        }
      }
    }
    return $eval;
  }
  protected async getCb(key: string): Promise<boolean | void | T> {
    const record = await firebaseService.get(this.entity as ModelName, key) as T;
    return record;
  }
  protected async createCb(data: T): Promise<boolean | void | T> {
    return await firebaseService.create(this.entity as ModelName, data) as T;
  }
  protected async deleteCb(data: T): Promise<boolean | void | T> {
    await firebaseService.delete(this.entity as ModelName, data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(filters?: Filters<Entity> | undefined): Promise<void | T[]> {
    return await firebaseService.findAll(this.entity as ModelName, filters as { [field: string]: string }) as T[];
  }
  protected async updateCb(data: T): Promise<boolean | void | T> {
    await firebaseService.update(this.entity as ModelName, data.id || data.key, data);
    return true;
  }
  protected async patchCb(data: T, property: string): Promise<CbResponse<T>> {
    await firebaseService.patch(this.entity as ModelName, data.key, property, data[property as keyof T]);
    return true;
  }
}
