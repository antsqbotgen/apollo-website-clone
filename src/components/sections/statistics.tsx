import React from 'react';

const statisticsData = [
  {
    value: '10Mn',
    label: 'High-quality diagnostic tests every year',
  },
  {
    value: '40Mn',
    label: 'Total No. of Customers',
  },
  {
    value: '99%',
    label: 'Customer Satisfaction Rate',
  },
  {
    value: '140+',
    label: 'Total No. of Labs',
  },
  {
    value: '12,000+',
    label: 'Pickup Points',
  },
];

const Statistics = () => {
  return (
    <section className="bg-secondary py-16">
      <div className="max-w-[1200px] mx-auto px-5">
        <h2 className="text-center text-[32px] font-bold text-foreground mb-10">
          Why Choose Apollo Diagnostics?
        </h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {statisticsData.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl font-bold text-primary leading-tight md:text-[40px]">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;