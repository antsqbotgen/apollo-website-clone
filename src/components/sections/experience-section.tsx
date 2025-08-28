import React from 'react';

const ExperienceSection = () => {
  return (
    <section className="bg-secondary py-[60px] text-center">
      <div className="container mx-auto px-5">
        <h2 className="mb-2 text-base font-bold uppercase tracking-[0.1em] text-primary">
          Experience at Apollo
        </h2>
        <h2 className="mx-auto mb-6 max-w-[900px] text-[32px] font-black leading-[1.2] text-foreground">
          “Experience safe, reliable diagnostics, powered by expertise”
        </h2>
        {/* Using h2 to match the source HTML structure, though semantically a <p> might be more appropriate. */}
        <h2 className="mx-auto max-w-[900px] text-lg font-normal leading-normal text-muted-foreground">
          A diagnostic service which consistently delivers accurate and precise results, minimizing errors. This is achieved through the use of advanced diagnostic technologies, coupled with stringent quality control processes. At Apollo Diagnostics, we follow standardized protocols and guidelines that align with international quality standards including ISO certifications, CAP accreditation &amp; NABL in healthcare to ensure precision, quality and efficiency of results.
        </h2>
      </div>
    </section>
  );
};

export default ExperienceSection;