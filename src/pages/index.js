import { Row, Col, Button, Select, Table, Divider, Spin, Popconfirm, message, Modal, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import Stomp from 'stompjs'
import { connect } from 'dva';
import EditTable from './components/EditTable';
import request from '../utils/request';
import CandleStickChartWithMACDIndicator from './components/Chart';
import { getData } from '../utils/kline';
import SimpleStock from './components/SimpleStock';
import { useInterval } from 'react-use';
import EchartStock from './components/EchartStock';

const { Option } = Select;

let tickData = []

const PageIndex = props => {
  const { dispatch, mainPage } = props;
  const { symbolList, userList, currentUser, allShares, cash } = mainPage;
  const [fetching, setFetching] = useState(false)
  const [chooseShare, setChooseShare] = useState(0)
  const [strategyData, setStrategyData] = useState([])
  const [currentStrategy, setCurrentStrategy] = useState(0)
  const [techStrategyData, setTechStrategyData] = useState([])
  const [currentTechStrategy, setCurrentTechStrategy] = useState(0)
  const [currentRecommendShareList, setCurrentRecommendShareList] = useState([])
  const [klineData, setKlineData] = useState(null)
  const [recommendTableLoading, setRecommendTableLoading] = useState(false)
  const [attackPriceMark, setAttackPriceMark] = useState(0)
  const [stopLossPriceMark, setStopLossPriceMark] = useState(0)
  const [counterPriceMark, setCounterPriceMark] = useState(0)
  const [indexModalVisible, setIndexModalVisible] = useState(false)
  const [currentIndexData, setCurrentIndexData] = useState(0)
  const [indexList, setIndexList] = useState([])
  const [indexDetail, setIndexDetail] = useState([])

  useInterval(
    () => {
      dispatch({
        type: "mainPage/changeTickPrice",
        payload: tickData,
      })
      tickData = []
    },
    1000
  );

  useEffect(() => {
    dispatch({
      type: "mainPage/getInitData",
      payload: {is_trade: true, noPage: 1}
    })

    // getData().then(data => {
    //   setKlineData(data)
    // })
  
    const sock = new WebSocket("ws://127.0.0.1:15674/ws")
    const on_error = err => {
      console.log(err)
    };

    request('/api/v1/fundament/fundament_strategy?noPage=1&status=0').then(res => {
      setStrategyData(res.data)
      const todayShares = res.data[0].today_shares.map(item => ({...item, operation: item.share, key: item.id}))
      // setCurrentRecommendShareList(todayShares)
  })

  request('/api/v1/technical/technical_strategy?noPage=1&status=0').then(res => {
    setTechStrategyData(res.data)
  })

    const handleMessage = d => {
      const messageInfo = JSON.parse(d.body)
      if(messageInfo.message_type === "tick"){
        tickData.push(messageInfo)
      } else if (messageInfo.message_type === "recommend") {
        notification.open({
          message: "盘中推荐",
          description: <div>
            {messageInfo.share_list.map(item => (<div key={item.symbol}>{item.symbol} {item.name}</div>))}
            <Divider />
            <h3>今日行业统计</h3>
            {messageInfo.industry_total.map(item => (<div key={item.name}>{item.name}: {item.count}</div>))}
          </div>,
          duration: null,
          placement: "topLeft"
        })
      }
    }

    const stompClient = Stomp.over(sock)
    stompClient.heartbeat.incoming = 50000
    stompClient.heartbeat.outgoing = 50000

    stompClient.connect("guest", "guest", function(frame){
      stompClient.subscribe("/exchange/info", handleMessage)
    }, on_error, 'message')
  }, [])

  const saveRow = (key, row) => {
    dispatch({
      type: "mainPage/editRow",
      payload: {user_id: currentUser.id, symbol: key, data: row}
    })
  }

  const addShare = () => {
    if(chooseShare === 0) {
      message.error("请先输入股票代码")
      return
    }
    dispatch({
      type: "mainPage/addShare",
      payload: {share_id: chooseShare, user_id: currentUser.id}
    })
  }

  const cancelSubscribeShare = record => {
    dispatch({
      type: "mainPage/deleteShare",
      payload: {symbol: record.symbol},
    })
  }

  const searchShare = val => {
    if(val.length < 4 || val.length > 7 || fetching) {
      return
    }
    setFetching(true)
    dispatch({
      type: "mainPage/queryShare",
      payload: {symbol__icontains: val, noPage: 1},
      callback: () => setFetching(false)
    })
  }

  const changeShare = val => {
    setChooseShare(val)
  }

  const getIndexListAndShowIndexModal = () => {
    request.get("/api/v1/fundament/custom_index?status=0&noPage=1").then(res => {
      setIndexModalVisible(true)
      setIndexList(res.data)
    })
  }

  const changeStrategy = val => {
    setCurrentStrategy(val)
    if(val === 0){
      setCurrentRecommendShareList([])
      setCurrentStrategy(val)
      return
    }

    const todayShares = strategyData.find(item => item.id === val).today_shares.map(item => ({...item, operation: item.share, key: item.id}));
    setCurrentRecommendShareList(todayShares)
    setCurrentTechStrategy(0)
  }

  const changeTechStrategy = val => {
    if(currentStrategy === 0){
      message.error("请先选择基本面策略")
      return
    }

    if(val === 0) {
      const todayShares = strategyData.find(item => item.id === currentStrategy).today_shares.map(item => ({...item, operation: item.share, key: item.id}));
      setCurrentRecommendShareList(todayShares)
    }
  
    setCurrentTechStrategy(val)
  }

  const filterTechShares = () => {
    if(currentTechStrategy === 0) {
      return
    }
    setRecommendTableLoading(true)

    request('/api/v1/technical/technical_strategy/filter_tech_shares', 
      {method: "POST", data: { tech_strategy: currentTechStrategy, strategy: currentStrategy }}
    ).then(res => {
      setRecommendTableLoading(false)
      const shareList = res.data.map(item => ({industry_name: item.industry__name, symbol_name_cn: item.sec_name, operation: item.id, key: item.id, symbol: item.symbol}))
      setCurrentRecommendShareList(shareList)
    })
  }

  const setChartData = symbol => {
    request(`/api/v1/technical/kline_history?symbol=${symbol}`).then(res => {
      setKlineData(res.data)
    })
  }

  const changeIndex = val => {
    setCurrentIndexData(val)
    if (val > 0) {
      request.get(`/api/v1/fundament/custom_index_detail?custom_index=${val}&noPage=1`).then(res => {
        setIndexDetail(res.data)
      })
    }
  }

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setChartData(selectedRows[0].symbol)
      setAttackPriceMark(0)
      setStopLossPriceMark(0)
      setCounterPriceMark(0)
    },
    type: "radio",
  }

  const recommendColumns = [
    {
      title: "行业",
      dataIndex: "industry_name",
      key: "industry_name",
    },
    {
      title: "标的",
      dataIndex: "symbol",
      key: "symbol",
    },
    {
      title: "名称",
      dataIndex: "symbol_name_cn",
      key: "symbol_name_cn",
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      render: val => <Popconfirm okText="是" cancelText="否" title="确定加入?" onConfirm={() => { dispatch({type: "mainPage/addShare", payload: {share_id: val, user_id: currentUser.id}})}}>
                        <a>加入面板</a>
                     </Popconfirm>
    }
  ]

  return (
    <div>
      <Row style={{ marginTop: 20 }}>
        <Col span={12}>
          {klineData?<EchartStock oriData={klineData} attackPrice={attackPriceMark} stopLossPrice={stopLossPriceMark} counterPrice={counterPriceMark} />:null}
        </Col>
        <Col span={12}>
          <Row>
            <Col span={4}><h4>光子智能交易系统</h4></Col>
            <Col span={4}>权益:{cash.nav}</Col>
            <Col span={4}>浮动盈亏:{cash.fpnl}</Col>
            <Col span={4}>平仓盈亏:{cash.cum_pnl}</Col>
            <Col span={4}>资金使用率:{cash.use_rate}</Col>
          </Row>
          <Divider />
          <Row>
            <Col><h4>策略推荐股票</h4></Col>
            <Col offset={1}>
              <Select style={{ width: 100 }} onChange={changeStrategy} value={currentStrategy}>
                <Option value={0}>无</Option>
                {strategyData.map(item => (<Option value={item.id} key={item.id}>{item.name}</Option>))}
              </Select>
            </Col>
            <Col offset={1}>
              <Select value={currentTechStrategy} onChange={changeTechStrategy}>
                <Option value={0}>全部</Option>
                {techStrategyData.map(item => (<Option key={item.id} value={item.id}>{item.name}</Option>))}
              </Select>
            </Col>
            <Col offset={1}><Button onClick={filterTechShares} type="primary">搜索</Button></Col>
            <Col offset={1} span={6}>
              <Select
                style={{ width: 200 }}
                showSearch
                onSearch={searchShare}
                notFoundContent={fetching ? <Spin size="small" /> : null}
                filterOption={false}
                onChange={changeShare}
                placeholder="输入股票代码搜索"
              >
                {allShares.map(item => (
                  <Option value={item.id} key={item.id}>{`${item.sec_name}(${item.symbol})`}</Option>
                ))}
              </Select>
            </Col>
            <Col span={1}><Button type="primary" onClick={addShare}>加入面板</Button></Col>
            <Col span={1} offset={2}><Button type="primary" onClick={getIndexListAndShowIndexModal}>自定义指数</Button></Col>
          </Row>
          <Divider />
          <Row>
          <Col span={24}><Table rowSelection={rowSelection} loading={recommendTableLoading} pagination={false} columns={recommendColumns} dataSource={currentRecommendShareList} scroll={{y: 500}} /></Col>
          </Row>
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col>
          <EditTable 
            setChartData={setChartData} 
            symbolList={symbolList} 
            saveRow={saveRow} 
            cancelSubscribeShare={cancelSubscribeShare}
            setAttackPriceMark={setAttackPriceMark}
            setStopLossPriceMark={setStopLossPriceMark}
            setCounterPriceMark={setCounterPriceMark}
          />
        </Col>
      </Row>
      <Modal
        title="指数"
        visible={indexModalVisible}
        onOk={() =>  setIndexModalVisible(false)}
        onCancel={() => setIndexModalVisible(false)}
        width={1000}
      >
        <Select onChange={changeIndex} style={{ width: 200 }} value={currentIndexData}>
          <Option value={0}>无</Option>
          {indexList.map(item => (<Option key={item.id} value={item.id}>{item.name}</Option>))}
        </Select>
        <Divider />
        {indexDetail.length > 0?<SimpleStock oriData={indexDetail} />:null}
      </Modal>
    </div>
  )
}

export default connect(({ mainPage }) => ({
  mainPage,
}))(PageIndex);
