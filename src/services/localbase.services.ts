import { KeyValueStorage } from './localbase';
import { FilterPart, Filters, Pagination } from './localbase/state-db.controller';

const dbVersion = undefined;

const localDb = {
  profile: new KeyValueStorage('asc-profiles', dbVersion),
  project: new KeyValueStorage('asc-projects', dbVersion),
  iteration: new KeyValueStorage('asc-iterations', dbVersion),
  ceremony: new KeyValueStorage('asc-cermony', dbVersion),
  discussion: new KeyValueStorage('asc-discussion', dbVersion),
  convo: new KeyValueStorage('asc-convo', dbVersion),
  media: new KeyValueStorage('asc-media', dbVersion),
  session: new KeyValueStorage('asc-session', dbVersion)
};

type LocalDb = typeof localDb;
type KeysOfLocalDb = keyof LocalDb;
type IBaseModel = {
  key: string;
} | object;
interface IStoreModel<T extends IBaseModel> {
  status: 'saved' | 'sent' | 'updated' | 'deleted';
  key: string;
  data: T
}
export type SaveCallBack<T extends IBaseModel> = (data: T) => Promise<void | boolean> | void;
export abstract class LocalBaseService<T extends IBaseModel> {
  constructor(private entity: KeysOfLocalDb) { }
  private async manageDocCallback(doc: IStoreModel<T>) {
    if (doc.status !== 'sent') {
      let status: void | boolean = false;
      if (doc.status == 'saved' && this.saveCb) {
        status = await this.saveCb(doc.data);
      } else if (doc.status == 'updated' && this.updateCb) {
        status = await this.updateCb(doc.data);
      }
      if (status === true) {
        await this.setDataStatus(doc.key, 'sent');
      }
    }
  }
  saveCb?: SaveCallBack<T>;
  deleteCb?: SaveCallBack<T>;
  deleteAllCb?: () => Promise<void>;
  getAllCb?: (filters?: Filters) => Promise<T[]>;
  updateCb?: SaveCallBack<T>;
  async findAllFrom(filters?: Filters): Promise<T[]> {
    const result: IStoreModel<T>[] = await this.findAllDocFrom(filters);
    const mapper = (doc: IStoreModel<T>) => {
      this.manageDocCallback(doc);
      return doc.data;
    };
    return result.map(mapper) as T[];
  }
  async findAllDocFrom(filters?: Filters): Promise<IStoreModel<T>[]> {
    let result: IStoreModel<T>[] = [];
    let onlineResult: T[] = [];
    if (this.getAllCb) {
      try {
        onlineResult = await this.getAllCb(filters);
        if (onlineResult) {
          result = (await localDb[this.entity].values<IStoreModel<T>>());
          const intersection = result.filter(i => {
            const match = onlineResult.find(o => this.getKeyOf(o) == i.key);
            if (match) {
              i.data = match;
              return true;
            }
            return false;
          });
          const added = onlineResult.filter(o => !intersection.find(i => i.key == this.getKeyOf(o)));
          const deleted = result.filter(i => !intersection.find(o => o.key == i.key));
          //delete from local the deleted
          await Promise.all(deleted.map((i) => {
            return localDb[this.entity].deleteItem(i.key);
          }));
          //update intersection
          result = (await Promise.all(intersection.map(async (i) => {
            if (i.status == 'sent') {
              return localDb[this.entity].setItem(i.key, i);
            } else {
              return i;
            }
          }))).concat(
            await Promise.all(added.map((i) => {
              const key = this.getKeyOf(i);
              return localDb[this.entity].setItem(key, {
                data: i,
                key,
                status: 'sent'
              } as IStoreModel<T>);
            })));

        }
      } catch {
        result = (await localDb[this.entity].values<IStoreModel<T>>());
      }
    }


    if (filters && result && typeof filters !== 'function') {
      return result.filter((row) =>
        Object.keys(filters).reduce((prev: boolean, cur) => {
          return prev && (row.data as unknown as FilterPart)[cur] == filters[cur];
        }, true)
      );
    }
    return result;

  }

  async findAll(filters?: Filters, page?: Pagination<T>): Promise<Pagination<T>> {
    const mapper = (doc: IStoreModel<T>) => {
      this.manageDocCallback(doc);
      return doc.data;
    };
    const pageanated = (await localDb[this.entity].paginatedValues<IStoreModel<T>>(filters, page));
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
  async saveEachTo(entity: KeysOfLocalDb, values: T[]) {
    while (values.length) {
      const v = values.splice(0, 1)[0];
      v && await this.setData(this.getKeyOf(v),
        v
      );
    }
  }
  async setData(key: string, value: T): Promise<T> {
    const existing = await this.getDoc(key);
    if (existing && existing.status == 'sent') {
      existing.status = 'updated';
      existing.data = value;
      await localDb[this.entity].setItem(key, existing as IStoreModel<T>);
      this.manageDocCallback(existing);
      return existing.data;
    } else {
      const doc = await localDb[this.entity].setItem(key, {
        data: value,
        key: key,
        status: 'saved'
      } as IStoreModel<T>);
      return doc.data;
    }
  }
  async getDoc(key: string) {
    return await localDb[this.entity].getItem<IStoreModel<T>>(key);
  }
  async getDocStatus(key: string) {
    return (await this.getDoc(key)).status;
  }
  async setDataStatus(key: string, status: 'saved' | 'sent' = 'sent') {
    const doc = await this.getDoc(key);
    const oldStatus = doc.status;
    doc.status = status;
    await localDb[this.entity].setItem(key, doc);
    return oldStatus;
  }
  async getData(key: string): Promise<T | undefined> {
    const doc = await localDb[this.entity].getItem<IStoreModel<T>>(key);
    this.manageDocCallback(doc);
    return doc.data;
  }

  async count() {
    return localDb[this.entity].length();
  }

  async deleteData(key: string) {
    const doc = await this.getDoc(key);
    if (doc.status != 'saved' && this.deleteCb) {
      doc.status = 'deleted';
      await this.deleteCb(doc.data);
    }
    await localDb[this.entity].deleteItem(key);
    return doc.data;
  }

  async deleteAll() {
    if (this.deleteAllCb) {
      await this.deleteAllCb()
    }
    localDb[this.entity].deleteAll();
  }
  private getKeyOf(v: T): string {
    if (typeof v == 'object') {
      if (Object.prototype.hasOwnProperty.call(v, 'id')) {
        return (v as unknown as { id: string }).id;
      } else if (Object.prototype.hasOwnProperty.call(v, 'key')) {
        return (v as unknown as { key: string }).key;
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
