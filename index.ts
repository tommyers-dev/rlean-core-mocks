import { ApiAdapter } from "@rlean/core";
import {
  AdapterAPIPayload,
  EntityDefineOptions,
} from "@rlean/core/types/types";
import { AxiosResponse } from "axios";

const log = (text: any) => {
  if (process.env.TESTING_LOG === "true") {
    console.log(text);
  }
};

const entitiesCustomReturnObject: {
  [key: string]: { [method: string]: any[] };
} = {};

const entitiesCustomReturnStatusObject: {
  [key: string]: { [method: string]: number[] };
} = {};

type InferedEntityType<Definition, Fallback> =
  Definition extends EntityDefineOptions<infer DefinitionContent>
    ? DefinitionContent extends Array<infer EntityType>
      ? () => Partial<EntityType>[]
      : () => DefinitionContent
    : Fallback;

const setCustomEntityResponse = <T>(
  path: string,
  method: string,
  cbOrStatus: InferedEntityType<T, Function> | number
) => {
  let testingStoreObject: any = entitiesCustomReturnStatusObject;
  let testingResult = cbOrStatus;

  if (typeof cbOrStatus === "function") {
    testingStoreObject = entitiesCustomReturnObject;
    testingResult = cbOrStatus();
  }

  if (testingStoreObject[path]) {
    if (testingStoreObject[path][method]) {
      testingStoreObject[path][method].push(testingResult);
    } else {
      testingStoreObject[path][method] = [testingResult];
    }
  } else {
    testingStoreObject[path] = {};
    testingStoreObject[path][method] = [testingResult];
  }
};

const getCustomEntityResponse = (
  type: "data" | "status",
  key: string,
  method: string
) => {
  let testingObject: any = entitiesCustomReturnStatusObject;
  if (type === "data") {
    testingObject = entitiesCustomReturnObject;
  }

  if (testingObject[key]) {
    if (testingObject[key][method]) {
      return testingObject[key][method].shift();
    }
  }
  return null;
};

const setCustomEntityReturn = <T>(
  path: string,
  method: string,
  callback: InferedEntityType<T, Function>
) => {
  setCustomEntityResponse<T>(path, method, callback);
};

const getCustomEntityReturn = (key: string, method: string) => {
  return getCustomEntityResponse("data", key, method);
};

const setCustomEntityReturnStatus = (
  path: string,
  method: string,
  status: number
) => {
  setCustomEntityResponse(path, method, status);
};

const getCustomEntityReturnStatus = (key: string, method: string) => {
  return getCustomEntityResponse("status", key, method);
};

class AxiosErrorMock {
  response: {
    status: number;
    data: any;
    headers: any;
  };
  constructor(response: any) {
    this.response = { ...response };
  }
}

const MockedAxiosAdapter = <S>(pathJsonStored: S): ApiAdapter => {
  return {
    get: async <R, T>(apiPayload: AdapterAPIPayload<T>) => {
      const url = apiPayload.url;

      const urlKey = Object.keys(pathJsonStored).find((key) =>
        url.includes(key)
      );

      if (!urlKey) {
        throw new Error(`No path found for ${url}`);
      }

      let resData = getCustomEntityReturn(urlKey, "get");

      if (!resData) {
        resData = (pathJsonStored[urlKey].get as R) || {};
      }

      const status = getCustomEntityReturnStatus(urlKey, "get") || 200;
      log({ url, urlKey, status });

      if (status > 200) {
        throw new AxiosErrorMock({ status });
      }

      return { data: resData, status } as AxiosResponse<R>;
    },
    post: async <R, T>(apiPayload: AdapterAPIPayload<T>) => {
      const { url, data } = apiPayload;

      const urlKey = Object.keys(pathJsonStored).find((key) =>
        url.includes(key)
      );

      if (!urlKey) {
        throw new Error(`No path found for ${url}`);
      }

      let resData = getCustomEntityReturn(urlKey, "post");
      if (!resData) {
        resData = (pathJsonStored[urlKey].post as R) || {};
      }

      const status = getCustomEntityReturnStatus(urlKey, "post") || 200;
      log({ url, urlKey, status });

      if (status > 200) {
        throw new AxiosErrorMock({ status });
      }

      return { data: resData, status } as AxiosResponse<R>;
    },
    put: async <R, T>(apiPayload: AdapterAPIPayload<T>) => {
      const { url, data } = apiPayload;

      const urlKey = Object.keys(pathJsonStored).find((key) =>
        url.includes(key)
      );

      if (!urlKey) {
        throw new Error(`No path found for ${url}`);
      }

      let resData = getCustomEntityReturn(urlKey, "put");
      if (!resData) {
        resData = (pathJsonStored[urlKey].put as R) || {};
      }

      const status = getCustomEntityReturnStatus(urlKey, "put") || 200;
      log({ url, urlKey, status });

      if (status > 200) {
        throw new AxiosErrorMock({ status });
      }

      return { data: resData, status } as AxiosResponse<R>;
    },
    del: async <R, T>(apiPayload: AdapterAPIPayload<T>) => {
      const { url, data } = apiPayload;

      const urlKey = Object.keys(pathJsonStored).find((key) =>
        url.includes(key)
      );

      if (!urlKey) {
        throw new Error(`No path found for ${url}`);
      }

      let resData = getCustomEntityReturn(urlKey, "del");
      if (!resData) {
        resData = (pathJsonStored[urlKey].del as R) || {};
      }

      const status = getCustomEntityReturnStatus(urlKey, "del") || 200;
      log({ url, urlKey, status });

      if (status > 200) {
        throw new AxiosErrorMock({ status });
      }

      return { status: status } as AxiosResponse<R>;
    },
    patch: jest.fn(),
  };
};

export {
  MockedAxiosAdapter,
  setCustomEntityReturnStatus,
  setCustomEntityReturn,
};
