import React, { useState } from 'react';

function FileUpload({onUpload}) {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = () => {
        const fileReader = new FileReader();

        fileReader.onloadend = function (evt) {
            if (evt.target.readyState === FileReader.DONE) {
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
