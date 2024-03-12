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
import {
  EChartsOption,
  LineSeriesOption,
  TooltipComponentFormatterCallbackParams,
} from 'echarts';
import { date } from 'quasar';
import { IIteration, ILoggable, IProject } from 'src/entities';
import { entityKey } from 'src/entities/base.entity';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useTransactionLogsStore } from 'src/stores/transaction-log-store';
import { capitalize, computed, onMounted, ref } from 'vue';
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
    const cs = ceremonyStore.ceremonies
      .filter(
        (c) =>
          c.projectKey == props.project.key &&
          c.iterationKey == props.iteration.key &&
          date.getDateDiff(c.start, d, 'days') == 0
      )
      .map((c) => capitalize(c.type))
      .join(' ');
    return `[${cs}] ${date.formatDate(d, 'ddd')}`;
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
    title: {
      text: 'Sprint Activities',
    },
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
      formatter(series: TooltipComponentFormatterCallbackParams) {
        if (series instanceof Array) {
          const acts = (series[0] as unknown as { axisValue: string })
            .axisValue;
          return (
            `<div class="text-h6">Activities(${acts})</div>` +
            series
              .map((s) => ({
                profile: profileStore.profiles.find((p) => p.key == s.seriesId),
                data: s.data,
                index: s.dataIndex,
                type: s.dataType,
              }))
              .map(
                (data) =>
                  `<div class="row justify-between"><img src="${
                    data.profile?.avatar || ''
                  }" class="chart-avatar q-mx-sm"/> ${
                    data.profile?.name || ''
                  } <div class="q-space"></div><span class="text-bold q-mx-sm">${
                    data.data
                  }</span></div>`
              )
              .join('')
          );
        }
        return 'No Info';
      },
    },
    series: [
      ...new Set([...props.project.members, ...props.project.moderators]),
    ].map((m) => {
      const user = profileStore.profiles.find((p) => p.key == m);
      return {
        type: 'line',
        id: m,
        name: user?.name || m,
        label: user?.name || m,
        data: profileActivities(m),
      } as LineSeriesOption;
    }),
  };
});
</script>
<style lang="css">
.chart-avatar {
  vertical-align: middle;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
</style>
