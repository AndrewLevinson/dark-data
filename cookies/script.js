/* global Vue */
var app = new Vue({
  el: "#bars",
  data() {
    return {
      chartTitle: "Cookies",
      svgWidth: window.innerWidth * 0.9,
      svgHeight: window.innerHeight * 0.8,
      margin: { top: 25, left: 25, bottom: 25, right: 25 },
      data: [{}],
      myFilters: {
        exp: 0,
        source: "",
        type: "",
        purpose: ""
      },
      showLabel: null
    };
  },
  computed: {
    filteredData() {
      let filteredData = this.data.filter(el => el.expire > this.myFilters.exp);
      return filteredData;
    },
    width() {
      return this.svgWidth - this.margin.left - this.margin.right;
    },
    height() {
      return this.svgHeight - this.margin.top - this.margin.bottom;
    },
    scale() {
      const x = d3
        .scaleBand()
        .domain(this.data.map(x => x.name))
        // https://github.com/d3/d3-scale/blob/master/README.md#band_rangeRound
        .rangeRound([0, this.width])
        .padding(0.8);
      const y = d3
        .scaleLinear()
        .domain([0, Math.max(...this.data.map(x => x.expire))])
        .rangeRound([0, this.height]); // Already flipped
      return { x, y };
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      d3.json("data.json").then(d => {
        return (this.data = d.cookies);
      });
    },
    myFill(e) {
      if (e === "news") {
        return "orange";
      } else if (e === "social") {
        return "lightblue";
      } else if (e === "google") {
        return "lightgreen";
      } else if (e === "ecommerce") {
        return "lightcoral";
      } else {
        return "#000";
      }
    },
    myTooltip(d) {
      tooltip = {
        element: null,
        init: function() {
          this.element = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        },
        show: function(t) {
          this.element
            .html(t)
            .transition()
            .duration(200)
            .style("left", 20 + "px")
            .style("top", 20 + "px")
            .style("opacity", 0.9);
        },
        move: function() {
          this.element
            .transition()
            .duration(30)
            .style("left", 20 + "px")
            .style("top", 20 + "px")
            .style("opacity", 0.9);
        },
        hide: function() {
          this.element
            .transition()
            .duration(500)
            .style("opacity", 0);
        }
      };
      tooltip.init();

      tooltip.show(
        `<div class="total double"><h5>Hello</h5></div> ${d.name}<br>${
          d.category
        }<br>${d.type}`
      );
    }
  },
  directives: {
    axis(el, binding) {
      const axis = binding.arg; // x or y
      const axisMethod = { x: "axisTop", y: "axisLeft" }[axis];
      // The line below assigns the x or y function of the scale object
      const methodArg = binding.value[axis];
      // d3.axisBottom(scale.x)
      d3.select(el).call(d3[axisMethod](methodArg));
    }
  }
});
