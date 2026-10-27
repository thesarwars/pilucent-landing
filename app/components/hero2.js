'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const HeroSection = ({ tabs, onTabClick, selectedFeature }) => {
  // const [selectedTab, setSelectedTab] = useState(tabs[0]);

  // const handleTabClick = (tab) => {
  //   setSelectedTab(tab);
  //   onTabClick(tab);
  // };
  const router = useRouter();

  return (
    <section className="text-white text-center py-12">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className='md:w-[880px] mx-auto'>
          <h1 className="text-h2 mb-4 text-wrap">
            {selectedFeature?.title}
          </h1>
          {/* Subheading */}
          <p className="text-p1 text-body_text mb-6 text-wrap">
            {selectedFeature?.description}
          </p>
        </div>
        {/* Button */}
        <button onClick={() => router.push('/demo')} className="bg-primary_btn text-text_blue font-semibold py-3 px-6 rounded-lg shadow-md">
          Get free demo
        </button>
        {/* Tabs */}
        <div className="flex flex-wrap justify-center mt-8 gap-2">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => onTabClick(tab?.slug)}
              className={`px-4 py-2 border border-white text-white rounded-md font-medium hover:bg-gray-100 hover:text-text_blue transition duration-200 ${selectedFeature?.slug === tab?.slug ? 'bg-gray-100 !text-text_blue' : ''}`}
            >
              {tab.head}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
