import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const helpOptions = [
  {
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/icons/prescription-2.png?",
    alt: "Prescription icon",
    bgColor: "bg-secondary", // Brand's light blue
    title: "Have a Prescription?",
    description: "Upload and book your tests",
    href: "https://apollodiagnostics.in/upload-prescription",
    isExternal: true,
  },
  {
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/icons/feature3-3.png?",
    alt: "Phone icon",
    bgColor: "bg-[#e5f7f2]",
    title: "Call us to book your tests",
    description: "Our team of experts will guide you",
    href: "tel:040-4444-2424",
    isExternal: true,
  },
  {
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/icons/whatsapp-4.png?",
    alt: "WhatsApp icon",
    bgColor: "bg-[#e5f7f2]",
    title: "WhatsApp Booking",
    description: "Text us on WhatsApp to book a test",
    href: "https://api.whatsapp.com/send/?phone=918978689444&text=Hi&type=phone_number&app_absent=0",
    isExternal: true,
  },
];

const HelpOptionsSection = () => {
  return (
    <section className="relative -mt-16 md:-mt-[70px] z-10">
      <div className="container mx-auto px-5">
        <div className="max-w-6xl mx-auto rounded-lg overflow-hidden shadow-[0_8px_16px_-4px_rgba(145,158,171,0.2)]">
          <div className="bg-[#0073e5] px-8 py-5">
            <h3 className="text-white font-medium text-[22px]">
              Need help?
            </h3>
          </div>
          <div className="bg-white grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
            {helpOptions.map((option) => {
              const cardContent = (
                <div className="flex w-full h-full items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-[50px] h-[50px] rounded-full flex items-center justify-center flex-shrink-0 ${option.bgColor}`}>
                      <Image
                        src={option.icon}
                        alt={option.alt}
                        width={28}
                        height={28}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#000c17]">
                        {option.title}
                      </p>
                      <p className="text-[13px] text-[#637381] mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
                </div>
              );

              return (
                <div key={option.title}>
                  {option.isExternal ? (
                    <a
                      href={option.href}
                      target={option.href.startsWith('http') ? '_blank' : '_self'}
                      rel={option.href.startsWith('http') ? 'noopener noreferrer' : ''}
                      className="h-full flex"
                    >
                      {cardContent}
                    </a>
                  ) : (
                    <Link href={option.href} className="h-full flex">
                      {cardContent}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpOptionsSection;