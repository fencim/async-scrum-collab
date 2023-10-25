<template>
  <router-view />
</template>

<script lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  PieChart,
  BarChart,
  ScatterChart,
  LineChart,
  EffectScatterChart,
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent,
  GeoComponent,
  GridComponent,
} from 'echarts/components';

import { useQuasar } from 'quasar';
import { defineComponent } from 'vue';
use([
  CanvasRenderer,
  GridComponent,
  BarChart,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent,
  GeoComponent,
  ScatterChart,
  EffectScatterChart,
]);

export default defineComponent({
  name: 'App',
  setup() {
    const $q = useQuasar();
    $q.dark.set(true);
  },
});
</script>
