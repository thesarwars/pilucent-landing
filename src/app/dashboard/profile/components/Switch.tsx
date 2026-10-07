import { useEffect, useState } from 'react';

const Switch = ({ value = false, setValue }: any) => {
  // const [toggle, setToggle] = useState(value);

  // useEffect(()=>{
  //   if(setValue) setValue(toggle)
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[toggle,value])

  return (
    <>
      <div
        className={`${
          value ? 'bg-green-500' : 'bg-[#f0f0f0]'
        } relative h-[30px] w-[57px] cursor-pointer rounded-full border border-[#e5eaf2] px-[0.150rem] py-[0.160rem] transition-colors duration-500`}
        onClick={() => setValue(!value)}
      >
        <div
          className={`${
            value ? 'translate-x-[27px]' : 'translate-x-[0px]'
          } h-[23px] w-[23px] rounded-full bg-[#fff] pb-1 transition-all duration-500`}
          style={{ boxShadow: '1px 2px 5px 2px rgb(0,0,0,0.1)' }}
        ></div>
      </div>
    </>
  );
};

export default Switch;
