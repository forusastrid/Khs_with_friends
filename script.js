const locations = document.querySelectorAll('.location');
const tooltip = document.getElementById('tooltip');
const warningBanner = document.getElementById('warning-banner');
const badLocationsList = document.getElementById('bad-locations-list');
const csvUpload = document.getElementById('csv-upload');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalClose = document.getElementById('modal-close');
const chartCtx = document.getElementById('chart').getContext('2d');
let chartInstance = null;

const PH_RANGE = [6.5, 8.5];
const TDS_MAX = 400;

function evaluateStatus(ph, tds) {
  if (ph < PH_RANGE[0] || ph > PH_RANGE[1] || tds > TDS_MAX) {
    return 'bad';
  } else if (
    (ph >= PH_RANGE[0] && ph <= PH_RANGE[1]) &&
    (tds <= TDS_MAX && tds > TDS_MAX * 0.75)
  ) {
    return 'average';
  } else {
    return 'good';
  }
}

function updateAllLocations() {
  let badPlaces = [];

  locations.forEach(loc => {
    const ph = parseFloat(loc.getAttribute('data-ph'));
    const tds = parseFloat(loc.getAttribute('data-tds'));
    const status = evaluateStatus(ph, tds);

    loc.classList.remove('good', 'average', 'bad');
    loc.classList.add(status);

    if (status === 'bad') badPlaces.push(loc.textContent.trim());
  });

  if (badPlaces.length > 0) {
    warningBanner.classList.remove('hidden');
    badLocationsList.textContent = `문제 위치: ${badPlaces.join(', ')}`;
  } else {
    warningBanner.classList.add('hidden');
    badLocationsList.textContent = '';
  }
}

function showTooltip(e) {
  const target = e.target;
  const ph = target.getAttribute('data-ph');
  const tds = target.getAttribute('data-tds');
  const placeName = target.textContent.trim();

  tooltip.textContent = `${placeName} | pH: ${ph} | TDS: ${tds}`;
  tooltip.style.opacity = '1';
  tooltip.style.display = 'block';

  const offsetX = 15;
  const offsetY = 15;
  let left = e.pageX + offsetX;
  let top = e.pageY + offsetY;

  const tooltipRect = tooltip.getBoundingClientRect();
  const pageWidth = window.innerWidth;
  const pageHeight = window.innerHeight;

  if (left + tooltipRect.width > pageWidth) {
    left = e.pageX - tooltipRect.width - offsetX;
  }
  if (top + tooltipRect.height > pageHeight) {
    top = e.pageY - tooltipRect.height - offsetY;
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideTooltip() {
  tooltip.style.opacity = '0';
  setTimeout(() => {
    tooltip.style.display = 'none';
  }, 200);
}

function openModal(placeName) {
  modalTitle.textContent = `${placeName} 과거 수질 변화`;

  modal.classList.remove('hidden');

  const data = pastDataExample[placeName];

  if (!data) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    chartCtx.clearRect(0, 0, 400, 250);
    chartCtx.font = "16px Arial";
    chartCtx.fillText("과거 데이터가 없습니다.", 20, 120);
  } else {
    if (chartInstance) chartInstance.destroy();

    setTimeout(() => {
      chartInstance = new Chart(chartCtx, {
        type: 'line',
        data: {
          labels: data.dates,
          datasets: [
            {
              label: 'pH',
              data: data.ph,
              borderColor: '#0066cc',
              backgroundColor: 'rgba(0,102,204,0.15)',
              yAxisID: 'y1',
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 3,
            },
            {
              label: 'TDS',
              data: data.tds,
              borderColor: '#004080',
              backgroundColor: 'rgba(0,64,128,0.15)',
              yAxisID: 'y2',
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 3,
            }
          ]
        },
        options: {
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          stacked: false,
          scales: {
            y1: {
              type: 'linear',
              position: 'left',
              title: {
                display: true,
                text: 'pH',
                color: '#0066cc',
                font: { weight: 'bold' }
              },
              min: 0,
              max: 14,
              grid: { color: 'rgba(0,102,204,0.1)' },
              ticks: { color: '#004080' }
            },
            y2: {
              type: 'linear',
              position: 'right',
              title: {
                display: true,
                text: 'TDS',
                color: '#004080',
                font: { weight: 'bold' }
              },
              min: 0,
              max: 1000,
              grid: {
                drawOnChartArea: false,
                color: 'rgba(0,64,128,0.1)'
              },
              ticks: { color: '#003366' }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#003366',
                font: { weight: 'bold' }
              }
            }
          }
        }
      });
    }, 0);
  }
}

function closeModal() {
  modal.classList.add('hidden');
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

locations.forEach(location => {
  location.addEventListener('mouseover', showTooltip);
  location.addEventListener('mousemove', showTooltip);
  location.addEventListener('mouseout', hideTooltip);

  location.addEventListener('click', (e) => {
    const placeName = e.target.textContent.trim();
    openModal(placeName);
  });
});

modalClose.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

const pastDataExample = {
  "급식실 음수대": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [6.44, 6.46, 6.45, 6.43, 6.47],
    tds: [195, 197, 198, 196, 197]
  },
  ".체육관 화장실.": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [6.8, 6.81, 6.79, 6.78, 6.8],
    tds: [196, 198, 197, 197, 197]
  },
  ".전동 음수대.": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [6.78, 6.79, 6.8, 6.79, 6.78],
    tds: [96, 97, 96, 98, 97]
  },
  ".후동 음수대.": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [6.59, 6.6, 6.6, 6.61, 6.6],
    tds: [93, 94, 94, 95, 94]
  },
  "'전동 음수대'": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [6.65, 6.66, 6.67, 6.66, 6.66],
    tds: [94, 95, 96, 95, 95]
  },
  "'후동 음수대'": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [6.6, 6.61, 6.62, 6.6, 6.61],
    tds: [193, 194, 195, 194, 194]
  },
  "전동 음수대": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [6.61, 6.62, 6.63, 6.62, 6.62],
    tds: [95, 96, 97, 96, 96]
  },
  "후동 음수대": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [6.55, 6.56, 6.57, 6.56, 6.56],
    tds: [93, 94, 94, 95, 94]
  },
  "장애인 화장실": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [6.63, 6.64, 6.65, 6.64, 6.64],
    tds: [93, 94, 95, 94, 94]
  },
  ".전동 화장실.": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [7.34, 7.35, 7.36, 7.35, 7.35],
    tds: [90, 91, 92, 91, 91]
  },
  ".중앙 화장실.": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [6.78, 6.79, 6.8, 6.79, 6.78],
    tds: [96, 97, 97, 96, 97]
  },
  ".후동 화장실.": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [7.34, 7.35, 7.36, 7.35, 7.35],
    tds: [95, 96, 97, 96, 96]
  },
  "'전동 화장실'": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [7.47, 7.48, 7.49, 7.48, 7.48],
    tds: [93, 94, 94, 95, 94]
  },
  "'중앙 화장실'": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [6.74, 6.75, 6.76, 6.75, 6.75],
    tds: [93, 94, 95, 94, 94]
  },
  "'후동 화장실'": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [8.6, 8.61, 8.62, 8.61, 8.6],
    tds: [96, 97, 98, 97, 97]
  },
  "전동 화장실": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [7.74, 7.75, 7.76, 7.75, 7.75],
    tds: [94, 95, 96, 95, 95]
  },
  "중앙 화장실": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [8.31, 8.32, 8.33, 8.32, 8.32],
    tds: [94, 95, 96, 95, 95]
  },
  "후동 화장실": {
    dates: ["2025-07-06", "2025-07-07", "2025-07-08", "2025-07-09", "2025-07-10"],
    ph: [7.67, 7.68, 7.69, 7.68, 7.68],
    tds: [152, 153, 154, 153, 153]
  }
};

updateAllLocations();

csvUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    processCSV(text);
  };
  reader.readAsText(file);
});

function processCSV(csvText) {
  const lines = csvText.trim().split('\n');
  lines.forEach(line => {
    const [locationName, floor, phStr, tdsStr] = line.split(',');
    if (!locationName || !phStr || !tdsStr) return;

    const ph = parseFloat(phStr);
    const tds = parseFloat(tdsStr);

    const locElem = [...locations].find(loc => loc.textContent.trim() === locationName);
    if (locElem) {
      locElem.setAttribute('data-ph', ph);
      locElem.setAttribute('data-tds', tds);
    }
  });
  updateAllLocations();
}
