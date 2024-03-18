<template>
  <router-view />
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { defineComponent } from 'vue';
import { use } from 'echarts/core';
import 'v-calendar/dist/style.css';
import '@uivjs/vue-markdown-preview/markdown.css';
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
    if (
      ($q.platform.is.android ||
        $q.platform.is.ios ||
        typeof Notification != 'undefined') &&
      !['granted', 'denied'].includes(Notification.permission)
    ) {
      Notification.requestPermission();
    }
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', (e) => {
        console.log('Message from  Worker', e.data);
      });
    }
  },
  async mounted() {
    await import('src/workflows');
  },
});

export default app;
</script>
