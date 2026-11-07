import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}


function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true,
        writable: false,
        enumerable: false,
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  const container = d3.select('#commit-stats');
  container.html('');

  container.append('h2').text('Summary Stats');

  const dl = container.append('dl');

  const totalCommits = commits.length;
  const numFiles = d3.group(data, (d) => d.file).size;
  const totalLoc = data.length;
  const maxDepth = d3.max(data, (d) => d.depth);
  const longestLine = d3.max(data, (d) => d.length);

  dl.append('dt').text('COMMITS');
  dl.append('dd').text(totalCommits);

  dl.append('dt').text('FILES');
  dl.append('dd').text(numFiles);

  dl.append('dt').html('TOTAL LOC');
  dl.append('dd').text(totalLoc);

  dl.append('dt').text('MAX DEPTH');
  dl.append('dd').text(maxDepth);

  dl.append('dt').text('LONGEST LINE');
  dl.append('dd').text(longestLine)
}

let data = await loadData();
let commits = processCommits(data);
console.log(commits);
renderCommitInfo(data, commits);