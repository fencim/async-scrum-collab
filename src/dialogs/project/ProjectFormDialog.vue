<template>
  <q-dialog v-model="showTopSheet" :position="'top'">
    <q-card
      :style="$q.screen.gt.xs ? { 'min-width': $q.screen.sizes.sm + 'px' } : ''"
    >
      <q-form @submit="submitProject">
        <q-toolbar>
          <q-avatar>
            <img src="/icons/favicon-128x128.png" />
          </q-avatar>
          <q-toolbar-title
            ><span class="text-weight-bold">{{
              formPreFields.project ? 'Edit' : 'New'
            }}</span>
            Project</q-toolbar-title
          >

          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
          <q-input
            v-model="projectValidation"
            type="password"
            v-if="!formPreFields.project"
            :label="'Security Code:'"
            :disable="saving"
            :rules="[(v) => valid == v || 'Wrong Secret Code']"
          />
          <q-input
            v-model="theProject.key"
            :readonly="!!formPreFields.project"
            label="Key"
            maxlength="4"
            mask="XXXX"
            :disable="saving"
            :rules="[
              (v) => (v && /^[0-9A-Z]{4}$/i.test(v)) || '4 digit project code',
              (v) =>
                (v &&
                  (formPreFields.project ||
                    !projectStore.projects.find(
                      (p) => !$route.params.project && p.key == v
                    ))) ||
                v + ' project key is not available',
            ]"
          />
          <q-input
            v-model="theProject.name"
            label="Name"
            :disable="saving"
            :rules="[(v) => (v && v.length > 0) || 'Enter Project Name']"
          />
          <q-input
            v-model="theProject.description"
            label="Description"
            filled
            :disable="saving"
            type="textarea"
          />

          <q-file
            v-if="!icon"
            v-model="icon"
            filled
            accept=".jpg, image/*"
            :multiple="false"
            use-chips
            label="Select logo"
          />
          <div v-else class="col-4">
            <span>Icon</span>
            <the-image-cropper :file="[icon]" @cropImage="cropImage" />
          </div>

          <q-select
            class="col-12"
            emit-value
            label="Members"
            map-options
            multiple
            :disable="saving"
            v-model="theProject.members"
            :options="profileStore.profiles"
            :option-label="'name'"
            option-value="key"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn type="submit" :loading="saving">Save</q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { date, useQuasar } from 'quasar';
import TheImageCropper from 'src/components/TheImageCropper.vue';
import { IProject } from 'src/entities';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { TheDialogs } from '../the-dialogs';
import { TheWorkflows } from 'src/workflows/the-workflows';

const projectStore = useProjectStore();
const profileStore = useProfilesStore();
const showTopSheet = ref(false);
const formPreFields = ref({
  project: undefined as IProject | undefined,
});
const theProject = ref<IProject>({
  key: '',
  name: '',
  members: [],
  pending: [],
  admins: [],
  moderators: [],
  guests: [],
});
const icon = ref<File | undefined>();
const croppedImg = ref<File | undefined>();
const cropImg = ref('');
const saving = ref(false);
const doneCb = ref<undefined | ((p: IProject) => void)>();
const $router = useRouter();
const $q = useQuasar();
const today = new Date();
const valid =
  String(today.getFullYear() + today.getMonth()) +
  date.formatDate(today, 'dd')[0];
const projectValidation = ref('');

onMounted(async () => {
  await profileStore.init();
});

async function submitProject() {
  try {
    saving.value = true;
    if (
      profileStore.theUser &&
      (!theProject.value.admins || !theProject.value.admins.length)
    ) {
      theProject.value.admins = [profileStore.theUser.key];
    }
    if (formPreFields.value.project) {
      TheWorkflows.emit({
        type: 'updateProject',
        arg: {
          project: theProject.value as IProject,
          icon: croppedImg.value || icon.value,
          done(project) {
            if (doneCb.value) {
              doneCb.value(project);
            } else {
              $router.replace({
                name: 'projectHome',
                params: {
                  project: theProject.value?.key,
                },
              });
            }
          },
        },
      });
    } else {
      TheWorkflows.emit({
        type: 'createProject',
        arg: {
          project: theProject.value as IProject,
          icon: croppedImg.value || icon.value,
          done(project) {
            if (doneCb.value) {
              doneCb.value(project);
            } else {
              $router.replace({
                name: 'projectHome',
                params: {
                  project: theProject.value?.key,
                },
              });
            }
          },
        },
      });
    }
  } catch (e) {
    $q.notify({
      message: String((e as { code: string }).code || e),
      position: 'top',
      color: 'negative',
    });
  }
}
function cropImage(img: string) {
  cropImg.value = img;
  if (cropImg.value) {
    croppedImg.value = dataURLtoFile(cropImg.value, icon.value?.name || '');
  }
}
function dataURLtoFile(dataUrl: string, fileName: string) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
}
TheDialogs.on({
  type: 'newProject',
  cb(e) {
    formPreFields.value.project = undefined;
    doneCb.value = e.done;
    showTopSheet.value = true;
  },
});
TheDialogs.on({
  type: 'editProject',
  cb(e) {
    formPreFields.value.project = e.project;
    doneCb.value = e.done;
    theProject.value = { ...e.project };
    showTopSheet.value = true;
  },
});
</script>
<style></style>
