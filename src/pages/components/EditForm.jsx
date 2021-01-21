import React from 'react';
import { Form, Input, Button } from 'antd';

const EditForm = () => {
    const [form] = Form.useForm();
    return (
        <Form form={form} layout="inline">
            <Form.Item label="手数">
                <Input />
            </Form.Item>
            <Form.Item label="顺攻价">
                <Input />
            </Form.Item>
            <Form.Item label="价差">
                <Input />
            </Form.Item>
            <Form.Item label="固定止损">
                <Input />
            </Form.Item>
            <Form.Item><Button type="submit" type="primary">更新所选股票</Button></Form.Item>
        </Form>
    )
}

export default EditForm;
