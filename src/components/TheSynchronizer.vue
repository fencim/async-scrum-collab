<template>
  <q-btn
    v-if="byModule && byModule.length > 0"
    data-cy="onViewSync"
    color="beige"
    icon="sync"
    :dense="$q.screen.lt.md"
    flat
    round
  >
    <q-badge
      v-if="synchingTotal || synchingTotalError"
      :color="!synchingTotalError ? 'primary' : 'negative'"
      rounded
      floating
      >{{ synchingTotalError || synchingTotal }}
      <q-tooltip>
        {{
          !synchingTotalError
            ? `${'Synching'} ${synchingTotal}`
            : `${synchingTotalError} ${'Errors'}`
        }}
      </q-tooltip>
    </q-badge>
    <q-menu
      class="text-grey-9 q-pb-sm"
      transition-show="scale"
      transition-hide="scale"
      :offset="[-10, 20]"
      style="width: 500px"
    >
      <div v-if="byModule && byModule.length > 0">
        <div class="q-pr-sm q-pt-sm text-right">
          <q-icon name="show_chart" size="sm" />
        </div>
        <div
          v-for="(syncModule, index) in byModule"
          :key="index"
          class="row items-center justify-between"
        >
          <div class="q-pl-md col-12 text-capitalize text-h6 text-weight-bold">
            {{ syncModule.module }}
          </div>
          <div
            v-for="(resource, idx) in syncModule.resources"
            :key="idx"
            class="q-pl-xl q-pt-sm col-12 row items-center"
          >
            <div class="col">
              <div class="col-12 row items-center justify-between">
                <span>{{ resource.entity }}</span>
                <div class="col-2 text-caption text-right">
                  {{ syncPercent(resource.synched, resource.total) }}%
                </div>
              </div>
              <div class="q-my-xs col-12">
                <q-linear-progress
                  rounded
                  :value="syncProgress(resource.synched, resource.total)"
                  :buffer="syncBuffer(resource.error, resource.total)"
                />
              </div>
              <div
                class="col-12 text-caption"
                v-if="resource.synched != resource.total"
              >
                {{ resource.synched }} of {{ resource.total }}
                {{ 'transaction not synced' }}
              </div>
              <div class="col-12 text-caption" v-else>
                {{ 'all synched' }} ({{ resource.synched }})
              </div>
            </div>
            <div class="col-2 text-center">
              <q-btn
                @click="
                  synchronizerStore.retrySynching({
                    module: resource.module,
                    entity: resource.entity,
                  })
                "
                color="grey-9"
                icon="sync"
                dense
                flat
                round
              >
                <q-badge
                  v-if="resource.error"
                  :color="'negative'"
                  rounded
                  floating
                  >{{ resource.error }}
                  <q-tooltip>
                    {{ `${resource.error} ${'Errors'}` }}
                  </q-tooltip>
                </q-badge>
              </q-btn>
            </div>
          </div>
          <div v-if="byModule.length != index + 1" class="col-12 q-my-sm">
            <q-separator color="grey-6" />
          </div>
        </div>
      </div>
      <div v-else class="q-pa-md text-primary">
        {{ 'All data are synced!' }}
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  ISyncByModule,
  useSynchronizerStore,
} from 'src/stores/synchronizer.store';
import resourceSynchronizer from 'src/workers/synchronizer/resource.synchronizer';
import { useQuasar } from 'quasar';
const $q = useQuasar();
const synchronizerStore = useSynchronizerStore();

const byModule = computed(() => {
  return synchronizerStore.byModule;
});
const synchingTotal = computed(() => {
  return synchronizerStore.synchingTotal;
});
const synchingTotalError = computed(() => {
  return synchronizerStore.synchingTotalError;
});
resourceSynchronizer.subscribe((info) => {
  const timeout = 3000;
  if (info.entity == 'online') return;
  if (info.status == 'synced') {
    switch (info.fromStatus) {
      case undefined:
      case 'error':
      case 'saved':
        $q.notify({
          type: 'positive',
          icon: 'add_task',
          caption: info.entity,
          message: 'Successfuly created',
          position: 'bottom-left',
          timeout,
        });
        break;
      case 'patched':
      case 'updated':
        $q.notify({
          type: 'positive',
          icon: 'check_circle_outline',
          caption: info.entity,
          message: 'Successfully updated',
          position: 'bottom-left',
          timeout,
        });
        break;
      case 'deleted':
        $q.notify({
          type: 'positive',
          icon: 'delete_outline',
          caption: info.entity,
          position: 'bottom-left',
          message: 'Successfully deleted',
          timeout,
        });
        break;
    }
  } else if (info.status == 'error') {
    $q.notify({
      type: 'negative',
      icon: 'error',
      message: info.entity + ':' + info.fromStatus,
      caption: info.status,
      position: 'bottom-left',
      timeout,
    });
  }
});

function syncPercent(sycned: number, total: number) {
  return !sycned && !total ? 100 : ((sycned / total) * 100).toFixed(0);
}

function syncProgress(sycned: number, total: number) {
  return sycned / total;
}

function syncBuffer(sycned: number, total: number) {
  return !sycned && !total ? 0.0 : sycned / (total + 0.01);
}
</script>

<style></style>
