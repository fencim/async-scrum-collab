<template>
  <div v-if="isCurrent">
    <svg
      width="73px"
      height="88px"
      viewBox="0 0 73 88"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <g id="hourglass">
        <path
          d="M63.8761664,86 C63.9491436,84.74063 64,83.4707791 64,82.1818182 C64,65.2090455 57.5148507,50.6237818 48.20041,44 C57.5148507,37.3762182 64,22.7909545 64,5.81818182 C64,4.52922091 63.9491436,3.25937 63.8761664,2 L10.1238336,2 C10.0508564,3.25937 10,4.52922091 10,5.81818182 C10,22.7909545 16.4851493,37.3762182 25.79959,44 C16.4851493,50.6237818 10,65.2090455 10,82.1818182 C10,83.4707791 10.0508564,84.74063 10.1238336,86 L63.8761664,86 Z"
          id="glass"
          fill="#ECF1F6"
        ></path>
        <rect
          id="top-plate"
          fill="#4D4544"
          x="0"
          y="0"
          width="74"
          height="8"
          rx="2"
        ></rect>
        <rect
          id="bottom-plate"
          fill="#4D4544"
          x="0"
          y="80"
          width="74"
          height="8"
          rx="2"
        ></rect>

        <g id="top-sand" transform="translate(18, 21)">
          <clipPath id="top-clip-path" fill="white">
            <rect x="0" y="0" width="38" height="21"></rect>
          </clipPath>

          <path
            fill="#00000"
            clip-path="url(#top-clip-path)"
            d="M38,0 C36.218769,7.51704545 24.818769,21 19,21 C13.418769,21 1.9,7.63636364 0,0 L38,0 Z"
          ></path>
        </g>

        <g id="bottom-sand" transform="translate(18, 55)">
          <clipPath id="bottom-clip-path" fill="white">
            <rect x="0" y="0" width="38" height="21"></rect>
          </clipPath>

          <g clip-path="url(#bottom-clip-path)">
            <path
              fill="#00000"
              d="M0,21 L38,21 C36.1,13.3636364 24.581231,0 19,0 C13.181231,0 1.781231,13.4829545 0,21 Z"
            ></path>
          </g>
        </g>
      </g>
    </svg>
    <div class="text-overline">{{ status }}</div>
  </div>
  <div v-else>
    <q-icon name="history_toggle_off" size="sm">
      <q-tooltip>{{ status }}</q-tooltip>
    </q-icon>
  </div>
</template>

<script lang="ts">
import { date } from 'quasar';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'HourGlass',
  props: {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      date,
    };
  },
  computed: {
    isCurrent() {
      const start = new Date(date.formatDate(this.start));
      const end = new Date(date.formatDate(this.end));
      return date.isBetweenDates(new Date(), start, end);
    },
    status() {
      const start = new Date(date.formatDate(this.start));
      const end = new Date(date.formatDate(this.end));
      const now = new Date();
      if (!this.isCurrent) {
        if (now < start) {
          return 'in ' + date.getDateDiff(start, now, 'days') + ' days';
        } else if (now > end) {
          const days = date.getDateDiff(now, end, 'days');
          return days == 1 ? 'yesterday' : days + ' days past';
        }
      }
      return date.getDateDiff(end, now, 'hours') + ' hr ';
    },
  },
});
</script>

<style scoped>
div {
  text-align: center;
}

@keyframes top-clip {
  0% {
  }
  50% {
    transform: translateY(21px);
  }
  100% {
    transform: translateY(21px);
  }
}

@keyframes bottom-sand-path {
  0% {
  }
  50% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes bottom-sand-g {
  0% {
  }
  85% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-9px);
  }
}

@keyframes hourglass-rotation {
  50% {
    transform: rotateZ(0);
  }
  100% {
    transform: rotateZ(180deg);
  }
}

#top-sand #top-clip-path rect,
#bottom-sand path,
#bottom-sand g,
svg {
  animation-duration: 5s;
  animation-delay: 1s;
  animation-iteration-count: infinite;
  width: 35px;
  margin-bottom: -20px;
}

#top-sand #top-clip-path rect {
  animation-name: top-clip;
}

#bottom-sand path {
  transform: translateY(21px);
  animation-name: bottom-sand-path;
}

#bottom-sand g {
  animation-name: bottom-sand-g;
}

svg {
  animation-name: hourglass-rotation;
}
</style>
