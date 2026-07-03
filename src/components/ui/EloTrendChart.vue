<template>
  <svg :viewBox="`0 0 ${W} ${H}`" width="100%" :height="H" class="elo-chart">
    <template v-if="!lines.length">
      <text
        :x="W / 2"
        :y="H / 2"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#4A5563"
        font-size="13"
        font-weight="600"
        font-family="Space Grotesk, sans-serif"
      >
        Select players below
      </text>
    </template>
    <template v-else>
      <line
        v-for="(grid, i) in gridLines"
        :key="'g' + i"
        :x1="padL"
        :x2="W - padR"
        :y1="grid.y"
        :y2="grid.y"
        stroke="rgba(255,255,255,0.06)"
        stroke-width="1"
      />
      <g v-for="line in lines" :key="line.id">
        <polyline
          :points="line.points"
          fill="none"
          :stroke="line.color"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          :style="{ filter: `drop-shadow(0 2px 5px ${line.color}55)` }"
        />
        <circle
          :cx="line.endX"
          :cy="line.endY"
          r="3.6"
          :fill="line.color"
          stroke="#12171E"
          stroke-width="2"
        />
      </g>
      <text
        :x="padL"
        :y="padT - 5"
        fill="#6B7683"
        font-size="9"
        font-family="Space Grotesk, sans-serif"
        font-weight="600"
      >
        {{ Math.round(maxVal) }}
      </text>
      <text
        :x="padL"
        :y="H - padB + 13"
        fill="#6B7683"
        font-size="9"
        font-family="Space Grotesk, sans-serif"
        font-weight="600"
      >
        {{ Math.round(minVal) }}
      </text>
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface ChartLine {
  id: string;
  color: string;
  hist: number[];
}

const props = defineProps<{
  lines: ChartLine[];
}>();

const W = 326;
const H = 192;
const padL = 8;
const padR = 12;
const padT = 16;
const padB = 26;

const allValues = computed(() => props.lines.flatMap((l) => l.hist));

const minVal = computed(() => {
  if (!allValues.value.length) return 1400;
  const min = Math.min(...allValues.value);
  const max = Math.max(...allValues.value);
  const pd = (max - min) * 0.18 || 10;
  return min - pd;
});

const maxVal = computed(() => {
  if (!allValues.value.length) return 1600;
  const min = Math.min(...allValues.value);
  const max = Math.max(...allValues.value);
  const pd = (max - min) * 0.18 || 10;
  return max + pd;
});

function xPos(i: number, n: number): number {
  if (n <= 1) return padL;
  return padL + ((W - padL - padR) * i) / (n - 1);
}

function yPos(v: number): number {
  const range = maxVal.value - minVal.value || 1;
  return padT + (H - padT - padB) * (1 - (v - minVal.value) / range);
}

const gridLines = computed(() =>
  [0, 0.33, 0.66, 1].map((t) => ({
    y: padT + (H - padT - padB) * t,
  }))
);

const lines = computed(() =>
  props.lines.map((line) => {
    const n = line.hist.length;
    const points = line.hist.map((v, i) => `${xPos(i, n)},${yPos(v)}`).join(' ');
    return {
      ...line,
      points,
      endX: xPos(n - 1, n),
      endY: yPos(line.hist[line.hist.length - 1]),
    };
  })
);
</script>

<style scoped>
.elo-chart {
  display: block;
}
</style>
