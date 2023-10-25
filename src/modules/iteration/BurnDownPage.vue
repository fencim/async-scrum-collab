<script lang="ts" setup>
import { ref } from 'vue';
import { LineSeriesOption, EChartsOption } from 'echarts';
import VChart from 'vue-echarts';
const loading = ref(false);
const chartOptions = ref<EChartsOption>({
  title: {},
  xAxis: {
    type: 'category',
    data: [
      '1 Mon',
      '2 Tue',
      '3 Wed',
      '4 Thu',
      '5 Fri',
      'Sat',
      'Sun',
      '6 Mon',
      '7 Tue',
      '8 Wed',
      '9 Thu',
      '10 Fri',
    ],
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
      data: [100, 90, 80, 70, 60, 50, 50, 40, 30, 20, 10, 0],
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
