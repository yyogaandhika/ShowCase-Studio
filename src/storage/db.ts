import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { AgencyBrandKit, ProjectArchiveBundle, ProjectData } from '../types';

interface ShowcaseDB extends DBSchema {
  projects: {
    key: string;
    value: ProjectData;
    indexes: { 'by-updated': number };
  };
  assets: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      mimeType: string;
      name: string;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'showcase-studio-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<ShowcaseDB>> | null = null;

function getDB(): Promise<IDBPDatabase<ShowcaseDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ShowcaseDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('projects')) {
            const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
            projectStore.createIndex('by-updated', 'updatedAt');
          }
          if (!db.objectStoreNames.contains('assets')) {
            db.createObjectStore('assets', { keyPath: 'id' });
          }
        }
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings');
          }
        }
      },
    });
  }
  return dbPromise;
}

export async function saveProject(project: ProjectData): Promise<void> {
  const db = await getDB();
  const projectToSave = {
    ...project,
    status: project.status || 'draft',
    revisionHistory: project.revisionHistory || [],
    updatedAt: Date.now(),
  };

  // If assets have blobs, save them to the assets store
  if (project.primaryAsset?.blob) {
    await saveAssetBlob(
      project.primaryAsset.id,
      project.primaryAsset.blob,
      project.primaryAsset.type === 'video' ? 'video/mp4' : 'image/png',
      project.primaryAsset.name
    );
  }
  if (project.secondaryAsset?.blob) {
    await saveAssetBlob(
      project.secondaryAsset.id,
      project.secondaryAsset.blob,
      project.secondaryAsset.type === 'video' ? 'video/mp4' : 'image/png',
      project.secondaryAsset.name
    );
  }

  // Clone project without serializing large blobs directly inside the project record
  const cleanProject: ProjectData = {
    ...projectToSave,
    primaryAsset: project.primaryAsset
      ? { ...project.primaryAsset, blob: undefined }
      : null,
    secondaryAsset: project.secondaryAsset
      ? { ...project.secondaryAsset, blob: undefined }
      : null,
  };

  await db.put('projects', cleanProject);
}

export async function getProject(id: string): Promise<ProjectData | undefined> {
  const db = await getDB();
  const project = await db.get('projects', id);
  if (!project) return undefined;

  // Restore blobs if available
  if (project.primaryAsset) {
    const assetRecord = await getAssetBlob(project.primaryAsset.id);
    if (assetRecord) {
      project.primaryAsset.blob = assetRecord.blob;
      project.primaryAsset.url = URL.createObjectURL(assetRecord.blob);
    }
  }
  if (project.secondaryAsset) {
    const assetRecord = await getAssetBlob(project.secondaryAsset.id);
    if (assetRecord) {
      project.secondaryAsset.blob = assetRecord.blob;
      project.secondaryAsset.url = URL.createObjectURL(assetRecord.blob);
    }
  }

  return project;
}

export async function listProjects(): Promise<ProjectData[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('projects', 'by-updated');
  return all.reverse(); // newest first
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  const project = await db.get('projects', id);
  if (project) {
    if (project.primaryAsset) {
      await deleteAssetBlob(project.primaryAsset.id);
    }
    if (project.secondaryAsset) {
      await deleteAssetBlob(project.secondaryAsset.id);
    }
  }
  await db.delete('projects', id);
}

export async function saveAssetBlob(
  id: string,
  blob: Blob,
  mimeType: string,
  name: string
): Promise<void> {
  const db = await getDB();
  await db.put('assets', { id, blob, mimeType, name });
}

export async function getAssetBlob(id: string) {
  const db = await getDB();
  return db.get('assets', id);
}

export async function deleteAssetBlob(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('assets', id);
}

/**
 * Brand Kit Local Storage
 */
export async function saveBrandKit(kit: AgencyBrandKit): Promise<void> {
  const db = await getDB();
  await db.put('settings', kit, 'agency_brand_kit');
}

export async function getBrandKit(): Promise<AgencyBrandKit | undefined> {
  const db = await getDB();
  return db.get('settings', 'agency_brand_kit');
}

/**
 * Helper to convert Blob to Base64 data string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Helper to convert Base64 data string back to Blob
 */
function base64ToBlob(base64: string): Promise<Blob> {
  return fetch(base64).then((res) => res.blob());
}

/**
 * Exports complete project and assets as a standalone .showcase JSON file
 */
export async function exportProjectArchive(project: ProjectData): Promise<Blob> {
  let primaryAssetBase64: string | null = null;
  let secondaryAssetBase64: string | null = null;

  if (project.primaryAsset?.blob) {
    primaryAssetBase64 = await blobToBase64(project.primaryAsset.blob);
  } else if (project.primaryAsset?.id) {
    const rec = await getAssetBlob(project.primaryAsset.id);
    if (rec?.blob) {
      primaryAssetBase64 = await blobToBase64(rec.blob);
    }
  }

  if (project.secondaryAsset?.blob) {
    secondaryAssetBase64 = await blobToBase64(project.secondaryAsset.blob);
  } else if (project.secondaryAsset?.id) {
    const rec = await getAssetBlob(project.secondaryAsset.id);
    if (rec?.blob) {
      secondaryAssetBase64 = await blobToBase64(rec.blob);
    }
  }

  const bundle: ProjectArchiveBundle = {
    version: '1.0',
    exportedAt: Date.now(),
    project,
    primaryAssetBase64,
    secondaryAssetBase64,
  };

  const jsonStr = JSON.stringify(bundle, null, 2);
  return new Blob([jsonStr], { type: 'application/json' });
}

/**
 * Imports a .showcase bundle and restores it into IndexedDB
 */
export async function importProjectArchive(file: File): Promise<ProjectData> {
  const text = await file.text();
  const bundle = JSON.parse(text) as ProjectArchiveBundle;

  if (!bundle.project || !bundle.project.name) {
    throw new Error('Invalid .showcase bundle format');
  }

  const restoredProject: ProjectData = {
    ...bundle.project,
    id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: `${bundle.project.name} (Imported)`,
    updatedAt: Date.now(),
  };

  // Restore primary asset blob
  if (bundle.primaryAssetBase64 && restoredProject.primaryAsset) {
    const blob = await base64ToBlob(bundle.primaryAssetBase64);
    restoredProject.primaryAsset.blob = blob;
    restoredProject.primaryAsset.url = URL.createObjectURL(blob);
    await saveAssetBlob(
      restoredProject.primaryAsset.id,
      blob,
      restoredProject.primaryAsset.type === 'video' ? 'video/mp4' : 'image/png',
      restoredProject.primaryAsset.name
    );
  }

  // Restore secondary asset blob
  if (bundle.secondaryAssetBase64 && restoredProject.secondaryAsset) {
    const blob = await base64ToBlob(bundle.secondaryAssetBase64);
    restoredProject.secondaryAsset.blob = blob;
    restoredProject.secondaryAsset.url = URL.createObjectURL(blob);
    await saveAssetBlob(
      restoredProject.secondaryAsset.id,
      blob,
      restoredProject.secondaryAsset.type === 'video' ? 'video/mp4' : 'image/png',
      restoredProject.secondaryAsset.name
    );
  }

  await saveProject(restoredProject);
  return restoredProject;
}

/**
 * Duplicates an existing project with all its assets (Fase 11)
 */
export async function duplicateProject(
  sourceId: string,
  suffix = ' (Copy)'
): Promise<ProjectData> {
  const original = await getProject(sourceId);
  if (!original) {
    throw new Error('Project not found to duplicate');
  }

  const newId = `project-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const duplicated: ProjectData = {
    ...JSON.parse(JSON.stringify(original)),
    id: newId,
    name: `${original.name}${suffix}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'draft',
    revisionHistory: [],
  };

  // Duplicate primary asset blob if exists
  if (original.primaryAsset) {
    const assetRecord = await getAssetBlob(original.primaryAsset.id);
    if (assetRecord) {
      const newAssetId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await saveAssetBlob(newAssetId, assetRecord.blob, assetRecord.mimeType, assetRecord.name);
      duplicated.primaryAsset = {
        ...original.primaryAsset,
        id: newAssetId,
        blob: assetRecord.blob,
        url: URL.createObjectURL(assetRecord.blob),
      };
    }
  }

  // Duplicate secondary asset blob if exists
  if (original.secondaryAsset) {
    const assetRecord = await getAssetBlob(original.secondaryAsset.id);
    if (assetRecord) {
      const newAssetId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await saveAssetBlob(newAssetId, assetRecord.blob, assetRecord.mimeType, assetRecord.name);
      duplicated.secondaryAsset = {
        ...original.secondaryAsset,
        id: newAssetId,
        blob: assetRecord.blob,
        url: URL.createObjectURL(assetRecord.blob),
      };
    }
  }

  await saveProject(duplicated);
  return duplicated;
}
