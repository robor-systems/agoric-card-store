import React from 'react';
import CancelIcon from '../assets/icons/cancel.png';

const ModalWrapper = ({ open, onClose, children, style }) => {
  return (
    open && (
      <div className="fixed inset-0 h-full w-full">
        <div className="h-full justify-center mx-auto w-max items-center flex relative inset-0 z-50 outline-none focus:outline-none">
          <div
            className={`relative w-auto my-6 mx-auto overflow-y-auto ${style}`}
          >
            <div className=" border-0 rounded-lg shadow-lg relative object-contain flex flex-col w-full bg-white outline-none focus:outline-none">
              <div className="flex justify-end mr-6 mt-6 mb-2.5">
                <button onClick={onClose}>
                  <img src={CancelIcon} alt="close" className="w-3.5 h-3.5" />
                </button>
              </div>
              <>{children}</>
            </div>
          </div>
        </div>
        <div
          onClick={() => {
            console.log('clicking');
            onClose();
          }}
          className="opacity-25 absolute w-full h-full inset-0 z-40 bg-black"
        ></div>
      </div>
    )
  );
};

export default ModalWrapper;
