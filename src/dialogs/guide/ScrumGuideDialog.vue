<script lang="ts" setup>
import MarkdownPreview from '@uivjs/vue-markdown-preview';
import { computed, ref } from 'vue';

import { TheDialogs } from '../the-dialogs';
import { GuideItem, guideTree } from './guide-tree';

const keyword = ref('');
const filtered = computed(() => {
  return filterNodes(guideTree, '');
});
const selectedKey = ref(filtered.value[0].key);
const showGuideSheet = ref(false);
const split = ref(20);
const selected = computed(() => {
  const node = findNode(filtered.value, selectedKey.value || keyword.value);
  return node;
});
function findNode(nodes: GuideItem[], key: string): GuideItem | undefined {
  return nodes.reduce((p: GuideItem | undefined, n: GuideItem) => {
    if (p) return p;
    if (n.key == key) {
      return n;
    } else if (n.children) {
      return findNode(n.children, key);
    }
    return undefined;
  }, undefined);
}

function filterNodes(nodes: GuideItem[], key: string): GuideItem[] {
  return nodes.reduce((p: GuideItem[], n: GuideItem) => {
    if (
      !key ||
      n.key == key ||
      n.keywords.find((k) => k.toLowerCase() == key.toLowerCase())
    ) {
      p.push(n);
    } else if (n.children) {
      const filtered = filterNodes(n.children, key);
      if (filtered.length) {
        p.push({
          ...n,
          children: filtered,
        });
      }
    }
    return p;
  }, []);
}
TheDialogs.on({
  type: 'scrumGuide',
  cb(e) {
    keyword.value = e.keyword || '';
    if (keyword.value) {
      const match = findNode(filtered.value, keyword.value);
      selectedKey.value = match?.key || '';
    }
    showGuideSheet.value = true;
  },
});
</script>
<template>
  <q-dialog v-model="showGuideSheet" :position="'right'">
    <q-card :style="`min-width:${Math.round($q.screen.width * 0.8)}px`">
      <q-toolbar
        ><q-toolbar-title>Scum Guide</q-toolbar-title>
        <q-space />
        <q-btn round dense icon="close" v-close-popup />
      </q-toolbar>
      <q-card-section>
        <q-splitter v-model="split">
          <template #before>
            <q-tree
              default-expand-all
              no-selection-unset
              class="col-12 col-sm-6"
              node-key="key"
              :nodes="filtered"
              selected-color="primary"
              v-model:selected="selectedKey"
            />
          </template>
          <template #after>
            <q-toolbar>
              <q-btn flat round dense icon="assignment_ind" />

              <q-toolbar-title>{{
                selected?.label || selectedKey
              }}</q-toolbar-title>
            </q-toolbar>
            <q-scroll-area
              v-if="selected"
              :style="`height: ${Math.round($q.screen.height * 0.8)}px;`"
            >
              <MarkdownPreview :source="selected.content" />
            </q-scroll-area>
          </template>
        </q-splitter>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
