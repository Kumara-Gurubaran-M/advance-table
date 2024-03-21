import React, { useState } from 'react'
import { FaEye, FaLayerGroup } from "react-icons/fa";
import { LuArrowUpDown } from "react-icons/lu";
import { PiFunnelSimpleBold } from "react-icons/pi";

function Navbar({ setShowSidePanel, setSearchQuery, setShowSidePanelSort, setShowSidePanelGrp, setShowSidePanelFilter }) {
    const [query, setQuery] = useState('');

    const handleInputChange = (e) => {
        const { value } = e.target;
        setQuery(value);
        setSearchQuery(value);
    };



    return (
        <nav className='d-flex justify-content-end my-4'>
            <input className='px-2' placeholder='Search' value={query} onChange={handleInputChange}></input>
            <div className='ps-2 d-flex '>
                <div className='ms-3'><FaEye onClick={() => setShowSidePanel(prevState => !prevState)} /></div>
                <div className='ms-3' ><LuArrowUpDown onClick={() => setShowSidePanelSort(prevState => !prevState)} /></div>
                <div className='ms-3' ><PiFunnelSimpleBold onClick={() => setShowSidePanelGrp(prevState => !prevState)} /></div>
                <div className='ms-3' > <FaLayerGroup onClick={() => setShowSidePanelFilter(prevState => !prevState)} /></div>
            </div>

        </nav>
    )
}

export default Navbar