import { Observable } from 'rxjs';
import { KeyValueStorage } from './localbase';
import { FilterFn2, Filters, Pagination } from './localbase/state-db.controller';

const dbVersion = undefined;

type IBaseResourceModel =
  | {
    id?: string;
    key?: string;
  }
  | object;
type DocStatus = 'new' | 'saved' | 'synced' | 'updated' | 'deleted';
interface IDocStore<T extends IBaseResourceModel> {
  status: DocStatus;
  key: string;
  data: T;
}
type KeyValuePair = {
  [key: string]: string;
}

export abstract class BaseResource<T extends IBaseResourceModel> {
  requestDelay = 1000 * 1 /*second*/;
  constructor(entity: string, private keyField?: string, prefix = 'hrs') {
    this.localBase = new KeyValueStorage(
      prefix + '-' + entity.toLowerCase(),
      dbVersion
    );
  }
  private localBase: KeyValueStorage;
  private async manageDocCallback(doc: IDocStore<T>) {
    let statusOrData: void | boolean | T = false;
    try {
      if (doc.status !== 'synced') {
        if (doc.status == 'saved' && this.createCb) {
          statusOrData = await this.createCb(doc.data);
          if (statusOrData && typeof statusOrData == 'object') {
            await this.updateData(doc.key, statusOrData);
          }
        } else {
          const props = Object.keys(doc.data).filter(prop => /^\*/.test(prop));
          if (props.length == 0 && doc.status == 'updated' && this.updateCb) {
            statusOrData = await this.updateCb(doc.data);
          } else if (doc.status == 'updated' && this.patchCb) {
            const failedPatch: string[] = [];
            await Promise.all(props.map(async (prop) => {
              const result = await this.patchCb(doc.data, prop.replace('*', ''));
              if (result) {
                const data = doc.data;
                delete (data as unknown as KeyValuePair)['*' + String(prop)];
              } else {
                failedPatch.push(prop);
              }
            }));
            statusOrData = failedPatch.length == 0;
            if (statusOrData) {
              await this.setData(doc.key, doc.data, 'synced');
            } else if (failedPatch.length != props.length) {
              await this.setData(doc.key, doc.data, 'updated');
            }
          }
        }
        if (statusOrData) {
          await this.setDataStatus(doc.key, 'synced');
        }
      } else if (this.getCb) {
        const status = await this.getCb(doc.key);
        if (status && typeof status == 'object') {
          await this.setData(doc.key, status, 'synced');
          doc.data = status;
        }
      }
    } catch {
      //offline try again later
    }
  }
  protected abstract createCb(data: T): Promise<void | boolean | T> | void;
  protected abstract deleteCb(data: T): Promise<void | boolean | T> | void;
  protected abstract deleteAllCb(): Promise<void | boolean>;
  protected abstract getAllCb(filters?: Filters): Promise<T[] | void>;
  protected abstract getCb(key: string): Promise<T | void | boolean>;
  protected abstract updateCb(data: T): Promise<void | boolean | T> | void;
  protected abstract patchCb(data: T, property: string): Promise<void | boolean | T>;
  protected abstract stream(filters?: Filters): void | Observable<T[]>;
  protected arrayFilter<T = []>(filters?: Filters) {
    if (
      typeof filters == 'function' &&
      /^\w*\s*\(\s*\)/.test(filters.toString())
    ) {
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
      result =
        (await this.localBase.paginatedValues<IDocStore<T>>(filters))
          .contents || [];
      this.getAllCb(filters).then(async (onlineResult) => {
        if (!onlineResult) return;
        const intersection = result.filter(i => {
          const match = onlineResult.find(o => this.getKeyOf(o) == this.getKeyOf(i as T));
          if (match) {
            i.data = (i.status == 'synced') ? match : i.data;
            return true;
          }
          return false;
        });
        const addedOnline = onlineResult.filter(o => !intersection.find(i => i.key == this.getKeyOf(o)));
        const localyAdded = result.filter(i => i.status == 'saved');
        const deleted = !filters && result.filter(i => !intersection.find(o => o.key == i.key || i.status != 'synced'));
        //delete from local the deleted
        await Promise.all((deleted || []).map((i) => {
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
      });
      await new Promise((r) => setTimeout(r, this.requestDelay));
    }
    return result;
  }

  async findAll(
    filters?: Filters,
    page?: Pagination<T>
  ): Promise<Pagination<T>> {
    const mapper = (doc: IDocStore<T>) => {
      this.manageDocCallback(doc);
      return doc.data;
    };
    const pageanated = await this.localBase.paginatedValues<IDocStore<T>>(
      filters,
      page
    );
    return {
      ...pageanated,
      contents: await Promise.all((pageanated.contents || []).map(mapper)),
    };
  }
  async findOne(filters?: Filters): Promise<T | undefined> {
    const all = await this.findAllFrom(filters);
    return all && (all[0] as T);
  }
  async saveAllTo(values: T[]) {
    return Promise.all(
      values.map((v) => {
        return v && this.setData(this.getKeyOf(v), v);
      })
    );
  }
  async saveEachTo(values: T[], createOnlyOrStatus: boolean | DocStatus = false) {
    while (values.length) {
      const v = values.splice(0, 1)[0];
      v && (await this.setData(this.getKeyOf(v), v, createOnlyOrStatus));
    }
  }
  /**
   * Create or update existing record if exists
   * @param key
   * @param value
   * @returns
   */
  async setData(key: string, value: T, createOnlyOrStatus: boolean | DocStatus = false): Promise<T> {
    const identity = key || this.getKeyOf(value);
    const existing = identity && await this.getDoc(identity);
    if (createOnlyOrStatus === true && existing) {
      throw 'Record already exist';
    }
    if (existing && existing.status == 'synced') {
      existing.status = typeof createOnlyOrStatus == 'string' ? createOnlyOrStatus : 'updated';
      existing.data = value;
      await this.localBase.setItem(identity, existing as IDocStore<T>);
      if (existing.status != 'synced') this.manageDocCallback(existing);
      return existing.data;
    } else {
      let doc = identity && await this.localBase.setItem(identity, {
        data: value,
        key: identity,
        status: typeof createOnlyOrStatus == 'string' ? createOnlyOrStatus : 'saved',
      } as IDocStore<T>);
      if (typeof doc == 'object') {
        await this.manageDocCallback(doc);
        return doc.data;
      } else {
        doc = {
          data: value,
          status: 'new'
        } as IDocStore<T>;
        await this.manageDocCallback(doc);
        return doc.data;
      }
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
      const oldData = (existing.data as unknown as KeyValuePair)[String(prop)];
      (existing.data as unknown as KeyValuePair)['*' + String(prop)] = oldData;
      (existing.data as unknown as KeyValuePair)[String(prop)] = value as string;
      await this.localBase.setItem(key, existing as IDocStore<T>);
      await this.setDataStatus(existing.key, /^(synced|updated)$/.test(existing.status) ? 'updated' : 'saved');
      this.manageDocCallback(existing);
      return existing;
    }
  }
  async getDoc(key: string) {
    return await this.localBase.getItem<IDocStore<T>>(key);
  }
  async getDocStatus(key: string) {
    return (await this.getDocByIdentity(key))?.status;
  }
  protected async setDataStatus(key: string, status: 'saved' | 'synced' | 'updated' = 'synced') {
    const doc = await this.getDoc(key);
    const oldStatus = doc.status;
    doc.status = status;
    await this.localBase.setItem(key, doc);
    return oldStatus;
  }
  async getData(key: string): Promise<T | undefined> {
    const doc = await this.getDocByIdentity(key);
    if (doc) {
      this.manageDocCallback(doc);
      await new Promise((r) => setTimeout(r, this.requestDelay));
      return doc.data;
    } else if (this.getCb) {
      try {
        const data = await this.getCb(key);
        if (typeof data == 'object') {
          const identity = this.getKeyOf(data);
          await this.setData(identity, data, 'synced');
          return data;
        }
      } catch {
        return;
      }
    }
  }

  private async getDocByIdentity(key: string): Promise<IDocStore<T> | undefined> {
    let item = await this.localBase.getItem<IDocStore<T>>(key);
    if (this.keyField != 'key') {
      item = item || await this.getDocByField('key', key);
      item = item || await this.getDocByField('id', key);
    }
    return item;
  }

  private async getDocByField(idField: string, value: string): Promise<IDocStore<T> | undefined> {
    const result = (await this.localBase.paginatedValues<IDocStore<T>>((doc) => {
      return ((doc.value as (IDocStore<T>)).data as { [key: string]: string })[idField] == value
    })).contents;
    if (result instanceof Array) {
      return result[0];
    }
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
      await this.deleteAllCb();
    }
    this.localBase.deleteAll();
  }
  getKeyOf(v: T): string {
    if (typeof v == 'object') {
      if (
        this.keyField &&
        Object.prototype.hasOwnProperty.call(v, this.keyField)
      ) {
        return (v as unknown as { [key: string]: string })[this.keyField];
      } else if (Object.prototype.hasOwnProperty.call(v, 'key')) {
        return (v as unknown as { key: string }).key;
      } else if (Object.prototype.hasOwnProperty.call(v, 'id')) {
        return (v as unknown as { id: string }).id;
      } else if (Object.prototype.hasOwnProperty.call(v, 'code')) {
        return (v as unknown as { code: string }).code;
      } else {
        return '';
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
      hash = (hash << 5) - hash + chr;
      hash = hash & hash;
    }
    return hash;
  }
}
