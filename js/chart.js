function uuid() {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);   
}

function run(axis, evaluation) {

  const axisKeys = Object.keys(axis);

  const threshold = document.querySelector('#threshold').value;
  const os = ['whatsapp', 'apple'][document.querySelector('#os').value];

  const data = Object.keys(evaluation.emojis).map(k => {
    return {
      key: k,
      [axisKeys[0]]: evaluation.emojis[k][axisKeys[0]],
      [axisKeys[1]]: evaluation.emojis[k][axisKeys[1]],
      count: evaluation.emojis[k].count,
      imageUrl: `./images/${os}/${k}.png`
    }
  }).filter(emoji => emoji.count > threshold)

  const wh = window.innerHeight;
  const ww = window.innerWidth;

  var margin = { top: 0, right: 0, bottom: 50, left: 50 },
      outerWidth = Math.min(window.innerWidth - 90, 760),
      outerHeight = Math.min(window.innerWidth * 3/4, 760 * 3/4),
      width = outerWidth - margin.left - margin.right,
      height = outerHeight - margin.top - margin.bottom;

  var x = d3.scale.linear()
      .range([0, width]).nice();

  var y = d3.scale.linear()
      .range([height, 0]).nice();

  var xMax = d3.max(data, function(d) { return d[axisKeys[0]]; }) * 1.05,
      xMin = d3.min(data, function(d) { return d[axisKeys[0]]; }),
      xMin = xMin > 0 ? 0 : xMin,
      yMax = d3.max(data, function(d) { return d[axisKeys[1]]; }) * 1.05,
      yMin = d3.min(data, function(d) { return d[axisKeys[1]]; }),
      yMin = yMin > 0 ? 0 : yMin;

  x.domain([xMin, xMax]);
  y.domain([yMin, yMax]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .tickSize(-height);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .tickSize(-width);

  var color = d3.scale.category10();

  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return `
          ${axis[axisKeys[0]]}: ${d[axisKeys[0]]}<br>
          ${axis[axisKeys[1]]}: ${d[axisKeys[1]]}<br>
          count: ${d['count']}<br>
        `
        // <img src="${d.imageUrl}" width="32px" height="32px">
      });

  var zoomBeh = d3.behavior.zoom()
      .x(x)
      .y(y)
      .scaleExtent([0, 500])
      .on('zoom', zoom);

  const id = `chart`;
  const chart = document.querySelector('#chart');
  if(chart) chart.remove()
  const element = document.createElement('div');
  element.setAttribute('id', id)
  document.getElementById('chart-container').appendChild(element)

  var svg = d3.select(`#${id}`)
    .append('svg')
      .attr('width', outerWidth)
      .attr('height', outerHeight)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .call(zoomBeh);

  svg.append('rect')
      .attr('width', width)
      .attr('height', height);

  svg.append('g')
      .classed('x axis', true)
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
    .append('text')
      .classed('label', true)
      .attr('x', width)
      .attr('y', margin.bottom - 10)
      .style('text-anchor', 'end')
      .text(`${axis[axisKeys[0]]} (${axis.legend_1})`);

  svg.append('g')
      .classed('y axis', true)
      .call(yAxis)
    .append('text')
      .classed('label', true)
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text(`${axis[axisKeys[1]]} (${axis.legend_2})`);

  var objects = svg.append('svg')
      .classed('objects', true)
      .attr('width', width)
      .attr('height', height);

  objects.append('svg:line')
      .classed('axisLine hAxisLine', true)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', width)
      .attr('y2', 0)
      .attr('transform', 'translate(0,' + height + ')');

  objects.append('svg:line')
      .classed('axisLine vAxisLine', true)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', height);

  objects.selectAll('.dot')
      .data(data)
    .enter().append('circle')
      .classed('dot', true)
      // .attr('r', function (d) { return 6 * Math.sqrt(d[rCat] / Math.PI); })
      .attr('r', function (d) { return 3 })
      .attr('transform', transform)
      // .style('fill', function(d) { return color(d[colorCat]); })
      // .style('fill', function (d, i) { return 'url(#img-' + i + ')' })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)

  var images = svg.append('svg')
      .classed('images', true)
      .attr('width', width)
      .attr('height', height);

  const size = 18;

  images.selectAll('.img')
      .data(data)
    .enter().append('image')
      .classed('img', true)
      .attr('xlink:href', function(d){ return d.imageUrl })
      .attr('transform', transform)
      .attr('width', size)
      .attr('height', size)
      .attr('x', -size / 2)
      .attr('y', -size / 2)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)


  var legend = svg.selectAll('.legend')
      .data(color.domain())
    .enter().append('g')
      .classed('legend', true)
      .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

  legend.append('circle')
      .attr('r', 3.5)
      .attr('cx', width + 20)
      .attr('fill', color);

  legend.append('text')
      .attr('x', width + 26)
      .attr('dy', '.35em')
      .text(function(d) { return d; });

  svg.call(tip);

  function zoom() {
    svg.select('.x.axis').call(xAxis);
    svg.select('.y.axis').call(yAxis);

    svg.selectAll('.dot')
        .attr('transform', transform);

    svg.selectAll('.img')
        .attr('transform', transform);
  }

  function transform(d) {
    return 'translate(' + x(d[axisKeys[0]]) + ',' + y(d[axisKeys[1]]) + ')';
  }
}

async function init() {
  const emojis = await $.getJSON('./data/emojis-as-objects.json');
  const symbols = await $.getJSON('./data/symbols.json');
  const labels = await $.getJSON('./data/labels-en.json');

  const symbolsKeys = Object.keys(symbols);
  const names = symbolsKeys.map(sk => sk.split('_')[0]);

  const evaluation = { symbolsKeys, names, emojis };

  const options = labels;

  const select1 = document.querySelector('#key-1');
  const select2 = document.querySelector('#key-2');

  labels.forEach((l, i) => {
    let option = document.createElement('option');
    option.value = i;

    let option1 = option.cloneNode();
    let option2 = option.cloneNode();

    option1.innerText = l[1]
    option2.innerText = l[1]

    if(l[0] === 'IMPRESSION_MOTIVATION') option1.selected = true;
    if(l[0] === 'AGE') option2.selected = true;

    select1.appendChild(option1)
    select2.appendChild(option2)
  })

  function onChange() {
    const select1 = document.querySelector('#key-1');
    const select2 = document.querySelector('#key-2');
    const selection1 = select1.options[select1.selectedIndex].value;
    const selection2 = select2.options[select2.selectedIndex].value;
    const label1 = options[selection1][1];
    const label2 = options[selection2][1];
    const key1 = options[selection1][0];
    const key2 = options[selection2][0];

    const option = {
      [key1]: label1,
      [key2]: label2,
      legend_1: options[selection1][2],
      legend_2: options[selection2][2]
    }

    run(option, evaluation);
  }

  document.querySelector('#key-1').addEventListener('change', onChange)
  document.querySelector('#key-2').addEventListener('change', onChange)
  document.querySelector('#os').addEventListener('change', onChange)
  document.querySelector('#threshold').addEventListener('change', onChange)
  window.addEventListener('resize', onChange);

  run({
    IMPRESSION_MOTIVATION: 'Impression Motivation',
    AGE: 'Age'
  }, evaluation);
}

document.addEventListener('DOMContentLoaded', () => {
  init();
})