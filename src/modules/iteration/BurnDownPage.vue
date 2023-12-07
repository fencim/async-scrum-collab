<script lang="ts" setup>
import { ref } from 'vue';
import { LineSeriesOption, EChartsOption } from 'echarts';
import VChart from 'vue-echarts';
import { useIterationStore } from 'src/stores/iterations.store';
import { date } from 'quasar';
import { useRoute } from 'vue-router';
import { useCeremonyStore } from 'src/stores/cermonies.store';
import { ICeremony } from 'src/entities';
const route = useRoute();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();
const iteration =
  iterationStore.activeIteration ||
  iterationStore.iterations.find((i) => i.key == route.params?.iteration);
const dailyScrums = (
  ceremonyStore.ceremonies.filter(
    (c) => c.iterationKey == iteration?.key && c.type == 'scrum'
  ) as ICeremony[]
).sort((a, b) => {
  return date.getDateDiff(a.start, b.start, 'days');
});
const loading = ref(false);
const startDate = iteration && date.formatDate(iteration.start, 'YYYY/MM/DD');
const endDate = iteration && date.formatDate(iteration.end, 'YYYY/MM/DD');

const daysCount = dailyScrums.length;

let workDays = dailyScrums.map(
  (c) => new Date(date.formatDate(c.start, 'YYYY/MM/DD'))
);
//const fill days
let cursorDate = startDate && new Date(startDate);
while (
  endDate &&
  cursorDate &&
  date.getDateDiff(cursorDate, endDate, 'days') <= 0
) {
  const existing = workDays.find(
    (w) => date.getDateDiff(cursorDate!, w, 'days') == 0
  );
  if (!existing) {
    workDays.push(new Date(cursorDate));
  }
  cursorDate.setDate(cursorDate.getDate() + 1);
}
workDays = workDays.sort((a, b) => {
  return date.getDateDiff(a, b, 'days');
});
const xAxis = (() => {
  let counter = 0;
  return workDays.map((d) => {
    const standUpMeeting = dailyScrums.find(
      (c) => date.getDateDiff(d, c.start, 'days') == 0
    );
    if (standUpMeeting) {
      counter++;
      return counter + date.formatDate(d, ' (ddd)');
    } else {
      return date.formatDate(d, 'ddd');
    }
    2;
  });
})();
const chartOptions = ref<EChartsOption>({
  title: {},
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
  legend: {},
  series: [
    {
      type: 'line',
      name: 'Ideal',
      label: 'Ideal',
      data: (() => {
        const totalPoints = 100;
        let remainingPts = totalPoints;
        const idealDailyBurn = totalPoints / daysCount;
        return workDays.map((d, i) => {
          const standUpMeeting = dailyScrums.find(
            (c) => date.getDateDiff(d, c.start, 'days') == 0
          );
          if (standUpMeeting) {
            remainingPts -= idealDailyBurn;
          }
          const burn = Math.round(remainingPts);
          return burn;
        });
      })(),
    } as LineSeriesOption,
    {
      type: 'line',
      name: 'Planned',
      label: 'Planned',
      data: [100, 88, 80, 66, 60, 55, 0],
    } as LineSeriesOption,
    {
      type: 'line',
      name: 'Actual',
      label: 'Actual',
      data: [100, 78],
    } as LineSeriesOption,
  ],
});
</script>
<template>
  <div>
    <VChart
      class="col-6"
      :option="chartOptions"
      autoresize
      :style="{ height: '500px' }"
      :loading="loading"
    />
  </div>
</template>
