<template>
    <section class="average__access-chart-container">
      <div class="average__access-chart-header">
        <div class="average__access-chart-info">
          <h4 class="average__access-chart-title">Usuários</h4>
          <div class="average__access-chart-actions">
            <button class="average__access-chart-button" :class="{'-selected': selectedPeriod == 'today'}" @click="setPeriod('today')">Hoje</button>
            <button class="average__access-chart-button" :class="{'-selected': selectedPeriod == '7d'}" @click="setPeriod('7d')">7d</button>
            <button class="average__access-chart-button" :class="{'-selected': selectedPeriod == '30d'}" @click="setPeriod('30d')">30d</button>
            <button class="average__access-chart-button" :class="{'-selected': selectedPeriod == '1y'}" @click="setPeriod('1y')">1a</button>
            <select class="average__access-chart-dropdown" v-model="selectedSite">
              <option value="">Todos os sites</option>
              <option v-for="site in sites" :key="site" :value="site">{{ site }}</option>
            </select>
            <button class="average__access-chart-export-btn" @click="exportData">
              Exportar
              <img src="../assets/img/export-icon.svg"/>
            </button>
          </div>
        </div>
        <p class="average__access-chart-subtitle">Veja a evolução de novos usuários</p>
      </div>
      <canvas ref="chartCanvas" id="chartCanvas"></canvas>
    </section>
  </template>
  
  <script lang="ts">
  import { defineComponent, onMounted, ref, watch } from 'vue';
  import { Chart, ChartData, ChartOptions } from 'chart.js/auto';
  import type { AccessData, AggregatedData } from '../types';
  import * as XLSX from 'xlsx';
  
  export default defineComponent({
    setup() {
      const chartCanvas = ref<HTMLCanvasElement | null>(null);
      const chartInstance = ref<Chart<'line'> | null>(null);
      const dataPoints = ref<AggregatedData[]>([]);
      const selectedPeriod = ref<string>('1y');
      const selectedSite = ref<string>('');
      const allData = ref<AccessData[]>([]);
      const sites = ref<string[]>([]);
  
      const fetchData = async () => {
        try {
          const response = await fetch('https://vuetestti.s3.us-east-1.amazonaws.com/data.json');
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data: AccessData[] = await response.json();
          allData.value = data;
          extractSites(data);
          processData();
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      const extractSites = (data: AccessData[]) => {
        const siteSet = new Set<string>();
        data.forEach(item => {
          const url = new URL(item.url);
          siteSet.add(url.hostname);
        });
        sites.value = Array.from(siteSet);
      };
  
      const processData = () => {
        const filteredData = filterDataByPeriod(allData.value, selectedPeriod.value);
        const filteredBySite = selectedSite.value
          ? filteredData.filter(item => new URL(item.url).hostname === selectedSite.value)
          : filteredData;
        
        const aggregated: { [key: string]: { totalSpent: number; count: number } } = {};
  
        filteredBySite.forEach(item => {
          const month = new Date(item.dateAccessed).toLocaleString('default', { month: 'long' });
          if (!aggregated[month]) {
            aggregated[month] = { totalSpent: 0, count: 0 };
          }
          aggregated[month].totalSpent += item.timeSpent;
          aggregated[month].count += 1;
        });
  
        dataPoints.value = Object.keys(aggregated).map(month => ({
          month,
          averageTimeSpent: aggregated[month].totalSpent / aggregated[month].count,
        })).sort((a, b) => new Date(`01 ${a.month} 2000`).getMonth() - new Date(`01 ${b.month} 2000`).getMonth());
  
        renderChart();
      };
  
      const filterDataByPeriod = (data: AccessData[], period: string): AccessData[] => {
        const now = new Date();
        let startDate: Date;
  
        switch (period) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case '7d':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            break;
          case '30d':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
            break;
          case '1y':
          default:
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        }
  
        return data.filter(item => new Date(item.dateAccessed) >= startDate);
      };
  
      const setPeriod = (period: string) => {
        selectedPeriod.value = period;
        console.log(selectedPeriod.value)
      };
  
      const renderChart = () => {
        if (chartCanvas.value && dataPoints.value.length > 0) {
          if (chartInstance.value) {
            chartInstance.value.destroy();
          }
          
          const ctx = chartCanvas.value.getContext('2d');
          if (ctx) {
            const data: ChartData<'line'> = {
              labels: dataPoints.value.map(point => point.month),
              datasets: [
                {
                  label: '',
                  data: dataPoints.value.map(point => point.averageTimeSpent),
                  fill: true,
                  backgroundColor: '#1a9bdc11',
                  borderColor: '#1a9cdc',
                  tension: 0.8,
                }
              ]
            };
  
            const options: ChartOptions<'line'> = {
              responsive: true,
              plugins: {
                  legend: {
                      display: false
                  }
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: ''
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: ''
                  }
                }
              }
            };
  
            chartInstance.value = new Chart<'line'>(ctx, {
              type: 'line',
              data,
              options
            });
          }
        }
      };

      const exportData = () => {
        const worksheet = XLSX.utils.json_to_sheet(dataPoints.value);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, 'data.xlsx');
      };
  
      onMounted(async () => {
        await fetchData();
      });
  
      watch([selectedPeriod, selectedSite], processData);
  
      return {
        chartCanvas,
        selectedPeriod,
        selectedSite,
        sites,

        exportData,
        setPeriod,
        updateChart: processData
      };
    }
  });
  </script>
  <style scoped>
  @import url('../styles/variables.css');
  
  canvas#chartCanvas {
    max-width: 800px;
    max-height: 400px;
    width: 100%;
    margin: 0;
  }
  
  .average__access-chart-container {
    max-width: 650px;
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--color-gray-200);
    margin: 2rem auto;
    border-radius: 8px;
  }
  
  .average__access-chart-header {
    display: flex;
    flex-direction: column;
    gap: var(--gap-large);
    margin-bottom: var(--gap-large);
  }
  
  .average__access-chart-title {
    font-size: var(--font-size-medium);
    font-weight: --font-weight-bold;
    color: var(--color-gray-400);
  }
  
  .average__access-chart-info {
    display: flex;
    justify-content: space-between;
  }
  
  
  .average__access-chart-subtitle {
    font-size: var(--font-size-small);
    font-weight: --font-weight-normal;
    color: var(--color-gray-300);
  }

  .average__access-chart-actions{
    display: flex;
    gap: var(--gap-medium);
  }

  .average__access-chart-button{
    background: var(--color-gray-100);
    color: var(--color-gray-300);
    border: none;
    outline: none;
    border-radius: 2px;
    cursor: pointer;
  }

  .average__access-chart-button:is(.-selected){
    background: var(--color-blue-100);
    color: var(--color-blue-200);
    font-weight: bold;
    cursor: pointer;
  }

  .average__access-chart-dropdown{
    border-radius: 4px;
    border: 1px solid var(--color-gray-200);
    color: var(--color-gray-400);
    padding: 0.2rem 0.5rem;
    cursor: pointer;
  }

  .average__access-chart-export-btn{
    display: flex;
    align-items: center;
    gap: var(--gap-small);
    background: none;
    border: none;
    color: var(--color-gray-400);
    font-weight: var(--font-weight-normal);
    outline: none;
    cursor: pointer;
  }

  .average__access-chart-export-btn img{
    height: 16px;
  }
  </style>
  