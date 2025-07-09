const locations = document.querySelectorAll('.location');
const tooltip = document.getElementById('tooltip');
const warningBanner = document.getElementById('warning-banner');
const badLocationsList = document.getElementById('bad-locations-list');
const csvUpload = document.getElementById('csv-upload');

// 모달 & 차트 관련
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

// 툴팁 위치와 내용 표시 함수
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

// 모달 열기 함수
function openModal(placeName) {
  modalTitle.textContent = `${placeName} 과거 수질 변화`;

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
  }
  modal.classList.remove('hidden');
}

// 모달 닫기
function closeModal() {
  modal.classList.add('hidden');
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

// 예시 과거 데이터
const pastDataExample = {
  "급식실 음수대": {
    dates: ["2025-07-01", "2025-07-02", "2025-07-03", "2025-07-04", "2025-07-05"],
    ph: [7.1, 7.0, 7.3, 7.2, 7.2],
    tds: [140, 150, 145, 148, 150]
  },
  "체육관 화장실": {
    dates: ["2025-07-01", "2025-07-02", "2025-07-03", "2025-07-04", "2025-07-05"],
    ph: [5.6, 5.7, 5.5, 5.4, 5.5],
    tds: [490, 500, 505, 495, 500]
  },
  // 필요 시 추가 가능
};

// 초기 상태 업데이트
updateAllLocations();

// CSV 업로드 (간단 구현, 실제 서버 연동 필요 시 추가 구현)
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

// CSV 데이터 처리 (위치명, 층, PH, TDS)
function processCSV(csvText) {
  const lines = csvText.trim().split('\n');
  lines.forEach(line => {
    const [locationName, floor, phStr, tdsStr] = line.split(',');
    if (!locationName || !phStr || !tdsStr) return;

    const ph = parseFloat(phStr);
    const tds = parseFloat(tdsStr);

    // 페이지 내 해당 위치 요소 찾기
    const locElem = [...locations].find(loc => loc.textContent.trim() === locationName);
    if (locElem) {
      locElem.setAttribute('data-ph', ph);
      locElem.setAttribute('data-tds', tds);
    }
  });
  updateAllLocations();
}
