import { defineStore } from 'pinia';
import { IProfile, IProject, IBoardColumn } from 'src/entities';
import { projectResource } from 'src/resources';
import { firebaseService } from 'src/services/firebase.service';
import { useCeremonyStore } from './ceremonies.store';
import { useDiscussionStore } from './discussions.store';
import { useIterationStore } from './iterations.store';
import { useActiveStore } from './active.store';
import { DeferredPromise } from 'src/resources/localbase';
import { useOnlineUsersStore } from './online-users.store';


interface IProjectState {
  projects: IProject[];
  activeProject?: IProject;
}
type MembershipType = 'pending' | 'admins' | 'moderators' | 'members' | 'guests';
export const useProjectStore = defineStore('projectStore', {
  state: () => ({
    projects: []
  } as IProjectState),
  getters: {

  },
  actions: {
    async init() {
      const filters: Partial<IProject> | undefined =
      {
        status: 'active'
      };
      projectResource.streamWith(filters).subscribe({
        next: async (projects) => {
          this.projects = projects;
          if (this.activeProject) {
            const activeProject = await this.selectProject(this.activeProject.key);
            activeProject && await useActiveStore().selectProject(activeProject);
          }
        },
      })
      this.projects = (await projectResource.findAllFrom(filters)) || [];
    },
    async selectProject(key: string) {
      if (this.activeProject?.key == key) return this.activeProject;
      if (key) {
        const project = this.projects.find(p => p.key == key) || await projectResource.findOne({ key });
        this.activeProject = project;
        if (project) {
          const discussionStore = useDiscussionStore();
          discussionStore.ofProject(project.key);
          const iterationStore = useIterationStore();
          await iterationStore.ofProject(project.key);
          const ceremonyStore = useCeremonyStore();
          await ceremonyStore.ofProject(project.key);
          project.boardColumns = project.boardColumns || [];
          const onlineUsersStore = useOnlineUsersStore();
          onlineUsersStore.init(project.key);
        }
        return project;
      } else {
        this.activeProject = undefined;
      }
    },
    async setProjectMember(project: IProject, profiles: IProfile[], toBe: MembershipType, from: MembershipType) {
      const theProject = (await projectResource.findOne({ key: project.key })) || project;
      const getCollection = (membershipType: MembershipType) => {
        switch (membershipType) {
          case 'admins':
            return theProject.admins;
          case 'moderators':
            return theProject.moderators;
          case 'members':
            return theProject.members;
          case 'guests':
            return theProject.guests;
          case 'pending':
          default:
            return theProject.pending;
        }
      }
      const source = getCollection(from);
      const destination = getCollection(toBe);
      profiles.forEach(profile => {
        const sourceIndex = source.findIndex(p => profile.key == p);
        if (sourceIndex >= 0) {
          if (from !== 'admins') {
            source.splice(sourceIndex, 1);
          }
          destination.push(profile.key);
        }
      })
      const doc = await projectResource.updatePropertiesFrom(theProject.key, {
        [toBe]: [...(new Set(destination))],
        [from]: [...(new Set(source))]
      }, [toBe, from], (() => {
        //
      })
      );
      return doc?.data;
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
      newProject.status = 'active';
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
      const project = await this.selectProject(projectKey);
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
    },
    async joinProject(projectKey: string, memberKey: string) {
      const project = await this.selectProject(projectKey);
      if (!project) {
        throw 'Project does not exits';
      }
      if (!project.pending?.find(m => m == memberKey) && !project.members?.find(m => m == memberKey)) {
        await projectResource.updatePropertiesFrom(project.key, {
          pending: (project.pending || []).concat([memberKey])
        }, ['pending']);

      }
      return project;
    },
    async updateSettings<P extends (keyof IProject)>(projectKey: string,
      setting: P, value: IProject[P]) {
      const project = await this.selectProject(projectKey);
      if (!project) {
        throw 'Project does not exits';
      }
      const deffered = new DeferredPromise<IProject | undefined>();
      await projectResource.updateProperty(projectKey, setting, value, async (info) => {
        if (info.status == 'synced') {
          this.activeProject = await projectResource.getLocalData(info.newKey || info.key || projectKey);
          deffered.resolve(await projectResource.getLocalData(projectKey));
        }
      });
      return deffered.promise;
    },
    async saveProjectColumns(projectKey: string, cols: IBoardColumn[]) {
      const project = await this.selectProject(projectKey);
      if (!project) {
        throw 'Project does not exits';
      }
      const deffered = new DeferredPromise<void>();
      await projectResource.updateProperty(projectKey, 'boardColumns', [...cols], async (info) => {
        if (info.status == 'synced') {
          this.activeProject = await projectResource.getLocalData(info.newKey || info.key || projectKey);
          deffered.resolve();
        }
      });
      await deffered.promise;
    }
  }
});
