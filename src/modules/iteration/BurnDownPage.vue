<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { LineSeriesOption, EChartsOption } from 'echarts';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import VChart from 'vue-echarts';
import { useIterationStore } from 'src/stores/iterations.store';
import { date } from 'quasar';
import { useRoute } from 'vue-router';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { DiscussionItem, ICeremony, IProfile } from 'src/entities';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { formatKey } from 'src/components/discussion.helper';
import { useActiveStore } from 'src/stores/active.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { entityKey } from 'src/entities/base.entity';
import draggable from 'vuedraggable';
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { TheWorkflows } from 'src/workflows/the-workflows';
const route = useRoute();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const profileStore = useProfilesStore();
const activeStore = useActiveStore();
defineProps<{
  preview?: boolean;
}>();
onMounted(async () => {
  const project = activeStore.activeProject;
  if (project) {
    discussionStore.ofProject(project.key);
  }
});
const keywords = ref<null | FilterOption[]>(null);
type FilterOption = {
  type: 'Assignee' | 'Type';
  value: string;
  display: string;
};

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
const planning = ref(
  ceremonyStore.ceremonies.find(
    (c) => c.iterationKey == iteration?.key && c.type == 'planning'
  )
);
const today = computed(() => date.formatDate(new Date(), 'YYYY/MM/DD'));
const discussions = computed(() => {
  return (
    (iteration &&
      discussionStore.fromIteration(iteration.projectKey, iteration.key)) ||
    []
  ).filter((task) => {
    if (!keywords.value || keywords.value.length == 0) return true;
    return keywords.value.find(
      (f) =>
        (f.type == 'Type' && task.type == f.value) ||
        (f.type == 'Assignee' &&
          typeof task.assignees == 'object' &&
          task.assignees.find((a) => entityKey(a) == f.value))
    );
  });
});
const filterOptions = computed(() => {
  return discussions.value.reduce((p, c) => {
    const isAssigneesObj =
      Array.isArray(c.assignees) && typeof c.assignees[0] == 'object';
    const assigneees = isAssigneesObj
      ? (c.assignees as IProfile[])
      : (profileStore.fromKeys((c.assignees as string[]) || []) as IProfile[]);
    assigneees?.forEach((assignee) => {
      if (
        typeof assigneees == 'object' &&
        !p.find((o) => o.type == 'Assignee' && o.value == assignee.key)
      ) {
        p.push({
          type: 'Assignee',
          value: assignee.key,
          display: assignee.name,
        });
      }
    });
    if (c.type && !p.find((o) => o.type == 'Type' && o.value == c.type)) {
      p.push({
        type: 'Type',
        value: c.type,
        display: c.type.replace(/^\w/, (m) => m.toUpperCase()),
      });
    }
    return p;
  }, [] as FilterOption[]);
});
const mappedDiscussions = computed(() => {
  return discussions.value.filter((d) => d.dueDate /* && d.assignedTo */);
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
  });
})();
const totalPoints = computed(() => {
  return mappedDiscussions.value.reduce((p, c) => (c.complexity || 0) + p, 0);
});
const planned = computed(() => {
  let remainingPts = totalPoints.value;
  return workDays.map((workday) => {
    const tasks = mappedDiscussions.value.filter(
      (d) => d.dueDate && date.getDateDiff(workday, d.dueDate, 'days') == 0
    );
    const subTotalPts = tasks.reduce((p, c) => (c.complexity || 0) + p, 0);
    remainingPts -= subTotalPts;
    return Math.round(remainingPts);
  });
});
const ideal = computed(() => {
  let remainingPts = totalPoints.value;
  const idealDailyBurn = totalPoints.value / daysCount;
  return workDays.map((d) => {
    const standUpMeeting = dailyScrums.find(
      (c) => date.getDateDiff(d, c.start, 'days') == 0
    );
    if (standUpMeeting) {
      remainingPts -= idealDailyBurn;
    }
    const burn = remainingPts;
    return burn;
  });
});
const totalCompleted = ref(0);
const unplannedTasks = computed(() => {
  return mappedDiscussions.value
    .filter(
      (t) =>
        t.datePlanned &&
        planning.value &&
        date.getDateDiff(planning.value?.end, t.datePlanned, 'days') < 0
    )
    .reduce((p, c) => {
      const plannedDate = date.formatDate(c.datePlanned!, 'YYYY/MM/DD');
      const exist = p[plannedDate] || [];
      exist.push(c);
      p[plannedDate] = exist;
      return p;
    }, {} as { [date: string]: DiscussionItem[] });
});
const actual = computed(() => {
  let remainingPts = totalPoints.value;
  const now = new Date();
  return workDays
    .map((workday) => {
      if (date.getDateDiff(workday, now, 'days') > 0) {
        return undefined;
      }
      const completedTasks = discussions.value.filter(
        (d) => d.doneDate && date.getDateDiff(workday, d.doneDate, 'days') == 0
      );
      const subTotalPts = completedTasks.reduce(
        (p, c) => (c.complexity || 0) + p,
        0
      );
      totalCompleted.value += subTotalPts;
      remainingPts -= subTotalPts;
      const unplanned =
        unplannedTasks.value[date.formatDate(workday, 'YYYY/MM/DD')];
      if (unplanned?.length) {
        remainingPts += unplanned.reduce((p, c) => (c.complexity || 0) + p, 0);
      }
      return Math.round(remainingPts);
    })
    .filter((d) => typeof d !== 'undefined');
});
const unplanned = computed(() => {
  let unPlanned = 0;
  return workDays.map((workday) => {
    const unplanned =
      unplannedTasks.value[date.formatDate(workday, 'YYYY/MM/DD')];
    if (unplanned?.length) {
      unPlanned += unplanned.reduce((p, c) => (c.complexity || 0) + p, 0);
    }
    return Math.round(unPlanned);
  });
});
const plannedTasks = computed(() => {
  return discussions.value
    .filter(
      (t) =>
        planning.value &&
        (!t.datePlanned ||
          date.getDateDiff(planning.value?.end, t.datePlanned, 'days') >= 0)
    )
    .reduce((p, c) => {
      const dueDate =
        (c.dueDate && date.formatDate(c.dueDate, 'YYYY/MM/DD')) || 'unmapped';
      const exist = p[dueDate] || [];
      exist.push(c);
      p[dueDate] = exist;
      return p;
    }, {} as { [date: string]: DiscussionItem[] });
});
const completedTasks = computed(() => {
  return mappedDiscussions.value
    .filter((t) => t.doneDate)
    .reduce((p, c) => {
      const dueDate = date.formatDate(c.doneDate!, 'YYYY/MM/DD');
      const exist = p[dueDate] || [];
      exist.push(c);
      p[dueDate] = exist;
      return p;
    }, {} as { [date: string]: DiscussionItem[] });
});

function plannedPtsOnDay(d: Date) {
  const tasks = plannedTasks.value[date.formatDate(d, 'YYYY/MM/DD')] || [];
  return tasks.reduce((p, c) => (c.complexity || 0) + p, 0);
}

const chartOptions = computed<EChartsOption>(() => {
  return {
    title: {},
    legend: {},
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          name: iteration?.name + '-burn-down' || 'burn-down',
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
    series: [
      {
        type: 'line',
        name: 'Ideal',
        label: 'Ideal',
        data: ideal.value,
      } as LineSeriesOption,
      {
        type: 'line',
        name: 'Planned',
        label: 'Planned',
        data: planned.value,
      } as LineSeriesOption,
      {
        type: 'line',
        name: 'UnPlanned',
        label: 'Un-Planned',
        data: unplanned.value,
      } as LineSeriesOption,
      {
        type: 'line',
        name: 'Actual',
        label: 'Actual',
        data: actual.value,
      } as LineSeriesOption,
    ],
  };
});
async function moveDue(
  d: Date,
  change: {
    added?: { newIndex: number; element: DiscussionItem };
    removed: { oldIndex: number; element: DiscussionItem };
    moved: { newIndex: number; oldIndex: number; element: DiscussionItem };
  }
) {
  if (change.added) {
    const issue = { ...change.added.element } as DiscussionItem;
    return updateDueDate(date.formatDate(d, 'YYYY/MM/DD'), issue);
  }
}
function updateDueDate(d: string, task: DiscussionItem) {
  return TheWorkflows.emitPromised({
    type: 'updateDiscussionFields',
    arg: {
      payload: {
        ...task,
        dueDate: d,
      },
    },
  });
}
function describeDiscussion(item: DiscussionItem | string): string {
  const discussionStore = useDiscussionStore();
  if (typeof item == 'object') {
    return (
      '[' +
      formatKey(item.key) +
      '] ' +
      discussionStore.describeDiscussion(item)
    );
  } else {
    const disc = discussionStore.discussions.find((d) => d.key == item);
    return (disc && describeDiscussion(disc)) || 'Unknown Roadblock';
  }
}
</script>
<template>
  <div class="row">
    <q-select
      class="q-pa-sm col-12"
      dense
      filled
      v-model="keywords"
      use-input
      use-chips
      hide-dropdown-icon
      multiple
      :options="filterOptions"
      input-debounce="0"
    >
      <template #selected-item="{ opt, removeAtIndex, index }">
        <q-chip
          v-if="keywords"
          dense
          removable
          text-color="primary"
          class="q-my-none q-ml-xs q-mr-none"
          @remove="removeAtIndex(index)"
        >
          {{ opt.type }} : {{ opt.display }}
        </q-chip>
        <q-badge v-else>*none*</q-badge>
      </template>
      <template #option="{ opt, itemProps }">
        <q-item v-bind="itemProps">
          <q-item-section>
            <q-item-label caption>{{ opt.type }}</q-item-label>
            <q-item-label>{{ opt.display }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <VChart
      class="col-12"
      :option="chartOptions"
      autoresize
      :style="{ height: '500px' }"
      :loading="loading"
    />
  </div>
  <div class="row q-px-xl" v-if="!preview && $q.screen.gt.sm">
    <div
      class="col row q-px-xs"
      v-for="workday in ['unmapped', ...workDays]"
      :key="typeof workday == 'string' ? workday : workday.getTime()"
    >
      <draggable
        class="col kanban-task-list dragArea list-group"
        :list="
          plannedTasks[
            typeof workday != 'string'
              ? date.formatDate(workday, 'YYYY/MM/DD')
              : 'unmapped'
          ] || []
        "
        group="tasks"
        item-key="key"
        @change="(e) => typeof workday != 'string' && moveDue(workday, e)"
      >
        <template #header>
          <q-chip
            class="text-center full-width"
            v-if="typeof workday != 'string'"
            >{{ date.formatDate(workday, 'MMM DD') }} ({{
              plannedPtsOnDay(workday)
            }})
          </q-chip>
          <q-chip v-else> Un-mapped</q-chip>
        </template>
        <template #item="{ element }">
          <q-chip
            :color="
          (element.doneDate && date.getDateDiff(element.dueDate!, element.doneDate, 'days') >= 0) ||
          (!element.doneDate && date.getDateDiff(element.dueDate!, today, 'days') >= 0)
            ? 'secondary'
            : 'negative'
        "
            class="full-width"
            dense
          >
            <span
              @click="TheDialogs.emit({ type: 'viewTask', arg: element })"
              class="cursor-pointer"
              >{{ formatKey(element.key) }}
              <q-tooltip>{{ describeDiscussion(element) }}</q-tooltip>
            </span>
            <q-space />
            <recent-active-members
              sizes="xs"
              v-if="element.assignedTo"
              :profiles="[element.assignedTo]"
            />
            <q-btn-dropdown
              v-else
              round
              content-class="no-shadow"
              no-icon-animation
              dropdown-icon="person"
              size="xs"
              dense
            >
              <RecentActiveMembers
                sizes="xs"
                v-close-popup
                :max-count="15"
                :profiles="activeStore.activeMembers"
                @click-profile="
                  (p) =>
                    TheWorkflows.emit({
                      type: 'assignTask',
                      arg: {
                        issue: element,
                        profile: p,
                      },
                    })
                "
              />
            </q-btn-dropdown>
            {{ element.complexity }}</q-chip
          >
        </template>
      </draggable>
    </div>
  </div>

  <div class="row q-px-xl" v-if="!preview && $q.screen.gt.sm">
    <div class="col-12 text-title">
      Actual
      <q-separator />
    </div>
    <div
      class="col row q-px-xs"
      v-for="workday in workDays"
      :key="workday.getTime()"
    >
      <q-chip
        v-for="task in completedTasks[date.formatDate(workday, 'YYYY/MM/DD')]"
        :key="task.key"
        dense
        :color="!task.dueDate || date.getDateDiff(task.dueDate!, task.doneDate!, 'days') >=0 ? 'primary': 'negative'"
        class="col-12 self-start"
        clickable
        @click="TheDialogs.emit({ type: 'viewTask', arg: task })"
        >{{ formatKey(task.key) }}<q-space />{{ task.complexity }}
        <q-tooltip>{{ describeDiscussion(task) }}</q-tooltip>
      </q-chip>
    </div>
  </div>
</template>
