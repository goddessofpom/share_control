import { InputNumber, Table, Form, Popconfirm, Select, Button, Input, Space } from "antd";
import React, { useState } from 'react';

const { Option } = Select;

const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps}) => {
    const node = inputType === "string"? <InputNumber />:<Select dropdownMatchSelectWidth><Option value={0}>托管执行</Option><Option value={-1}>停止</Option></Select>
    return (
        <td {...restProps}>
            {editing? <Form.Item name={dataIndex}>
                {node}
            </Form.Item>: <div>{children}</div>}
        </td>
    )
}


const EditTable = props => {
    const [form] = Form.useForm();
    const { symbolList, saveRow, cancelSubscribeShare, setChartData, setAttackPriceMark, setStopLossPriceMark, setCounterPriceMark } = props;
    const [editingKey, setEditingKey] = useState("")
    const isEditing = (record) => record.key === editingKey;
    let searchInput = null;

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        setChartData(selectedRows[0].symbol)
        setAttackPriceMark(selectedRows[0].attackPrice)
        setStopLossPriceMark(selectedRows[0].stopLoss)
        setCounterPriceMark(selectedRows[0].counterPrice)
      },
      type: "radio",
    }

    const edit = (record) => {
        form.setFieldsValue({
          ...record,
        });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (key) => {
        const row = await form.validateFields();
        saveRow(key, row)
        setAttackPriceMark(row.attackPrice)
        setStopLossPriceMark(row.stopLoss)
        setCounterPriceMark(row.counterPrice)
        setEditingKey('')
    }

    const cancelSubscribe = record => {
        cancelSubscribeShare(record)
    }

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm()
    }

    const handleReset = clearFilters => {
        clearFilters()
    }

    const getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
              <Input
                ref={node => {
                  searchInput = node;
                }}
                value={selectedKeys[0]}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                style={{ width: 188, marginBottom: 8, display: 'block' }}
              />
              <Space>
                <Button
                  type="primary"
                  onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                  size="small"
                  style={{ width: 90 }}
                >
                  搜索
                </Button>
                <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                  重置
                </Button>
              </Space>
            </div>
        ),
        onFilter: (value, record) => record[dataIndex].includes(value)
    })

    const columns = [
        {
          title: "标的",
          dataIndex: "symbol",
          key: "symbol",
          ...getColumnSearchProps("symbol"),
        },
        {
          title: "股票",
          dataIndex: "symbol_name",
          key: "symbol_name",
          ...getColumnSearchProps("symbol_name"),
        },
        {
          title: "最新价",
          dataIndex: "price",
          key: "price",
        },
        {
          title: "持仓",
          dataIndex: "position",
          key: "position",
        },
        {
          title: "持仓成本",
          dataIndex: "holdPosition",
          key: "holdPosition",
        },
        {
          title: "盈亏",
          dataIndex: "profit",
          key: "profit",
        },
        {
          title: "手数",
          dataIndex: "lots",
          key: "lots",
          editable: true,
          inputType: "string"
        },
        {
          title: "顺攻价",
          dataIndex: "attackPrice",
          key: "attackPrice",
          editable: true,
          inputType: "string"
        },
        {
          title: "价差",
          dataIndex: "priceGap",
          key: "priceGap",
          editable: true,
          inputType: "string"
        },
        {
          title: "反击价",
          dataIndex: "counterPrice",
          key: "counterPrice",
          editable: true,
          inputType: "string"
        },
        {
          title: "反击价差",
          dataIndex: "counterPriceGap",
          key: "counterPriceGap",
        },
        {
          title: "跟踪价格",
          dataIndex: "tracingPrice",
          key: "tracingPrice",
        },
        {
          title: "跟踪价差",
          dataIndex: "tracingPriceGap",
          key: "tracingPriceGap",
          editable: true,
          inputType: "string"
        },
        {
          title: "固定止损",
          dataIndex: "stopLoss",
          key: "stopLoss",
          editable: true,
          inputType: "string"
        },
        {
          title: "触发价差",
          dataIndex: "triggerPrice",
          key: "triggerPrice",
        },
        {
          title: "十面埋伏",
          dataIndex: "smmf",
          key: "smmf",
          editable: true,
          inputType: "select",
          render: val => val === 0?"托管执行": "停止"
        },
        {
          title: "闪电战",
          dataIndex: "sdz",
          key: "sdz",
          editable: true,
          inputType: "select",
          render: val => val === 0?"托管执行": "停止"
        },
        {
            title: "操作",
            dataIndex: "operation",
            key: "operation",
            render: (_, record) => {
                const editable = isEditing(record);
                return editable? (
                    <span>
                        <a
                            onClick={() => save(record.key)}
                            style={{
                                marginRight: 8,
                            }}
                            >
                            保存
                            </a>
                            <Popconfirm okText="是" cancelText="否" title="确定取消?" onConfirm={cancel}>
                            <a>取消</a>
                            </Popconfirm>
                    </span>
                ) : (
                    <span>
                    <a style={{ marginRight: 8 }} disabled={editingKey !== ''} onClick={() => edit(record)}>
                        修改
                    </a>
                    <Popconfirm okText="是" cancelText="否" title="是否取消订阅" onConfirm={() => cancelSubscribe(record)}>
                    <a>删除</a>
                    </Popconfirm>
                    </span>
                )
            }
        }
    ]


    const mergedColumns = columns.map(col => {
        if(!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: record => ({
                record,
                inputType: col.inputType,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record)
            })
        }
    })
    return (
        <Form form={form} component={false}>
            <Table 
                components={{
                    body: {
                        cell: EditableCell
                    }
                }}
                pagination={false} 
                scroll={{ y: 350 }} 
                columns={mergedColumns}
                dataSource={symbolList}
                rowSelection={rowSelection}
            />
        </Form>
    )
}

export default EditTable;
