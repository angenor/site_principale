import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import * as am5percent from '@amcharts/amcharts5/percent'
import * as am5radar from '@amcharts/amcharts5/radar'
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy'
import * as am5flow from '@amcharts/amcharts5/flow'
import * as am5map from '@amcharts/amcharts5/map'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive'

export default defineNuxtPlugin(() => {
  // Make amCharts5 modules available globally via provide/inject
  return {
    provide: {
      am5: {
        core: am5,
        xy: am5xy,
        percent: am5percent,
        radar: am5radar,
        hierarchy: am5hierarchy,
        flow: am5flow,
        map: am5map,
        themes: {
          Animated: am5themes_Animated,
          Responsive: am5themes_Responsive,
        },
      },
    },
  }
})
