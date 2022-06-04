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
    media: new KeyValueStorage('asc-media', dbVersion)
};

type LocalDb = typeof localDb;
type KeysOfLocalDb = keyof LocalDb;
interface IBaseModel {
    key: string;
}
interface IStoreModel<T extends IBaseModel> {
    status: 'saved' | 'sent' | 'updated' | 'deleted';
    data: T
}
type SaveCallBack<T extends IBaseModel> = (data: T) => Promise<void>;
export abstract class LocalBaseService<T extends IBaseModel> {
    constructor(private entity: KeysOfLocalDb) { }
    private async manageDocCallback(doc: IStoreModel<T>) {
        if (doc.status !== 'sent') {
            if (doc.status == 'saved' && this.saveCb) {
                await this.saveCb(doc.data);
            } else if (doc.status == 'updated' && this.updateCb) {
                await this.updateCb(doc.data);
            }
        }
    }
    saveCb?: SaveCallBack<T>;
    deleteCb?: SaveCallBack<T>;
    deleteAllCb?: () => Promise<void>;
    updateCb?: SaveCallBack<T>;
    async findAllFrom(filters?: Filters): Promise<T[]> {
        const result = await localDb[this.entity].values<IStoreModel<T>>();
        const mapper = (doc: IStoreModel<T>) => {
            this.manageDocCallback(doc);
            return doc.data;
        };
        if (filters && result && typeof filters !== 'function') {
            return result.filter((row) =>
                Object.keys(filters).reduce((prev: boolean, cur) => {
                    return prev && (row.data as unknown as FilterPart)[cur] == filters[cur];
                }, true)
            ).map(mapper);
        }
        return result.map(mapper) as T[];
    }
    async findAllDocFrom(filters?: Filters): Promise<IStoreModel<T>[]> {
        const result = await localDb[this.entity].values<IStoreModel<T>>();
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
                    this.setData(v.key, v);
            })
        );
    }
    async saveEachTo(entity: KeysOfLocalDb, values: T[]) {
        while (values.length) {
            const v = values.splice(0, 1)[0];
            v && await this.setData(v.key,
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
}
