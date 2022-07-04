<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-form @submit="submitCeremony">
      <q-card>
        <q-toolbar>
          <q-avatar>
            <img src="icons/favicon-128x128.png" />
          </q-avatar>

          <q-toolbar-title
            ><span class="text-weight-bold">{{
              $route.params.ceremony ? 'Edit' : 'New'
            }}</span>
            Ceremony of {{ activeProject?.name }}</q-toolbar-title
          >

          <q-btn flat round dense icon="close" :to="`/${activeProjectKey}/`" />
        </q-toolbar>

        <q-card-section class="row">
          <q-select
            :readonly="!!$route.params.ceremony"
            class="col-10"
            emit-value
            map-options
            v-model="theCeremony.type"
            :options="[
              { v: 'planning', t: 'Planning' },
              { v: 'review', t: 'Review' },
              { v: 'retro', t: 'Retrospective' },
              { v: 'scrum', t: 'Daily Scrum' },
            ]"
            option-value="v"
            option-label="t"
          />
          <div class="col-2 text-h4 text-center">
            {{
              ceremonies.filter(
                (c) => c.type == theCeremony.type && c.key !== theCeremony.key
              ).length
            }}
          </div>
          <q-input class="col-6" filled v-model="theCeremony.start">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="theCeremony.start" mask="YYYY-MM-DD HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy>
                  <q-time
                    v-model="theCeremony.start"
                    mask="YYYY-MM-DD HH:mm"
                    format24h
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input class="col-6" filled readonly v-model="theCeremony.end" />
          <q-separator />
          <q-slider
            v-model="duration"
            :label-value="duration + ' hours'"
            label-always
            :min="0"
            :step="0.5"
            :max="24 - new Date(theCeremony.start).getHours()"
            @change="
              theCeremony.end = date.formatDate(
                date.addToDate(theCeremony.start, { hours: duration }),
                'hh:mm A'
              )
            "
          />
          <q-select
            class="col-12"
            emit-value
            label="Discussion Items"
            map-options
            multiple
            v-model="theCeremony.discussions"
            :options="discussions"
            :option-label="describeDiscussion"
            option-value="key"
          />
        </q-card-section>

        <q-card-actions :align="'right'">
          <q-btn icon="save" :loading="saving" type="submit">Save</q-btn>
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { date } from 'quasar';
import { DiscussionItem, ICeremony, IIteration, IProject } from 'src/entities';
import { useCeremonyStore } from 'src/stores/cermonies.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';

const projectStore = useProjectStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();

export default defineComponent({
  name: 'CeremonyPage',
  components: {},
  data() {
    return {
      date: date,
      discuss: discussionStore,
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
      activeProjectKey: 'AA1',
      activeProject: undefined as IProject | undefined,
      activeIterationKey: '',
      activeIteration: undefined as IIteration | undefined,
      ceremonies: [] as ICeremony[],
      discussions: [] as DiscussionItem[],
      theCeremony: {} as ICeremony,
      icon: undefined as File | undefined,
      scheduleCeremonies: true,
      saving: false,
      duration: 12,
    };
  },
  async mounted() {
    this.activeProjectKey =
      (this.$route.params.project && String(this.$route.params.project)) || '';
    this.activeProject = await projectStore.withKey(this.activeProjectKey);

    this.activeIterationKey =
      (this.$route.params.iteration && String(this.$route.params.iteration)) ||
      '';
    this.activeIteration = await iterationStore.withKey(
      this.activeProjectKey,
      this.activeIterationKey
    );
    this.ceremonies = await ceremonyStore.ofIteration(
      this.activeProjectKey,
      this.activeIterationKey
    );
    this.discussions = await discussionStore.ofProject(this.activeProjectKey);
    const editing = this.$route.params.ceremony as string;
    if (editing) {
      this.theCeremony =
        (await ceremonyStore.withKey(
          this.activeProjectKey,
          this.activeIterationKey,
          editing
        )) || this.theCeremony;
      this.theCeremony.start = date.formatDate(
        this.theCeremony.start,
        'YYYY-MM-DD hh:mm A'
      );
      this.theCeremony.end = date.formatDate(
        this.theCeremony.end,
        'YYYY-MM-DD hh:mm A'
      );
      this.duration = date.getDateDiff(
        this.theCeremony.end,
        this.theCeremony.start,
        'hours'
      );
    } else {
      const now = new Date();
      this.theCeremony = {
        projectKey: this.activeProjectKey,
        key: '',
        discussions: [],
        start: date.formatDate(now),
        end: date.formatDate(now),
        iterationKey: this.activeIterationKey,
        type: 'scrum',
      };
    }
  },
  computed: {},
  methods: {
    describeDiscussion(item: DiscussionItem) {
      return discussionStore.describeDiscussion(item);
    },
    async submitCeremony() {
      this.saving = false;
      const start = new Date(this.theCeremony.start);
      const end = date.addToDate(start, {
        hour: this.duration,
      });
      const ceremonies = this.ceremonies.filter(
        (c) => c.type == this.theCeremony.type
      );
      this.theCeremony.end = date.formatDate(end);

      this.theCeremony.key =
        this.theCeremony.key ||
        this.activeProjectKey +
          this.activeIterationKey +
          this.theCeremony.type +
          ceremonies.length;
      await ceremonyStore.saveCeremony(this.theCeremony);
      this.$router.replace({
        name: 'ceremony',
        params: {
          project: this.activeProjectKey,
          iteration: this.activeIterationKey,
          ceremony: this.theCeremony.key,
        },
      });
    },
  },
});
</script>
<style></style>
