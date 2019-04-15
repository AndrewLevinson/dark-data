/* global Vue */
var app = new Vue({
  el: "#container",
  data() {
    return {
      chartTitle:
        "Cookies Stored on my Computer from 1 Day of Internet Browsing",
      svgWidth: window.innerWidth * 0.55,
      svgHeight: window.innerHeight * 0.825,
      margin: { top: 25, left: 130, bottom: 25, right: 25 },
      cookies: [{}],
      myFilters: {
        exp: 0,
        party: "all",
        category: "all",
        purpose: null,
        site: "all"
      },
      showLabel: false,
      myCount: null,
      nested_data: [{}],
      domainX: {
        min: 0,
        max: 65
      },
      filterKey: "3rd Party"
    };
  },
  computed: {
    filteredData() {
      let filteredData = this.nested_data.filter(
        el => el.key !== this.filterKey
      );
      return filteredData;
    },
    width() {
      return this.svgWidth - this.margin.left - this.margin.right;
    },
    height() {
      return this.svgHeight - this.margin.top - this.margin.bottom;
    },
    scale() {
      // console.log(this.cookies);
      const x = d3
        .scaleLinear()
        // .domain([0, Math.max(...this.nested_data.map(x => x.values.length))])
        .domain([0, this.domainX.max])
        .rangeRound([0, this.width]);

      const y = d3
        .scaleBand()
        .domain(this.filteredData.map(y => y.key))
        // https://github.com/d3/d3-scale/blob/master/README.md#band_rangeRound
        .rangeRound([0, this.height])
        .padding(0.6);

      // const grid = d3
      //   .scaleLinear()
      //   .domain([0, this.domainX.max])
      //   .rangeRound([0, this.width]);

      const gridlines = d3
        .scaleLinear()
        .domain([0, this.domainX.max])
        .rangeRound([0, this.width]);

      return { x, y, gridlines };
    }
  },
  created() {
    this.loadData();
  },
  mounted() {
    this.initTooltip();
    this.scrollTrigger();
  },
  updated() {
    // console.log(this.cookies);
  },
  methods: {
    loadData() {
      // d3.json("data/data.json").then(d => {
      //   return (this.data = d.cookies);
      // });

      d3.csv("data/cookies.csv", d => {
        return {
          id: +d["cookieID"],
          domain: d["mastername2"],
          thirdpartydom: d["ThirdPartyHost"],
          cat: d["Category"],
          site: d["site"],
          exp: +d["exp"],
          type: d["type"],
          purpose: d["purpose"],
          name: d["name"]
        };
      })
        .then(d => {
          // add property for converted expiration time to days
          let converedData = d.map(d => ({
            ...d,
            days: this.timeConvert(d.exp)
          }));
          return (this.cookies = converedData);
        })
        .then(d => {
          this.nested_data = d3
            .nest()
            .key(d => {
              return d.domain;
            })
            // .sortKeys(function(a, b) {
            //   console.log(a);
            //   return b.length - a.length;
            // })
            .entries(d);
        });
    },
    timeConvert(e) {
      // used to convert unix seconds to number of days until expiration
      let cookiesSeconds = e;
      let start = new Date(0); // The 0 there is the key, which sets the date to the epoch
      let updatedD = start.setUTCSeconds(cookiesSeconds);
      // april 14 (need to subtract 1 since data was collected april 13)
      let today = 1555277525106;
      // let today = Date.now();
      let difference = Math.floor((updatedD - today + 1) / 86400000);

      return difference;
    },
    initTooltip() {
      tooltip = {
        element: null,
        init: function() {
          this.element = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("right", `0px`)
            .style("bottom", `50px`)
            .style("opacity", 0);
        },
        show: function(t) {
          this.element
            .html(t)
            .transition()
            .duration(200)
            .style("right", `50px`)
            .style("bottom", `50px`)
            .style("opacity", 0.925);
        },
        move: function() {
          this.element
            .transition()
            .duration(30)
            .style("right", 20 + "px")
            .style("top", 20 + "px")
            .style("opacity", 0.9);
        },
        hide: function() {
          this.element
            .transition()
            .duration(200)
            .style("opacity", 0)
            .delay(400)
            .style("right", `0px`);
        }
      };
      tooltip.init();
    },

    myTooltip(d) {
      if (this.showLabel) {
        tooltip.show(`<h5 class="total">${d.site}</h5><p>
        <span class="datum"><i>cookie name</i></span> is a <span class="datum">${
          d.party
        }</span> cookie used for <span class="datum">${
          d.purpose
        }</span> that will be stored on my computer as a <span class="datum">${
          d.type
        }</span> type with a duration of <span class="datum">${
          d.expire
        }</span> days.
        </p>`);
      } else if (!this.showLabel) {
        tooltip.hide();
      }
    },
    myFill(e) {
      if (e === "News") {
        return "var(--cat-news)";
      } else if (e === "Social") {
        return "var(--cat-social)";
      } else if (e === "Google") {
        return "var(--cat-google)";
      } else if (e === "Shopping") {
        return "var(--cat-ecommerce)";
      } else if (e === "Entertainment & Info") {
        return "var(--cat-ent)";
      }
      if (e === "targeting") {
        return "var(--targeting)";
      } else {
        return "#000";
      }
    },
    count() {
      return this.cookies.length;
    },
    scrollTrigger() {
      d3.graphScroll()
        .offset(130)
        .graph(d3.selectAll("#graph"))
        .container(d3.select("#chart"))
        .sections(d3.selectAll("#sections > div"))
        .eventId("uniqueId1")
        .on("active", i => {
          switch (i) {
            case 0:
              // offscreen so do nothing / reset with just line
              this.filterKey = "3rd Party";
              this.domainX.max = 70;
              console.log("case 0");
              break;
            case 1:
              this.filterKey = null;
              this.domainX.max = 700;

              console.log("case 1");
              break;
            case 2:
              console.log("case 2");
              break;
          }
        });
    }
  },
  directives: {
    axis(el, binding) {
      const axis = binding.arg; // x or y

      const axisMethod = { x: "axisTop", y: "axisLeft" }[axis];
      // The line below assigns the x or y function of the scale object
      const methodArg = binding.value[axis];

      // d3.axisBottom(scale.x)
      d3.select(el).call(d3[axisMethod](methodArg).ticks(5));
    },
    grid(el, binding) {
      const axis = binding.arg; // x or y
      const axisMethod = { gridlines: "axisTop" }[axis];
      // The line below assigns the x or y function of the scale object
      const methodArg = binding.value[axis];
      // d3.axisBottom(scale.x)
      d3.select(el).call(
        d3[axisMethod](methodArg)
          .tickFormat("")
          .tickSize(-window.innerHeight * 0.74)
          .ticks(5)
      );
    }
  }
});
