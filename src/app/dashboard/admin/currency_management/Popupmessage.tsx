"use client";
import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
const Popupmessage = ({onClose}:any) => {
    
  return (
    <div>
      <div className="fixed inset-y-0 right-0">
        <div className="absolute right-0 top-0 h-full w-[556px] rounded-tl-xl border-2 bg-white">
          <div className="pl-[41px] pr-6 pt-[34px]">
            <div className="flex w-[491px] items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold leading-9 text-accent_text_black">
                  History
                </h3>
              </div>
              <div onClick={onClose} className="h-6 w-6 cursor-pointer">
                <RxCross2 className="h-[14px] w-[14px] text-black" />
              </div>
            </div>
            <div className="mt-[18px]">
              <h3 className="mt-[18px] text-xl font-medium leading-[30px] text-accent_text_charcoal">
                AFN - Afghan Afghani{" "}
              </h3>
              <p className="mt-2 text-sm font-medium leading-[21px] text-accent_text_light_gray">
                Currency exchange rate history
              </p>
            </div>

            <div className="mt-[50px] flex w-[491px] items-center justify-between">
              <div className="w-[247px]">
                <div className="w-full bg-accent_bg_gray">
                  <h3 className="py-[18px] pl-2 text-sm font-medium leading-[21px] text-accent_text_gray">
                    Date
                  </h3>{" "}
                </div>
                <div className="w-full bg-accent_bg_light_gray">
                  <h3 className="px-2 py-[18.5px] text-sm font-normal leading-[21px] text-accent_text_light_gray">
                    5/27/15
                  </h3>{" "}
                </div>
                <div className="w-full bg-accent_bg_light_gray">
                  <h3 className="px-2 py-[18.5px] text-sm font-normal leading-[21px] text-accent_text_light_gray">
                    5/27/15
                  </h3>{" "}
                </div>
              </div>
              <div className="w-[244px]">
                <div className="w-full bg-accent_bg_gray">
                  <h3 className="py-[18px] pl-2 text-sm font-medium leading-[21px] text-accent_text_gray">
                    Exchange Rate
                  </h3>{" "}
                </div>
                <div className="w-full bg-accent_bg_light_gray">
                  <h3 className="px-2 py-[18.5px] text-sm font-normal leading-[21px] text-accent_text_light_gray">
                    $106.55
                  </h3>{" "}
                </div>
                <div className="w-full bg-accent_bg_light_gray">
                  <h3 className="px-2 py-[18.5px] text-sm font-normal leading-[21px] text-accent_text_light_gray">
                    $106.55
                  </h3>{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popupmessage;
