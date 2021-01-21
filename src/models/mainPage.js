import { apiAddShare, apiDeleteShare, apiEditRow, apiInitData, apiInitSymbol, apiQueryShareInfo } from "../services/mainPage"
import { message } from 'antd';

export default {
    namespace: "mainPage",
    state: {
        userList: [],
        currentUser: {},
        symbolList: [],
        allShares: [],
        cash: {nav: 0, use_rate: 0, fpnl: 0, cum_pnl: 0},
    },
    effects: {
        *getInitData({ payload }, { call, put }) {
            const response = yield call(apiInitData, payload)
            if(response){
                yield put({
                    type: "changeUsers",
                    payload: response.data
                })
                const symbolResponse = yield call(apiInitSymbol, {user_id: response.data[0].id})
                if(symbolResponse){
                    yield put({
                        type: "changeSymbolList",
                        payload: symbolResponse.data,
                    })
                }
            }
        },
        *editRow({ payload }, { call, put, select }){
            const symbolList = yield select(state => state.mainPage.symbolList)
            const symbol = symbolList.find(item => item.symbol === payload.symbol)

            const payloadWithName = {...payload, data: {...payload.data, symbol_name: symbol.symbol_name}}
            const response = yield call(apiEditRow, payloadWithName)
            if(response){
                message.success("操作成功")
                yield put({
                    type: "changeRow",
                    payload: payloadWithName
                })
            }
        },
        *addShare({ payload }, { call, put }){
            const response = yield call(apiAddShare, payload)
            if(response) {
                message.success("操作成功")
                yield put({
                    type: "addShareToSymbolList",
                    payload: response.data
                })
            }
        },
        *deleteShare({ payload }, { call, put }){
            const response = yield call(apiDeleteShare, payload)
            if(response) {
                message.success("操作成功")
                yield put({
                    type: "minusShare",
                    payload
                })
            }
        },
        *queryShare({ payload, callback }, { call, put }){
            const response = yield call(apiQueryShareInfo, payload)
            if(response){
                callback()
                yield put({
                    type: "changeAllShares",
                    payload: response.data
                })
            }
        }
    },
    reducers: {
        changeUsers(state, { payload }){
            return {
                ...state,
                userList: payload,
                currentUser: payload[0]
            }
        },
        changeSymbolList(state, { payload }){
            const data = Object.entries(payload).map(item => (
                {
                    symbol: item[0],
                    symbol_name: item[1]["symbol_name"],
                    price: 0,
                    position: 0,
                    holdPosition: 0,
                    profit: 0,
                    smmf: item[1]["smmf"],
                    sdz: item[1]["sdz"],
                    key: item[0],
                    lots: item[1]["lots"],
                    attackPrice: item[1]["attackPrice"],
                    priceGap: item[1]["priceGap"],
                    counterPrice: item[1]["counterPrice"] || 0,
                    tracingPrice: 0,
                    tracingPriceGap: item[1]["tracingPriceGap"] || 0,
                    counterPriceGap: 0,
                    stopLoss: item[1]["stopLoss"],
                    triggerPrice: 0,
                }
            ))
            return {
                ...state,
                symbolList: data,
            }
        },
        changeTickPrice(state, { payload }) {
            if(payload.length === 0){
                return state
            }
            const symbolList = state.symbolList.map(item => {
                const symbolTick = payload.filter(d => d.symbol === item.symbol)
                const tickLength = symbolTick.length;
                if(tickLength > 0){
                    return {
                        ...item,
                        price: symbolTick[tickLength - 1].price,
                        position: symbolTick[tickLength - 1].tick_position.volume,
                        holdPosition: symbolTick[tickLength - 1].tick_position.cost,
                        profit: symbolTick[tickLength - 1].tick_position.fpnl,
                        tracingPrice: symbolTick[tickLength - 1].tracing_price,
                        triggerPrice: symbolTick[tickLength - 1].trigger_price,
                        counterPriceGap: symbolTick[tickLength - 1].counter_price_gap,
                    }
                }
                return item
            })
            return {
                ...state,
                symbolList,
                cash: payload[payload.length - 1].tick_cash
            }
        },
        changeRow(state, { payload }) {
            const newData = state.symbolList.map(item => (
                item.key === payload.symbol ? 
                {...item, ...payload.data} : item
            ))
            return {
                ...state,
                symbolList: newData,
            }
        },
        changeAllShares(state, { payload }){
            return {
                ...state,
                allShares: payload,
            }
        },
        minusShare(state, { payload }){
            return {
                ...state,
                symbolList: state.symbolList.filter(item => item.symbol !== payload.symbol)
            }
        },
        addShareToSymbolList(state, { payload }){
            const newSymbol = {
                ...payload,
                price: 0,
                position: 0,
                holdPosition: 0,
                profit: 0,
                key: payload.symbol,
                counterPrice: 0,
                tracingPrice: 0,
                triggerPrice: 0,
                counterPriceGap: 0,
                tracingPriceGap: 0
            }
            return {
                ...state,
                symbolList: [...state.symbolList, newSymbol]
            }
        }
    },
}