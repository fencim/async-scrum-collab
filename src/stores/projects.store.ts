import { defineStore } from 'pinia';
import { IProject } from 'src/entities';
import { projectResource } from 'src/resources';

export const useProjectStore = defineStore('projectStore', {
  state: () => ({
    projects: [] as IProject[]
  }),
  getters: {
  },
  actions: {
    async init() {
      this.projects = (await projectResource.findAll()).contents || [];
    },
    async withKey(key: string) {
      if (key) {
        return this.projects.find(p => p.key == key) || projectResource.findOne({ key });
      }
    },
    async saveProject(newProject: IProject, icon?: File) {
      return new Promise<IProject>((resolve, reject) => {
        const reader = new FileReader();
        const save = async () => {
          newProject.icon = reader.result as string || newProject.icon;
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
          resolve(newProject);
        };
        reader.addEventListener('load', save)
        reader.addEventListener('error', reject);
        if (icon) {
          reader.readAsDataURL(icon);
        } else {
          save();
        }
      })
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
