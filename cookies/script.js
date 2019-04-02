Vue.directive("scroll", {
  inserted: function(el, binding) {
    let f = function(evt) {
      if (binding.value(evt, el)) {
        window.removeEventListener("scroll", f);
      }
    };
    window.addEventListener("scroll", f);
  }
});

/* global Vue */
var app = new Vue({
  el: "#container",
  data() {
    return {
      chartTitle:
        "Cookies Stored on my Computer from 1 Day of Internet Browsing",
      svgWidth: window.innerWidth * 0.925,
      svgHeight: window.innerHeight * 0.9,
      margin: { top: 25, left: 30, bottom: 25, right: 25 },
      data: [{}],
      myFilters: {
        exp: 0,
        party: "all",
        category: "all",
        purpose: null,
        site: "all"
      },
      showLabel: false,
      myCount: null
    };
  },
  computed: {
    filteredData() {
      let filteredData = this.data.filter(
        el =>
          el.expire > this.myFilters.exp &&
          (this.myFilters.party === "all"
            ? el.party != null
            : el.party === this.myFilters.party) &&
          (this.myFilters.category === "all"
            ? el.category != null
            : el.category === this.myFilters.category) &&
          (this.myFilters.site === "all"
            ? el.site != null
            : el.site === this.myFilters.site)
      );
      return filteredData;
    },
    width() {
      return this.svgWidth - this.margin.left - this.margin.right;
    },
    height() {
      return this.svgHeight - this.margin.top - this.margin.bottom;
    },
    count() {
      return (this.myCount = this.data.length);
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
    this.initTooltip();
  },
  methods: {
    loadData() {
      d3.json("data.json").then(d => {
        return (this.data = d.cookies);
      });
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
    myFill(e) {
      if (e === "news") {
        return "var(--cat-news)";
      } else if (e === "social") {
        return "var(--cat-social)";
      } else if (e === "google") {
        return "var(--cat-google)";
      } else if (e === "ecommerce") {
        return "var(--cat-ecommerce)";
      }
      if (e === "targeting") {
        return "var(--targeting)";
      } else {
        return "#000";
      }
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
    handleScrollOne(evt, el) {
      // console.log(evt.path[0].body.children[0].children[2].children[0].id);
      // console.log(window.scrollY + window.innerHeight - el.height);
      if (window.scrollY > el.offsetTop) {
        // el.setAttribute("style", "color: blue");
        this.myFilters.site = "Facebook";
        this.myFilters.party = "all";
      }
      return window.scrollY > el.height;
    },
    handleScrollTwo(evt, el) {
      // console.log(evt.path[0].body.children[0].children[2].children[0].id);
      // console.log(window.scrollY + window.innerHeight - el.height);
      if (window.scrollY > el.offsetTop) {
        // el.setAttribute("style", "color: blue");
        this.myFilters.site = "Amazon";
        this.myFilters.party = "all";
      }
      return window.scrollY > el.height;
    },
    handleScrollThree(evt, el) {
      // console.log(evt.path[0].body.children[0].children[2].children[0].id);
      // console.log(window.scrollY + window.innerHeight - el.height);
      if (window.scrollY > el.offsetTop) {
        // el.setAttribute("style", "color: blue");
        this.myFilters.site = "all";
        this.myFilters.party = "third party";
      }
      return window.scrollY > el.height;
    },
    handleScrollFour(evt, el) {
      // console.log(evt.path[0].body.children[0].children[2].children[0].id);
      // console.log(window.scrollY + window.innerHeight - el.height);
      if (window.scrollY > el.offsetTop) {
        // el.setAttribute("style", "color: blue");
        this.myFilters.site = "all";
        this.myFilters.party = "all";
        this.showLabel = true;
      }
      return window.scrollY > el.height;
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
