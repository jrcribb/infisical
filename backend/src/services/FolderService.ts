import { nanoid } from "nanoid";
import { TFolderSchema } from "../models/folder";

type TAppendFolderDTO = {
  folderName: string;
  parentFolderId?: string;
};

type TRenameFolderDTO = {
  folderName: string;
  folderId: string;
};

export const validateFolderName = (folderName: string) => {
  const validNameRegex = /^[a-zA-Z0-9-_]+$/;
  return validNameRegex.test(folderName);
};

export const generateFolderId = (): string => nanoid(12);

// simple bfs search
export const searchByFolderId = (
  root: TFolderSchema,
  folderId: string
): TFolderSchema | undefined => {
  const queue = [root];
  while (queue.length) {
    const folder = queue.pop() as TFolderSchema;
    if (folder.id === folderId) {
      return folder;
    }
    queue.push(...folder.children);
  }
};

export const folderBfsTraversal = async (
  root: TFolderSchema,
  callback: (data: TFolderSchema) => void | Promise<void>
) => {
  const queue = [root];
  while (queue.length) {
    const folder = queue.pop() as TFolderSchema;
    await callback(folder);
    queue.push(...folder.children);
  }
};

// bfs and then append to the folder
const appendChild = (folders: TFolderSchema, folderName: string) => {
  const folder = folders.children.find(({ name }) => name === folderName);
  if (folder) {
    throw new Error("Folder already exists");
  }
  const id = generateFolderId();
  folders.version += 1;
  folders.children.push({
    id,
    name: folderName,
    children: [],
    version: 1,
  });
  return { id, name: folderName };
};

// root of append child wrapper
export const appendFolder = (
  folders: TFolderSchema,
  { folderName, parentFolderId }: TAppendFolderDTO
) => {
  const isRoot = !parentFolderId;

  if (isRoot) {
    return appendChild(folders, folderName);
  }
  const folder = searchByFolderId(folders, parentFolderId);
  if (!folder) {
    throw new Error("Parent Folder not found");
  }
  return appendChild(folder, folderName);
};

export const renameFolder = (
  folders: TFolderSchema,
  { folderName, folderId }: TRenameFolderDTO
) => {
  const folder = searchByFolderId(folders, folderId);
  if (!folder) {
    throw new Error("Folder doesn't exist");
  }

  folder.name = folderName;
};

// bfs but stops on parent folder
// Then unmount the required child and then return both
export const deleteFolderById = (folders: TFolderSchema, folderId: string) => {
  const queue = [folders];
  while (queue.length) {
    const folder = queue.pop() as TFolderSchema;
    const index = folder.children.findIndex(({ id }) => folderId === id);
    if (index !== -1) {
      const deletedFolder = folder.children.splice(index, 1);
      return { deletedNode: deletedFolder[0], parent: folder };
    }
    queue.push(...folder.children);
  }
};

// bfs but return parent of the folderID
export const getParentFromFolderId = (
  folders: TFolderSchema,
  folderId: string
) => {
  const queue = [folders];
  while (queue.length) {
    const folder = queue.pop() as TFolderSchema;
    const index = folder.children.findIndex(({ id }) => folderId === id);
    if (index !== -1) return folder;

    queue.push(...folder.children);
  }
};

// to get all folders ids from everything from below nodes
export const getAllFolderIds = (folders: TFolderSchema) => {
  const folderIds: Array<{ id: string; name: string }> = [];
  const queue = [folders];
  while (queue.length) {
    const folder = queue.pop() as TFolderSchema;
    folderIds.push({ id: folder.id, name: folder.name });
    queue.push(...folder.children);
  }
  return folderIds;
};

// To get the path of a folder from the root. Used for breadcrumbs
// LOGIC: We do dfs instead if bfs
// Each time we go down we record the current node
// We then record the number of childs of each root node
// When we reach leaf node or when all childs of a root node are visited
// We remove it from path recorded by using the total child record
export const searchByFolderIdWithDir = (
  folders: TFolderSchema,
  folderId: string
) => {
  const stack = [folders];
  const dir: Array<{ id: string; name: string }> = [];
  const hits: Record<string, number> = {};

  while (stack.length) {
    const folder = stack.shift() as TFolderSchema;
    // score the hit
    hits[folder.id] = folder.children.length;
    const parent = dir[dir.length - 1];
    if (parent) hits[parent.id] -= 1;

    if (folder.id === folderId) {
      dir.push({ name: folder.name, id: folder.id });
      return { folder, dir };
    }

    if (folder.children.length) {
      dir.push({ name: folder.name, id: folder.id });
      stack.unshift(...folder.children);
    } else {
      if (!hits[parent.id]) {
        dir.pop();
      }
    }
  }
  return;
};

// to get folder of a path given
// Like /frontend/folder#1
export const getFolderByPath = (folders: TFolderSchema, searchPath: string) => {
  // corner case when its just / return root
  if (searchPath === "/") {
    return folders.id === "root" ? folders : undefined;
  }

  const path = searchPath.split("/").filter(Boolean);
  const queue = [folders];
  let segment: TFolderSchema | undefined;
  while (queue.length && path.length) {
    const folder = queue.pop();
    const segmentPath = path.shift();
    segment = folder?.children.find(({ name }) => name === segmentPath);
    if (!segment) return;

    queue.push(segment);
  }
  return segment;
};
