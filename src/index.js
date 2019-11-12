import React, {useCallback, useState, useEffect} from 'react'
import {useDropzone} from 'react-dropzone'
import {putFileInStorage} from './putFileInStorage'
import PropTypes from 'prop-types'
import { AvatarWrapper, ImageWrapper } from './theme'
import AddPhoto from './icons/AddPhoto'
import Loading from './icons/Loading'

ReactAvatarFirebase.propTypes = {
  pathToStorage: PropTypes.string,
  imageSrc: PropTypes.string,
  handleGetImage: PropTypes.func,
  animationTime: PropTypes.string,
  size: PropTypes.number,
  borderColor: PropTypes.string,
  borderOpacity: PropTypes.number,
  readOnly: PropTypes.bool,
  storage: PropTypes.object
}

ReactAvatarFirebase.defaultProps = {
  pathToStorage: '',
  imageSrc: null,
  handleGetImage: () => {},
  animationTime: '0.3s',
  size: 128,
  borderColor: '#e2e2e2',
  borderOpacity: 1,
  readOnly: false,
  storage: {}
}

function ReactAvatarFirebase(props) {
  const {pathToStorage, imageSrc, handleGetImage, animationTime, size, borderColor, borderOpacity, readOnly, storage} = props
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState(false)
  const RAFID = Math.random().toPrecision(3)*100

  useEffect(() => {
    if (imageSrc) return setImage(imageSrc)
  }, [loading, imageSrc])

  useEffect(() => {
    setImageOnCanvas(image, size, RAFID)
  }, [image])

  const handleDropFile = async acceptedFile => {
    let file = acceptedFile[0]
    createThumb(file)
    addFileToStorageAndGetTask(file)
  }

  const createThumb = file => {
    const reader = new window.FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setImage(reader.result)
    }
  }

  const onDrop = useCallback(handleDropFile)

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: ['.png', '.jpg', '.jpeg', '.svg']
  })

  const addFileToStorageAndGetTask = async file => {
    setLoading(true)
    try {
      const uploadedImage = await putFileInStorage(storage, pathToStorage, file)
      handleGetImage(uploadedImage)
    } catch (error) {
      console.log({error})
    }
    setLoading(false)
  }

  const Child = () => {
    return <>
      {!readOnly && <input {...getInputProps()} />}
      {isDragActive && !readOnly ? (
        <div>Solte aqui...</div>
      ) : !image ? (
        loading ? <Loading /> : <AddPhoto />
      ) : (
        <ImageWrapper style={{backgroundImage: `url(${image})`}} />
      )}
    </>
  }

  return (
    <>
      <AvatarWrapper
        id={`RAF-canvas-${RAFID}`}
        animationTime={animationTime}
        size={size}
        borderColor={borderColor}
        borderOpacity={borderOpacity}
        readOnly={readOnly}
        {...getRootProps()}>
        <Child />
      </AvatarWrapper>
      <span id="procent"></span>
    </>
  )
}

export default ReactAvatarFirebase

const setImageOnCanvas = (image, size, id) => {
  var ctx = document.getElementById(`RAF-canvas-${id}`);
  ctx = ctx && ctx.getContext('2d');
  let img = new Image(size, size);
  img.src = image;
  ctx.drawImage(img, 0, 0);
  ctx.fillStyle = "rgba(200, 0, 0, 0.1)";
}