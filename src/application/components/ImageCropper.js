import React, { Component } from 'react';
import Cropper from 'react-easy-crop';
import style from '../common/css/cropper.less'
import { relative } from 'path';
import MD5 from 'md5';
import toast from '../common/js/toast';

class ImageCropper extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            imageSrc: this.props.initialValue || '',
            crop: { x: 0, y: 0 },
            zoom: 1,
            aspect: 4 / 5,
            cropShape: 'rect',
            showGrid: true,
            showCopper: this.props.initialValue ? true : false
        }
        this.props.refs(this);
        this.onImageSelected = this.onImageSelected.bind(this);
        this.props.initialValue && this.props.onChange(this.props.initialValue);
    }

    onImageSelected(e) {
        let file = e.target.files[0];
        let path = file ? file.path : undefined;
        let patten = /\.(gif|jpeg|jpg|png)/;
        if (patten.test(path)) {
            let imageSrc = 'file://' + path
            this.setState({
                imageSrc: imageSrc,
                showCopper: true
            })
            this.props.onChange(imageSrc);
        } else {
            toast.show('您上传的可能不是图片哦~请上传图片文件');
        }
    }

    reselectImage() {
        this.setState({
            showCopper: false
        })
    }

    uploadImageToCdn() {
        return new Promise((reslove, reject) => {
            let canvas = document.querySelector('.preview');
            canvas.toBlob(blob => {
                const salt = '_txyy_publish_code_token_a2fc3580-58db-11e8-8094-1997742557f7';
                const size = blob.size;
                const filename = MD5(size + Date.now()).substr(0, 10) + '.jpg';
                const str = [salt, filename, size].join('');
                const token = MD5(str);
                
                let form = new FormData();
                form.append('token', token);
                form.append('file', blob, filename);
                form.append('dist', 'tc');
                let xhr = new XMLHttpRequest();
                console.log(str, token);
                xhr.open('POST', 'https://atest.yk.qq.com/file/publish_file');
                xhr.send(form);
                xhr.onreadystatechange = () => {
                    if (xhr.status == 200) {
                        if (xhr.readyState == 4) {
                            let res = JSON.parse(xhr.responseText);
                            this.props.onChange(res.data.url);
                            reslove(res.data.url);　　　　　　
                        }
                    } else {
                        reject(xhr.statusText);
                    }
                }
            }, 'image/jpg', 1);
       }) 
    }

    onCropChange = crop => {
        this.setState({ crop })
    }

    onZoomChange = zoom => {
        this.setState({ zoom })
    }
    
    onCropComplete = (croppedArea, croppedAreaPixels) => {
        let canvas = document.querySelector('.preview');
        let image = document.querySelector('.image-to-crop');
        image.setAttribute("crossOrigin", 'Anonymous');
        let ctx = canvas.getContext('2d');
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, canvas.width, canvas.height);
    }

    render() {
        return (
            <div style={{position: 'relative', height: '200px', top: '12px'}}>
                <div className="crop-container">
                    {this.state.showCopper ? 
                        <Cropper
                        image={this.state.imageSrc}
                        crop={this.state.crop}
                        zoom={this.state.zoom}
                        aspect={this.state.aspect}
                        cropShape={this.state.cropShape}
                        showGrid={this.state.showGrid}
                        onCropChange={this.onCropChange}
                        onCropComplete={this.onCropComplete}
                        onZoomChange={this.onZoomChange}
                        classes={{imageClassName: 'image-to-crop'}}
                        /> :
                        <div className={style.imagePicker}>
                            <input type='file' accept="image/gif,image/jpeg,image/jpg,image/png" onChange={this.onImageSelected}></input>
                        </div>
                    } 
                </div>
                <div className='previewLabel'>效果预览</div>
                <canvas className='preview'></canvas>
            </div>
        )
    }
}

export default ImageCropper;