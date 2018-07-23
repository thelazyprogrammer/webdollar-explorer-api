<template>
  <div class="pools">
    <h2> Star network <span v-if="is_loaded">({{ stars.nodes.length - 1}} connections)</span></h2>
    <div v-if="is_loaded">
    </div>
    <loading v-else></loading>
    <svg id="svg" width="1280" height="1024" :class="getDisplayClass()"></svg>
  </div>

</template>

<script>
const d3 = require('d3');
import BlocksService from '@/services/BlocksService'
import Loading from '@/components/utils/Loading'

export default {
  name: 'stars',

  components:{ Loading, },

  data () {
    return {
      stars: [],
      is_loaded: false
    }
  },
  mounted () {
    this.getStars()
  },
  methods: {
    getDisplayClass() {
      if (this.is_loaded) {
        return "displaySVG"
      }
      return "displayNOSVG"
    },
    async getStars() {
      this.is_loaded = false
      var address = encodeURIComponent(window.location.href.substring(window.location.href.indexOf("WEBD"),window.location.href.length))
      if (!address) {
        console.log("No address found")
        return
      }
      let result = await BlocksService.fetchStars(address + "?depth=1")
      if (result.data) {
        this.is_loaded = true
        this.stars = result.data
        this.drawStars()
      }
    },
    async drawStars() {

    var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = 6;

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody().strength(function() {return -130}))
      .force("center", d3.forceCenter(width / 2, height / 2));

    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(this.stars.links)
      .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(this.stars.nodes)
      .enter().append("circle")
      .attr("r", radius)
      .attr("fill", function(d) { if (d.group == 1001) {return "#f00"} else { return color(d.group);} })
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

     node.append("title")
      .text(function(d) { return d.id; }); simulation
       .nodes(this.stars.nodes)
       .on("tick", tick);

     simulation.force("link")
       .links(this.stars.links);

      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      function tick() {
        node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
          .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });

        link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
      }
    }
  }

}
</script>

<style type="text/css">
.links line {
  stroke: #999;
  stroke-opacity: 0.6;
}

.nodes circle {
  stroke: #fff;
  stroke-width: 1.5px;
}

#svg {
  -webkit-box-shadow: 1px 0px 13px 11px rgba(186,186,186,1);
  -moz-box-shadow: 1px 0px 13px 11px rgba(186,186,186,1);
  box-shadow: 1px 0px 13px 11px rgba(186,186,186,1);
  margin: 0 auto;
}

.displaySVG {
  display: block;
}

.displayNOSVG {
  display: none;
}
</style>
