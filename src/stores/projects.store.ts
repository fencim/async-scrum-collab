import { defineStore } from 'pinia';
import { IProfile, IProject } from 'src/entities';
import { projectResource } from 'src/resources';
import { firebaseService } from 'src/resources/firebase.service';
import { useCeremonyStore } from './cermonies.store';
import { useDiscussionStore } from './discussions.store';
import { useIterationStore } from './iterations.store';
import { useProfilesStore } from './profiles.store';
interface IProjectState {
  projects: IProject[];
  activeProject?: IProject;
}
type MembershipType = 'pending' | 'admin' | 'moderator' | 'member' | 'guest';
export const useProjectStore = defineStore('projectStore', {
  state: () => ({
    projects: []
  } as IProjectState),
  getters: {
  },
  actions: {
    async init() {
      projectResource.streamWith().subscribe({
        next: (projects) => {
          this.projects = projects;
          if (this.activeProject) {
            this.selectProject(this.activeProject.key);
          }
        },
      })
      this.projects = (await projectResource.findAllFrom()) || [];
    },
    async selectProject(key: string) {
      if (key) {
        const project = this.projects.find(p => p.key == key) || await projectResource.findOne({ key });
        this.activeProject = project;
        if (project) {
          const profileStore = useProfilesStore();
          profileStore.selectProjectMembers([...project.admins, ...project.members, ...project.moderators]);
          const discussionStore = useDiscussionStore();
          discussionStore.ofProject(project.key);
          const iterationStore = useIterationStore();
          await iterationStore.ofProject(project.key);
          const ceremonyStore = useCeremonyStore();
          await ceremonyStore.ofIteration(project.key);

        }
        return project;
      } else {
        this.activeProject = undefined;
      }
    },
    async setProjectMember(project: IProject, profiles: IProfile[], tobe: MembershipType, from: MembershipType) {
      const getCollection = (membershipType: MembershipType) => {
        switch (membershipType) {
          case 'admin':
            return project.admins;
          case 'moderator':
            return project.moderators;
          case 'member':
            return project.members;
          case 'guest':
            return project.guests;
          case 'pending':
          default:
            return project.pending;
        }
      }
      const source = getCollection(from);
      const destination = getCollection(tobe);
      profiles.forEach(profile => {
        const sourceIndex = source.findIndex(p => profile.key == p);
        if (sourceIndex >= 0) {
          source.splice(sourceIndex, 1);
          destination.push(profile.key);
        }
      })
      await this.saveProject(project);
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
        project.pending = (project.pending || []).concat([memberKey]);
        projectResource.setData(projectKey, {
          ...project,
          pending: [...project.pending]
        });
      }
      return project;
    }
  }
});
