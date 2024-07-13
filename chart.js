import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import * as d3 from 'd3';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataFilePath = path.resolve(__dirname, "./data.json");

export function generateCharts() {
  fs.readFile(dataFilePath, "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    try {
      const data = JSON.parse(jsonString);
      createChart(data);
      createTotalCommitChart(data);
      createTotalCommitBy6MonthChart(data);
      createContributionsBy6MonthChart(data);
      createMembersBy6MonthChart(data);
      createLanguagesChart(data);
    } catch (err) {
      console.log("Error parsing JSON string:", err);
    }
  });
}

function createChart(data) {
  const labels = ["Total Stars", "Total PRs", "Total Merged PRs", "Total Contributions"];
  const values = [data.totalStars, data.totalPRs, data.totalMergedPRs, data.totalContributions];

  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 40 };

  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
  const body = d3.select(dom.window.document).select('body');

  const svg = body.select('#container').append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('width', width)
    .attr('height', height);

  const x = d3.scaleBand()
    .domain(labels)
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(values)]).nice()
    .range([height - margin.bottom, margin.top]);

  const bar = svg.selectAll('.bar')
    .data(values)
    .join('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => x(labels[i]))
      .attr('y', d => y(d))
      .attr('height', d => y(0) - y(d))
      .attr('width', x.bandwidth())
      .attr('fill', '#249324');

  // Thêm giá trị vào từng cột
  svg.selectAll('.text')
    .data(values)
    .join('text')
      .attr('class', 'text')
      .attr('x', (d, i) => x(labels[i]) + x.bandwidth() / 2)
      .attr('y', d => y(d) - 5)
      .attr('text-anchor', 'middle')
      .style('fill', 'black')
      .style('font-size', '12px')
      .text(d => d);

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
      .attr("fill", "black");

  svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
      .attr("fill", "black");

  svg.append('text')
    .attr('x', (width / 2))
    .attr('y', margin.top)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('fill', 'black')
    .text('Total Information');

  const svgString = body.select('#container').html();
  fs.writeFileSync(path.join(__dirname, "img", "Information.svg"), svgString);
  console.log("The SVG file was created.");
}

function createTotalCommitChart(data) {
  const totalMemberCommits = data.totalMemberCommits;
  const diverseBoldColors = [
    '#B20000', '#0073A5', '#B2B200', '#B200B2', '#483D8B',
    '#CC8400', '#00008B', '#3B4B27', '#54586B', '#701C1C',
    '#249324', '#167E7E', '#FF5733', '#33FF57', '#3357FF',
    '#FF33A1', '#FFD700', '#8A2BE2', '#DC143C', '#FF8C00',
    '#32CD32', '#8B0000', '#00CED1'
  ];

  const margin = { top: 100, right: 50, bottom: 100, left: 50 };
  const fullWidth = 800; // Độ rộng toàn bộ biểu đồ
  const fullHeight = 600; // Độ cao toàn bộ biểu đồ
  const chartWidth = fullWidth - margin.left - margin.right;
  const chartHeight = fullHeight - margin.top - margin.bottom;

  // Tạo một instance JSDOM và chọn body của document
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
  const body = d3.select(dom.window.document).select('body');

  // Tạo svg element để chứa biểu đồ
  const svg = body.select('#container').append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('width', fullWidth)
    .attr('height', fullHeight);

  // Tạo group element để vẽ biểu đồ trong svg
  const chart = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Định nghĩa scale cho trục x và y
  const x = d3.scaleBand()
    .domain(Object.keys(totalMemberCommits))
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(Object.values(totalMemberCommits))])
    .nice()
    .range([chartHeight, 0]);

  // Vẽ trục x và y
  chart.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('overflow', 'visible');

  chart.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y).ticks(10));

  // Vẽ các cột biểu đồ và thêm giá trị vào mỗi cột
  chart.selectAll('.bar')
    .data(Object.entries(totalMemberCommits))
    .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d[0]))
      .attr('y', d => y(d[1]))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - y(d[1]))
      .attr('fill', (d, i) => diverseBoldColors[i % diverseBoldColors.length])
      .append('title') // Thêm title element để hiển thị tooltip
        .text(d => `${d[0]}: ${d[1]}`); // Hiển thị tên và giá trị của từng cột khi hover
        

  // Thêm tiêu đề cho biểu đồ
  chart.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', -margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('fill', 'black')
    .text('Total Commits By Members');

  // Lưu biểu đồ thành file SVG
  const svgString = body.select('#container').html();
  fs.writeFileSync(path.join(__dirname, 'img', 'TotalMembersCommit.svg'), svgString);
  console.log('The SVG file was created.');
}

function createTotalCommitBy6MonthChart(data) {
  const totalMemberCommits = data.by6month.summary;
  const diverseBoldColors = [
    '#B20000', '#0073A5', '#B2B200', '#B200B2', '#483D8B',
    '#CC8400', '#00008B', '#3B4B27', '#54586B', '#701C1C',
    '#249324', '#167E7E', '#FF5733', '#33FF57', '#3357FF',
    '#FF33A1', '#FFD700', '#8A2BE2', '#DC143C', '#FF8C00',
    '#32CD32', '#8B0000', '#00CED1'
  ];

  const margin = { top: 100, right: 50, bottom: 100, left: 50 };
  const fullWidth = 800; // Độ rộng toàn bộ biểu đồ
  const fullHeight = 600; // Độ cao toàn bộ biểu đồ
  const chartWidth = fullWidth - margin.left - margin.right;
  const chartHeight = fullHeight - margin.top - margin.bottom;

  // Tạo một instance JSDOM và chọn body của document
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
  const body = d3.select(dom.window.document).select('body');

  // Tạo svg element để chứa biểu đồ
  const svg = body.select('#container').append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('width', fullWidth)
    .attr('height', fullHeight);

  // Tạo group element để vẽ biểu đồ trong svg
  const chart = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Định nghĩa scale cho trục x và y
  const x = d3.scaleBand()
    .domain(Object.keys(totalMemberCommits))
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(Object.values(totalMemberCommits))])
    .nice()
    .range([chartHeight, 0]);

  // Vẽ trục x và y
  chart.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

  chart.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y).ticks(10));

  // Vẽ các cột biểu đồ
  chart.selectAll('.bar')
    .data(Object.entries(totalMemberCommits))
    .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d[0]))
      .attr('y', d => y(d[1]))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - y(d[1]))
      .attr('fill', (d, i) => diverseBoldColors[i % diverseBoldColors.length])
      .append('title')
        .text(d => `${d[0]}: ${d[1]}`); // Thêm title element để hiển thị tooltip

  // Thêm tiêu đề cho biểu đồ
  chart.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', -margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('fill', 'black')
    .text('Total Commits By Members (Last 6 Months)');

  const svgString = body.select('#container').html();
  fs.writeFileSync(path.join(__dirname, 'img', 'TotalMembersCommitBy6Month.svg'), svgString);
  console.log('The SVG file was created.');
}

function createContributionsBy6MonthChart(data) {
  const by6month = data.by6month;
  const months = Object.keys(by6month)
    .filter(month => month !== 'summary')
    .reverse();

  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const fullWidth = 800; // Độ rộng toàn bộ biểu đồ
  const fullHeight = 600; // Độ cao toàn bộ biểu đồ
  const chartWidth = fullWidth - margin.left - margin.right;
  const chartHeight = fullHeight - margin.top - margin.bottom;

  // Tạo một instance JSDOM và chọn body của document
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
  const body = d3.select(dom.window.document).select('body');

  // Tạo svg element để chứa biểu đồ
  const svg = body.select('#container').append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('width', fullWidth)
    .attr('height', fullHeight);

  // Tạo group element để vẽ biểu đồ trong svg
  const chart = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Định nghĩa scale cho trục x và y
  const x = d3.scaleBand()
    .domain(months)
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(months.map(month => by6month[month].total))])
    .nice()
    .range([chartHeight, 0]);

  // Vẽ lưới dọc
  chart.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y)
      .ticks(5)
      .tickSize(-chartWidth)
      .tickFormat('')
    );

  // Vẽ lưới ngang
  chart.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x)
      .tickSize(-chartHeight)
      .tickFormat('')
    );

  // Vẽ đường biểu đồ
  chart.append('path')
    .datum(months.map(month => ({ month, value: by6month[month].total })))
    .attr('fill', 'none')
    .attr('stroke', '#FF0000')
    .attr('stroke-width', 2)
    .attr('d', d3.line()
      .x(d => x(d.month) + x.bandwidth() / 2)
      .y(d => y(d.value))
      .curve(d3.curveLinear)
    );

  // Hiển thị giá trị của từng điểm dữ liệu
  chart.selectAll('.point')
    .data(months.map(month => ({ month, value: by6month[month].total })))
    .enter().append('circle')
      .attr('class', 'point')
      .attr('cx', d => x(d.month) + x.bandwidth() / 2)
      .attr('cy', d => y(d.value))
      .attr('r', 4)
      .attr('fill', '#FF0000');

  // Thêm nhãn cho các điểm dữ liệu
  chart.selectAll('.label')
    .data(months.map(month => ({ month, value: by6month[month].total })))
    .enter().append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.month) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#333')
      .text(d => d.value);

  // Vẽ trục x và y
  chart.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x));

  chart.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y).ticks(5));

  // Thêm tiêu đề cho biểu đồ
  chart.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', -margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('fill', 'black')
    .text('Total Contributions By ORG (per month for the past 6 months)');

  const svgString = body.select('#container').html();
  fs.writeFileSync(path.join(__dirname, 'img', 'TotalContributionsBy6Month.svg'), svgString);
  console.log('The SVG file was created.');
}

function createMembersBy6MonthChart(data) {
  const diverseBoldColors = [
    "#B20000", "#0073A5", "#B2B200", "#B200B2", "#483D8B",
    "#CC8400", "#00008B", "#3B4B27", "#54586B", "#701C1C",
    "#249324", "#167E7E", "#FF5733", "#33FF57", "#3357FF",
    "#FF33A1", "#FFD700", "#8A2BE2", "#DC143C", "#FF8C00",
    "#32CD32", "#8B0000", "#00CED1"
  ];

  const margin = { top: 100, right: 100, bottom: 100, left: 100 };
  const fullWidth = 800;
  const fullHeight = 600;
  const chartWidth = fullWidth - margin.left - margin.right;
  const chartHeight = fullHeight - margin.top - margin.bottom;

  // Tạo một instance JSDOM và chọn body của document
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
  const body = d3.select(dom.window.document).select('body');

  // Tạo svg element để chứa biểu đồ
  const svg = body.select('#container').append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('width', fullWidth)
    .attr('height', fullHeight);

  // Tạo group element để vẽ biểu đồ trong svg
  const chart = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Chuẩn bị dữ liệu cho biểu đồ cột xếp chồng
  const months = Object.keys(data.by6month).filter(month => month !== "summary");
  const teams = Object.keys(data.by6month[months[0]]).filter(team => team !== "total");

  const stackedData = d3.stack().keys(teams)(months.map(month => ({
    month,
    ...data.by6month[month]
  })));

  // Định nghĩa scale cho trục x và y
  const x = d3.scaleBand()
    .domain(months)
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])])
    .nice()
    .range([chartHeight, 0]);

  // Vẽ các cột biểu đồ
  chart.selectAll('.bar')
    .data(stackedData)
    .enter().append('g')
      .attr('fill', d => {
        const index = teams.indexOf(d.key);
        return diverseBoldColors[index % diverseBoldColors.length];
      })
    .selectAll('rect')
    .data(d => d)
    .enter().append('rect')
      .attr('x', d => x(d.data.month))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth());

  // Vẽ trục x và y
  chart.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

  chart.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y).ticks(10));

  // Thêm tiêu đề cho biểu đồ
  chart.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', -margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('fill', 'black')
    .text('Commits by Members (per month for the past 6 months)');

  // Thêm chú thích về màu sắc
  const legend = chart.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(0, ${chartHeight + margin.bottom / 2})`);

  const legendItems = legend.selectAll('.legend-item')
    .data(teams)
    .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(${i % 6 * 120},${Math.floor(i / 6) * 20})`);

  legendItems.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', (d, i) => diverseBoldColors[i % diverseBoldColors.length]);

  legendItems.append('text')
    .attr('x', 15)
    .attr('y', 5)
    .text(d => d)
    .style('font-size', '12px')
    .attr('alignment-baseline', 'middle');


  // Lưu biểu đồ thành file SVG
  const svgString = body.select('#container').html();
  fs.writeFileSync(path.join(__dirname, 'img', 'MemberCommitBy6Month.svg'), svgString);
  console.log('The SVG file was created.');
}

function createLanguagesChart(data) {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
  const body = d3.select(dom.window.document).select('body');

  const totalLanguages = data.totalLanguages;
  const totalLines = Object.values(totalLanguages).reduce((a, b) => a + b, 0);

  const diverseBoldColors = [
    "#B20000", "#0073A5", "#B2B200", "#B200B2", "#483D8B",
    "#CC8400", "#00008B", "#3B4B27", "#54586B", "#701C1C",
    "#249324", "#167E7E", "#FF5733", "#33FF57", "#3357FF",
    "#FF33A1", "#FFD700", "#8A2BE2", "#DC143C", "#FF8C00",
    "#32CD32", "#8B0000", "#00CED1"
  ];

  const pie = d3.pie().sort(null).value(d => d[1]);
  const arc = d3.arc().innerRadius(0).outerRadius(Math.min(300, 300) / 2 - 1);

  const svg = body.select('#container').append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('width', 800)
    .attr('height', 600)
    .append('g')
    .attr('transform', 'translate(300,200)');

  const arcs = svg.selectAll('arc')
    .data(pie(Object.entries(totalLanguages)))
    .enter().append('g')
    .attr('class', 'arc');

  arcs.append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => diverseBoldColors[i % diverseBoldColors.length]);

  const legend = svg.append('g')
    .attr('transform', `translate(200, -150)`);

  const legendItems = legend.selectAll('.legend-item')
    .data(Object.entries(totalLanguages))
    .enter().append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`);

  legendItems.append('rect')
    .attr('x', -20)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', (d, i) => diverseBoldColors[i % diverseBoldColors.length]);

  legendItems.append('text')
    .attr('x', 0)
    .attr('y', 6)
    .attr('dy', '.35em')
    .style('text-anchor', 'start')
    .text(d => `${d[0]}: ${((d[1] / totalLines) * 100).toFixed(2)}%`);

  svg.append('text')
    .attr('x', 0)
    .attr('y', -180)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('fill', 'black')
    .text('Total Languages');

  const svgString = body.select('#container').html();
  const filePath = path.join(__dirname,"img", 'TotalLanguages.svg');
  fs.writeFileSync(filePath, svgString);
  console.log(`The SVG file was created.`);
}

export default generateCharts ;
//generateCharts();
