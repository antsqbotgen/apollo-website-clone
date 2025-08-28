import Image from "next/image";

interface Step {
  iconSrc: string;
  text: string;
}

const steps: Step[] = [
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/icons/test-5.png?",
    text: "Select Test/Package",
  },
  {
    iconSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/icons/cal-6.png?",
    text: "Choose Date & Time for Home Sample Collection",
  },
  {
    iconSrc: "https://apollodiagnostics.in/images/timeline/agent.png",
    text: "Phlebotomist will visit as per the chosen Date/Time",
  },
];

const StepItem = ({ iconSrc, text, isMobile }: { iconSrc: string; text: string; isMobile?: boolean }) => (
  <div className={`flex flex-col items-center text-center ${isMobile ? '' : 'w-1/3 px-2'}`}>
    <div className="w-[90px] h-[90px] rounded-full bg-white shadow-lg flex items-center justify-center mb-4">
      <Image src={iconSrc} alt={text} width={50} height={50} objectFit="contain" />
    </div>
    <p className="text-base font-medium text-foreground leading-snug max-w-[200px]">{text}</p>
  </div>
);


const ProcessTimeline = () => {
  return (
    <section className="bg-muted py-16">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="text-center mb-16">
          <p className="font-black text-sm text-[var(--brand-pink)] mb-2">OUR PROCESS</p>
          <h2 className="text-[32px] font-bold text-foreground">Easy ordering in 3 Steps</h2>
        </div>

        {/* Desktop View */}
        <div className="relative hidden md:block">
          <div className="w-full h-auto px-12">
            <Image
              src="https://apollodiagnostics.in/images/timelineSection.png"
              alt="Timeline connecting steps"
              width={1040}
              height={106}
              className="w-full"
            />
          </div>
          <div className="absolute top-[-4px] left-0 right-0 flex justify-between items-start px-8 lg:px-[70px]">
            {steps.map((step, index) => (
              <StepItem key={index} iconSrc={step.iconSrc} text={step.text} />
            ))}
          </div>
        </div>
        
        {/* Mobile View */}
        <div className="md:hidden space-y-10">
          {steps.map((step, index) => (
            <StepItem key={index} iconSrc={step.iconSrc} text={step.text} isMobile />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;