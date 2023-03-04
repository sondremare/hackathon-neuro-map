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
import ControlPanel from "./ControlPanel";
import NiftiReader from "nifti-reader-js";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import {setUpView} from "./setUpView";

function App() {
  const sagitalContainerRef = useRef(null);
  const axialContainerRef = useRef(null);
  const coronalContainerRef = useRef(null);
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [imageData, setImageData] = useState(null);

  const readNifty = (name, file) => {
    const data = NiftiReader.isCompressed(file) ? NiftiReader.decompress(file) : file;

    if (!NiftiReader.isNIFTI(data)) {
      alert('not nifty data breh!');
    }

    const header = NiftiReader.readHeader(data);
    console.log('heaader', header);
    const niftiImage = NiftiReader.readImage(header, data);

    console.log('niftiImage', niftiImage);

    const dataArray = vtkDataArray.newInstance({
      numberOfComponents: 1,
      values: new Uint8Array(niftiImage),
    });

    console.log('dataArray - range', dataArray.getRange());


    const localImageData = vtkImageData.newInstance()
    localImageData.getPointData().setScalars(dataArray);
    localImageData.setDimensions(header.dims.slice(1, 4));
    // localImageData.setDimensions([167, 212, 160]); // TODO: SET THE DIMENSIONS LIKE A NON_NNUUB

    console.log('localImageData', localImageData.toJSON());
    console.log('extent', localImageData.getExtent());
    console.log('dims', localImageData.getDimensions());

    setImageData(localImageData);
  };

  // Show full 3D view
  useEffect(() => {
    if (context.current) {
      const {imageActorI, imageActorJ, imageActorK, sagitalView, fullBlastView, axialView, coronalView} = context.current;
      const imageMapperK = vtkImageMapper.newInstance();
      imageMapperK.setInputData(imageData);
      imageMapperK.setKSlice(30);
      imageActorK.setMapper(imageMapperK);
      console.log('YAY');

      const imageMapperJ = vtkImageMapper.newInstance();
      imageMapperJ.setInputData(imageData);
      imageMapperJ.setJSlice(30);
      imageActorJ.setMapper(imageMapperJ);
      //
      const imageMapperI = vtkImageMapper.newInstance();
      imageMapperI.setInputData(imageData);
      imageMapperI.setISlice(30);
      imageActorI.setMapper(imageMapperI);
      //
      sagitalView.renderer.resetCamera();
      fullBlastView.renderer.resetCamera();
      axialView.renderer.resetCamera();
      coronalView.renderer.resetCamera();

      sagitalView.renderer.resetCameraClippingRange();
      fullBlastView.renderer.resetCameraClippingRange();
      axialView.renderer.resetCameraClippingRange();
      coronalView.renderer.resetCameraClippingRange();

      sagitalView.renderWindow.render();
      fullBlastView.renderWindow.render();
      axialView.renderWindow.render();
      coronalView.renderWindow.render();

    }
  }, [imageData]);

  // setup 3d view
  useEffect(() => {
    if (vtkContainerRef && sagitalContainerRef && axialContainerRef && coronalContainerRef) {
      if (!context.current) {

        const imageActorI = vtkImageSlice.newInstance();
        const imageActorJ = vtkImageSlice.newInstance();
        const imageActorK = vtkImageSlice.newInstance();

        const sagitalView = setUpView(sagitalContainerRef, [imageActorI]);
        const axialView = setUpView(axialContainerRef, [imageActorJ]);
        const coronalView = setUpView(coronalContainerRef, [imageActorK]);

        const fullBlastView = setUpView(vtkContainerRef, [imageActorI, imageActorJ, imageActorK]);

        context.current = {
          sagitalView,
          axialView,
          coronalView,
          fullBlastView,
          imageActorI,
          imageActorJ,
          imageActorK,
        };
      }
    }

    return () => {

    };
    // return () => {
    //   if (context.current) {
    //     const { fullScreenRenderer, actor, mapper } = context.current;
    //     actor.delete();
    //     mapper.delete();
    // fullScreenRenderer.delete();
    // context.current = null;
    // }
    // };
  }, [vtkContainerRef, sagitalContainerRef, axialContainerRef, coronalContainerRef]);

  return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex'}}>
          <div ref={sagitalContainerRef} style={{height: 500, width: 500}}/>
          <div ref={axialContainerRef} style={{height: 500, width: 500}}/>
        </div>
        <div style={{display: 'flex'}}>
          <div ref={coronalContainerRef} style={{height: 500, width: 500}}/>
          <div ref={vtkContainerRef} style={{height: 500, width: 500}}/>
        </div>
        <ControlPanel onUpload={readNifty}/>
      </div>
  );
}

export default App;
