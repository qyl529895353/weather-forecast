<template>
  <div class="container" v-loading="load">
    <div class="nav">
      <div class="time">{{ localTime }}</div>
      <div class="city" @click="changeCity">切换城市</div>
    </div>

    <div class="city-info">
      <p class="city">{{ lives.city }}</p>
      <p class="weather">{{ lives.weather }}</p>
      <h2 class="temp">
        <em>{{ lives.temperature }}</em
        >℃
      </h2>
      <div class="detail">
        <span>风力: {{ lives.windpower }}</span> |
        <span>风向: {{ lives.winddirection }}</span> |
        <span>空气湿度: {{ lives.humidity }} %</span>
      </div>
    </div>

    <div class="future" v-if="forecasts.casts.length > 0">
      <div class="group" v-for="item in forecasts.casts" :key="item.date">
        {{item.date}}:
        <span class="tm"
          >白天: {{ item.daytemp }}℃
          {{ item.dayweather }}
          {{ item.daywind }}
          {{ item.daypower }}
        </span>
        <span class="tm"
          >夜间: {{ item.nighttemp }}℃
          {{ item.nightweather }}
          {{ item.nightwind }}
          {{ item.nightpower }}
        </span>
      </div>
    </div>

    <div class="echart-container" ref="echartContainer"></div>

    <van-popup v-model="show" position="bottom" :style="{ height: '30%' }" >
      <van-area 
        title="标题" 
        :area-list="areaList" 
        visible-item-count="4"
        @cancel="show = false"
        columns-num="2"
        @confirm="selectCity"
      />
    </van-popup>
    
  </div>
</template>

<script>
import * as echarts from "echarts";
import { areaList } from '@vant/area-data';
import {getWearch} from "@/api/api.js";
export default {
  data() {
    return {
      lives: {},
      load: false,
      forecasts: {
        casts: []
      },
      localTime: "",
      mapData: {},
      futureMapData: [],
      seriesData: [],
      seriesNightData: [],
      areaList: areaList,
      show: false
    };
  },
  mounted() {
    setInterval(() => {
      this.localTime = this.getLocalTime();
    }, 1000);

    this.initMap();
  },
  methods: {
    getLocalTime() {
      return new Date().toLocaleTimeString();
    },
    initMap() {
      let that = this;
      AMap.plugin("AMap.CitySearch", function () {
        var citySearch = new AMap.CitySearch();
        citySearch.getLocalCity(function (status, result) {
          if (status === "complete" && result.info === "OK") {
            // 查询成功，result即为当前所在城市信息
            that.getWeatherData(result);
          }
        });
      });
    },
    async getWeatherData(cityInfo) {
      this.load = true
      try {
        const  wearchResult = await getWearch({adCode:cityInfo.adcode});
        if (wearchResult.status === 200){
          Object.assign(this.lives,wearchResult.result.lives.length ? wearchResult.result.lives[0]:{} );
          this.forecasts = wearchResult.result.forecasts[0];
        } else {
          this.$message.error(wearchResult.message);
        }
      } catch (error) {
        this.$message.error(error);
      }finally{
        this.load = false
      }
      
      // 每天的温度
      this.seriesData = []
      this.seriesNightData = []
      this.forecasts.casts.forEach(item => {
        this.seriesData.push(item.daytemp)
        this.seriesNightData.push(item.nighttemp)
      })

      this.$nextTick(() => {
        this.initEchart()
      })

    },
    initEchart() {
      // 基于准备好的dom，初始化echarts实例
      let myChart = echarts.init(this.$refs.echartContainer);

      // 绘制图表
      let option = {
        title: {
          text: "温度折线图",
        },
        legend: {
          data: ['白天','晚上']
        },
        tooltip: {},
        xAxis: {
          data: this.forecasts.casts.map(fm=>fm.date),
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: "#fff"
            }
          }
        },
        yAxis: {
          min: '-10',
          max: '50',
          interval: 10,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#fff'
            }
          },
          
        },
        series: [
          {
            name: "白天",
            type: "line",
            data: this.seriesData,
          },
          {
            name: "晚上",
            type: "line",
            data: this.seriesNightData,
            lineStyle: {
              color: 'red'
            }
          },
        ],
      }
      myChart.setOption(option)
    },
    changeCity() {
      this.show = true
    },
    selectCity(e) {
      this.getWeatherData({adcode: e[1].code})
      this.show = false
    }
  },
};
</script>

<style lang="less" scoped>
.container {
  min-height: 100vh;
  background: #6c8989;
  opacity: 0.7;
  color: #fff;
  font-size: 16px;
  .nav {
    display: flex;
    justify-content: space-between;
    padding: 10px;
  }
  .city-info {
    text-align: center;
    .city{
      cursor: pointer;
    }
    .temp {
      font-size: 26px;
      em {
        font-size: 34px;
        font-style: normal;
      }
    }
  }
  .future {
    margin-top: 30px;
    padding: 0 10px;
    .group {
      height: 30px;
      line-height: 30px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.6);
      color: rgba(16, 16, 16, 1);
      font-size: 13px;
      margin-bottom: 10px;
      padding: 0 10px;
      .tm {
        color: #1800df;
      }
      .tm:last-child {
        margin-left: 8px;
      }
    }
  }
  .echart-container {
    width: 100%;
    height: 50vh;
  }
}
</style>