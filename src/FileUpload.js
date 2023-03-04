import React, { useState } from 'react';
import NiftiReader from 'nifti-reader-js';

function FileUpload({onUpload}) {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = () => {
        console.log('selectedFile', selectedFile);

        // var blob = makeSlice(file, 0, file.size);

        const fileReader = new FileReader();

        fileReader.onloadend = function (evt) {
            if (evt.target.readyState === FileReader.DONE) {
                console.log('fileREader done');
                console.log('evt.target.result', evt.target.result);
                onUpload(selectedFile.name, evt.target.result);
            }
        };

        fileReader.readAsArrayBuffer(selectedFile);
    };



    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleFileUpload}>Upload</button>
        </div>
    );
}

export default FileUpload;
