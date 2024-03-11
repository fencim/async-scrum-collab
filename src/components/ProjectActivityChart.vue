<template>
  <VChart
    class="col-12"
    :option="chartOptions"
    autoresize
    :style="{ height: '500px' }"
    :loading="loading"
  >
  </VChart>
</template>
<script lang="ts" setup>
import { EChartsOption, LineSeriesOption } from 'echarts';
import { date } from 'quasar';
import { IIteration, ILoggable, IProject } from 'src/entities';
import { entityKey } from 'src/entities/base.entity';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useTransactionLogsStore } from 'src/stores/transaction-log-store';
import { computed, onMounted, ref } from 'vue';
import VChart from 'vue-echarts';
const profileStore = useProfilesStore();
const ceremonyStore = useCeremonyStore();
const logStore = useTransactionLogsStore();
const logs = ref<ILoggable[]>([]);
const props = defineProps<{
  project: IProject;
  iteration: IIteration;
}>();
const loading = ref(false);
const workDays: Date[] = [];
const start = new Date(props.iteration.start);
const end = new Date(props.iteration.end);
const cursor = new Date(start);
workDays.splice(0, workDays.length);
while (date.getDateDiff(end, cursor, 'days') >= 0) {
  workDays.push(new Date(cursor));
  cursor.setDate(cursor.getDate() + 1);
}
onMounted(() => {
  loading.value = true;

  logStore
    .streamTransactionsOn(
      props.project.key,
      props.iteration.start,
      props.iteration.end
    )
    .subscribe({
      next: (records) => {
        logs.value = records;
        loading.value = false;
      },
    });
});

const xAxis = (() => {
  return workDays.map((d) => {
    return date.formatDate(d, 'ddd');
  });
})();
function profileActivities(profileKey: string) {
  return workDays.map((d) => {
    return (
      logs.value.filter(
        (l) =>
          date.getDateDiff(d, l.date, 'days') == 0 &&
          entityKey(l.operator) == profileKey
      ).length || 0
    );
  });
}
const chartOptions = computed<EChartsOption>(() => {
  return {
    title: {},
    legend: {},
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          name: props.project.name + '-sprint-activity' || 'sprint-activity',
          backgroundColor: 'transparent',
        },
      },
    },
    xAxis: {
      type: 'category',
      data: xAxis,
    },
    yAxis: {
      type: 'value',
    },
    tooltip: {
      trigger: 'axis',
    },
    series: props.project.members.map((m) => {
      const user = profileStore.profiles.find((p) => p.key == m);
      return {
        type: 'line',
        name: user?.name || m,
        label: user?.name || m,
        data: profileActivities(m),
      } as LineSeriesOption;
    }),
  };
});
</script>
