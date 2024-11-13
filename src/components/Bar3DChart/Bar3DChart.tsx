import { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import 'echarts-gl';
import salesQuery from '@/graphql/salesDataQuery.gql';
import { useAppContext } from 'zvm-code-context';
type SalesHistory = {
  id: number;
  year: number;
  city_name: string;
  amount: number;
}

export interface Bar3DChartPropData {
  cityName: string;
  year: string;
}

export interface Bar3DChartStateData {}

export interface Bar3DChartEvent {}

export interface Bar3DChartProps {
  propData: Bar3DChartPropData;
  propState: Bar3DChartStateData;
  event: Bar3DChartEvent;
}

export function Bar3DChart({ propData }: Bar3DChartProps) {
  const [option] = useState<any>(null);
  const { query } = useAppContext();

  useEffect(() => {
    async function fetchData(propData: Bar3DChartPropData) {
      const option = await fetchDemoOptionData(query, propData);
      const chartDom = document.getElementById('__Bar3DChart__container');
      console.log(chartDom);
      if (chartDom) {
        const myChart = echarts.init(chartDom);
        myChart.setOption(option);
        const handleResize = () => {
          myChart.resize();
        };

        window.addEventListener('resize', handleResize);

        // Clear side effects
        return () => {
          myChart.dispose();
          window.removeEventListener('resize', handleResize);
        };
      }
    }

    fetchData(propData);
  }, [option, propData]);

  return (
    <div
      id='__Bar3DChart__container'
      style={{ width: '100%', height: '100%' }}
    />
  );
}

async function fetchDemoOptionData(query: (gql: string, variables: Record<string, any>) => Promise<any>, propData: Bar3DChartPropData) {
  const { cities, years, data } = await fetchAndProcessData(query, propData);
  const { min, max } = findMinMax(data);
  return {
    tooltip: {
      trigger: "item",
      formatter: function (params: any) {
        return `${cities[params.data.value[0]]} had sales of ${params.data.value[2]} in year ${years[params.data.value[1]]}`;
      },
    },
    visualMap: {
      max,
      min,
      inRange: {
        color: [
          "#313695",
          "#4575b4",
          "#74add1",
          "#abd9e9",
          "#e0f3f8",
          "#ffffbf",
          "#fee090",
          "#fdae61",
          "#f46d43",
          "#d73027",
          "#a50026",
        ],
      },
    },
    xAxis3D: {
      type: "category",
      data: cities,
      name: "City",
      axisLabel: {
        interval: 0, 
      },
    },
    yAxis3D: {
      type: "category",
      data: years,
      name: "Year",
      axisLabel: {
        interval: 0, 
      },
    },
    zAxis3D: {
      type: "value",
      name: "Sales",
    },
    grid3D: {
      boxWidth: cities.length * 8,
      boxDepth: years.length * 8,
      boxHeight: 60,
      light: {
        main: {
          intensity: 1.2,
        },
        ambient: {
          intensity: 0.3,
        },
      },
    },
    series: [
      {
        type: "bar3D",
        data: data.map(function (item) {
          return {
            value: [item[1], item[0], item[2]],
          };
        }),
        shading: "color",
        label: {
          show: false,
          fontSize: 16,
          borderWidth: 1,
        },
        itemStyle: {
          opacity: 0.4,
        },
        emphasis: {
          label: {
            fontSize: 20,
            color: "#900",
          },
          itemStyle: {
            color: "#900",
          },
        },
      },
    ],
    textStyle: {
      fontFamily: "sans-serif",
      fontSize: 12,
    },
    axisPointer: {},
  };
}
function findMinMax(arr: number[][]): { min: number; max: number } {
  // To extract the value of the third item
  const thirdItems = arr.map((item) => item[2]);

  // Find the minimum and maximum values
  const min = Math.min(...thirdItems);
  const max = Math.max(...thirdItems);

  return { min, max };
}


async function fetchAndProcessData(query: (gql: string, variables: Record<string, any>) => Promise<any>, propData: Bar3DChartPropData) {
  const conditions = [];
  if (propData.cityName) {
    conditions.push({ city_name: { _eq: propData.cityName } });
  }
  if (propData.year) {
    conditions.push({ year: { _eq: propData.year } });
  }

  const variables = {
    where: conditions.length ? { _and: conditions } : {},
    orderBy: [{ id: 'desc' }],
    distinct_on: [],
  };
  const fetched = (await query(salesQuery.loc.source.body, variables));
  const salesData = fetched.data.sales_history as SalesHistory[];

  const cities = Array.from(
    new Set(salesData.map((data) => data.city_name))
  );
  const years = Array.from(new Set(salesData.map((data) => data.year)));

  const salesAmount = salesData.map((item) => [
    years.indexOf(item.year),
    cities.indexOf(item.city_name),
    item.amount,
  ]);

  return {
    cities,
    years,
    data: salesAmount,
  };
}