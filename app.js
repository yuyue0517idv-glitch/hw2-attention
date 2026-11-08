'use strict';

const PROJECT = '39X7E3';
const LAB = /attention-lab/.test(location.host)
  ? location.origin
  : 'https://attention-lab-production.up.railway.app';
const PARAMS = new URLSearchParams(location.search);
const IS_TEST = PARAMS.get('test') === '1';
const OFFLINE = PARAMS.get('offline') === '1';
const BASE_EXPERIMENTS = ['map_ar', 'graph_3d', 'ui_blindness'];
const FOCUS_EXPERIMENTS = (PARAMS.get('experiment') || '').split(',').map(function (value) { return value.trim(); }).filter(function (value) { return BASE_EXPERIMENTS.indexOf(value) >= 0; });
const GRAPH_CONDITIONS = ['area', 'volume'];
const GRAPH_FORMAL_PER_CONDITION = 10;
const MAP_CONDITIONS = ['no_landmark', 'landmark'];
const MAP_FORMAL_PER_CONDITION = 12;
const UI_ACTUAL_RED = 12;

const EXPERIMENT_INFO = {
  map_ar: {
    number: 1,
    title: '校园地图寻路',
    subtitle: '有明显地标 vs 无明显地标',
    duration: '约 4–6 分钟',
    tagline: '根据前方建筑与北向上校园地图，判断前往目标建筑时应怎样转向。',
    condition: 'landmark_vs_no_landmark',
    source: 'Aretz (1991); Levine (1982)'
  },
  graph_3d: {
    number: 2,
    title: '面积与体积比例',
    subtitle: '二维圆形 vs 三维圆球',
    duration: '约 6–8 分钟',
    tagline: '比较两个圆形或两个圆球，判断较小者占较大者面积的百分比，或较小者占较大者体积的百分比。',
    condition: 'area_vs_volume',
    source: 'Cleveland & McGill (1984); Hollands & Dyre (2000)'
  },
  ui_blindness: {
    number: 3,
    title: '界面非注意盲视',
    subtitle: '集中计数与意外刺激',
    duration: '约 1–2 分钟',
    tagline: '默数动态界面中出现的红色警告窗口，并在结束后报告数量。',
    condition: 'single_trial',
    source: 'Simons & Chabris (1999)'
  }
};

const STUDY_ANALYSIS = {
  n: 7,
  dataLabel: '课程后台导出 CSV · 7 名匿名被试 · 315 个正式试次',
  map: {
    noLandmarkAccuracy: 98.810,
    landmarkAccuracy: 95.238,
    accuracyDiff: -3.571,
    accuracySD: 6.557,
    accuracyDz: -0.545,
    noLandmarkRT: 3293.810,
    landmarkRT: 3501.476,
    rtDiffNoMinusLandmark: -207.667,
    rtSD: 535.909,
    rtDz: -0.388
  },
  graph: {
    areaError: 10.557,
    volumeError: 9.657,
    errorDiffVolumeMinusArea: -0.900,
    errorSD: 5.872,
    errorDz: -0.153,
    areaAccuracy: 98.571,
    volumeAccuracy: 100.000,
    areaEstimatePass: 61.429,
    volumeEstimatePass: 64.286
  },
  ui: {
    seen: 5,
    missed: 2,
    detectionRate: 71.429,
    nonattentionRate: 28.571,
    meanAbsCountError: 0.143,
    countCorrect: 6
  }
};

function pairedCohenDz(meanDifference, pairedSD) {
  if (!Number.isFinite(Number(meanDifference)) || !Number.isFinite(Number(pairedSD)) || Number(pairedSD) === 0) {
    return null;
  }
  return Number(meanDifference) / Number(pairedSD);
}

function signedValue(value, digits, suffix) {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  const rounded = Number(Number(value).toFixed(digits == null ? 3 : digits));
  return (rounded > 0 ? '+' : '') + rounded + (suffix || '');
}

function studyAnalysisHtml() {
  const mapAccDz = pairedCohenDz(STUDY_ANALYSIS.map.accuracyDiff, STUDY_ANALYSIS.map.accuracySD);
  const mapRtDz = pairedCohenDz(STUDY_ANALYSIS.map.rtDiffNoMinusLandmark, STUDY_ANALYSIS.map.rtSD);
  const graphErrDz = pairedCohenDz(STUDY_ANALYSIS.graph.errorDiffVolumeMinusArea, STUDY_ANALYSIS.graph.errorSD);
  return '<div class="section-head">' +
      '<div><p class="eyebrow">提交版分析快照</p><h2>效应量与预测对照</h2></div>' +
      '<span class="status-badge ok">n = ' + STUDY_ANALYSIS.n + '</span>' +
    '</div>' +
    '<p class="result-sub">' + escapeHtml(STUDY_ANALYSIS.dataLabel) + '。正式分析只纳入 practice = 0 的试次。</p>' +
    '<div class="aggregate-panel analysis-table-wrap">' +
      '<div class="aggregate-head"><h3>配对效应量</h3><span class="status-badge">Cohen\'s d_z</span></div>' +
      '<table class="aggregate-table">' +
        '<thead><tr><th>实验与指标</th><th>条件 A</th><th>条件 B</th><th>配对差</th><th>配对差 SD</th><th>Cohen\'s d_z</th></tr></thead>' +
        '<tbody>' +
          '<tr><td>校园地图 · 正确率</td><td>无地标 ' + STUDY_ANALYSIS.map.noLandmarkAccuracy.toFixed(3) + '%</td><td>有地标 ' + STUDY_ANALYSIS.map.landmarkAccuracy.toFixed(3) + '%</td><td>有 − 无 = ' + signedValue(STUDY_ANALYSIS.map.accuracyDiff, 3, ' pp') + '</td><td>' + STUDY_ANALYSIS.map.accuracySD.toFixed(3) + '</td><td>' + signedValue(mapAccDz, 3) + '</td></tr>' +
          '<tr><td>校园地图 · 反应时</td><td>无地标 ' + STUDY_ANALYSIS.map.noLandmarkRT.toFixed(3) + ' ms</td><td>有地标 ' + STUDY_ANALYSIS.map.landmarkRT.toFixed(3) + ' ms</td><td>无 − 有 = ' + signedValue(STUDY_ANALYSIS.map.rtDiffNoMinusLandmark, 3, ' ms') + '</td><td>' + STUDY_ANALYSIS.map.rtSD.toFixed(3) + '</td><td>' + signedValue(mapRtDz, 3) + '</td></tr>' +
          '<tr><td>面积体积 · 绝对误差</td><td>面积 ' + STUDY_ANALYSIS.graph.areaError.toFixed(3) + ' pp</td><td>体积 ' + STUDY_ANALYSIS.graph.volumeError.toFixed(3) + ' pp</td><td>体积 − 面积 = ' + signedValue(STUDY_ANALYSIS.graph.errorDiffVolumeMinusArea, 3, ' pp') + '</td><td>' + STUDY_ANALYSIS.graph.errorSD.toFixed(3) + '</td><td>' + signedValue(graphErrDz, 3) + '</td></tr>' +
        '</tbody>' +
      '</table>' +
      '<p class="result-note">Cohen\'s d_z = 配对差均值 / 配对差标准差（ddof = 1）。n = 7，只作描述性解释，不进行显著性推断。</p>' +
    '</div>' +
    '<div class="aggregate-panel analysis-table-wrap">' +
      '<div class="aggregate-head"><h3>与原文及收数前预测的对照</h3><span class="status-badge warn">探索性结果</span></div>' +
      '<table class="aggregate-table comparison-table">' +
        '<thead><tr><th>实验</th><th>收数前预测 / 原研究方向</th><th>本次实测</th><th>结论</th></tr></thead>' +
        '<tbody>' +
          '<tr><td>校园地图<br><span class="muted">Aretz (1991); Levine (1982)</span></td><td>明显地标应提供额外空间参照，提高方向判断正确率并缩短反应时。</td><td>无地标 98.810%、3293.810 ms；有地标 95.238%、3501.476 ms。正确率差 −3.571 pp（d_z = −0.545），反应时差 −207.667 ms（d_z = −0.388）。</td><td>未支持预测；有地标略慢、正确率略低，但正确率接近天花板，不能据此否定理论。</td></tr>' +
          '<tr><td>面积与体积<br><span class="muted">Cleveland &amp; McGill (1984); Hollands &amp; Dyre (2000)</span></td><td>二维面积编码应比三维体积编码更准确、比例估计误差更小。</td><td>误差：面积 10.557 pp、体积 9.657 pp；正确率：面积 98.571%、体积 100%；误差差 −0.900 pp（d_z = −0.153）。</td><td>未支持预测；方向相反但效应量很小，存在明显天花板效应。</td></tr>' +
          '<tr><td>界面非注意盲视<br><span class="muted">Simons &amp; Chabris (1999)</span></td><td>集中计数时，部分被试会漏报高显著、非任务相关的意外刺激。</td><td>5/7 报告看到巨型鼠标，2/7 未报告；非注意盲视率 28.571%；平均绝对计数误差 0.143 个。</td><td>方向与原研究一致，但检测率偏高；刺激大、移动慢、对比强且样本小。</td></tr>' +
        '</tbody>' +
      '</table>' +
      '<p class="result-note">原研究提供方向性参照，本任务改变刺激、试次和比例范围，因此不能把本次效应量直接等同于原论文数值。</p>' +
    '</div>';
}

let state = {
  participant: '',
  handedness: 'right',
  order: [],
  currentIndex: 0,
  results: {},
  uploads: {},
  sessionId: ''
};

const $ = function (id) { return document.getElementById(id); };
const app = $('app');
const topbar = $('topbar');
const topbarStatus = $('topbarStatus');
const siteFooter = $('siteFooter');
const toastEl = $('toast');
const backupDialog = $('backupDialog');

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

function sample(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function mean(values) {
  const clean = values.filter(function (value) {
    return typeof value === 'number' && Number.isFinite(value);
  });
  return clean.length ? clean.reduce(function (sum, value) { return sum + value; }, 0) / clean.length : null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits) {
  if (value == null || !Number.isFinite(value)) return null;
  const power = Math.pow(10, digits == null ? 1 : digits);
  return Math.round(value * power) / power;
}

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

function apiExperiment(baseName) {
  return IS_TEST ? 'test_' + baseName : baseName;
}

function showToast(message, duration) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () {
    toastEl.classList.remove('show');
  }, duration || 2600);
}

function setDocumentMode(isStage) {
  document.body.classList.toggle('stage-mode', Boolean(isStage));
  topbar.hidden = Boolean(isStage);
  siteFooter.hidden = Boolean(isStage);
  app.classList.toggle('stage-main', Boolean(isStage));
  if (isStage) {
    topbarStatus.textContent = '实验进行中';
  }
}

function stageChrome(title, progress, bodyHtml) {
  setDocumentMode(true);
  app.innerHTML =
    '<div class="stage-shell">' +
      '<div class="stage-bar">' +
        '<strong>' + escapeHtml(title) + '</strong>' +
        '<div class="stage-progress" aria-label="实验进度"><span style="width:' + Math.max(0, Math.min(100, progress)) + '%"></span></div>' +
      '</div>' +
      '<div class="stage-body">' + bodyHtml + '</div>' +
    '</div>';
}

function updateStageBar(label, progress) {
  const bar = app.querySelector('.stage-bar strong');
  const fill = app.querySelector('.stage-progress span');
  if (bar) bar.textContent = label;
  if (fill) fill.style.width = Math.max(0, Math.min(100, progress)) + '%';
}

function updateChromeStatus(text) {
  topbarStatus.textContent = text;
}

function renderStart() {
  setDocumentMode(false);
  updateChromeStatus(IS_TEST ? '测试模式' : '准备开始');
  const modeNotice = IS_TEST || OFFLINE
    ? '<div class="notice">当前为测试模式' + (OFFLINE ? '，且不连接服务器' : '：上传时实验名会自动加上 test_ 前缀') + '。正式收数请使用不带 test=1 或 offline=1 的网址。</div>'
    : '';
  app.innerHTML =
    '<section class="start-grid">' +
      '<div>' +
        '<p class="eyebrow">Attention Lab / 工程心理学作业二</p>' +
        '<h1>注意如何落在显示、空间与界面上</h1>' +
        '<p class="lede">三个短实验分别观察校园地图中的地标、二维图形中的面积与体积判断，以及动态界面中的红色警告计数。测试模式可以选择任一实验单独运行。</p>' +
        modeNotice +
        '<div class="experiment-list" aria-label="实验列表">' +
          '<div class="experiment-row">' +
            '<span class="experiment-number">01</span>' +
            '<div><h3>校园地图寻路</h3><p>根据前方建筑和北向上地图判断转向，比较有、无明显地标</p></div>' +
            '<span class="experiment-time">约 5 分钟</span>' +
          '</div>' +
          '<div class="experiment-row">' +
            '<span class="experiment-number">02</span>' +
            '<div><h3>面积与体积比例</h3><p>比较两个圆形或两个圆球，估计面积比例或体积比例</p></div>' +
            '<span class="experiment-time">约 7 分钟</span>' +
          '</div>' +
          '<div class="experiment-row">' +
            '<span class="experiment-number">03</span>' +
            '<div><h3>界面非注意盲视</h3><p>在动态软件界面中默数红色警告窗口</p></div>' +
            '<span class="experiment-time">约 1 分钟</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<form class="form-panel" id="startForm" novalidate>' +
        '<p class="eyebrow">开始前</p>' +
        '<h2>知情同意与匿名编号</h2>' +
        '<div class="consent-copy">' +
          '<p>本任务用于课程实验，只记录匿名编号、反应、判断和浏览器基本信息。页面不会要求姓名、学号、电话或任何可识别身份的信息。</p>' +
          '<p>参与自愿。你可以随时关闭页面停止；已提交的数据由课程注意实验室收集。请尽量在安静环境、桌面端 Chrome 或 Edge 中完成。</p>' +
        '</div>' +
        '<div class="field">' +
          '<label for="participantId">匿名编号</label>' +
          '<input id="participantId" maxlength="40" autocomplete="off" placeholder="例如 P001 或 07" required>' +
          '<p class="field-help">同一个编号只在本次完整流程中使用。不要填写真实姓名。</p>' +
        '</div>' +
        '<div class="field">' +
          '<label for="handedness">利手</label>' +
          '<select id="handedness">' +
            '<option value="right">右利手</option>' +
            '<option value="left">左利手</option>' +
            '<option value="ambidextrous">双手同利</option>' +
          '</select>' +
        '</div>' +
        '<label class="check-row">' +
          '<input type="checkbox" id="consentCheck">' +
          '<span>我已阅读上述说明，理解本任务会收集匿名实验数据，并同意参加。</span>' +
        '</label>' +
        '<button class="button wide" type="submit">进入实验</button>' +
        '<p class="microcopy">项目码 ' + PROJECT + ' · 数据提交至注意实验室。若上传失败，页面会提供本地 CSV/JSON 备份。</p>' +
      '</form>' +
    '</section>';
  $('startForm').addEventListener('submit', handleStartSubmit);
}

function handleStartSubmit(event) {
  event.preventDefault();
  const participant = $('participantId').value.trim();
  const consent = $('consentCheck').checked;
  if (!participant) {
    showToast('请先填写匿名编号');
    $('participantId').focus();
    return;
  }
  if (participant.length > 40) {
    showToast('匿名编号请控制在 40 个字符以内');
    return;
  }
  if (!consent) {
    showToast('请先勾选知情同意');
    return;
  }
  state.participant = participant;
  state.handedness = $('handedness').value;
  state.order = FOCUS_EXPERIMENTS.length ? FOCUS_EXPERIMENTS.slice() : BASE_EXPERIMENTS.slice();
  state.currentIndex = 0;
  state.results = {};
  state.uploads = {};
  state.sessionId = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  updateChromeStatus('编号 ' + participant + ' · 准备实验');
  if ((IS_TEST || OFFLINE) && !FOCUS_EXPERIMENTS.length) {
    renderTestPicker();
  } else {
    continueSession();
  }
}

function renderTestPicker() {
  setDocumentMode(false);
  updateChromeStatus('测试模式 · 选择实验');
  const completed = BASE_EXPERIMENTS.filter(function (name) { return Boolean(state.results[name]); }).length;
  app.innerHTML =
    '<section>' +
      '<p class="eyebrow">测试模式 / 实验选择</p>' +
      '<h1>选择要单独测试的实验</h1>' +
      '<p class="lede">测试不会进入正式收数。当前编号为 ' + escapeHtml(state.participant) + '，每完成一个实验后都会返回此页。</p>' +
      '<div class="test-picker">' +
        BASE_EXPERIMENTS.map(function (baseName) {
          const info = EXPERIMENT_INFO[baseName];
          const done = Boolean(state.results[baseName]);
          return '<article class="test-choice">' +
            '<span class="experiment-number">0' + info.number + '</span>' +
            '<div><h3>' + info.title + '</h3><p>' + info.subtitle + ' · ' + info.duration + '</p>' +
              (done ? '<p class="microcopy">本次测试已产生数据，可重新运行并在结果中覆盖。</p>' : '') +
            '</div>' +
            '<button class="button" data-test-experiment="' + baseName + '">' + (done ? '重新测试' : '单独测试') + '</button>' +
          '</article>';
        }).join('') +
      '</div>' +
      '<div class="action-row">' +
        (completed ? '<button class="button dark" id="viewTestResults">查看本次测试结果</button>' : '') +
        '<button class="button secondary" id="testBackup">数据备份</button>' +
      '</div>' +
    '</section>';
  app.querySelectorAll('[data-test-experiment]').forEach(function (button) {
    button.addEventListener('click', function () {
      state.order = [button.getAttribute('data-test-experiment')];
      state.currentIndex = 0;
      renderExperimentIntro();
    });
  });
  if ($('viewTestResults')) $('viewTestResults').addEventListener('click', renderResults);
  $('testBackup').addEventListener('click', openBackupDialog);
}

function instructionHtml(baseName) {
  const info = EXPERIMENT_INFO[baseName];
  const details = baseName === 'map_ar'
    ? '<ol>' +
        '<li>先看“前方”是什么建筑，这就是你当前行进的方向。</li>' +
        '<li>再看北向上的校园地图，找到目标建筑的位置。</li>' +
        '<li>判断相对当前前进方向，接下来应左转、直行、右转还是掉头。</li>' +
      '</ol>' +
      '<p>地图中的红色三角形表示一个明显地标。部分试次有该地标，部分试次没有。请尽快、准确地判断。</p>'
    : baseName === 'graph_3d'
      ? '<ol>' +
          '<li>屏幕中出现两个圆形，或两个圆球，分别标为 A 和 B。</li>' +
          '<li>先点击你认为较小的图形。</li>' +
          '<li>随后立即出现 0–100 滑块。面积条件估计“小圆面积 / 大圆面积”，体积条件估计“小球体积 / 大球体积”。</li>' +
          '<li>拖动滑块到你的估计值并确认。</li>' +
        '</ol>' +
        '<p>请依靠快速视觉判断，不要用尺子、手指或心算测量。所选目标不会高亮。</p>'
      : '<ol>' +
          '<li>注视模拟软件界面，默数出现的红色警告窗口。</li>' +
          '<li>动画结束后报告数量，不要按其他键或做笔记。</li>' +
          '<li>动画结束后输入你数到的红色警告窗口数量。</li>' +
        '</ol>' +
        '<p>先完成一段短练习，熟悉“只看、只数”的规则。</p>';
  return '<section class="instruction-layout">' +
    '<div class="instruction-copy">' +
      '<p class="eyebrow">实验 ' + info.number + '</p>' +
      '<h1>' + info.title + '</h1>' +
      '<p class="lede">' + info.tagline + '</p>' +
      details +
      '<div class="action-row">' +
        '<button class="button" id="beginExperiment">开始练习</button>' +
        '<button class="button secondary" id="backupButton">数据备份</button>' +
      '</div>' +
    '</div>' +
    '<aside class="condition-summary">' +
      '<p class="eyebrow">实验信息</p>' +
      '<dl>' +
        '<dt>研究条件</dt><dd>' + info.subtitle + '</dd>' +
        '<dt>预计用时</dt><dd>' + info.duration + '</dd>' +
        '<dt>理论来源</dt><dd>' + info.source + '</dd>' +
      '</dl>' +
    '</aside>' +
  '</section>';
}

function renderExperimentIntro() {
  const baseName = state.order[state.currentIndex];
  const info = EXPERIMENT_INFO[baseName];
  setDocumentMode(false);
  updateChromeStatus('实验 ' + info.number + ' · ' + info.title);
  app.innerHTML = instructionHtml(baseName);
  $('beginExperiment').addEventListener('click', function () {
    runExperiment(baseName);
  });
  $('backupButton').addEventListener('click', openBackupDialog);
}

async function continueSession() {
  if (state.currentIndex >= state.order.length) {
    renderResults();
    return;
  }
  renderExperimentIntro();
}

async function runExperiment(baseName) {
  try {
    let trials = [];
    if (baseName === 'graph_3d') {
      trials = await runGraphExperiment();
    } else if (baseName === 'map_ar') {
      trials = await runMapExperiment();
    } else {
      trials = await runUiExperiment();
    }
    state.results[baseName] = trials;
    await completeExperiment(baseName, trials);
  } catch (error) {
    console.error(error);
    setDocumentMode(false);
    app.innerHTML = '<section class="center-stage compact">' +
      '<p class="eyebrow">实验中断</p>' +
      '<h1>页面遇到错误</h1>' +
      '<p>' + escapeHtml(error && error.message ? error.message : '未知错误') + '</p>' +
      '<div class="action-row">' +
        '<button class="button" id="retrySession">返回当前实验</button>' +
        '<button class="button secondary" id="backupButton">数据备份</button>' +
      '</div>' +
    '</section>';
    $('retrySession').addEventListener('click', renderExperimentIntro);
    $('backupButton').addEventListener('click', openBackupDialog);
  }
}

async function completeExperiment(baseName, trials) {
  const info = EXPERIMENT_INFO[baseName];
  const code = apiExperiment(baseName);
  stageChrome(info.title, 100,
    '<section class="center-stage compact transition-stage">' +
      '<p class="eyebrow">实验完成</p>' +
      '<h2>正在提交匿名数据</h2>' +
      '<p id="submitStatus">请稍候，不要关闭页面。</p>' +
      '<div class="empty-space"></div>' +
    '</section>'
  );
  const meta = {
    session_id: state.sessionId,
    order_index: state.currentIndex + 1,
    order: state.order.join('>'),
    handedness: state.handedness,
    test_mode: IS_TEST,
    ua: navigator.userAgent.slice(0, 160),
    viewport: String(innerWidth) + 'x' + String(innerHeight),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  };
  let uploadResult = null;
  let uploadError = null;
  try {
    if (OFFLINE) {
      uploadResult = { ok: true, offline: true, warnings: [] };
      uploadError = null;
    } else {
      uploadResult = await uploadWithRetry(state.participant, code, trials, info.condition, meta, 2);
    }
    state.uploads[baseName] = { ok: true, offline: OFFLINE, result: uploadResult, code: code };
  } catch (error) {
    uploadError = error;
    state.uploads[baseName] = { ok: false, error: error.message, code: code };
  }
  const testPickerMode = (IS_TEST || OFFLINE) && !FOCUS_EXPERIMENTS.length;
  const nextLabel = testPickerMode
    ? '返回实验选择'
    : (state.currentIndex + 1 < state.order.length ? '进入下一实验' : '查看实验结果');
  const statusHtml = uploadResult
    ? '<p class="eyebrow" style="color:var(--green)">' + (OFFLINE ? '离线测试' : '上传成功') + '</p>' +
      '<h2>本段数据已保留</h2>' +
      '<p>' + (OFFLINE ? '离线测试未连接服务器，请下载本地备份核对。' : escapeHtml(code) + ' 已提交。' + (uploadResult.warnings && uploadResult.warnings.length ? ' 后台提示：' + escapeHtml(uploadResult.warnings.join('；')) : '')) + '</p>'
    : '<p class="eyebrow" style="color:var(--orange)">上传失败</p>' +
      '<h2>请保留本地备份</h2>' +
      '<p>数据仍在当前页面中，但尚未上传。错误：' + escapeHtml(uploadError && uploadError.message ? uploadError.message : '网络错误') + '</p>';
  stageChrome(info.title, 100,
    '<section class="center-stage compact transition-stage">' +
      statusHtml +
      '<div class="action-row" style="justify-content:center">' +
        (uploadResult ? '' : '<button class="button secondary" id="backupNow">下载本次数据</button>') +
        '<button class="button" id="continueFlow">' + nextLabel + '</button>' +
      '</div>' +
    '</section>'
  );
  if (!uploadResult) $('backupNow').addEventListener('click', openBackupDialog);
  $('continueFlow').addEventListener('click', function () {
    if (testPickerMode) {
      renderTestPicker();
      return;
    }
    state.currentIndex += 1;
    continueSession();
  });
}

async function uploadWithRetry(participant, experiment, trials, condition, meta, attempts) {
  let lastError = null;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await submitData(participant, experiment, trials, condition, meta);
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) await sleep(900);
    }
  }
  throw lastError || new Error('上传失败');
}

function makeGraphTrials(practice) {
  const ratios = practice
    ? [0.52, 0.43]
    : [0.18, 0.23, 0.29, 0.36, 0.44, 0.52, 0.61, 0.70, 0.77, 0.83];
  const trials = [];
  shuffle(GRAPH_CONDITIONS).forEach(function (conditionId, conditionIndex) {
    const conditionRatios = practice ? [ratios[conditionIndex]] : shuffle(ratios);
    const reps = practice ? 1 : GRAPH_FORMAL_PER_CONDITION;
    for (let i = 0; i < reps; i += 1) {
      const ratio = conditionRatios[i % conditionRatios.length];
      trials.push({
        condition_id: conditionId,
        shape: conditionId === 'area' ? 'circle' : 'sphere',
        practice: practice ? 1 : 0,
        true_percent: round(ratio * 100, 1),
        ratio: ratio,
        A_is_smaller: Math.random() < 0.5 ? 1 : 0,
        size_seed: Math.random(),
        trial_index: i + 1
      });
    }
  });
  return shuffle(trials);
}

function graphShapeSizes(trial) {
  const largeRadius = 104 + trial.size_seed * 18;
  const exponent = trial.condition_id === 'area' ? 0.5 : 1 / 3;
  const smallRadius = largeRadius * Math.pow(trial.ratio, exponent);
  return {
    radiusA: trial.A_is_smaller ? smallRadius : largeRadius,
    radiusB: trial.A_is_smaller ? largeRadius : smallRadius
  };
}

function graphStimulus(trial) {
  const sizes = graphShapeSizes(trial);
  const y = 228;
  if (trial.condition_id === 'area') {
    return '<svg viewBox="0 0 720 460" role="img" aria-label="两个不同面积的圆形">' +
      '<circle cx="222" cy="' + y + '" r="' + sizes.radiusA.toFixed(2) + '" fill="#27332e" stroke="#17211d" stroke-width="2"></circle>' +
      '<circle cx="502" cy="' + y + '" r="' + sizes.radiusB.toFixed(2) + '" fill="#27332e" stroke="#17211d" stroke-width="2"></circle>' +
      '<text x="222" y="398" text-anchor="middle" font-size="24" font-weight="700" fill="#17211d">A</text>' +
      '<text x="502" y="398" text-anchor="middle" font-size="24" font-weight="700" fill="#17211d">B</text>' +
    '</svg>';
  }
  return '<svg viewBox="0 0 720 460" role="img" aria-label="两个不同体积的圆球">' +
    '<defs>' +
      '<radialGradient id="sphereShade" cx="35%" cy="28%" r="72%">' +
        '<stop offset="0%" stop-color="#adb9b3"></stop>' +
        '<stop offset="32%" stop-color="#66756e"></stop>' +
        '<stop offset="72%" stop-color="#25322d"></stop>' +
        '<stop offset="100%" stop-color="#111a16"></stop>' +
      '</radialGradient>' +
    '</defs>' +
    '<ellipse cx="222" cy="354" rx="' + (sizes.radiusA * .72).toFixed(2) + '" ry="14" fill="#cfd3cf"></ellipse>' +
    '<ellipse cx="502" cy="354" rx="' + (sizes.radiusB * .72).toFixed(2) + '" ry="14" fill="#cfd3cf"></ellipse>' +
    '<circle cx="222" cy="' + y + '" r="' + sizes.radiusA.toFixed(2) + '" fill="url(#sphereShade)" stroke="#111a16" stroke-width="2"></circle>' +
    '<circle cx="502" cy="' + y + '" r="' + sizes.radiusB.toFixed(2) + '" fill="url(#sphereShade)" stroke="#111a16" stroke-width="2"></circle>' +
    '<ellipse cx="' + (222 - sizes.radiusA * .32) + '" cy="' + (y - sizes.radiusA * .34) + '" rx="' + (sizes.radiusA * .16) + '" ry="' + (sizes.radiusA * .1) + '" fill="#f6f8f7" opacity=".3"></ellipse>' +
    '<ellipse cx="' + (502 - sizes.radiusB * .32) + '" cy="' + (y - sizes.radiusB * .34) + '" rx="' + (sizes.radiusB * .16) + '" ry="' + (sizes.radiusB * .1) + '" fill="#f6f8f7" opacity=".3"></ellipse>' +
    '<text x="222" y="398" text-anchor="middle" font-size="24" font-weight="700" fill="#17211d">A</text>' +
    '<text x="502" y="398" text-anchor="middle" font-size="24" font-weight="700" fill="#17211d">B</text>' +
  '</svg>';
}

async function runGraphExperiment() {
  stageChrome('面积与体积比例', 0,
    '<section class="center-stage compact transition-stage">' +
      '<p class="eyebrow">练习阶段</p>' +
      '<h2>熟悉圆形与圆球判断</h2>' +
      '<p>练习共 2 个试次：一个面积条件和一个体积条件，每个条件一次。</p>' +
      '<button class="button" id="startGraphPractice">开始练习</button>' +
    '</section>'
  );
  await new Promise(function (resolve) {
    $('startGraphPractice').addEventListener('click', resolve, { once: true });
  });
  const practiceTrials = makeGraphTrials(true);
  const practiceResults = [];
  for (let i = 0; i < practiceTrials.length; i += 1) {
    practiceResults.push(await runGraphTrial(practiceTrials[i], i, practiceTrials.length, 5 + i * 10));
  }
  stageChrome('面积与体积比例', 22,
    '<section class="center-stage compact transition-stage">' +
      '<p class="eyebrow">STOP</p>' +
      '<h2>练习结束</h2>' +
      '<p>正式阶段共 20 个试次：10 个圆形面积试次和 10 个圆球体积试次。两种条件随机穿插，不提供逐题反馈。</p>' +
      '<button class="button" id="startGraphFormal">开始正式实验</button>' +
    '</section>'
  );
  await new Promise(function (resolve) {
    $('startGraphFormal').addEventListener('click', resolve, { once: true });
  });
  const formalTrials = makeGraphTrials(false);
  const formalResults = [];
  for (let i = 0; i < formalTrials.length; i += 1) {
    formalResults.push(await runGraphTrial(formalTrials[i], i, formalTrials.length, 22 + (i + 1) / formalTrials.length * 78));
  }
  return practiceResults.concat(formalResults);
}

async function runGraphTrial(trial, index, total, progress) {
  const prompt = trial.condition_id === 'area' ? '请判断：哪一个圆形较小？' : '请判断：哪一个圆球较小？';
  stageChrome('面积与体积比例', progress,
    '<section class="graph-stage">' +
      '<div class="graph-prompt" id="graphPrompt">' + prompt + '</div>' +
      '<div class="graph-canvas">' + graphStimulus(trial) + '</div>' +
      '<div class="graph-answer" id="graphAnswer">' +
        '<div class="choice-grid">' +
          '<button class="choice-button" data-choice="A">A 较小</button>' +
          '<button class="choice-button" data-choice="B">B 较小</button>' +
        '</div>' +
      '</div>' +
    '</section>'
  );
  await new Promise(function (resolve) { requestAnimationFrame(function () { requestAnimationFrame(resolve); }); });
  const startTime = performance.now();
  const choice = await new Promise(function (resolve) {
    app.querySelectorAll('[data-choice]').forEach(function (button) {
      button.addEventListener('click', function () { resolve(button.getAttribute('data-choice')); }, { once: true });
    });
  });
  const choiceRt = performance.now() - startTime;
  $('graphPrompt').textContent = trial.condition_id === 'area'
    ? '较小圆形的面积是较大圆形的百分之多少？'
    : '较小圆球的体积是较大圆球的百分之多少？';
  $('graphAnswer').innerHTML =
    '<div class="slider-panel">' +
      '<input id="graphSlider" type="range" min="0" max="100" step="1" value="50" aria-label="估计百分比">' +
      '<output class="percent-readout" id="percentReadout">—</output>' +
      '<button class="button" id="confirmEstimate" disabled>确认</button>' +
    '</div>';
  let touched = false;
  const slider = $('graphSlider');
  const readout = $('percentReadout');
  const confirm = $('confirmEstimate');
  slider.addEventListener('input', function () {
    touched = true;
    readout.textContent = slider.value + '%';
    confirm.disabled = false;
  });
  await new Promise(function (resolve) {
    confirm.addEventListener('click', function () {
      if (touched) resolve(Number(slider.value));
    });
  });
  const totalRt = performance.now() - startTime;
  const judged = Number(slider.value);
  const smallerCorrect = (choice === 'A') === Boolean(trial.A_is_smaller) ? 1 : 0;
  if (Number(trial.practice) === 1) {
    $('graphPrompt').textContent = '练习反馈';
    $('graphAnswer').innerHTML =
      '<div class="practice-feedback">' +
        '<p style="font-size:22px;font-weight:800;color:' + (smallerCorrect ? 'var(--green)' : 'var(--orange)') + '">' + (smallerCorrect ? '✓ 较小图形判断正确' : '✗ 较小图形应为 ' + (trial.A_is_smaller ? 'A' : 'B')) + '</p>' +
        '<p>实际比例：<strong>' + round(Number(trial.true_percent), 1) + '%</strong>　你的估计：<strong>' + judged + '%</strong></p>' +
        '<p class="microcopy">估计误差：' + round(Math.abs(judged - Number(trial.true_percent)), 1) + ' 个百分点</p>' +
        '<button class="button" id="graphPracticeNext">继续</button>' +
      '</div>';
    await new Promise(function (resolve) { $('graphPracticeNext').addEventListener('click', resolve, { once: true }); });
  } else {
    app.innerHTML = '<div class="stage-body" style="color:#e8eee9;font-size:18px">下一图形</div>';
    await sleep(250);
  }
  return {
    condition_id: trial.condition_id,
    shape: trial.shape,
    practice: trial.practice,
    true_percent: trial.true_percent,
    A_is_smaller: trial.A_is_smaller,
    response_smaller: choice,
    smaller_correct: smallerCorrect,
    judged_percent: judged,
    estimate_within_10pp: Math.abs(judged - Number(trial.true_percent)) <= 10 ? 1 : 0,
    choice_rt_ms: Math.round(choiceRt),
    total_rt_ms: Math.round(totalRt),
    trial_index: index + 1
  };
}

const TURN_LABELS = { left: '左转', straight: '直行', right: '右转', u_turn: '掉头' };

const CAMPUS_BUILDINGS = [
  { id: 'library', name: '图书馆' },
  { id: 'teaching', name: '教学楼' },
  { id: 'gym', name: '体育馆' },
  { id: 'dining', name: '食堂' }
];

function buildingAtBearing(bearing) {
  const index = normalizeAngle(bearing) === 0 ? 0 : normalizeAngle(bearing) === 90 ? 1 : normalizeAngle(bearing) === 180 ? 2 : 3;
  return CAMPUS_BUILDINGS[index];
}

function makeMapTrials() {
  const directions = ['straight', 'right', 'left', 'u_turn'];
  const deltaByTurn = { straight: 0, right: 90, left: 270, u_turn: 180 };
  const practice = [];
  MAP_CONDITIONS.forEach(function (conditionId, index) {
    const heading = index === 0 ? 90 : 0;
    const turn = index === 0 ? 'right' : 'right';
    const destinationBearing = normalizeAngle(heading + deltaByTurn[turn]);
    const landmarkSide = conditionId === 'landmark' ? 'left' : '';
    const landmarkBearing = conditionId === 'landmark' ? normalizeAngle(heading - 45) : null;
    practice.push({
      condition_id: conditionId,
      landmark_present: conditionId === 'landmark' ? 1 : 0,
      landmark_side: landmarkSide,
      current_heading_deg: heading,
      destination_bearing_deg: destinationBearing,
      current_ahead_building: buildingAtBearing(heading).name,
      destination_building: buildingAtBearing(destinationBearing).name,
      left_building: buildingAtBearing(heading - 90).name,
      right_building: buildingAtBearing(heading + 90).name,
      landmark_bearing_deg: landmarkBearing,
      correct_turn: turn,
      practice: 1,
      trial_index: index + 1
    });
  });
  const formal = [];
  MAP_CONDITIONS.forEach(function (conditionId) {
    const balancedTurns = shuffle(directions.concat(directions, directions));
    balancedTurns.forEach(function (turn, index) {
      const heading = sample([0, 90, 180, 270]);
      const destinationBearing = normalizeAngle(heading + deltaByTurn[turn]);
      const landmarkSide = conditionId === 'landmark' ? (index % 2 === 0 ? 'left' : 'right') : '';
      const landmarkBearing = conditionId === 'landmark'
        ? normalizeAngle(heading + (landmarkSide === 'left' ? -45 : 45))
        : null;
      formal.push({
        condition_id: conditionId,
        landmark_present: conditionId === 'landmark' ? 1 : 0,
        landmark_side: landmarkSide,
        current_heading_deg: heading,
        destination_bearing_deg: destinationBearing,
        current_ahead_building: buildingAtBearing(heading).name,
        destination_building: buildingAtBearing(destinationBearing).name,
        left_building: buildingAtBearing(heading - 90).name,
        right_building: buildingAtBearing(heading + 90).name,
        landmark_bearing_deg: landmarkBearing,
        correct_turn: turn,
        practice: 0,
        trial_index: index + 1
      });
    });
  });
  return { practice: practice, formal: shuffle(formal) };
}

function campusPosition(bearing) {
  if (bearing === 0) return { x: 300, y: 108 };
  if (bearing === 90) return { x: 492, y: 300 };
  if (bearing === 180) return { x: 300, y: 492 };
  return { x: 108, y: 300 };
}

function campusPointAtBearing(bearing, radius) {
  const radians = (normalizeAngle(bearing) - 90) * Math.PI / 180;
  return { x: 300 + Math.cos(radians) * radius, y: 300 + Math.sin(radians) * radius };
}

function forwardBuilding(x, y, width, height, name, scale) {
  const roofLift = 34 * scale;
  return '<g>' +
    '<rect x="' + x + '" y="' + y + '" width="' + width + '" height="' + height + '" fill="#e7e4d9" stroke="#25312d" stroke-width="3"></rect>' +
    '<polygon points="' + (x - 14 * scale) + ',' + y + ' ' + (x + width / 2) + ',' + (y - roofLift) + ' ' + (x + width + 14 * scale) + ',' + y + '" fill="#6d7f77" stroke="#25312d" stroke-width="3"></polygon>' +
    '<rect x="' + (x + width / 2 - 11 * scale) + '" y="' + (y + height * .5) + '" width="' + (22 * scale) + '" height="' + (height * .5) + '" fill="#53635c"></rect>' +
    '<g fill="#c8d2cd"><rect x="' + (x + width * .16) + '" y="' + (y + height * .2) + '" width="' + (18 * scale) + '" height="' + (16 * scale) + '"></rect><rect x="' + (x + width * .72) + '" y="' + (y + height * .2) + '" width="' + (18 * scale) + '" height="' + (16 * scale) + '"></rect></g>' +
    '<text x="' + (x + width / 2) + '" y="' + (y + height + 27) + '" text-anchor="middle" font-size="' + (16 * scale) + '" font-weight="700" fill="#17211d">' + escapeHtml(name) + '</text>' +
  '</g>';
}

function forwardCampusSvg(trial) {
  const landmarkX = trial.landmark_side === 'left' ? 255 : 465;
  const landmark = trial.landmark_present
    ? '<path d="M ' + landmarkX + ' 118 L ' + (landmarkX + 22) + ' 156 L ' + (landmarkX - 22) + ' 156 Z" fill="#c93e3e" stroke="#fff" stroke-width="4"></path>'
    : '';
  return '<svg viewBox="0 0 720 340" role="img" aria-label="当前前方：' + escapeHtml(trial.current_ahead_building) + '">' +
    '<rect width="720" height="340" fill="#dbe9ed"></rect>' +
    '<rect y="205" width="720" height="135" fill="#c7c5ac"></rect>' +
    '<path d="M 272 340 L 332 202 L 388 202 L 448 340 Z" fill="#7f8f87"></path>' +
    '<path d="M 354 340 L 360 202 M 366 340 L 360 202" stroke="#f1f0dc" stroke-width="4"></path>' +
    forwardBuilding(280, 82, 160, 124, trial.current_ahead_building, 1) +
    landmark +
  '</svg>';
}

function campusMapSvg(trial) {
  const cards = [0, 90, 180, 270].map(function (bearing) {
    const building = buildingAtBearing(bearing);
    const point = campusPosition(bearing);
    return '<g>' +
      '<rect x="' + (point.x - 34) + '" y="' + (point.y - 26) + '" width="68" height="52" rx="5" fill="#f4f3ed" stroke="#34413b" stroke-width="2"></rect>' +
      '<polygon points="' + (point.x - 40) + ',' + (point.y - 26) + ' ' + point.x + ',' + (point.y - 47) + ' ' + (point.x + 40) + ',' + (point.y - 26) + '" fill="#718078" stroke="#34413b" stroke-width="2"></polygon>' +
      '<text x="' + point.x + '" y="' + (point.y + 7) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#17211d">' + building.name + '</text>' +
    '</g>';
  }).join('');
  let landmark = '';
  if (trial.landmark_present) {
    const point = campusPointAtBearing(trial.landmark_bearing_deg, 198);
    landmark = '<path d="M ' + point.x + ' ' + (point.y - 19) + ' L ' + (point.x + 21) + ' ' + (point.y + 17) + ' L ' + (point.x - 21) + ' ' + (point.y + 17) + ' Z" fill="#c93e3e" stroke="#fff" stroke-width="3"></path>';
  }
  return '<svg viewBox="0 0 600 600" role="img" aria-label="北向上的二维校园地图">' +
    '<rect width="600" height="600" fill="#e4e6df"></rect>' +
    '<g opacity=".55" stroke="#aab3ad" stroke-width="2"><path d="M0 160 H600 M0 300 H600 M0 440 H600 M160 0 V600 M300 0 V600 M440 0 V600"></path></g>' +
    '<circle cx="300" cy="300" r="118" fill="#f1efe3" stroke="#b2b9b3" stroke-width="2"></circle>' +
    '<path d="M300 182 V418 M182 300 H418" stroke="#9ca8a1" stroke-width="28"></path>' +
    '<circle cx="300" cy="300" r="18" fill="#1f6a5a" stroke="#fff" stroke-width="4"></circle>' +
    '<circle cx="300" cy="300" r="4" fill="#fff"></circle>' +
    cards + landmark +
    '<text x="300" y="28" text-anchor="middle" font-size="16" font-weight="700" fill="#17211d">北</text>' +
    '<text x="574" y="304" text-anchor="middle" font-size="16" font-weight="700" fill="#17211d">东</text>' +
    '<text x="300" y="586" text-anchor="middle" font-size="16" font-weight="700" fill="#17211d">南</text>' +
    '<text x="26" y="304" text-anchor="middle" font-size="16" font-weight="700" fill="#17211d">西</text>' +
    '<g transform="translate(34 42)"><path d="M 0 24 L 14 0 L 28 24 L 14 18 Z" fill="#17211d"></path></g>' +
    '<text x="574" y="582" text-anchor="end" font-size="13" fill="#52615a">校园平面图 · 上方为北</text>' +
  '</svg>';
}

async function runMapExperiment() {
  stageChrome('校园地图寻路', 0,
    '<section class="center-stage compact transition-stage">' +
      '<p class="eyebrow">练习阶段</p>' +
      '<h2>看清前方，再对照地图</h2>' +
      '<p>练习共 2 个试次，分别包含有明显地标和无明显地标的地图。请先看前方建筑，再判断应怎样转向。</p>' +
      '<button class="button" id="startMapPractice">开始练习</button>' +
    '</section>'
  );
  await new Promise(function (resolve) { $('startMapPractice').addEventListener('click', resolve, { once: true }); });
  const mapTrials = makeMapTrials();
  const practiceResults = [];
  for (let i = 0; i < mapTrials.practice.length; i += 1) {
    practiceResults.push(await runCampusMapTrial(mapTrials.practice[i], 8 + i * 8));
  }
  stageChrome('校园地图寻路', 24,
    '<section class="center-stage compact transition-stage">' +
      '<p class="eyebrow">STOP</p>' +
      '<h2>练习结束</h2>' +
      '<p>正式阶段共 24 个试次：12 个有明显地标，12 个无明显地标。请尽快、准确作答。</p>' +
      '<button class="button" id="startMapFormal">开始正式实验</button>' +
    '</section>'
  );
  await new Promise(function (resolve) { $('startMapFormal').addEventListener('click', resolve, { once: true }); });
  const formalResults = [];
  for (let i = 0; i < mapTrials.formal.length; i += 1) {
    formalResults.push(await runCampusMapTrial(mapTrials.formal[i], 24 + (i + 1) / mapTrials.formal.length * 76));
  }
  return practiceResults.concat(formalResults);
}

async function runCampusMapTrial(trial, progress) {
  stageChrome('校园地图寻路', Math.max(0, progress - 4),
    '<section class="campus-forward-stage">' +
      '<p class="eyebrow">先看前方</p>' +
      '<h2>你正朝' + escapeHtml(trial.current_ahead_building) + '前进</h2>' +
      '<div class="campus-forward">' + forwardCampusSvg(trial) + '</div>' +
      '<button class="button" id="showCampusMap">查看地图</button>' +
    '</section>'
  );
  const forwardViewStart = performance.now();
  await new Promise(function (resolve) {
    $('showCampusMap').addEventListener('click', resolve, { once: true });
  });
  const forwardViewMs = performance.now() - forwardViewStart;

  stageChrome('校园地图寻路', progress,
    '<section class="campus-map-layout">' +
      '<div class="campus-map-wrap" id="campusMap">' + campusMapSvg(trial) + '</div>' +
      '<div class="campus-question" id="campusQuestion">' +
        '<p>你准备前往：<strong>' + escapeHtml(trial.destination_building) + '</strong></p>' +
        '<div class="direction-grid">' +
          '<button class="turn-button" data-map-turn="left">← 左转</button>' +
          '<button class="turn-button" data-map-turn="straight">↑ 直行</button>' +
          '<button class="turn-button" data-map-turn="right">右转 →</button>' +
          '<button class="turn-button" data-map-turn="u_turn">↓ 掉头</button>' +
        '</div>' +
      '</div>' +
    '</section>'
  );
  await new Promise(function (resolve) { requestAnimationFrame(function () { requestAnimationFrame(resolve); }); });
  const startTime = performance.now();
  const response = await new Promise(function (resolve) {
    let done = false;
    const finish = function (value) {
      if (done) return;
      done = true;
      app.removeEventListener('click', clickHandler);
      window.removeEventListener('keydown', keyHandler);
      resolve(value);
    };
    const clickHandler = function (event) {
      const button = event.target.closest('[data-map-turn]');
      if (button) finish(button.getAttribute('data-map-turn'));
    };
    const keyHandler = function (event) {
      if (event.code === 'ArrowLeft') finish('left');
      if (event.code === 'ArrowUp') finish('straight');
      if (event.code === 'ArrowRight') finish('right');
      if (event.code === 'ArrowDown') finish('u_turn');
    };
    app.addEventListener('click', clickHandler);
    window.addEventListener('keydown', keyHandler);
  });
  const rt = performance.now() - startTime;
  const correct = response === trial.correct_turn ? 1 : 0;
  if (Number(trial.practice) === 1) {
    $('campusQuestion').innerHTML =
      '<p class="eyebrow">练习反馈</p>' +
      '<h2 style="font-size:30px;color:' + (correct ? 'var(--green)' : 'var(--orange)') + '">' + (correct ? '✓ 判断正确' : '✗ 判断错误') + '</h2>' +
      '<p>正确方向：<strong>' + TURN_LABELS[trial.correct_turn] + '</strong></p>' +
      '<p>你的选择：<strong>' + TURN_LABELS[response] + '</strong></p>' +
      '<button class="button" id="mapPracticeNext">继续</button>';
    await new Promise(function (resolve) { $('mapPracticeNext').addEventListener('click', resolve, { once: true }); });
  } else {
    app.innerHTML = '<div class="stage-body" style="color:#e8eee9;font-size:18px">下一地图</div>';
    await sleep(220);
  }
  return {
    condition_id: trial.condition_id,
    landmark_present: trial.landmark_present,
    landmark_side: trial.landmark_side,
    practice: trial.practice,
    current_ahead_building: trial.current_ahead_building,
    destination_building: trial.destination_building,
    left_building: trial.left_building,
    right_building: trial.right_building,
    current_heading_deg: trial.current_heading_deg,
    destination_bearing_deg: trial.destination_bearing_deg,
    landmark_bearing_deg: trial.landmark_bearing_deg,
    correct_turn: trial.correct_turn,
    response_turn: response,
    correct: correct,
    rt_ms: Math.round(rt),
    forward_view_ms: Math.round(forwardViewMs),
    trial_index: trial.trial_index
  };
}

const POPUP_POSITIONS = [
  { left: '18%', top: '12%' },
  { left: '43%', top: '10%' },
  { left: '67%', top: '16%' },
  { left: '55%', top: '39%' },
  { left: '24%', top: '38%' },
  { left: '70%', top: '53%' },
  { left: '40%', top: '61%' },
  { left: '16%', top: '67%' },
  { left: '60%', top: '72%' }
];

function popupSchedule(isPractice) {
  const templates = {
    warning: [
      { title: '警告', body: '服务响应超时' },
      { title: '警告', body: '连接被重置' },
      { title: '警告', body: '任务执行失败' },
      { title: '警告', body: '存储空间不足' },
      { title: '警告', body: '权限验证失败' },
      { title: '警告', body: '服务暂时不可用' }
    ],
    info: [
      { title: '同步完成', body: '12 个文件已更新' },
      { title: '新消息', body: '项目成员更新了说明' },
      { title: '同步完成', body: '设置已更新' },
      { title: '自动更新', body: '组件已安装' },
      { title: '同步完成', body: '所有更改已保存' }
    ],
    neutral: [
      { title: '系统提示', body: '自动保存已开启' },
      { title: '后台完成', body: '缓存已经清理' },
      { title: '系统提示', body: '网络质量良好' },
      { title: '后台完成', body: '日志已归档' },
      { title: '系统提示', body: '任务队列为空' }
    ]
  };
  const redIndices = isPractice ? [1, 3, 6] : [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56];
  const total = isPractice ? 9 : 65;
  const intervalMs = isPractice ? 600 : 450;
  const firstDelayMs = isPractice ? 350 : 300;
  const items = [];
  let redCounter = 0;
  let infoCounter = 0;
  let neutralCounter = 0;
  for (let index = 0; index < total; index += 1) {
    const isRed = redIndices.indexOf(index) >= 0;
    const type = isRed ? 'warning' : (index % 2 === 0 ? 'info' : 'neutral');
    const pool = templates[type];
    const content = type === 'warning'
      ? pool[redCounter++ % pool.length]
      : (type === 'info' ? pool[infoCounter++ % pool.length] : pool[neutralCounter++ % pool.length]);
    items.push({
      time: firstDelayMs + index * intervalMs,
      life: isPractice ? 1700 : 3000,
      type: type,
      title: content.title,
      body: content.body,
      position: POPUP_POSITIONS[index % POPUP_POSITIONS.length]
    });
  }
  return {
    items: items,
    redCount: redIndices.length,
    intervalMs: intervalMs,
    popupCount: total
  };
}

function popupHtml(item, id) {
  return '<div class="popup ' + item.type + '" id="' + id + '" style="left:' + item.position.left + ';top:' + item.position.top + '">' +
    '<small>Workspace notification</small>' +
    '<strong>' + item.title + '</strong>' +
    '<small>' + item.body + '</small>' +
  '</div>';
}

async function runUiExperiment() {
  stageChrome('界面非注意盲视', 0,
    '<section class="center-stage compact transition-stage">' +
      '<p class="eyebrow">练习阶段</p>' +
      '<h2>只看，只数</h2>' +
      '<p>练习持续约 6 秒。请默数红色警告窗口，不要点击或记录。结束后输入你数到的数量。</p>' +
      '<button class="button" id="startUiPractice">开始练习</button>' +
    '</section>'
  );
  await new Promise(function (resolve) {
    $('startUiPractice').addEventListener('click', resolve, { once: true });
  });
  const practiceResult = await runUiTrial(true, 0);
  stageChrome('界面非注意盲视', 35,
    '<section class="center-stage compact transition-stage">' +
      '<p class="eyebrow">STOP</p>' +
      '<h2>正式阶段</h2>' +
      '<p>接下来持续约 30 秒。请始终注视软件界面并默数红色警告窗口。动画结束后请按真实体验回答。</p>' +
      '<button class="button" id="startUiFormal">开始正式实验</button>' +
    '</section>'
  );
  await new Promise(function (resolve) {
    $('startUiFormal').addEventListener('click', resolve, { once: true });
  });
  const formalResult = await runUiTrial(false, 1);
  return [practiceResult, formalResult];
}

async function runUiTrial(isPractice, trialIndex) {
  const duration = isPractice ? 6000 : 30000;
  const schedule = popupSchedule(isPractice);
  stageChrome('界面非注意盲视', isPractice ? 10 : 55,
    '<section class="ui-experiment">' +
      '<div class="ui-window" id="uiWindow">' +
        '<div class="faux-appbar"><span>Operations Console</span><span>Connected · developer@workspace</span></div>' +
        '<div class="faux-layout">' +
          '<div class="faux-sidebar">' +
            '<div class="faux-navline"></div><div class="faux-navline"></div><div class="faux-navline"></div>' +
            '<div class="faux-navline"></div><div class="faux-navline"></div><div class="faux-navline"></div>' +
          '</div>' +
          '<div class="faux-content">' +
            '<div class="faux-chart">' +
              '<span style="height:34%"></span><span style="height:58%"></span><span style="height:44%"></span>' +
              '<span style="height:72%"></span><span style="height:61%"></span><span style="height:84%"></span>' +
              '<span style="height:66%"></span><span style="height:48%"></span>' +
            '</div>' +
            '<div class="faux-lines">' +
              '<span style="width:84%"></span><span style="width:61%"></span><span style="width:73%"></span>' +
              '<span style="width:48%"></span><span style="width:77%"></span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ui-timer" id="uiTimer">' + (duration / 1000).toFixed(1) + ' s</div>' +
        (isPractice ? '' :
          '<svg class="giant-pointer" viewBox="0 0 120 160" aria-hidden="true">' +
            '<path d="M 10 6 L 103 92 L 62 98 L 84 146 L 61 156 L 41 108 L 10 140 Z" fill="#050706" stroke="none" stroke-width="0" stroke-linejoin="round"></path>' +
          '</svg>') +
      '</div>' +
    '</section>'
  );
  const host = $('uiWindow');
  const start = performance.now();
  const timer = $('uiTimer');
  const timeouts = [];
  schedule.items.forEach(function (item, index) {
    const id = 'stimulusPopup' + index;
    timeouts.push(setTimeout(function () {
      if (!host.isConnected) return;
      host.insertAdjacentHTML('beforeend', popupHtml(item, id));
      timeouts.push(setTimeout(function () {
        const node = $(id);
        if (node) node.remove();
      }, item.life));
    }, item.time));
  });
  await new Promise(function (resolve) {
    const interval = setInterval(function () {
      const elapsed = performance.now() - start;
      if (timer) timer.textContent = Math.max(0, (duration - elapsed) / 1000).toFixed(1) + ' s';
    }, 100);
    setTimeout(function () {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
      resolve();
    }, duration);
  });
  const animationDuration = Math.round(performance.now() - start);
  stageChrome('界面非注意盲视', isPractice ? 28 : 82,
    '<section class="center-stage compact ui-question">' +
      '<p class="eyebrow">动画结束</p>' +
      '<h2>刚才出现了多少个红色警告窗口？</h2>' +
      '<form id="uiCountForm" novalidate>' +
        '<div class="field">' +
          '<label for="countedRed">输入数量</label>' +
          '<input id="countedRed" type="number" min="0" max="50" step="1" inputmode="numeric" required>' +
        '</div>' +
        '<div id="detectionQuestion"></div>' +
        '<button class="button" type="submit">提交答案</button>' +
      '</form>' +
    '</section>'
  );
  const counted = await new Promise(function (resolve) {
    $('uiCountForm').addEventListener('submit', function (event) {
      event.preventDefault();
      const value = Number($('countedRed').value);
      if (!Number.isInteger(value) || value < 0 || value > 50) {
        showToast('请输入 0 到 50 的整数');
        return;
      }
      if (!isPractice) resolve(value);
      else resolve(value);
    });
  });
  const countCorrect = counted === schedule.redCount ? 1 : 0;
  if (isPractice) {
    stageChrome('界面非注意盲视', 35,
      '<section class="center-stage compact transition-stage">' +
        '<p class="eyebrow">练习反馈</p>' +
        '<h2 style="color:' + (countCorrect ? 'var(--green)' : 'var(--orange)') + '">' + (countCorrect ? '✓ 数量正确' : '✗ 数量不正确') + '</h2>' +
        '<p>实际出现：<strong>' + schedule.redCount + '</strong> 个</p>' +
        '<p>你的报告：<strong>' + counted + '</strong> 个</p>' +
        '<p>误差：<strong>' + Math.abs(counted - schedule.redCount) + '</strong> 个</p>' +
        '<button class="button" id="uiPracticeNext">继续</button>' +
      '</section>'
    );
    await new Promise(function (resolve) { $('uiPracticeNext').addEventListener('click', resolve, { once: true }); });
  }

  let detectionResponse = 'practice';
  let sawMouse = null;
  if (!isPractice) {
    stageChrome('界面非注意盲视', 94,
      '<section class="center-stage compact ui-question">' +
        '<p class="eyebrow">最后一项</p>' +
        '<h2>在刚才的动画中，除了各种提示窗口，你是否注意到了屏幕上有其他异常物体出现？</h2>' +
        '<form id="detectionForm">' +
          '<div class="radio-list">' +
            '<label class="radio-option"><input type="radio" name="detection" value="giant_mouse" required><span>看到一个巨大的鼠标穿过</span></label>' +
            '<label class="radio-option"><input type="radio" name="detection" value="none" required><span>没有看到任何其他东西</span></label>' +
          '</div>' +
          '<button class="button" type="submit">完成</button>' +
        '</form>' +
      '</section>'
    );
    detectionResponse = await new Promise(function (resolve) {
      $('detectionForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const selected = document.querySelector('input[name="detection"]:checked');
        if (!selected) {
          showToast('请选择一个选项');
          return;
        }
        resolve(selected.value);
      });
    });
    sawMouse = detectionResponse === 'giant_mouse';
  }
  return {
    practice: isPractice ? 1 : 0,
    counted_red: counted,
    actual_red: schedule.redCount,
    saw_mouse: sawMouse,
    detection_response: detectionResponse,
    count_error: counted - schedule.redCount,
    count_correct: countCorrect,
    animation_duration_ms: animationDuration,
    unexpected_stimulus: isPractice ? 'none' : 'giant_mouse_4s',
    popup_interval_ms: schedule.intervalMs,
    popup_count: schedule.popupCount,
    trial_index: trialIndex
  };
}

async function submitData(participant, experiment, trials, condition, meta) {
  if (!participant || !experiment || !Array.isArray(trials)) {
    throw new Error('提交参数不完整');
  }
  const response = await fetch(LAB + '/api/hw2/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: PROJECT,
      experiment: experiment,
      participant: participant,
      condition: condition,
      trials: trials,
      meta: meta
    })
  });
  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error('服务器返回了无法解析的响应');
  }
  if (!response.ok || !payload.ok) {
    throw new Error(payload && payload.msg ? payload.msg : '上传接口返回错误');
  }
  if (Array.isArray(payload.warnings) && payload.warnings.length) {
    console.warn('上传警告：', payload.warnings);
  }
  return payload;
}

async function loadAll(experiment) {
  const response = await fetch(LAB + '/api/hw2/data?project=' + encodeURIComponent(PROJECT) + '&experiment=' + encodeURIComponent(experiment));
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload && payload.msg ? payload.msg : '读取数据失败');
  return Array.isArray(payload.records) ? payload.records : [];
}

function formalTrials(baseName) {
  const trials = state.results[baseName] || [];
  return trials.filter(function (trial) { return Number(trial.practice) === 0; });
}

function graphOwnMetrics(trials) {
  const result = {};
  GRAPH_CONDITIONS.forEach(function (conditionId) {
    const subset = trials.filter(function (trial) { return trial.condition_id === conditionId; });
    result[conditionId] = {
      accuracy: mean(subset.map(function (trial) { return Number(trial.smaller_correct) * 100; })),
      absError: mean(subset.map(function (trial) { return Math.abs(Number(trial.judged_percent) - Number(trial.true_percent)); })),
      estimateAccuracy: mean(subset.map(function (trial) { return Number(trial.estimate_within_10pp) * 100; })),
      rt: mean(subset.map(function (trial) { return Number(trial.total_rt_ms); }))
    };
  });
  result.accuracyEffect = result.area.accuracy != null && result.volume.accuracy != null
    ? result.area.accuracy - result.volume.accuracy
    : null;
  result.errorEffect = result.volume.absError != null && result.area.absError != null
    ? result.volume.absError - result.area.absError
    : null;
  return result;
}

function mapOwnMetrics(trials) {
  const result = {};
  MAP_CONDITIONS.forEach(function (conditionId) {
    const subset = trials.filter(function (trial) { return trial.condition_id === conditionId; });
    result[conditionId] = {
      accuracy: mean(subset.map(function (trial) { return Number(trial.correct) * 100; })),
      rt: mean(subset.map(function (trial) { return Number(trial.rt_ms); }))
    };
  });
  result.accuracyEffect = result.landmark.accuracy != null && result.no_landmark.accuracy != null
    ? result.landmark.accuracy - result.no_landmark.accuracy
    : null;
  result.rtEffect = result.landmark.rt != null && result.no_landmark.rt != null
    ? result.landmark.rt - result.no_landmark.rt
    : null;
  return result;
}

function uiOwnMetrics(trials) {
  const formal = trials.find(function (trial) { return Number(trial.practice) === 0; }) || {};
  return {
    sawMouse: formal.saw_mouse,
    counted: formal.counted_red,
    actual: formal.actual_red,
    countError: formal.count_error
  };
}

function metricRow(label, value, max, suffix, orange) {
  const pct = value == null || !Number.isFinite(Number(value)) ? 0 : clamp(Number(value) / max * 100, 0, 100);
  const display = value == null ? '—' : String(round(Number(value), 1)) + (suffix || '');
  return '<div class="metric-row">' +
    '<span>' + escapeHtml(label) + '</span>' +
    '<div class="metric-track ' + (orange ? 'orange' : '') + '"><span style="width:' + pct + '%"></span></div>' +
    '<span class="metric-value">' + display + '</span>' +
  '</div>';
}

function resultCardsHtml() {
  const graph = graphOwnMetrics(formalTrials('graph_3d'));
  const map = mapOwnMetrics(formalTrials('map_ar'));
  const ui = uiOwnMetrics(state.results.ui_blindness || []);
  return '<div class="result-grid">' +
    '<article class="result-card">' +
      '<h3>校园地图寻路</h3><p class="result-sub">每条件 12 个正式试次</p>' +
      metricRow('无明显地标正确率', map.no_landmark.accuracy, 100, '%') +
      metricRow('有明显地标正确率', map.landmark.accuracy, 100, '%') +
      metricRow('无明显地标反应时', map.no_landmark.rt == null ? null : map.no_landmark.rt / 1000, 8, ' s', true) +
      metricRow('有明显地标反应时', map.landmark.rt == null ? null : map.landmark.rt / 1000, 8, ' s', true) +
      '<p class="result-note">有地标减无地标的正确率差为 ' + (map.accuracyEffect == null ? '—' : round(map.accuracyEffect, 1) + ' 个百分点') + '；反应时差为 ' + (map.rtEffect == null ? '—' : round(map.rtEffect, 0) + ' ms') + '。</p>' +
    '</article>' +
    '<article class="result-card">' +
      '<h3>面积与体积比例</h3><p class="result-sub">面积、体积各 10 个正式试次</p>' +
      metricRow('面积选择正确率', graph.area.accuracy, 100, '%') +
      metricRow('体积选择正确率', graph.volume.accuracy, 100, '%') +
      metricRow('面积估计合格率 ±10 pp', graph.area.estimateAccuracy, 100, '%', true) +
      metricRow('体积估计合格率 ±10 pp', graph.volume.estimateAccuracy, 100, '%', true) +
      '<p class="result-note">面积减体积的选择正确率差为 ' + (graph.accuracyEffect == null ? '—' : round(graph.accuracyEffect, 1) + ' 个百分点') + '；面积、体积平均绝对误差分别为 ' + valueText(graph.area.absError, ' pp') + ' 和 ' + valueText(graph.volume.absError, ' pp') + '。</p>' +
    '</article>' +
    '<article class="result-card">' +
      '<h3>界面非注意盲视</h3><p class="result-sub">一次正式试次</p>' +
      '<div style="font-size:28px;font-weight:800;margin:10px 0 4px;color:' + (ui.sawMouse ? 'var(--green)' : 'var(--orange)') + '">' + (ui.sawMouse === true ? '看到了巨型指针' : (ui.sawMouse === false ? '未报告巨型指针' : '—')) + '</div>' +
      metricRow('计数误差绝对值', ui.countError == null ? null : Math.abs(ui.countError), 5, ' 个', true) +
      '<p class="result-note">你报告 ' + (ui.counted == null ? '—' : ui.counted) + ' 个红色窗口；实际出现 ' + (ui.actual == null ? '—' : ui.actual) + ' 个。</p>' +
    '</article>' +
  '</div>';
}

function uploadStatusHtml() {
  return '<div class="status-list">' + BASE_EXPERIMENTS.map(function (baseName) {
    const info = EXPERIMENT_INFO[baseName];
    const upload = state.uploads[baseName];
    const ok = upload && upload.ok;
    const offline = upload && upload.offline;
    return '<div class="status-row">' +
      '<div class="status-label"><strong>' + escapeHtml(info.title) + '</strong><span>' + escapeHtml(upload && upload.code ? upload.code : apiExperiment(baseName)) + '</span></div>' +
      '<span class="status-badge ' + (ok && !offline ? 'ok' : 'warn') + '">' + (offline ? '离线保存' : (ok ? '已上传' : '仅本地')) + '</span>' +
    '</div>';
  }).join('') + '</div>';
}

function renderResults() {
  setDocumentMode(false);
  updateChromeStatus('编号 ' + state.participant + ' · 结果');
  app.innerHTML =
    '<section class="results-hero">' +
      '<div>' +
        '<p class="eyebrow">实验完成</p>' +
        '<h1>你的结果，以及匿名汇总</h1>' +
        '<p class="lede">先查看本次判断模式；页面下方同时展示提交版样本的效应量、原研究方向和收数前预测对照，以及实时匿名汇总。</p>' +
      '</div>' +
      '<div class="sample-chip"><strong id="sampleCount">读取中</strong><span>当前项目匿名被试</span></div>' +
    '</section>' +
    '<section>' +
      '<div class="section-head"><div><p class="eyebrow">本人结果</p><h2>表现概览</h2></div><span class="status-badge ' + (IS_TEST ? 'warn' : '') + '">' + (IS_TEST ? '测试数据' : '正式模式') + '</span></div>' +
      resultCardsHtml() +
    '</section>' +
    '<section class="result-section">' +
      studyAnalysisHtml() +
    '</section>' +
    '<section class="result-section">' +
      '<div class="section-head"><div><p class="eyebrow">数据状态</p><h2>三段数据分别提交</h2></div><button class="button secondary" id="resultsBackup">下载全部备份</button></div>' +
      uploadStatusHtml() +
      '<div class="aggregate-panel" id="aggregatePanel">' +
        '<div class="aggregate-head"><h3>全体匿名汇总</h3><span class="status-badge">正在读取</span></div>' +
        '<p>正在连接注意实验室数据接口。</p>' +
      '</div>' +
      '<div class="action-row">' +
        '<button class="button" id="rerunFlow">重新开始</button>' +
        '<button class="button secondary" id="refreshAggregate">刷新全体结果</button>' +
      '</div>' +
    '</section>';
  $('resultsBackup').addEventListener('click', openBackupDialog);
  $('rerunFlow').addEventListener('click', function () {
    if (confirm('重新开始会清空当前页面中的结果，确定继续？')) {
      state.order = [];
      state.results = {};
      state.uploads = {};
      renderStart();
    }
  });
  $('refreshAggregate').addEventListener('click', loadAggregateResults);
  loadAggregateResults();
}

function recordTrials(record) {
  if (Array.isArray(record.trials)) return record.trials;
  if (typeof record.trials === 'string') {
    try {
      const parsed = JSON.parse(record.trials);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
}

function latestByParticipant(records) {
  const latest = {};
  records.forEach(function (record) {
    if (!record || !record.participant) return;
    latest[record.participant] = record;
  });
  return Object.values(latest).map(function (record) {
    return { participant: record.participant, trials: recordTrials(record), record: record };
  });
}

async function loadAggregateResults() {
  const panel = $('aggregatePanel');
  if (!panel) return;
  if (OFFLINE) {
    const count = state.participant ? 1 : 0;
    const sample = $('sampleCount');
    if (sample) sample.textContent = String(count);
    panel.innerHTML = '<div class="aggregate-head"><h3>全体匿名汇总</h3><span class="status-badge warn">离线测试</span></div><p>当前没有连接课程数据接口。正式部署后刷新本页即可读取全体匿名结果。</p>';
    return;
  }
  panel.innerHTML = '<div class="aggregate-head"><h3>全体匿名汇总</h3><span class="status-badge">正在读取</span></div><p>正在连接注意实验室数据接口。</p>';
  try {
    const results = await Promise.all(BASE_EXPERIMENTS.map(async function (baseName) {
      const records = await loadAll(apiExperiment(baseName));
      return { baseName: baseName, rows: latestByParticipant(records) };
    }));
    let maxN = 0;
    const tableRows = results.map(function (entry) {
      const n = entry.rows.length;
      maxN = Math.max(maxN, n);
      if (entry.baseName === 'map_ar') {
        const metrics = entry.rows.map(function (row) { return mapOwnMetrics(formalTrialsFrom(row.trials)); }).filter(function (metric) { return metric.accuracyEffect != null; });
        const noAcc = mean(metrics.map(function (metric) { return metric.no_landmark.accuracy; }));
        const landAcc = mean(metrics.map(function (metric) { return metric.landmark.accuracy; }));
        const noRt = mean(metrics.map(function (metric) { return metric.no_landmark.rt; }));
        const landRt = mean(metrics.map(function (metric) { return metric.landmark.rt; }));
        const accEffect = noAcc != null && landAcc != null ? landAcc - noAcc : null;
        const rtEffect = noRt != null && landRt != null ? landRt - noRt : null;
        return '<tr><td>校园地图寻路</td><td>' + n + '</td><td>' + valueText(noAcc, '%') + '</td><td>' + valueText(landAcc, '%') + '</td><td>正确率差 ' + valueText(accEffect, ' pp') + '<br>反应时差 ' + valueText(rtEffect, ' ms') + '</td></tr>';
      }
      if (entry.baseName === 'graph_3d') {
        const metrics = entry.rows.map(function (row) { return graphOwnMetrics(formalTrialsFrom(row.trials)); }).filter(function (metric) { return metric.accuracyEffect != null; });
        const areaAcc = mean(metrics.map(function (metric) { return metric.area.accuracy; }));
        const volumeAcc = mean(metrics.map(function (metric) { return metric.volume.accuracy; }));
        const areaEstimate = mean(metrics.map(function (metric) { return metric.area.estimateAccuracy; }));
        const volumeEstimate = mean(metrics.map(function (metric) { return metric.volume.estimateAccuracy; }));
        const areaErr = mean(metrics.map(function (metric) { return metric.area.absError; }));
        const volumeErr = mean(metrics.map(function (metric) { return metric.volume.absError; }));
        const accEffect = areaAcc != null && volumeAcc != null ? areaAcc - volumeAcc : null;
        return '<tr><td>面积与体积比例</td><td>' + n + '</td><td>面积选择 ' + valueText(areaAcc, '%') + '<br>估计合格 ' + valueText(areaEstimate, '%') + '<br>误差 ' + valueText(areaErr, ' pp') + '</td><td>体积选择 ' + valueText(volumeAcc, '%') + '<br>估计合格 ' + valueText(volumeEstimate, '%') + '<br>误差 ' + valueText(volumeErr, ' pp') + '</td><td>选择正确率差 ' + valueText(accEffect, ' pp') + '</td></tr>';
      }
      const formal = entry.rows.map(function (row) {
        const trials = formalTrialsFrom(row.trials);
        return trials.find(function (trial) { return Number(trial.practice) === 0; });
      }).filter(Boolean);
      const detection = mean(formal.map(function (trial) { return trial.saw_mouse === true ? 100 : 0; }));
      const countErr = mean(formal.map(function (trial) { return Math.abs(Number(trial.count_error)); }));
      return '<tr><td>界面非注意盲视</td><td>' + n + '</td><td>计数误差 ' + valueText(countErr, ' 个') + '</td><td>检测率 ' + valueText(detection, '%') + '</td><td>单试次描述统计</td></tr>';
    }).join('');
    const sampleEl = $('sampleCount');
    if (sampleEl) sampleEl.textContent = String(maxN);
    panel.innerHTML =
      '<div class="aggregate-head"><h3>全体匿名汇总</h3><span class="status-badge ' + (maxN >= 5 ? 'ok' : 'warn') + '">' + (maxN >= 5 ? '样本数达到课程要求' : '至少需 5 人') + '</span></div>' +
      '<table class="aggregate-table">' +
        '<thead><tr><th>实验</th><th>被试数</th><th>条件 A</th><th>条件 B</th><th>差异</th></tr></thead>' +
        '<tbody>' + tableRows + '</tbody>' +
      '</table>' +
      '<p class="result-note">差值方向按“条件 B 减条件 A”计算。这里仅呈现样本描述统计；实际推断与讨论请结合原始试次、缺失值和样本量完成。</p>';
  } catch (error) {
    const panelAfterError = $('aggregatePanel');
    if (panelAfterError) {
      panelAfterError.innerHTML = '<div class="aggregate-head"><h3>全体匿名汇总</h3><span class="status-badge warn">读取失败</span></div>' +
        '<p>暂时无法读取全体数据：' + escapeHtml(error.message) + '。本人结果和本地备份不受影响。</p>';
    }
  }
}

function formalTrialsFrom(trials) {
  return (trials || []).filter(function (trial) { return Number(trial.practice) === 0; });
}

function valueText(value, suffix) {
  return value == null || !Number.isFinite(Number(value)) ? '—' : round(Number(value), 1) + (suffix || '');
}

function backupRecords() {
  return BASE_EXPERIMENTS.map(function (baseName) {
    return {
      project: PROJECT,
      experiment: apiExperiment(baseName),
      participant: state.participant,
      condition: EXPERIMENT_INFO[baseName].condition,
      trials: state.results[baseName] || [],
      meta: {
        session_id: state.sessionId,
        handedness: state.handedness,
        test_mode: IS_TEST,
        order: state.order.join('>'),
        uploaded: Boolean(state.uploads[baseName] && state.uploads[baseName].ok)
      }
    };
  }).filter(function (record) { return record.trials.length > 0; });
}

function downloadJson() {
  const records = backupRecords();
  if (!records.length) {
    showToast('还没有可备份的数据');
    return;
  }
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, 'attention_lab_' + safeFilename(state.participant) + '.json');
  showToast('JSON 备份已生成');
}

function downloadCsv() {
  const records = backupRecords();
  if (!records.length) {
    showToast('还没有可备份的数据');
    return;
  }
  const rows = [];
  records.forEach(function (record) {
    record.trials.forEach(function (trial) {
      const flat = {};
      Object.keys(trial).forEach(function (key) { flat[key] = trial[key]; });
      ['experiment', 'participant', 'condition', 'session_id', 'handedness'].forEach(function (key) {
        flat[key] = key === 'experiment' ? record.experiment : (key === 'participant' ? record.participant : (key === 'condition' ? record.condition : record.meta[key]));
      });
      rows.push(flat);
    });
  });
  const headers = Array.from(new Set(rows.reduce(function (all, row) { return all.concat(Object.keys(row)); }, [])));
  const csv = [headers.join(',')].concat(rows.map(function (row) {
    return headers.map(function (header) {
      const value = row[header] == null ? '' : String(row[header]);
      return '"' + value.replace(/"/g, '""') + '"';
    }).join(',');
  })).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, 'attention_lab_' + safeFilename(state.participant) + '.csv');
  showToast('CSV 备份已生成');
}

function safeFilename(value) {
  return String(value || 'participant').replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '_').slice(0, 40);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function openBackupDialog() {
  if (!backupRecords().length) {
    showToast('还没有可备份的数据');
    return;
  }
  if (typeof backupDialog.showModal === 'function') backupDialog.showModal();
}

$('brandLink').addEventListener('click', function (event) {
  event.preventDefault();
  if (state.order.length && !document.body.classList.contains('stage-mode')) {
    if (confirm('返回首页会清空当前页面中的进度，确定继续？')) {
      state.order = [];
      state.results = {};
      state.uploads = {};
      renderStart();
    }
  } else {
    renderStart();
  }
});
$('dialogCsv').addEventListener('click', downloadCsv);
$('dialogJson').addEventListener('click', downloadJson);

window.addEventListener('unhandledrejection', function (event) {
  console.error('Unhandled promise rejection', event.reason);
});

window.submitData = submitData;
if (PARAMS.get('debug') === '1') {
  window.AttentionLabDebug = {
    state: state,
    makeGraphTrials: makeGraphTrials,
    makeMapTrials: makeMapTrials,
    runExperiment: runExperiment,
    renderResults: renderResults,
    submitData: submitData
  };
  const auditGraph = makeGraphTrials(false);
  const auditMap = makeMapTrials();
  const auditUi = popupSchedule(false);
  const auditCounts = {};
  const auditMapCounts = {};
  auditGraph.forEach(function (trial) { auditCounts[trial.condition_id] = (auditCounts[trial.condition_id] || 0) + 1; });
  auditMap.formal.forEach(function (trial) { auditMapCounts[trial.condition_id] = (auditMapCounts[trial.condition_id] || 0) + 1; });
  document.documentElement.dataset.audit = JSON.stringify({
    graphTotal: auditGraph.length,
    graphCounts: auditCounts,
    graphMinRatio: Math.min.apply(null, auditGraph.map(function (trial) { return trial.ratio; })),
    graphMaxRatio: Math.max.apply(null, auditGraph.map(function (trial) { return trial.ratio; })),
    graphBytes: new Blob([JSON.stringify(auditGraph)]).size,
    mapPractice: auditMap.practice.length,
    mapFormal: auditMap.formal.length,
    mapCounts: auditMapCounts,
    uiPopupCount: auditUi.popupCount,
    uiRedCount: auditUi.redCount,
    uiPopupIntervalMs: auditUi.intervalMs
  });
}
renderStart();
