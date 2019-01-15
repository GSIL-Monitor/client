import React, { Component } from 'react'
import { Layout, Button, Icon, Form, Input, Select, DatePicker } from "antd";
import {
    HashRouter as Router,
    Route,
    Link,
    Switch,
    NavLink ,
    Redirect
} from "react-router-dom";
import moment from 'moment';
import ImageCropper from '../components/ImageCropper';
import backgroundResolver from '../communication/backgroundResolver';
import style from '../common/css/projectcreate.less';
import datefromatter from '../common/js/dateformatter';
import toast from '../common/js/toast';
import {loading} from './LoadingControl';
import {projectType} from '../../config';

const {Content} = Layout;
const Option = Select.Option;
const FormItem = Form.Item;

class ProjectEditContainer extends Component {
    
    constructor(props) {
        super(props);
        let projectInfoStr = props.location.pathname.replace('/edit/', '');
        let projectInfo = JSON.parse(projectInfoStr);
        console.log(projectInfo);
        this.state = {
            types: [],
            projectInfo: projectInfo
        }
        this.onClickSubmit = this.onClickSubmit.bind(this);
        this.onReselectImage = this.onReselectImage.bind(this);
    }

    componentDidMount() {
        backgroundResolver.request('/projectType').then(({param}) => {
            this.setState({
                types: param
            })
        }).catch(err => {
            console.log('projectType', err);
        })
    }

    onClickSubmit(e) {
        e.preventDefault();
        if (this.isAddingProject) {
            toast.show('正在创建中, 请勿重复点击');
            return;
        }
        this.props.form.validateFields((err, values) => {
            let emptyIndex = [values.name, values.index, values.time, values.cover].findIndex((item, i) => {
                return item === undefined || item === null
            });
            if (emptyIndex != -1) {
                let emptyItem = ['名称', '类型', '时间', '海报'][emptyIndex];
                toast.show('项目信息未填写完整: ' +  emptyItem);
                return;
            } else {
                const trimed = values.name.replace(/\s/g, '');
                if (trimed == '') {
                    toast.show('请输入有效项目名');
                    return;
                } 
            }
            if (!err) {
                this.isAddingProject = true;
                this.child.uploadImageToCdn().then(url => {
                    console.log('Received values of form: ', values, this.state.types);
                    const item = this.state.types[values.index];
                    const param = {
                        name: values.name,
                        cover: url,
                        time: datefromatter.dateToString(values.time.toDate()),
                        type: projectType[item.attrItemName],
                        id: item.attrItemId
                    }
                    console.log('editProject', param);
                    loading.startLoading('正在编辑...');
                    backgroundResolver.request('/editProject', {
                        id: this.state.projectInfo.projectId,
                        input: param
                    }).then(res => {
                        console.log('addProject', res);
                        //  成功之后返回首页
                        loading.stopLoading();
                        toast.show('编辑成功', () => {
                            this.props.history.push('/home');
                            this.isAddingProject = false;
                        });
                    }).catch(err => {
                        console.log('addProject', err);
                        loading.stopLoading();
                        toast.show('编辑失败');
                        this.isAddingProject = false;
                    })
                }).catch(err => {
                    console.log('uploadImageToCdn Error', err);
                    toast.show('图片上传失败');
                    this.isAddingProject = false;
                })
            }
        });
    }

    onReselectImage() {
        this.child.reselectImage();
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };
        const name = this.state.projectInfo.projectName;
        const type = this.state.projectInfo.projectType;
        const time = moment(this.state.projectInfo.time * 1000);
        const cover = this.state.projectInfo.cover;
        return(
            <Content className={style.content}>
                <NavLink to='/home' className={style.navBack}>
                    <Icon type="left"></Icon> 编辑项目
                </NavLink>
                <div className={style.formWrapper}>
                    <Form onSubmit={this.onClickSubmit} style={{maxWidth: "750px", paddingLeft: "150px"}}>
                        <FormItem label="项目名称" {...formItemLayout}>
                            {getFieldDecorator('name', {rules: [{required: false}], initialValue: name})(<Input placeholder="例: 择天记"></Input>)}
                        </FormItem>
                        <FormItem label="项目类型" {...formItemLayout}>
                            {getFieldDecorator('index', {rules: [{required: false}], initialValue: type})(
                            <Select placeholder="例: 电影">
                                {this.state.types.map((item, index) => {
                                    return <Option value={index}>{item.attrItemName}</Option>
                                })}
                            </Select>)}
                        </FormItem>
                        <FormItem label="上映时间" {...formItemLayout}>
                            {getFieldDecorator('time', {rules: [{required: false, type: 'object'}], initialValue: time})(<DatePicker placeholder='例: 2018/09/05' format='YYYY/MM/DD'/>)}
                        </FormItem>
                        <FormItem label="海报" {...formItemLayout}>
                            {getFieldDecorator('cover', {rules: [{required: false}]})(<ImageCropper refs={r => this.child = r} initialValue={cover}></ImageCropper>)}
                        </FormItem>
                        <FormItem {...tailFormItemLayout}>
                            <Button type="primary" onClick={this.onReselectImage}>更换图片</Button><Button type="primary" htmlType="submit">确认</Button>
                        </FormItem>
                    </Form>
                </div>
            </Content>
        )
    }
}

const WrappedEditCreateContainer = Form.create()(ProjectEditContainer);

export default WrappedEditCreateContainer;