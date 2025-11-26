<template>
  <div class="elo-chart-container">
    <Line v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import _ from 'lodash';
import { calculateEloHistory } from '@/utils/elo';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

import type { Match, Player } from '@/utils/elo';

interface Props {
  matches: Match[];
  players: Player[][];
}

const props = defineProps<Props>();

const chartData = computed(() => {
  if (!props.matches || props.matches.length === 0) {
    return null;
  }

  const { playerEloHistory } = calculateEloHistory(props.matches, props.players);
  
  // Generate random color for each player
  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 65 + Math.floor(Math.random() * 20); // 65-85%
    const lightness = 55 + Math.floor(Math.random() * 15); // 55-70%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };
  
  // Create datasets for each player
  const datasets = Object.keys(playerEloHistory).map((playerName) => {
    const history = playerEloHistory[playerName];
    const color = generateRandomColor();
    return {
      label: playerName,
      data: history.map(h => ({ x: h.date, y: h.elo })),
      borderColor: color,
      backgroundColor: color,
      tension: 0.1,
      pointRadius: 3,
      pointHoverRadius: 5
    };
  });
  
  return {
    datasets
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time' as const,
      time: {
        unit: 'day' as const
      },
      title: {
        display: true,
        text: 'Date',
        color: '#ffffff'
      },
      ticks: {
        color: '#ffffff'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    },
    y: {
      title: {
        display: true,
        text: 'ELO Rating',
        color: '#ffffff'
      },
      ticks: {
        color: '#ffffff'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        color: '#ffffff'
      }
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false
    }
  }
}));
</script>

<style scoped>
.elo-chart-container {
  height: 500px;
  width: 100%;
}
</style>

