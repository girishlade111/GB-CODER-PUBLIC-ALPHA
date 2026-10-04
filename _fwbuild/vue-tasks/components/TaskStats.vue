      <script setup>
      import { computed } from 'vue';
      import ProgressRing from './ProgressRing.vue';
      import { recentTrend } from '../utils/engine.js';

      const props = defineProps({
        total: { type: Number, required: true },
        done: { type: Number, required: true },
        open: { type: Number, required: true },
        overdue: { type: Number, required: true },
        percent: { type: Number, required: true },
        tasks: { type: Array, required: true },
      });

      /** Last seven days of completions, drawn as a tiny bar sparkline. */
      const trend = computed(() => recentTrend(props.tasks));
      const trendMax = computed(() => Math.max(1, ...trend.value));
      const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

      /*
        Sparkline geometry, worked out here so the template needs no inline style.
        Seven bars across a 70x24 user-unit box, with a floor of 2 units so an empty
        day still reads as a slot rather than disappearing.
      */
      const SPARK_W = 70;
      const SPARK_H = 24;
      const SPARK_STEP = SPARK_W / trend.value.length;

      const bars = computed(() =>
        trend.value.map((value, index) => {
          const height = Math.max(2, (value / trendMax.value) * (SPARK_H - 4));
          return {
            value,
            day: dayLabels[index],
            x: (index * SPARK_STEP).toFixed(2),
            y: (SPARK_H - height).toFixed(2),
            width: (SPARK_STEP - 2.4).toFixed(2),
            height: height.toFixed(2),
            index,
          };
        }),
      );

      const trendSummary = computed(() =>
        trend.value.reduce((sum, value) => sum + value, 0) + ' completions in the last seven days',
      );
      </script>

      <template>
        <section class="stats" aria-labelledby="stats-title">
          <h2 class="sr-only" id="stats-title">Task summary</h2>

          <div class="stats__ring">
            <ProgressRing :percent="percent" label="Completion" />
            <p class="stats__ring-note">
              {{ done }} of {{ total }} tasks finished.
              <span v-if="overdue > 0" class="stats__overdue">{{ overdue }} past due.</span>
              <span v-else>Nothing overdue.</span>
            </p>
          </div>

          <dl class="stats__tiles">
            <div class="stat stat--open">
              <dt>Open</dt>
              <dd>{{ open }}</dd>
            </div>
            <div class="stat stat--done">
              <dt>Done</dt>
              <dd>{{ done }}</dd>
            </div>
            <div class="stat stat--overdue" :class="{ 'stat--zero': overdue === 0 }">
              <dt>Overdue</dt>
              <dd>{{ overdue }}</dd>
            </div>
            <div class="stat stat--total">
              <dt>Total</dt>
              <dd>{{ total }}</dd>
            </div>
          </dl>

          <div class="spark">
            <p class="spark__label">Completed, last 7 days</p>
            <svg
              class="spark__svg"
              :viewBox="'0 0 ' + SPARK_W + ' ' + SPARK_H"
              preserveAspectRatio="none"
              role="img"
              :aria-label="trendSummary"
            >
              <rect
                v-for="bar in bars"
                :key="'bar-' + bar.index"
                class="spark__bar"
                :class="{ 'spark__bar--empty': bar.value === 0 }"
                :x="bar.x"
                :y="bar.y"
                :width="bar.width"
                :height="bar.height"
                rx="1.4"
              />
            </svg>
            <div class="spark__days" aria-hidden="true">
              <span v-for="bar in bars" :key="'day-' + bar.index">{{ bar.day }}</span>
            </div>
          </div>
        </section>
      </template>