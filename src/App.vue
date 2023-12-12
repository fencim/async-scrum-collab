<template>
  <router-view />
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { defineComponent } from 'vue';
import { use } from 'echarts/core';
import 'v-calendar/style.css';
import './workflows';
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

const app = defineComponent({
  name: 'App',
  setup() {
    const $q = useQuasar();
    $q.dark.set(true);
  },
});

export default app;
</script>
