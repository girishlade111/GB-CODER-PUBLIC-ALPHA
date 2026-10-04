      <script setup>
      import { computed } from 'vue';

      /**
       * Circular completion gauge.
       *
       * The sweep is a `stroke-dashoffset` attribute against a circle normalised to
       * `pathLength="100"`, so the geometry is `100 - percent` and nothing needs an
       * inline style. `vector-effect="non-scaling-stroke"` keeps the ring the same
       * weight however the SVG is scaled.
       */
      const props = defineProps({
        percent: { type: Number, required: true },
        label: { type: String, default: 'Completion' },
        size: { type: Number, default: 116 },
        thickness: { type: Number, default: 9 },
      });

      const radius = computed(() => (props.size - props.thickness) / 2);
      const offset = computed(() => String(100 - Math.max(0, Math.min(100, props.percent))));
      const tone = computed(() => {
        if (props.percent >= 100) return 'full';
        if (props.percent >= 50) return 'half';
        return 'low';
      });
      </script>

      <template>
        <div class="ring" role="img" :aria-label="label + ': ' + Math.round(percent) + ' percent'">
          <svg :width="size" :height="size" :viewBox="'0 0 ' + size + ' ' + size" aria-hidden="true" focusable="false">
            <circle
              class="ring__track"
              :cx="size / 2"
              :cy="size / 2"
              :r="radius"
              :stroke-width="thickness"
              fill="none"
            />
            <circle
              class="ring__value"
              :class="'ring__value--' + tone"
              :cx="size / 2"
              :cy="size / 2"
              :r="radius"
              :stroke-width="thickness"
              fill="none"
              stroke-linecap="round"
              pathLength="100"
              stroke-dasharray="100"
              :stroke-dashoffset="offset"
              :transform="'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'"
            />
            <text class="ring__text" x="50%" y="50%" text-anchor="middle" dy="0.12em">{{ Math.round(percent) }}%</text>
            <text class="ring__sub" x="50%" y="50%" text-anchor="middle" dy="1.55em">done</text>
          </svg>
        </div>
      </template>