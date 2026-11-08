# 注意实验室：校园地图、面积体积与界面注意

工程心理学作业二。网站包含三个实验：

1. map_ar：北向上校园地图中的地标与寻路判断
2. graph_3d：二维圆形面积与三维圆球体积的比例判断
3. ui_blindness：界面任务中的非注意盲视

项目码固定为 39X7E3。下载密钥不写入网页、README 或仓库。

## 运行

直接双击 index.html 即可运行。页面只依赖同目录下的 styles.css 与 app.js，所有资源都使用相对路径。

推荐使用桌面端 Chrome 或 Edge。如果浏览器限制本地文件访问，可在项目目录启动静态服务器：

~~~powershell
python -m http.server 8000
~~~

然后访问 http://127.0.0.1:8000/ 。正式上传接口为：

https://attention-lab-production.up.railway.app/api/hw2/submit

## 测试与正式收数

### 测试模式

~~~text
http://127.0.0.1:8000/?test=1&offline=1
~~~

- test=1：上传实验名自动加 test_ 前缀。
- offline=1：完全不连接服务器，只测试流程与本地备份。
- 填写匿名编号并同意后，进入实验选择页，可以单独选择任一实验。
- 每完成一个测试实验会返回实验选择页。
- 也可以使用 experiment=map_ar、experiment=graph_3d 或 experiment=ui_blindness 直接进入指定实验。

正式收数前应清理后台测试数据。

### 正式链接

正式链接不得包含 test、offline 或 experiment 参数：

~~~text
http://127.0.0.1:8000/
~~~

正式模式按实验 1、2、3 顺序运行。每完成一个实验自动调用一次 submitData 上传，不需要额外上传按钮。

如果只需要本地双击运行，直接打开 index.html 即可。注意 127.0.0.1 或 file:// 只对本机有效；发给其他被试前，需要将四个前端文件部署到 GitHub Pages 或其他静态托管服务。

## 实验 1：校园地图寻路

### 场景

每个试次先呈现第一人称前方视野，并明确显示“当前前方：图书馆”等建筑名称。前方视野只呈现正前方建筑，不呈现左侧、右侧或后方建筑。

前方视野会先单独呈现。被试点击“查看地图”后，前方视野消失，才呈现北向上的二维校园地图，两者不会同时出现。地图包含：

- 中央的当前位置。
- 四周的图书馆、教学楼、体育馆、食堂等建筑。
- 明确标出的目标建筑。
- North 方向箭头和“上方为北”的提示。

被试需要比较当前前进方向与目标建筑在地图中的方向，选择：

- 左转
- 直行
- 右转
- 掉头

地图中不显示表示当前朝向的箭头，也不圈出目标建筑。目标由题目中的建筑名称指定，当前朝向必须由刚刚看到的前方建筑推断。

### 实验条件

- no_landmark：地图中没有明显地标。
- landmark：在正前方建筑的左侧或右侧显示红色三角形。三角形在前方视野中的相对位置与二维地图一致，地图中它位于当前前进方向与相邻方向之间。
- 地图中的红色三角形不附带“地标”文字。

试次数：

- 练习 2 次：有明显地标、无明显地标各一次。
- 正式 24 次：每个条件 12 次。
- 左转、直行、右转、掉头在每个条件下各出现 3 次。

记录字段：

~~~text
condition_id, landmark_present, landmark_side, practice,
current_ahead_building, destination_building,
left_building, right_building,
current_heading_deg, destination_bearing_deg,
landmark_bearing_deg, correct_turn, response_turn,
correct, rt_ms, forward_view_ms, trial_index
~~~

练习试次在作答后显示正确或错误反馈，并说明正确方向。正式试次不提供反馈。

reaction time 使用 performance.now()，从完整试次呈现到第一次方向点击或按键。

### 收数前预测

明显地标为空间定向提供一个额外的全局参照。预测有地标条件比无地标条件反应时更短，方向判断正确率更高。

理论依据：

- Aretz (1991)：电子地图的朝向与参照系会影响空间判断。
- Levine (1982)：地图对齐与“你在这里”信息会影响空间定向。

这些预测只保存在 README 中，不显示在实验界面。

## 实验 2：面积与体积比例

### 任务

一个试次中出现两个图形，分别标为 A 和 B：

- area 条件：两个二维圆形。
- volume 条件：两个带明暗阴影的三维圆球。

被试先点击较小的图形，然后立即出现 0–100 滑块。

- 面积条件：估计较小圆形的面积是较大圆形面积的百分之多少。
- 体积条件：估计较小圆球的体积是较大圆球体积的百分之多少。

设计修改：

- 不再使用红点标记目标。
- 选择 A 或 B 后不再高亮。
- 只保留 area 与 volume 两个条件。

试次数：

- 练习 2 次：面积、体积各一次。
- 正式 20 次：每个条件 10 次。

真实比例：

- 面积条件：圆形半径按目标面积比例的平方根生成。
- 体积条件：圆球半径按目标体积比例的立方根生成。
- 真实比例范围约为 0.18–0.83。

记录字段：

~~~text
condition_id, shape, practice, true_percent,
A_is_smaller, response_smaller, smaller_correct,
judged_percent, estimate_within_10pp,
choice_rt_ms, total_rt_ms, trial_index
~~~

练习试次在确认估计后会显示：

- 较小图形是否判断正确。
- 实际比例。
- 被试输入的估计比例。
- 两者相差的百分点。

正式试次不显示比例反馈。

### 收数前预测

二维圆形的面积差异可以直接由平面轮廓判断；圆球体积需要从透视阴影和直径推断三维大小。预测面积条件的较小者选择正确率高于体积条件，面积比例的绝对估计误差低于体积条件。

理论依据：

- Cleveland & McGill (1984)：不同图形编码的知觉精度不同。
- Hollands & Dyre (2000)：比例判断会受到图形编码与心理尺度影响。

这些预测不显示在实验界面。

## 实验 3：界面非注意盲视

被试注视动态软件界面，默数红色警告窗口。指导语和实验介绍不提及其他物体或鼠标。正式动画持续约 30 秒，红色窗口实际出现 12 次。约第 20 秒起，一个巨型黑色鼠标指针用 4 秒从屏幕左侧缓慢移动到右侧。指针位于模拟界面内容上方、提示弹窗图层下方。

弹出窗口按固定间隔独立调度：正式阶段每 450 ms 出现一次，共 65 个，每个窗口停留约 3000 ms。鼠标开始移动后仍按同一时间表继续弹出。

动画结束后：

1. 输入红色警告窗口数量。
2. 强制二选一报告是否看到巨型鼠标。

试次数：

- 练习 1 次：约 6 秒，不含意外物体。
- 正式 1 次：约 30 秒，含巨型鼠标。

练习阶段提交计数后，会反馈计数是否正确，并显示实际数量、你的报告数量和误差。正式阶段不提供计数反馈。

非注意盲视依赖第一次意外暴露，因此不重复正式试次。组水平结果按多名被试的检测率汇总。

记录字段：

~~~text
practice, counted_red, actual_red, saw_mouse,
detection_response, count_error, count_correct,
animation_duration_ms,
unexpected_stimulus, popup_interval_ms,
popup_count, trial_index
~~~

理论依据：

- Simons & Chabris (1999) 的非注意盲视范式。

## submitData 接口

上传函数保持指定签名：

~~~javascript
submitData(participant, experiment, trials, condition, meta)
~~~

请求体：

~~~json
{
  "project": "39X7E3",
  "experiment": "map_ar",
  "participant": "P001",
  "condition": "landmark_vs_no_landmark",
  "trials": [],
  "meta": {}
}
~~~

正常模式的实验名严格为：

- map_ar
- graph_3d
- ui_blindness

测试模式自动加 test_ 前缀。每个实验完成一次后提交一次，练习和正式试次都在 trials 中，通过 practice 字段筛选。

## 结果分析

网页结果页计算：

### 校园地图寻路

- 无明显地标条件正确率。
- 有明显地标条件正确率。
- 两个条件的平均反应时。
- “有地标减无地标”的正确率差与反应时差。

### 面积与体积比例

- 面积条件较小者选择正确率。
- 体积条件较小者选择正确率。
- 面积与体积比例估计的绝对误差。
- 以真实比例正负 10 个百分点为合格范围的比例估计合格率。
- “面积减体积”的正确率差。

### 界面非注意盲视

- 是否报告看到巨型鼠标。
- 红色窗口计数误差。
- 全体被试的巨型鼠标检测率。

少于 5 名被试时，结果页显示样本不足，仅作描述统计。

## 收数流程

1. 用测试模式逐个选择并完成三个实验。
2. 检查测试上传是否带有 test_ 前缀，并检查后台警告。
3. 清除测试数据。
4. 使用正式链接，至少邀请 5 名他人独立完成。
5. 每人使用唯一匿名编号，不收集姓名或学号。
6. 每个实验完成页确认显示“上传成功”。
7. 若失败，立即下载 CSV 或 JSON 备份并记录匿名编号。
8. 在注意实验室后台下载数据，逐列核对试次数、条件平衡和缺失值。
9. 将真实结果写入 README 或单独的结果报告。

本仓库不包含虚构被试数据。真人收数、异常试次判断和最终讨论仍需由学生本人完成。

## 结果记录模板

| 实验 | 有效被试数 | 关键结果 | 解释与限制 |
| --- | ---: | --- | --- |
| map_ar | 待收数 | 有/无明显地标的正确率与反应时 | 建筑熟悉度、地图阅读经验 |
| graph_3d | 待收数 | 面积/体积正确率与估计误差 | 三维透视、图形编码差异 |
| ui_blindness | 待收数 | 巨型鼠标检测率与计数误差 | 单试次、样本量 |

讨论中应区分方向一致与统计显著，也不应把本任务直接等同于原论文的效应量。

## 隐私与限制

- 只收集匿名编号、利手、浏览器信息、视口和实验反应。
- 不收集姓名、学号、电话、精确位置或摄像头数据。
- 不写入下载密钥。
- 单次上传远低于 256 KB，每个试次少于 40 个字段。
- 页面不包含后端，依赖课程统一接口。
- 移动端可运行，但桌面端更适合地图和图形比例任务。

## 文件结构

~~~text
index.html   页面结构
styles.css   响应式界面与实验刺激样式
app.js       三个实验、上传、备份与结果分析
README.md    实验设计、预测、数据字典与收数流程
~~~

## AI 使用说明

AI 用于辅助代码实现、界面布局、数据校验和文档整理。实验选择、理论依据、收数前预测、真实数据解释和最终讨论应由学生本人核对并负责。

## 参考文献

- Aretz, A. J. (1991). The design of electronic map displays. Human Factors.
- Cleveland, W. S., & McGill, R. (1984). Graphical perception: Theory, experimentation, and application to the development of graphical methods. Journal of the American Statistical Association.
- Hollands, J. G., & Dyre, B. P. (2000). Bias in proportion judgments: The cyclical power model. Psychological Review.
- Levine, M. (1982). You-are-here maps: Psychological considerations. Environment and Behavior.
- Simons, D. J., & Chabris, C. F. (1999). Gorillas in our midst: Sustained inattentional blindness for dynamic events. Perception.
