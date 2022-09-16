<template>
  <q-card flat class="q-pa-none">
    <q-card-section class="q-pa-none">
      <section v-if="cropImg" class="preview-area">
        <div class="cropped-image text-center">
          <q-avatar size="100px">
            <q-img
              v-if="cropImg"
              :src="cropImg"
              alt="Cropped Image"
              fit="fill"
            />
          </q-avatar>
        </div>
      </section>
      <VueCropper
        v-else
        ref="cropper"
        :canScale="false"
        :fixed="true"
        :src="imgSrc"
        alt="Source Image"
      />
    </q-card-section>
    <q-card-actions class="q-pa-none q-pt-sm" align="center">
      <q-btn color="primary" icon="refresh" flat rounded @click="reset()">
        <q-tooltip content-class="bg-accent">Refresh</q-tooltip>
      </q-btn>
      <q-btn
        data-cy="cropImage"
        color="primary"
        icon="content_cut"
        flat
        rounded
        @click="cropImage()"
      >
        <q-tooltip content-class="bg-accent">Crop</q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';
import { defineComponent, PropType } from 'vue-demi';

interface ICropper extends Vue {
  reset(): void;
  replace(file: string | ArrayBuffer): void;
  getCroppedCanvas(): HTMLCanvasElement;
}

export default defineComponent({
  components: { VueCropper },
  name: 'TheImageCropper',
  props: {
    file: {
      type: Object as PropType<File[]>,
      required: true,
    },
  },
  data() {
    return {
      imgSrc: '',
      cropImg: '',
    };
  },
  emits: ['cropImage'],
  mounted() {
    const file = this.file[0];
    if (file.type.indexOf('image/') === -1) {
      alert('Please select an image file');
      return;
    }
    if (typeof FileReader === 'function') {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          this.imgSrc = event.target.result as unknown as string;
          // rebuild cropperjs with the updated source
          (this.$refs.cropper as ICropper).replace(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Sorry, FileReader API not supported');
    }
  },
  methods: {
    cropImage() {
      // get image data for post processing, e.g. upload or setting image src
      this.cropImg = (this.$refs.cropper as ICropper)
        .getCroppedCanvas()
        .toDataURL();
      this.$emit('cropImage', this.cropImg);
    },
    reset() {
      this.cropImg = '';
      this.$emit('cropImage', '');
    },
  },
});
</script>

<style scoped>
.preview-area {
  width: 307px;
}
</style>
