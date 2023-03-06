import { useState, useRef, useEffect } from 'react';

import '@kitware/vtk.js/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Volume';

// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import NiftiReader from "nifti-reader-js";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import {Row, Col, Container, RangeSlider} from "react-bootstrap";
import ReactBootstrapSlider from 'react-bootstrap-slider';
import FileUpload from "./FileUpload";

const setUpView = (ref, actors, background=[0.0, 0.0, 0.0]) => {
  const genericScreenRender = vtkGenericRenderWindow.newInstance({
      background: background,
  });

  genericScreenRender.setContainer(ref.current);

  const renderWindow = genericScreenRender.getRenderWindow();
  const renderer = genericScreenRender.getRenderer();

  for (const actor of actors) {
      renderer.addActor(actor);
  }

  return {
      renderWindow,
      renderer
  }
}

function App() {
  const sagittalContainerRef = useRef(null);
  const axialContainerRef = useRef(null);
  const coronalContainerRef = useRef(null);
  const vtkContainerRef = useRef(null);

  const context = useRef(null);

  const [imageData, setImageData] = useState(null);
  const [focalPoint, setFocalPoint] = useState([0, 0, 0]);
  const [dimensions, setDimensions] = useState([255, 255, 255]);
  const focalRef = useRef()
  focalRef.current = focalPoint

  const readNifti = (name, file) => {
    const data = NiftiReader.isCompressed(file) ? NiftiReader.decompress(file) : file;

    if (!NiftiReader.isNIFTI(data)) {
      alert('Not a nifti file');
    }

    const header = NiftiReader.readHeader(data);
    const niftiImage = NiftiReader.readImage(header, data);

    const dataArray = vtkDataArray.newInstance({
      numberOfComponents: 1,
      values: new Uint8Array(niftiImage),
    });

    const localImageData = vtkImageData.newInstance()
    localImageData.getPointData().setScalars(dataArray);
    localImageData.setDimensions(header.dims.slice(1, 4));

    setImageData(localImageData);
    setDimensions(header.dims.slice(1, 4))
  };

  // Setup views
  useEffect(() => {
    if (vtkContainerRef && sagittalContainerRef && axialContainerRef && coronalContainerRef) {
      if (!context.current) {

        const imageActorI = vtkImageSlice.newInstance();
        const imageActorJ = vtkImageSlice.newInstance();
        const imageActorK = vtkImageSlice.newInstance();

        const sagittalView = setUpView(sagittalContainerRef, [imageActorI]);
        const axialView = setUpView(axialContainerRef, [imageActorJ]);
        const coronalView = setUpView(coronalContainerRef, [imageActorK]);

        const fullBlastView = setUpView(vtkContainerRef,
                                        [imageActorI, imageActorJ, imageActorK],
                                        [1.0, 1.0, 1.0]);

        context.current = {
          sagittalView,
          axialView,
          coronalView,
          fullBlastView,
          imageActorI,
          imageActorJ,
          imageActorK,
        };
      }
    }
  }, [vtkContainerRef, sagittalContainerRef, axialContainerRef, coronalContainerRef]);

  // Render views
  useEffect(() => {
    if (context.current) {
      const {imageActorI, imageActorJ, imageActorK, sagittalView, fullBlastView, axialView, coronalView} = context.current;
      const imageMapperK = vtkImageMapper.newInstance();
      imageMapperK.setInputData(imageData);
      imageActorK.setMapper(imageMapperK);

      const imageMapperJ = vtkImageMapper.newInstance();
      imageMapperJ.setInputData(imageData);
      imageActorJ.setMapper(imageMapperJ);
      //
      const imageMapperI = vtkImageMapper.newInstance();
      imageMapperI.setInputData(imageData);
      imageActorI.setMapper(imageMapperI);

      setFocalPoint(dimensions.map((x) => x / 2))

      context.current = {
        sagittalView,
        axialView,
        coronalView,
        fullBlastView,
        imageActorI,
        imageActorJ,
        imageActorK,
        imageMapperI,
        imageMapperJ,
        imageMapperK
      };
    }
  }, [imageData]);

  useEffect (() => {
    if (context.current && focalPoint && focalPoint != [0, 0, 0]) {
      const center = dimensions.map((x) => x / 2.0)
      const [i, j, k] = focalPoint
      const {imageMapperI, imageMapperJ, imageMapperK, sagittalView, fullBlastView, axialView, coronalView} = context.current;
      imageMapperK.setKSlice(k);
      imageMapperJ.setJSlice(j);
      imageMapperI.setISlice(i);

      sagittalView.renderer.resetCamera();
      fullBlastView.renderer.resetCamera();
      axialView.renderer.resetCamera();
      coronalView.renderer.resetCamera();

      sagittalView.renderer.getActiveCamera().setViewUp(0, 0, 1)
      sagittalView.renderer.getActiveCamera().setFocalPoint(i, center[1], center[2])
      sagittalView.renderer.getActiveCamera().setPosition(i+510, center[1], center[2])

      axialView.renderer.getActiveCamera().setFocalPoint(center[0], j, center[2])
      axialView.renderer.getActiveCamera().setPosition(center[0], j + 485, center[2])

      coronalView.renderer.getActiveCamera().setFocalPoint(center[0], center[1], k)
      coronalView.renderer.getActiveCamera().setPosition(center[0], center[1], k + 520)

      sagittalView.renderWindow.render();
      fullBlastView.renderWindow.render();
      axialView.renderWindow.render();
      coronalView.renderWindow.render();
    }
  }, [focalPoint])

  const setI = (value) => {
    const [i, j, k] = focalRef.current
    setFocalPoint([value, j, k])
  }

  const setJ = (value) => {
    const [i, j, k] = focalRef.current
    setFocalPoint([i, value, k])
  }

  var setK = (value) => {
    const [i, j, k] = focalRef.current
    setFocalPoint([i, j, value])
  }

  return (
    <Container>
      <Row>
        <FileUpload onUpload={readNifti}/>
      </Row>
      <Row>
        <Col>
          <div ref={sagittalContainerRef} style={{height: 250, width: 250}}/>
          <ReactBootstrapSlider
            min={0}
            max={dimensions[0]}
            value={focalPoint[0]}
            change={(e) => {setI(e.target.value)}}
          />
        </Col>
        <Col>
          <div ref={axialContainerRef} style={{height: 250, width: 250}}/>
          <ReactBootstrapSlider
            min={0}
            max={dimensions[1]}
            value={focalPoint[1]}
            change={(e) => {setJ(e.target.value)}}
          />
        </Col>
        <Col>
          <div ref={coronalContainerRef} style={{height: 250, width: 250}}/>
          <ReactBootstrapSlider
            min={0}
            max={dimensions[2]}
            value={focalPoint[2]}
            change={(e) => {setK(e.target.value)}}
          />
        </Col>
        <Col>
          <div ref={vtkContainerRef} style={{height: 250, width: 250}}/>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
