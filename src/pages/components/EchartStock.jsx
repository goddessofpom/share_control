import React from 'react';
import ReactEcharts from 'echarts-for-react';


const EchartStock = props => {
    //数组处理
    const splitData = (rawData) => {
        var datas = [];
        var times = [];
        var vols = [];
        var macds = [];
        var difs = [];
        var deas = [];
        for (var i = 0; i < rawData.length; i++) {
            datas.push(rawData[i]);
            times.push(rawData[i].splice(0, 1)[0]);
            vols.push(rawData[i][4]);
            macds.push(rawData[i][6]);
            difs.push(rawData[i][7]);
            deas.push(rawData[i][8]);
        }
        return {
            datas: datas,
            times: times,
            vols: vols,
            macds: macds,
            difs: difs,
            deas: deas
        };
    }

    const { oriData, attackPrice, stopLossPrice, counterPrice } = props

    const data = splitData(oriData);

    //MA计算公式
    const calculateMA = (dayCount) => {
        var result = [];
        for (var i = 0, len = data.times.length; i < len; i++) {
            if (i < dayCount) {
                result.push('-');
                continue;
            }
            var sum = 0;
            for (var j = 0; j < dayCount; j++) {
                sum += data.datas[i - j][1];
            }
            result.push((sum / dayCount).toFixed(2));
        }
        return result;
    }

    const getOption = () => ({
        title: {
            text: 'K线',
            left: 0
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line'
            }
        },
        legend: {
            data: ['KLine', 'MA5']
        },
        grid: [{
            left: '3%',
            right: '1%',
            height: '60%'
        }, {
            left: '3%',
            right: '1%',
            top: '71%',
            height: '10%'
        }, {
            left: '3%',
            right: '1%',
            top: '82%',
            height: '14%'
        }],
        xAxis: [{
            type: 'category',
            data: data.times,
            scale: true,
            boundaryGap: false,
            axisLine: {
                onZero: false
            },
            splitLine: {
                show: false
            },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax'
        }, {
            type: 'category',
            gridIndex: 1,
            data: data.times,
            axisLabel: {
                show: false
            }
        }, {
            type: 'category',
            gridIndex: 2,
            data: data.times,
            axisLabel: {
                show: false
            }
        }],
        yAxis: [{
            scale: true,
            splitArea: {
                show: false
            }
        }, {
            gridIndex: 1,
            splitNumber: 3,
            axisLine: {
                onZero: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false
            },
            axisLabel: {
                show: true
            }
        }, {
            gridIndex: 2,
            splitNumber: 4,
            axisLine: {
                onZero: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false
            },
            axisLabel: {
                show: true
            }
        }],
        dataZoom: [{
            type: 'inside',
            xAxisIndex: [0, 0],
            start: 20,
            end: 100
        }, {
            show: true,
            xAxisIndex: [0, 1],
            type: 'slider',
            top: '97%',
            start: 20,
            end: 100
        }, {
            show: false,
            xAxisIndex: [0, 2],
            type: 'slider',
            start: 20,
            end: 100
        }],
        series: [{
            name: 'K线',
            type: 'candlestick',
            data: data.datas,
            itemStyle: {
                normal: {
                    color: '#ef232a',
                    color0: '#14b143',
                    borderColor: '#ef232a',
                    borderColor0: '#14b143'
                }
            },
            markPoint: {
                data: [{
                        type: 'max',
                        name: '最大值'
                    },
                    {
                        type: 'min',
                        name: '最小值',
                        itemStyle: { color: "#14b143" }
                    }
                ]
            },
            markLine: {
                lineStyle: {
                    type: "solid",
                    color: '#002766'
                },
                data: [
                    { yAxis: attackPrice, label: {formatter: `顺攻价: ${attackPrice}`} }, 
                    { yAxis: stopLossPrice, label: {formatter: `止损价: ${stopLossPrice}` }},
                    { yAxis: counterPrice, label: {formatter: `反击价: ${counterPrice}`}},
                ],
                symbol: ["circle", "circle"],
                label: { position: 'middle', distance: [-100, 30] }
            },
        }, {
            name: 'MA5',
            type: 'line',
            data: calculateMA(5),
            smooth: true,
            lineStyle: {
                normal: {
                    opacity: 0.5
                }
            }
        }, {
            name: 'Volumn',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: data.vols,
            itemStyle: {
                normal: {
                    color: function(params) {
                        var colorList;
                        if (data.datas[params.dataIndex][1] > data.datas[params.dataIndex][0]) {
                            colorList = '#ef232a';
                        } else {
                            colorList = '#14b143';
                        }
                        return colorList;
                    },
                }
            }
        }, {
            name: 'MACD',
            type: 'bar',
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: data.macds,
            itemStyle: {
                normal: {
                    color: function(params) {
                        var colorList;
                        if (params.data >= 0) {
                            colorList = '#ef232a';
                        } else {
                            colorList = '#14b143';
                        }
                        return colorList;
                    },
                }
            }
        }, {
            name: 'DIF',
            type: 'line',
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: data.difs
        }, {
            name: 'DEA',
            type: 'line',
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: data.deas
        }]
    })

    return (
        <div>
            <ReactEcharts option={getOption()} style={{height: '500px', width: '100%'}} />
        </div>
    )
}

export default EchartStock;
