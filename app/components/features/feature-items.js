import React from 'react';
const features = [
    {
        id: 1,
        title: "Manage Timelines Effectively",
        description:
            "Dedicate a specific number of hours to your client’s retainer and schedule work against that amount at a pace that works for both you and your client.",
        icon: "/clock.svg", // Replace with your actual icon path
    },
    {
        id: 2,
        title: "Create Professional Reports",
        description:
            "Generate and send retainer summary reports at any point during a retainer period to keep your clients happy and informed.",
        icon: "/report.svg", // Replace with your actual icon path
    },
    {
        id: 3,
        title: "Tame Scope Creep",
        description:
            "Dedicate a specific number of hours to your client’s retainer and schedule work against that amount at a pace that works for both you and your client.",
        icon: "/scope.svg", // Replace with your actual icon path
    },
    {
        id: 4,
        title: "Streamline Your Workflow",
        description:
            "Recurring invoicing, time tracking, project management, and reporting all seamlessly work together with this one, easy-to-use tool.",
        icon: "/workflow.svg", // Replace with your actual icon path
    },
];
const FeatureItems = () => {
    return (
        <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="flex flex-col items-start max-w-[580px] bg-white rounded-lg p-6"
                        >
                            {/* Icon */}
                            <div className="flex items-center justify-center  rounded-full ">
                                <img
                                    src={feature.icon}
                                    alt={feature.title}
                                    className=" text-indigo-600 w-10 h-10"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeatureItems;