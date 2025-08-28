import Image from 'next/image';

const lifestylePackagesData = [
  {
    name: "Diabetes",
    icon: "https://frontend.apollodiagnostics.in/images/home/popularcategories/Diabetes1%206.png",
    href: "https://apollodiagnostics.in/lifestyle-packages/diabetes-81",
  },
  {
    name: "Cardiovascular Diseases",
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Cardiovascular%20Disease-1%209-10.png?",
    href: "https://apollodiagnostics.in/lifestyle-packages/cardiovascular-diseases-82",
  },
  {
    name: "Hypertension",
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Hypertension12-11.png?",
    href: "https://apollodiagnostics.in/lifestyle-packages/hypertension-83",
  },
  {
    name: "Gut Health",
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Gut%20Health%202%202%207-12.png?",
    href: "https://apollodiagnostics.in/lifestyle-packages/gut-health-84",
  },
  {
    name: "Bone Health",
    icon: "https://frontend.apollodiagnostics.in/images/home/popularcategories/Bone%20health-6.png",
    href: "https://apollodiagnostics.in/lifestyle-packages/bone-health-85",
  },
  {
    name: "Alcohol",
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Alcohol-1%204-14.png?",
    href: "https://apollodiagnostics.in/lifestyle-packages/alcohol-86",
  },
  {
    name: "Cancer",
    icon: "https://frontend.apollodiagnostics.in/images/home/popularcategories/Cancer-new2.png",
    href: "https://apollodiagnostics.in/lifestyle-packages/cancer-87",
  },
  {
    name: "Depression",
    icon: "https://frontend.apollodiagnostics.in/images/home/popularcategories/Depression-new5.png",
    href: "https://apollodiagnostics.in/lifestyle-packages/depression-89",
  },
];

const LifestylePackages = () => {
  return (
    <section className="bg-muted py-16">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="text-center mb-10">
          <p className="text-[hsl(340,82%,52%)] text-sm font-bold tracking-[0.2em] uppercase">PACKAGES</p>
          <h2 className="text-3xl font-bold text-foreground mt-2">Lifestyle Packages</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {lifestylePackagesData.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="group flex flex-col items-center justify-start p-4 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-[170px]"
            >
              <div className="relative h-[80px] w-[80px]">
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <p className="mt-4 font-semibold text-sm text-foreground leading-tight">
                {item.name}
              </p>
            </a>
          ))}
        </div>
        <div className="text-center mt-12">
          <a
            href="https://apollodiagnostics.in/lifestyle-packages"
            className="inline-block border border-primary text-primary font-medium py-2 px-6 rounded-[4px] hover:bg-secondary transition-colors"
          >
            View All
          </a>
        </div>
      </div>
    </section>
  );
};

export default LifestylePackages;