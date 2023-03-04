import { useState, useRef, useEffect } from 'react';

import '@kitware/vtk.js/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Volume';

// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import ControlPanel from "./ControlPanel";
import FileUpload from "./FileUpload";
import NiftiReader from "nifti-reader-js";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";

function App() {
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

  useEffect(() => {
    if (context.current) {
      const {imageActorI, imageActorJ, imageActorK, renderer, renderWindow} = context.current;
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
      renderer.resetCamera();
      renderer.resetCameraClippingRange();
      console.log('RENDER PLZ');
      renderWindow.render();
      console.log('HAS RENEDERED?');
    } else {
      console.log('FOOOK');
    }
  }, [imageData]);

  useEffect(() => {
    if (!context.current) {

      const genericScreenRender = vtkGenericRenderWindow.newInstance({
        background: [0.5, 0.5, 0.5],
      });

      genericScreenRender.setContainer(vtkContainerRef.current);

      const renderWindow = genericScreenRender.getRenderWindow();
      const renderer = genericScreenRender.getRenderer();

      const imageActorI = vtkImageSlice.newInstance();
      const imageActorJ = vtkImageSlice.newInstance();
      const imageActorK = vtkImageSlice.newInstance();

      renderer.addActor(imageActorK);
      renderer.addActor(imageActorJ);
      renderer.addActor(imageActorI);

      context.current = {
        renderWindow,
        renderer,
        imageActorI,
        imageActorJ,
        imageActorK,
        // coneSource,
        // actor,
        // mapper,
      };
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
  }, [vtkContainerRef]);


  /* **/

  //
  // useEffect(() => {
  //   if (context.current) {
  //     const { coneSource, renderWindow } = context.current;
  //     coneSource.setResolution(coneResolution);
  //     renderWindow.render();
  //   }
  // }, [coneResolution]);

  // useEffect(() => {
  //   if (context.current) {
  //     const { actor, renderWindow } = context.current;
  //     actor.getProperty().setRepresentation(representation);
  //     renderWindow.render();
  //   }
  // }, [representation]);

  return (
      <div>
        <div ref={vtkContainerRef} />
        <ControlPanel onUpload={readNifty}/>
      </div>
  );
}

export default App;
