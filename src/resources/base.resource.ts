import { KeyValueStorage } from './localbase';
import { FilterFn2, Filters, Pagination } from './localbase/state-db.controller';

const dbVersion = undefined;

type IBaseResourceModel = {
  id?: string;
  key?: string;
} | object;
interface IDocStore<T extends IBaseResourceModel> {
  status: 'saved' | 'synced' | 'updated' | 'deleted';
  key: string;
  data: T
}
export type SaveCallBack<T extends IBaseResourceModel> = (data: T) => (Promise<void | boolean | T> | void);
export abstract class BaseResource<T extends IBaseResourceModel> {
  constructor(entity: string, private keyField?: string, prefix = 'hrs') {
    this.localBase = new KeyValueStorage(prefix + '-' + entity.toLowerCase(), dbVersion);
  }
  private localBase: KeyValueStorage;
  private async manageDocCallback(doc: IDocStore<T>, prop?: string) {
    if (doc.status !== 'synced') {
      let status: void | boolean | T = false;
      try {
        if (doc.status == 'saved' && this.createCb) {
          status = await this.createCb(doc.data);
          if (status && typeof status == 'object') {
            await this.updateData(doc.key, status);
          }
        } else if (doc.status == 'updated' && this.updateCb && !prop) {
          status = await this.updateCb(doc.data);
        } else if (doc.status == 'updated' && this.patchCb && prop) {
          status = await this.patchCb(doc.data, prop);
        }
        if (status) {
          await this.setDataStatus(doc.key, 'synced');
        }
      } catch {
        //offline try again later
      }
    }
  }
  protected abstract createCb(data: T): (Promise<void | boolean | T> | void);
  protected abstract deleteCb(data: T): (Promise<void | boolean | T> | void);
  protected abstract deleteAllCb(): Promise<void | boolean>;
  protected abstract getAllCb(filters?: Filters): Promise<T[] | void>;
  protected abstract updateCb(data: T): (Promise<void | boolean | T> | void);
  protected abstract patchCb(data: T, property: string): Promise<void | boolean | T>;
  protected arrayFilter<T = []>(filters?: Filters) {
    if (typeof filters == 'function' && /^\w*\s*\(\s*\)/.test(filters.toString())) {
      return (filters as FilterFn2)() as T;
    }
  }
  async findAllFrom(filters?: Filters): Promise<T[]> {
    const result: IDocStore<T>[] = await this.findAllDocFrom(filters);
    const mapper = (doc: IDocStore<T>) => {
      this.manageDocCallback(doc);
      return doc.data;
    };
    return result.map(mapper) as T[];
  }
  async findAllDocFrom(filters?: Filters): Promise<IDocStore<T>[]> {
    let result: IDocStore<T>[] = [];
    if (this.getAllCb) {
      result = (await this.localBase.paginatedValues<IDocStore<T>>(filters)).contents || [];
      this.getAllCb(filters).then(async (onlineResult) => {
        if (!onlineResult || !(onlineResult instanceof Array)) return;
        const intersection = result.filter(i => {
          const match = onlineResult.find(o => this.getKeyOf(o) == this.getKeyOf(i as T));
          if (match) {
            i.data = match;
            return true;
          }
          return false;
        });
        const addedOnline = onlineResult.filter(o => !intersection.find(i => i.key == this.getKeyOf(o)));
        const localyAdded = result.filter(i => i.status == 'saved');
        const deleted = result.filter(i => !intersection.find(o => o.key == i.key || i.status != 'synced'));
        //delete from local the deleted
        await Promise.all(deleted.map((i) => {
          return this.localBase.deleteItem(this.getKeyOf(i as T));
        }));
        //update intersection
        const updated = (await Promise.all(intersection.map(async (i) => {
          if (i.status == 'synced') {
            return this.localBase.setItem(this.getKeyOf(i as T), i);
          } else {
            return i;
          }
        }))).concat(
          ...await Promise.all(addedOnline.map((i) => {
            const key = this.getKeyOf(i);
            return this.localBase.setItem(key, {
              data: i,
              key,
              status: 'synced'
            } as IDocStore<T>);
          })),
          ...localyAdded);
        result.splice(0, result.length, ...(updated || []));
      })
      //sleep for 500ms
      await new Promise((r) => setTimeout(r, 500));
    }
    return result;
  }

  async findAll(filters?: Filters, page?: Pagination<T>): Promise<Pagination<T>> {
    const mapper = (doc: IDocStore<T>) => {
      this.manageDocCallback(doc);
      return doc.data;
    };
    const pageanated = (await this.localBase.paginatedValues<IDocStore<T>>(filters, page));
    return {
      ...pageanated,
      contents: await Promise.all((pageanated.contents || []).map(mapper))
    };
  }
  async findOne(
    filters?: Filters
  ): Promise<T | undefined> {
    const all = await this.findAllFrom(filters);
    return all && (all[0] as T);
  }
  async saveAllTo(values: T[]) {
    return Promise.all(
      values.map((v) => {
        return v &&
          this.setData(this.getKeyOf(v), v);
      })
    );
  }
  async saveEachTo(values: T[]) {
    while (values.length) {
      const v = values.splice(0, 1)[0];
      v && await this.setData(this.getKeyOf(v),
        v
      );
    }
  }
  /**
   * Create or update existing record if exists
   * @param key
   * @param value
   * @returns
   */
  async setData(key: string, value: T, createOnly = false): Promise<T> {
    const existing = await this.getDoc(key || this.getKeyOf(value));
    if (createOnly && existing) {
      throw 'Record already exist';
    }
    if (existing && existing.status == 'synced') {
      existing.status = 'updated';
      existing.data = value;
      await this.localBase.setItem(key, existing as IDocStore<T>);
      this.manageDocCallback(existing);
      return existing.data;
    } else {
      const doc = await this.localBase.setItem(key, {
        data: value,
        key: key,
        status: 'saved'
      } as IDocStore<T>);
      this.manageDocCallback(doc);
      return doc.data;
    }
  }
  /**
   * Update existing record
   * does nothing if record does not exist
   * @param key
   * @param value
   * @returns
   */
  async updateData(key: string, value: T) {
    const existing = await this.getDoc(key);
    if (existing) {
      existing.data = value;

      await this.localBase.setItem(key, existing as IDocStore<T>);
      await this.setDataStatus(existing.key, 'updated');
      this.manageDocCallback(existing);
      return existing.data;
    }
  }
  async updateProperty(key: string, prop: keyof T, value: unknown) {
    const existing = await this.getDoc(key);
    if (existing && typeof existing.data == 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (existing.data as unknown as any)[prop] = value;
      await this.localBase.setItem(key, existing as IDocStore<T>);
      await this.setDataStatus(existing.key, /^(synced|updated)$/.test(existing.status) ? 'updated' : 'saved');
      this.manageDocCallback(existing, prop as string);
      return existing.data;
    }
  }
  async getDoc(key: string) {
    return await this.localBase.getItem<IDocStore<T>>(key);
  }
  async getDocStatus(key: string) {
    return (await this.getDoc(key)).status;
  }
  protected async setDataStatus(key: string, status: 'saved' | 'synced' | 'updated' = 'synced') {
    const doc = await this.getDoc(key);
    const oldStatus = doc.status;
    doc.status = status;
    await this.localBase.setItem(key, doc);
    return oldStatus;
  }
  async getData(key: string): Promise<T | undefined> {
    const doc = await this.localBase.getItem<IDocStore<T>>(key);
    this.manageDocCallback(doc);
    return doc.data;
  }

  async count() {
    return this.localBase.length();
  }

  async deleteData(key: string) {
    const doc = await this.getDoc(key);
    if (doc.status != 'saved' && this.deleteCb) {
      doc.status = 'deleted';
      await this.deleteCb(doc.data);
    }
    await this.localBase.deleteItem(key);
    return doc.data;
  }

  async deleteAll() {
    if (this.deleteAllCb) {
      await this.deleteAllCb()
    }
    this.localBase.deleteAll();
  }
  private getKeyOf(v: T): string {
    if (typeof v == 'object') {
      if (this.keyField && Object.prototype.hasOwnProperty.call(v, this.keyField)) {
        return (v as unknown as { [key: string]: string })[this.keyField];
      } else if (Object.prototype.hasOwnProperty.call(v, 'key')) {
        return (v as unknown as { key: string }).key;
      } else if (Object.prototype.hasOwnProperty.call(v, 'id')) {
        return (v as unknown as { id: string }).id;
      } else if (Object.prototype.hasOwnProperty.call(v, 'code')) {
        return (v as unknown as { code: string }).code;
      } else {
        return this.hashName(JSON.stringify(v)).toString().replace('-', 'N');
      }
    } else {
      return this.hashName(String(v)).toString().replace('-', 'N');
    }
  }
  private hashName(name: string) {
    let hash = 0;
    if (name.length == 0) return hash;
    for (let i = 0; i < name.length; i++) {
      const chr = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash = hash & hash;
    }
    return hash;
  }
}
