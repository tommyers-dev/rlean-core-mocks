import { ApiAdapter } from "@rlean/core";
import { EntityDefineOptions } from "@rlean/core/types/types";
type InferedEntityType<Definition, Fallback> = Definition extends EntityDefineOptions<infer DefinitionContent> ? DefinitionContent extends Array<infer EntityType> ? () => Partial<EntityType>[] : () => DefinitionContent : Fallback;
declare const setCustomEntityReturn: <T>(path: string, method: string, callback: InferedEntityType<T, Function>) => void;
declare const setCustomEntityReturnStatus: (path: string, method: string, status: number) => void;
declare const MockedAxiosAdapter: <S>(pathJsonStored: S) => ApiAdapter;
export { MockedAxiosAdapter, setCustomEntityReturnStatus, setCustomEntityReturn, };
