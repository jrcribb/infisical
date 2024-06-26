import { TKeyStoreFactory } from "@app/keystore/keystore";

export const mockKeyStore = (): TKeyStoreFactory => {
  const store: Record<string, string | number | Buffer> = {};

  return {
    setItem: async (key, value) => {
      store[key] = value;
      return "OK";
    },
    setItemWithExpiry: async (key, value) => {
      store[key] = value;
      return "OK";
    },
    deleteItem: async (key) => {
      delete store[key];
      return 1;
    },
    getItem: async (key) => {
      const value = store[key];
      if (typeof value === "string") {
        return value;
      }
      return null;
    },
    incrementBy: async () => {
      return 1;
    },
    acquireLock: () => {
      throw new Error("Not implemented");
    }
  };
};
