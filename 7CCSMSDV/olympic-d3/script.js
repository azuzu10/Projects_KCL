``// GLOBAL
let chartMode = "trend";
let chartType = "line";

const svg = d3.select("svg");
const tooltip = d3.select("#tooltip");

// CHART DESCRIPTIONS
// Edit the text below to add your own insights for each chart.
// Each entry supports: title, text (main paragraph), points (bullet list - optional).
const descriptions = {
    trend: {
        line: {
            title: "Medal Trends Over Time — Line Chart",
            text: "This line chart tracks the total medal count won by each country across every Olympic Games. Lines reveal long-term trajectories, helping us see who is rising, declining, or staying steady over the decades.",
            points: [
                "Hover over any point to see exact medal counts for that year.",
                "Use the country buttons above to isolate specific countries.",
                "Steep upward slopes often align with major geopolitical shifts or investment in sport."
            ]
        },
        bar: {
            title: "Medal Trends Over Time — Bar Chart",
            text: "Each vertical bar represents a country's medal count in a given Olympic year. This view is ideal for comparing absolute values side-by-side rather than tracking continuous change.",
            points: [
                "Taller bars = more medals in that specific Olympics.",
                "Color-coded by country for quick visual grouping."
            ]
        },
        area: {
            title: "Medal Trends Over Time — Area Chart",
            text: "The area chart emphasises the volume of medals accumulated by each country, with shaded regions making dominance and decline immediately visible.",
            points: [
                "Larger shaded regions indicate sustained medal-winning performance.",
                "Overlapping areas highlight competitive eras between nations."
            ]
        }
    },
    host: {
        bar: {
            title: "Host Advantage — Grouped Bar Chart",
            text: "This chart compares each country's medal haul as the host nation versus their average performance as a non-host. A consistent gap suggests a measurable 'home advantage' effect.",
            points: [
                "Red bars = medals won when hosting.",
                "Teal bars = medals won at away Olympics.",
                "Larger red-to-teal gaps indicate stronger host advantages."
            ]
        },
        line: {
            title: "Host Advantage — Line Chart",
            text: "The line view connects host and non-host medal totals across countries, making it easy to spot which nations benefit most from hosting the Games.",
            points: [
                "Parallel lines suggest hosting had little impact.",
                "Widening gaps reveal meaningful home-crowd effects."
            ]
        },
        stacked: {
            title: "Host Advantage — Stacked Bar Chart",
            text: "Stacked bars combine host and non-host medals into a total per country, while still showing the proportion contributed by each. Great for seeing overall output and the host-share at a glance.",
            points: [
                "Total bar height = combined medals (host + non-host).",
                "Larger red segments indicate a stronger home performance."
            ]
        }
    },
    sport: {
        bar: {
            title: "Sport Dominance — Bar Chart",
            text: "For the selected sport, this chart ranks the top 3 countries by total medals won across all Olympic Games. Use the sport dropdown to switch between disciplines.",
            points: [
                "Helps identify which countries specialise in specific sports.",
                "Try switching between Athletics, Swimming, Boxing and others."
            ]
        },
        line: {
            title: "Sport Dominance — Line Chart",
            text: "This line chart tracks the combined medal totals of the top 5 countries across 5 key sports (Athletics, Swimming, Boxing, Wrestling, Badminton) over time.",
            points: [
                "Useful for spotting rising powers and declining dynasties.",
                "Each coloured line represents a different country."
            ]
        },
        sport_area: {
            title: "Sport Dominance — Stacked Area Chart",
            text: "The stacked area chart shows how the top 5 countries' combined medal output has grown and shifted over time, with each country contributing a coloured band.",
            points: [
                "Total height = combined medals won across selected sports.",
                "Bands expand/contract to reveal shifts in global competitiveness."
            ]
        }
    }
};

// DATA PROCESSED LOGIC — per-question explanation of how data was prepared
const dataLogic = {
    trend: "For Q1: total medal counts for countries United States, Great Britian, France and Peoples Republic of China were isolated",
    host: "For Q2: Compare medal tallies for countries during their host years vs average of non-host years",
    sport: "For Q3: We use medal tally for each sport for each country and pick the top 3 cumulatively over the period"
};

// DESCRIPTION UPDATER — creates text nodes based on current chart mode + type
function updateDescription() {
    const titleEl = document.getElementById("desc-title");
    const textEl = document.getElementById("desc-text");
    const pointsEl = document.getElementById("desc-points");
    const logicEl = document.getElementById("logic-text");

    if (!titleEl || !textEl || !pointsEl) return;

    // Clear existing text nodes
    titleEl.innerHTML = "";
    textEl.innerHTML = "";
    pointsEl.innerHTML = "";
    if (logicEl) logicEl.innerHTML = "";

    // Populate Data Processed Logic panel based on current mode
    if (logicEl && dataLogic[chartMode]) {
        logicEl.appendChild(document.createTextNode(dataLogic[chartMode]));
    }

    // Look up the right description
    const modeDescs = descriptions[chartMode] || {};
    const desc = modeDescs[chartType];

    if (!desc) return;

    // Title text node
    titleEl.appendChild(document.createTextNode(desc.title));

    // Main paragraph text node
    textEl.appendChild(document.createTextNode(desc.text));

    // Bullet point text nodes
    if (Array.isArray(desc.points)) {
        desc.points.forEach(pt => {
            const li = document.createElement("li");
            li.appendChild(document.createTextNode(pt));
            pointsEl.appendChild(li);
        });
    }
}

const margin = { top: 20, right: 100, bottom: 60, left: 60 };
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;

const color = d3.scaleOrdinal()
    .domain([
        "United States of America",
        "People’s Republic of China",
        "Great Britain",
        "France"
    ])
    .range(["blue", "red", "green", "orange"]);

//TOGGLE
function toggleCountry(country) {
    const className = country.replace(/\s/g, "");
    const elements = d3.selectAll(".country-" + className);
    const isVisible = elements.style("display") !== "none";
    elements.style("display", isVisible ? "none" : "block");
}

//SWITCH
function changeChartType() {
    chartType = document.getElementById("chartType").value;
    drawChart();
}

function sanitize(str) {
    return str.replace(/[^a-zA-Z0-9]/g, "");
}

function switchVisualization() {
    chartMode = document.getElementById("vizType").value;

    const chartDropdown = document.getElementById("chartType");
    const sportDropdown = document.getElementById("sportSelect");

    // Clear existing options
    chartDropdown.innerHTML = "";

    // Q1 → Line, Bar, Area
    if (chartMode === "trend") {
        chartDropdown.disabled = false;
        sportDropdown.style.display = "none";

        chartDropdown.innerHTML = `
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="area">Area Chart</option>
        `;
    }

    // Q2 → Bar, Line, Stacked
    else if (chartMode === "host") {
        chartDropdown.disabled = false;
        sportDropdown.style.display = "none";

        chartDropdown.innerHTML = `
            <option value="bar">Grouped Bar</option>
            <option value="line">Line Chart</option>
            <option value="stacked">Stacked Bar</option>
        `;
    }

    // Q3 → Bar, Line, Heatmap
    else if (chartMode === "sport") {
        chartDropdown.disabled = false;
        sportDropdown.style.display = "inline-block";

        chartDropdown.innerHTML = `
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="sport_area">Stacked Area Chart</option>
        `;
    }

    // Reset selected type
    chartType = chartDropdown.value;

    drawChart();
}

//MAIN
function drawChart() {

    d3.select("h2").text(
        chartMode === "trend" ? "Olympic Medal Trends" :
            chartMode === "host" ? "Host Advantage Analysis" :
                "Sport Dominance"
    );

    svg.selectAll("*").remove();

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    if (chartMode === "trend") drawTrend(g);
    else if (chartMode === "host") drawHost(g);
    else if (chartMode === "sport") drawSport(g);

    // Refresh description panel to match current chart
    updateDescription();
}

// Q1 TREND
function drawTrend(g) {

    d3.csv("data.csv").then(data => {

        data.forEach(d => {
            d.year = +d.year;
            d.medals = +d.medals;
        });

        const countries = [...new Set(data.map(d => d.country))];
        createCountryButtons(countries);

        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.medals)])
            .range([height, 0]);

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        g.append("g").call(d3.axisLeft(y));

        // X label
        g.append("text")
            .attr("x", width / 2)
            .attr("y", height + 50)
            .attr("text-anchor", "middle")
            .text("Year");

        // Y label
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .text("Medal Count");

        if (chartType === "line") {
            drawLineChart(g, data, x, y);
        }
        else if (chartType === "bar") {
            drawBarChart(g, data, x, y);
        }
        else if (chartType === "area") {
            drawAreaChart(g, data, x, y);
        }
        const legend = g.append("g")
            .attr("transform", `translate(${width - 20}, 20)`);

        color.domain().forEach((c, i) => {
            const row = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);

            row.append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", color(c));

            row.append("text")
                .attr("x", 18)
                .attr("y", 10)
                .text(c);
        });
    });
}

// Q2 HOST
function drawHost(g) {

    d3.csv("host_data.csv").then(data => {

        data.forEach(d => {
            d.Host = +d.Host;
            d.NonHost = +d.NonHost;
        });

        const countries = data.map(d => d.Country);
        createCountryButtons(countries);

        if (chartType === "bar") {
            drawHostGrouped(g, data);
        }
        else if (chartType === "line") {
            drawHostLine(g, data);
        }
        else if (chartType === "stacked") {
            drawHostStacked(g, data);
        }
    });
}

// Q3 SPORT
function drawSport(g) {

    d3.csv("sport_trend.csv").then(data => {

        data.forEach(d => {
            d.Year = +d.Year;
            d.Medals = +d.Medals;
        });

        // Dropdown populate
        const sports = [...new Set(data.map(d => d.Sport))];
        const dropdown = d3.select("#sportSelect");
        if (chartType === "bar") {
            dropdown.style("display", "inline-block");
        } else {
            dropdown.style("display", "none");
        }

        if (dropdown.selectAll("option").empty()) {
            dropdown.selectAll("option")
                .data(sports)
                .enter()
                .append("option")
                .text(d => d);
        }

        const selectedSport = dropdown.property("value") || sports[0];

        if (chartType === "bar") {
            drawSportBar(g, data, selectedSport);
        }
        else if (chartType === "line") {
            drawSportLine(g, data, selectedSport);
        }
        if (chartType === "sport_area") {
            drawSportStackedArea(g, data);
        }
    });
}

//Sport Line
function drawSportLine(g, data) {

    const allowedSports = [
        "Athletics",
        "Swimming",
        "Boxing",
        "Wrestling",
        "Badminton"
    ];

    // Step 1: Filter only selected sports
    const filtered = data.filter(d =>
        allowedSports.includes(d.Sport)
    );

    // Step 2: Get top 5 countries based on total medals
    const countryTotals = d3.rollups(
        filtered,
        v => d3.sum(v, d => d.Medals),
        d => d.Country
    ).map(([c, m]) => ({ country: c, medals: m }));

    const top5Countries = countryTotals
        .sort((a, b) => b.medals - a.medals)
        .slice(0, 5)
        .map(d => d.country);

    // Step 3: Filter data for top 5 countries
    const filteredTop = filtered.filter(d =>
        top5Countries.includes(d.Country)
    );

    const colorScale = d3.scaleOrdinal()
        .domain(top5Countries)
        .range([
            "#1f77b4",  
            "#ff7f0e",  
            "#2ca02c",  
            "#d62728",  
            "#9467bd"   
        ]);

    // Step 4: Aggregate (Year + Country SUM)
    const aggregated = d3.rollups(
        filteredTop,
        v => d3.sum(v, d => d.Medals),
        d => d.Year,
        d => d.Country
    ).flatMap(([year, countries]) =>
        countries.map(([country, medals]) => ({
            Year: +year,
            Country: country,
            Medals: medals
        }))
    );

    createCountryButtons(top5Countries);

    // Scales
    const x = d3.scaleLinear()
        .domain(d3.extent(aggregated, d => d.Year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(aggregated, d => d.Medals)])
        .nice()
        .range([height, 0]);

    // Axes
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    g.append("g")
        .call(d3.axisLeft(y));

    // Axis labels
    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Year");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Total Medals (5 Sports)");

    // Group by country
    const grouped = d3.group(aggregated, d => d.Country);

    const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.Medals));

    // Draw lines + dots
    grouped.forEach((values, key) => {

        values.sort((a, b) => a.Year - b.Year);

        // Line
        g.append("path")
            .datum(values)
            .attr("class", "country-" + key.replace(/\s/g, ""))
            .attr("fill", "none")
            .attr("stroke", colorScale(key))
            .attr("stroke-width", 2)
            .attr("d", line);

        // Dots
        g.selectAll(".dot-" + key)
            .data(values)
            .enter()
            .append("circle")
            .attr("class", d => "country-" + d.Country.replace(/\s/g, ""))
            .attr("cx", d => x(d.Year))
            .attr("cy", d => y(d.Medals))
            .attr("r", 3)
            .attr("fill", colorScale(key))
            .on("mouseover", function (event, d) {
                d3.select(this).attr("r", 6);

                tooltip.style("display", "block")
                    .html(`<b>${key}</b><br>Year: ${d.Year}<br>Total Medals: ${d.Medals}`);
            })
            .on("mousemove", function (event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("r", 3);
                tooltip.style("display", "none");
            });
    });

    // Legend
    const legend = g.append("g")
        .attr("transform", `translate(${width + 20}, 20)`);

    // use same color scale used in lines
    top5Countries.forEach((c, i) => {

        const row = legend.append("g")
            .attr("transform", `translate(0, ${i * 18})`);

        row.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", colorScale(c));

        row.append("text")
            .attr("x", 15)
            .attr("y", 9)
            .text(c)
            .style("font-size", "10px");
    });
}


//Sports Stacked Area
function drawSportStackedArea(g, data) {

    const allowedSports = [
        "Athletics",
        "Swimming",
        "Boxing",
        "Wrestling",
        "Badminton"
    ];

    // Step 1: filter sports
    const filtered = data.filter(d =>
        allowedSports.includes(d.Sport)
    );

    // Step 2: get top 5 countries
    const countryTotals = d3.rollups(
        filtered,
        v => d3.sum(v, d => d.Medals),
        d => d.Country
    ).map(([c, m]) => ({ country: c, medals: m }));

    const top5 = countryTotals
        .sort((a, b) => b.medals - a.medals)
        .slice(0, 5)
        .map(d => d.country);

    createCountryButtons(top5);

    // Step 3: aggregate Year + Country
    const aggregated = d3.rollups(
        filtered.filter(d => top5.includes(d.Country)),
        v => d3.sum(v, d => d.Medals),
        d => d.Year,
        d => d.Country
    );

    // Step 4: reshape into stacked format
    const years = aggregated.map(d => d[0]).sort((a, b) => a - b);

    const stackedData = years.map(year => {
        const obj = { Year: +year };
        const countries = aggregated.find(d => d[0] === year)[1];

        top5.forEach(c => {
            const found = countries.find(d => d[0] === c);
            obj[c] = found ? found[1] : 0;
        });

        return obj;
    });

    // Step 5: color scale
    const colorScale = d3.scaleOrdinal()
        .domain(top5)
        .range(d3.schemeTableau10);

    // Step 6: stack generator
    const stack = d3.stack().keys(top5);
    const series = stack(stackedData);

    // Step 7: scales
    const x = d3.scaleLinear()
        .domain(d3.extent(stackedData, d => d.Year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(series[series.length - 1], d => d[1])])
        .nice()
        .range([height, 0]);

    // axes
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    g.append("g")
        .call(d3.axisLeft(y));

    // labels
    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Year");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Total Medals");

    // Step 8: area generator
    const area = d3.area()
        .x(d => x(d.data.Year))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    // draw areas
    g.selectAll("path.area")
        .data(series)
        .enter()
        .append("path")
        .attr("class", d => "country-" + sanitize(d.key))
        .attr("fill", d => colorScale(d.key))
        .attr("d", area)
        .attr("opacity", 0.85)
        .on("mouseover", function (event, d) {
            tooltip.style("display", "block")
                .html(`<b>${d.key}</b>`);
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        });

    // legend
    const legend = g.append("g")
        .attr("transform", `translate(${width + 20}, 20)`);

    top5.forEach((c, i) => {
        const row = legend.append("g")
            .attr("transform", `translate(0, ${i * 18})`);

        row.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", colorScale(c));

        row.append("text")
            .attr("x", 15)
            .attr("y", 9)
            .text(c)
            .style("font-size", "10px");
    });
}

//Sport Bar
function drawSportBar(g, data, selectedSport) {

    const filtered = data.filter(d => d.Sport === selectedSport);

    const countryTotals = d3.rollups(
        filtered,
        v => d3.sum(v, d => d.Medals),
        d => d.Country
    ).map(([country, medals]) => ({ country, medals }));

    const top3 = countryTotals
        .sort((a, b) => b.medals - a.medals)
        .slice(0, 3);

    createCountryButtons(top3.map(d => d.country));

    const x = d3.scaleBand()
        .domain(top3.map(d => d.country))
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(top3, d => d.medals)])
        .range([height, 0]);

    // Axis
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append("g").call(d3.axisLeft(y));

    // Bars
    g.selectAll("rect")
        .data(top3)
        .enter()
        .append("rect")
        .attr("class", d => "country-" + d.country.replace(/\s/g, ""))
        .attr("x", d => x(d.country))
        .attr("y", d => y(d.medals))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.medals))
        .attr("fill", "orange")
        .on("mouseover", function (event, d) {
            tooltip.style("display", "block")
                .html(`<b>${d.country}</b><br>Medals: ${d.medals}`);
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        });

    // Labels
    g.selectAll(".value")
        .data(top3)
        .enter()
        .append("text")
        .attr("x", d => x(d.country) + x.bandwidth() / 2)
        .attr("y", d => y(d.medals) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.medals);
}


//LINE
function drawLineChart(g, data, x, y) {
    const grouped = d3.group(data, d => d.country);

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.medals));

    grouped.forEach((values, key) => {
        const className = key.replace(/\s/g, "");

        g.append("path")
            .datum(values)
            .attr("class", "country-" + className)
            .attr("fill", "none")
            .attr("stroke", color(key))
            .attr("stroke-width", 2)
            .attr("d", line);

        g.selectAll(".dot-" + className)
            .data(values)
            .enter()
            .append("circle")
            .attr("class", "country-" + className)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.medals))
            .attr("r", 4)
            .attr("fill", color(key))
            .on("mouseover", function (event, d) {
                tooltip.style("display", "block")
                    .html(`<b>${key}</b><br>Year: ${d.year}<br>Medals: ${d.medals}`);
            })
            .on("mousemove", function (event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("display", "none");
            });
    });
}

// BAR
function drawBarChart(g, data, x, y) {
    g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", d => "country-" + d.country.replace(/\s/g, ""))
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.medals))
        .attr("width", 5)
        .attr("height", d => height - y(d.medals))
        .attr("fill", d => color(d.country))
        .on("mouseover", function (event, d) {
            tooltip.style("display", "block")
                .html(`<b>${d.country}</b><br>Year: ${d.year}<br>Medals: ${d.medals}`);
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        });
}

// AREA
function drawAreaChart(g, data, x, y) {

    const grouped = d3.group(data, d => d.country);

    const area = d3.area()
        .x(d => x(d.year))
        .y0(height)
        .y1(d => y(d.medals))
        .curve(d3.curveMonotoneX);

    grouped.forEach((values, key) => {

        const className = key.replace(/\s/g, "");

        // Area
        g.append("path")
            .datum(values)
            .attr("class", "country-" + className)
            .attr("fill", color(key))
            .attr("opacity", 0.2)
            .attr("d", area);

        // Line on top (for clarity)
        g.append("path")
            .datum(values)
            .attr("class", "country-" + className)
            .attr("fill", "none")
            .attr("stroke", color(key))
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(d => x(d.year))
                .y(d => y(d.medals))
            );

        // Dots with tooltip
        g.selectAll(".dot-area-" + className)
            .data(values)
            .enter()
            .append("circle")
            .attr("class", "country-" + className)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.medals))
            .attr("r", 3)
            .attr("fill", color(key))
            .on("mouseover", function (event, d) {
                tooltip.style("display", "block")
                    .html(`<b>${key}</b><br>Year: ${d.year}<br>Medals: ${d.medals}`);
            })
            .on("mousemove", function (event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("display", "none");
            });
    });
}

// LineQ2
function drawHostLine(g, data) {

    const x = d3.scalePoint()
        .domain(data.map(d => d.Country))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.Host, d.NonHost))])
        .range([height, 0]);

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    g.append("g").call(d3.axisLeft(y));

    const series = [
        { key: "Host", color: "#ff6b6b" },
        { key: "NonHost", color: "#4ecdc4" }
    ];

    const legend = g.append("g")
        .attr("transform", `translate(${width + 20}, 20)`);

    [
        { key: "Host", color: "#ff6b6b" },
        { key: "NonHost", color: "#4ecdc4" }
    ].forEach((d, i) => {

        const row = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        row.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", d.color);

        row.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(d.key);
    });

    const line = d3.line()
        .x(d => x(d.Country))
        .y(d => y(d.value));

    series.forEach(s => {

        const values = data.map(d => ({
            Country: d.Country,
            value: d[s.key]
        }));

        g.append("path")
            .datum(values)
            .attr("fill", "none")
            .attr("stroke", s.color)
            .attr("stroke-width", 2)
            .attr("d", line);

        // X label
        g.append("text")
            .attr("x", width / 2)
            .attr("y", height + 80)
            .attr("text-anchor", "middle")
            .text("Countries");

        // Y label
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .text("Medal Count");

        g.selectAll(".dot-" + s.key)
            .data(values)
            .enter()
            .append("circle")
            .attr("class", d => "country-" + d.Country.replace(/\s/g, ""))
            .attr("cx", d => x(d.Country))
            .attr("cy", d => y(d.value))
            .attr("r", 4)
            .attr("fill", s.color)
            .on("mouseover", function (event, d) {
                tooltip.style("display", "block")
                    .html(`<b>${d.Country}</b><br>${s.key}: ${d.value}`);
            })
            .on("mousemove", function (event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("display", "none");
            });
    });
}

//LineStackBar
function drawHostStacked(g, data) {

    const keys = ["NonHost", "Host"];

    const x = d3.scaleBand()
        .domain(data.map(d => d.Country))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Host + d.NonHost)])
        .range([height, 0]);

    const stack = d3.stack().keys(keys);
    const stackedData = stack(data);

    const color = {
        Host: "#ff6b6b",
        NonHost: "#4ecdc4"
    };

    const legend = g.append("g")
        .attr("transform", `translate(${width + 20}, 20)`);

    [
        { key: "Host", color: "#ff6b6b" },
        { key: "NonHost", color: "#4ecdc4" }
    ].forEach((d, i) => {

        const row = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        row.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", d.color);

        row.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(d.key);
    });

    // Axis
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    g.append("g").call(d3.axisLeft(y));

    // X label
    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 80)
        .attr("text-anchor", "middle")
        .text("Countries");

    // Y label
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Medal Count");

    g.selectAll("g.layer")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("fill", d => color[d.key])
        .selectAll("rect")
        .data(d => d.map(v => ({ ...v, key: d.key })))
        .enter()
        .append("rect")
        .attr("class", d => "country-" + d.data.Country.replace(/\s/g, ""))
        .attr("x", d => x(d.data.Country))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", function (event, d) {
            const value = d.data[d.key];

            tooltip.style("display", "block")
                .html(`<b>${d.data.Country}</b><br>${d.key}: ${value}`);
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        });
}


//LineGroupped
function drawHostGrouped(g, data) {

    const x0 = d3.scaleBand()
        .domain(data.map(d => d.Country))
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(["Host", "NonHost"])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.Host, d.NonHost))])
        .range([height, 0]);

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-0.6em")
        .attr("dy", "0.1em");

    g.append("g").call(d3.axisLeft(y));

    // labels
    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 80)
        .attr("text-anchor", "middle")
        .text("Countries");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Medal Count");

    g.selectAll("g.bar-group")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d.Country)},0)`)
        .selectAll("rect")
        .data(d => [
            { key: "Host", value: d.Host, country: d.Country },
            { key: "NonHost", value: d.NonHost, country: d.Country }
        ])
        .enter()
        .append("rect")
        .attr("class", d => "country-" + d.country.replace(/\s/g, ""))
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => d.key === "Host" ? "#ff6b6b" : "#4ecdc4")
        .on("mouseover", function (event, d) {
            tooltip.style("display", "block")
                .html(`<b>${d.country}</b><br>${d.key}: ${d.value}`);
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        });

    // legend
    const legend = g.append("g")
        .attr("transform", `translate(${width - 120}, 10)`);

    ["Host", "NonHost"].forEach((key, i) => {
        const row = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        row.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", key === "Host" ? "#ff6b6b" : "#4ecdc4");

        row.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(key);
    });
}


//BUTTONS
function createCountryButtons(countries) {
    const container = d3.select("#buttons");
    container.html("");

    countries.forEach(country => {
        container.append("button")
            .text(country)
            .on("click", () => toggleCountry(country));
    });
}

//START
drawChart();