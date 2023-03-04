import React from 'react';
import FileUpload from "./FileUpload";
const ControlPanel = ({onUpload}) => {
    return (
        <div style={{
            position: 'absolute',
            top: '25px',
            left: '25px',
            background: 'white',
            padding: '12px',
        }}
        >>
        <FileUpload onUpload={onUpload}/>
        <table>
            <tr>
                <td>Slice I</td>
                <td>
                    <input className='sliceI' type="range" min="0" max="2.0" step="1" value="1"/>
                </td>
            </tr>
            <tr>
                <td>Slice J</td>
                <td>
                    <input className='sliceJ' type="range" min="0" max="2.0" step="1" value="1"/>
                </td>
            </tr>
            <tr>
                <td>Slice K</td>
                <td>
                    <input className='sliceK' type="range" min="0" max="100" step="1" value="1"/>
                </td>
            </tr>
            <tr>
                <td>Color level</td>
                <td>
                    <input className='colorLevel' type="range" min="-3926" max="3926" step="1" value="1"/>
                </td>
            </tr>
            <tr>
                <td>ColorWindow</td>
                <td>
                    <input className='colorWindow' type="range" min="0" max="3926" step="1" value="1"/>
                </td>
            </tr>
        </table>
        </div>
    );
}

export default ControlPanel;
