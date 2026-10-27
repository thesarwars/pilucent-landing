'use client';
import React, { useState, useEffect } from 'react';
import SmoothScroll from '../../../../components/scroll';
import HeroSection from '../../../../components/hero2';
import Recommend from '../../../../components/recommend';
import MainSection from '../../../../components/features/main';
import { features } from '../../../../helpers/dummy-data';
import { useRouter } from 'next/navigation';
import MainFeatureSection from '../../../../components/features/features';
import FeaturesTestimonial from '../../../../components/features/feature-testimonial';
import Testimonial from '../../../../components/testimonial';
import Faq from '../../../../components/faq';
import Build from '../../../../components/build';
import MarketingSection from '../../../../components/knowledge';
import FeatureItems from '../../../../components/features/feature-items';

const Features = ({ params }) => {
    const router = useRouter();
    const [selectedFeature, setSelectedFeature] = useState(null);

    useEffect(() => {
        const feature = features.find(f => f.slug === params.slug);
        setSelectedFeature(feature);
    }, [params.slug]);

    const handleTabClick = (slug) => {
        const feature = features.find(f => f.slug === slug);
        router.push(`/features/${slug}`);
        setSelectedFeature(feature);
    };

    return (
        <div className="font-inter">
            <SmoothScroll />
            <div className="bg-[#6A6EF6]">
                <HeroSection tabs={features} onTabClick={handleTabClick} selectedFeature={selectedFeature || features[0]} />
            </div>
            {selectedFeature && <MainSection data={selectedFeature} />}
            <Recommend />

            <MainFeatureSection data={selectedFeature} />
            <FeaturesTestimonial />
            <FeatureItems />
            <MarketingSection />
            <Testimonial />
            <Faq />
            <Build />
        </div>
    );
};

export default Features;