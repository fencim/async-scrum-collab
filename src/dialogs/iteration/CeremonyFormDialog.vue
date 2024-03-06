<template>
  <q-dialog v-model="showItemTopSheet" :position="'top'">
    <q-card>
      <q-form @submit="submitCeremony" v-if="theCeremony">
        <q-toolbar>
          <q-avatar>
            <img src="/icons/favicon-128x128.png" />
          </q-avatar>
          <q-toolbar-title
            ><span class="text-weight-bold">Edit {{ theCeremony.type }}</span>
            Ceremony</q-toolbar-title
          >
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="row">
          <q-input label="Start" filled v-model="range.from">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="range.from" mask="YYYY/MM/DD hh:mm A">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Set" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time
                    v-model="range.from"
                    mask="YYYY/MM/DD hh:mm A"
                    format24h
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Set" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input label="End" filled v-model="range.to">
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time v-model="range.to" mask="hh:mm A">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Set" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions :align="'right'">
          <q-btn icon="save" :loading="saving" type="submit">Save</q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { date, useQuasar } from 'quasar';
import { ICeremony } from 'src/entities';
import { ref } from 'vue';
import { TheDialogs } from '../the-dialogs';
import { TheWorkflows } from 'src/workflows/the-workflows';

const showItemTopSheet = ref(false);

const theCeremony = ref<ICeremony>();
const saving = ref(false);
const range = ref<{ from?: string; to?: string }>({
  from: '',
  to: '',
});
const $q = useQuasar();

async function submitCeremony() {
  if (!theCeremony.value) return;
  saving.value = true;
  theCeremony.value.start = date.formatDate(
    range.value.from,
    'YYYY/MM/DD HH:mm'
  );
  const targetDate = new Date(theCeremony.value.start);
  theCeremony.value.end = date.formatDate(range.value.to, 'YYYY/MM/DD HH:mm');
  const time = new Date(theCeremony.value.end);
  targetDate.setHours(time.getHours(), time.getMinutes(), 0);
  theCeremony.value.end = date.formatDate(targetDate, 'YYYY/MM/DD HH:mm');
  TheWorkflows.emit({
    type: 'updateCeremony',
    arg: {
      ceremony: theCeremony.value,
      done() {
        saving.value = false;
        showItemTopSheet.value = false;
      },
      error(err) {
        saving.value = false;
        $q.notify({
          message: String(err),
          color: 'negative',
          icon: 'error',
        });
      },
    },
  });
}

TheDialogs.on({
  type: 'editCeremony',
  async cb(e) {
    theCeremony.value = { ...e.ceremony };
    range.value.from = date.formatDate(
      theCeremony.value.start,
      'YYYY/MM/DD hh:mm A'
    );
    range.value.to = date.formatDate(theCeremony.value.end, 'hh:mm A');
    showItemTopSheet.value = true;
  },
});
</script>
<style></style>
