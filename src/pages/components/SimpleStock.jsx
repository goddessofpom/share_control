import React from 'react';
import ReactEcharts from 'echarts-for-react';


const SimpleStock = props => {
    //数组处理
    const splitData = (rawData) => {
        var datas = [];
        var times = [];
        var vols = [];
        for (var i = 0; i < rawData.length; i++) {
            datas.push([rawData[i].op, rawData[i].cl, rawData[i].low, rawData[i].high, rawData[i].volume]);
            times.push(rawData[i].eob);
            vols.push(rawData[i].volume);
        }
        return {
            datas: datas,
            times: times,
            vols: vols,
        };
    }

    const { oriData } = props

    const data = splitData(oriData);

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
            top: '75%',
            height: '15%'
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
        }]
    })

    return (
        <div>
            <ReactEcharts option={getOption()} style={{height: '500px', width: '100%'}} />
        </div>
    )
}

export default SimpleStock;
