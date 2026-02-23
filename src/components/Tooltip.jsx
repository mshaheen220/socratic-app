import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ text, children, style }) => {
    const [show, setShow] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [placement, setPlacement] = useState('top');
    const wrapperRef = useRef(null);

    const handleMouseEnter = () => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            if (rect.top < 100) {
                setCoords({ top: rect.bottom + 8, left: rect.left + (rect.width / 2) });
                setPlacement('bottom');
            } else {
                setCoords({ top: rect.top - 8, left: rect.left + (rect.width / 2) });
                setPlacement('top');
            }
            setShow(true);
        }
    };

    return (
        <div 
            ref={wrapperRef}
            className="tooltip-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShow(false)}
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', ...style }}
        >
            {children}
            {show && text && createPortal(
                <div 
                    className="tooltip-popup" 
                    style={{ 
                        position: 'fixed', 
                        top: coords.top, 
                        left: coords.left, 
                        transform: placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)', 
                        margin: 0, 
                        bottom: 'auto', 
                        zIndex: 10000 
                    }}
                >
                    {text}
                </div>,
                document.body
            )}
        </div>
    );
};

export default Tooltip;