import resourcesData from '../data/resources.json';
import { Resource } from '../types';

const STORAGE_KEY = 'tutorsphere_resources';

function getResources(): Resource[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { /* fall through */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resourcesData));
  return resourcesData as Resource[];
}

function saveResources(resources: Resource[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
}

export const resourceService = {
  getAllResources(): Resource[] {
    return getResources();
  },

  getResourcesBySubject(subject: string): Resource[] {
    return getResources().filter(r => r.subject.toLowerCase() === subject.toLowerCase());
  },

  addResource(resource: Resource): Resource {
    const resources = getResources();
    resources.push(resource);
    saveResources(resources);
    return resource;
  },

  deleteResource(resourceId: string): void {
    const resources = getResources().filter(r => r.id !== resourceId);
    saveResources(resources);
  },

  searchResources(query: string): Resource[] {
    const q = query.toLowerCase();
    return getResources().filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  },
};
