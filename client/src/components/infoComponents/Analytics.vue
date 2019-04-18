<template>
  <div>
    <highcharts class="tabWrapper" :options="chart_options"></highcharts>
  </div>
</template>

<script>

export default {
  name: 'analytics',

  components: { },

  props: {
    chart_options: {}
  },
  methods: {
  }
}
</script>
<style type="text/css">

</style>
