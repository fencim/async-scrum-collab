import { defineStore } from 'pinia';
import { IProject } from 'src/entities';
import { projectResource } from 'src/resources';
import { firebaseService } from 'src/resources/firebase.service';

export const useProjectStore = defineStore('projectStore', {
  state: () => ({
    projects: [] as IProject[]
  }),
  getters: {
  },
  actions: {
    async init() {
      this.projects = (await projectResource.findAllFrom()) || [];
    },
    async withKey(key: string) {
      if (key) {
        return this.projects.find(p => p.key == key) || projectResource.findOne({ key });
      }
    },
    async saveProject(newProject: IProject, icon?: File) {
      const iconURL = await (new Promise<string | undefined>((resolve) => {
        if (icon) {
          resolve(firebaseService.uploadImage(icon, {
            path: 'project-' + newProject.key
          }))
        } else {
          resolve(undefined);
        }
      }))
      newProject.icon = iconURL || newProject.icon;
      newProject.members = newProject.members || [];
      await projectResource.setData(newProject.key, {
        ...newProject,
        members: [...newProject.members]
      });
      const index = this.projects.findIndex(p => p.key == newProject.key);
      if (index < 0) {
        this.projects.push(newProject);
      } else {
        this.projects.splice(index, 1, newProject);
      }
      return newProject;
    },
    async addMember(projectKey: string, memberKey: string) {
      const project = await this.withKey(projectKey);
      if (!project) {
        throw 'Project does not exits';
      }
      if (!project.members?.find(m => m == memberKey)) {
        project.members = (project.members || []).concat([memberKey]);
        projectResource.setData(projectKey, {
          ...project,
          members: [...project.members]
        });
      }
      return project;
    }
  }
});
