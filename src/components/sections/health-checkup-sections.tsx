import Image from 'next/image';

const mensHealthCategories = [
  {
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Under%2030%20years%2068-18.png?",
    alt: "Under 30 years",
    title: "Under 30 years",
    href: "https://apollodiagnostics.in/mens-health/under-30-years-72"
  },
  {
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Age%2030-45%20years%206-19.png?",
    alt: "Age 30-45",
    title: "Age 30-45",
    href: "https://apollodiagnostics.in/mens-health/age-3045-73"
  },
  {
    imageSrc: "https://frontend.apollodiagnostics.in/images/home/popularcategories/Age%2045-60%20years%209.png",
    alt: "Age 45-60",
    title: "Age 45-60",
    href: "https://apollodiagnostics.in/mens-health/age-4560-74"
  },
  {
    imageSrc: "https://frontend.apollodiagnostics.in/images/home/popularcategories/Above%2060%20years%2010.png",
    alt: "Above 60 years",
    title: "Above 60 years",
    href: "https://apollodiagnostics.in/mens-health/above-60-years-75"
  }
];

const womensHealthCategories = [
  {
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Under%2030%20years%2010-22.png?",
    alt: "Under 30 years",
    title: "Under 30 years",
    href: "https://apollodiagnostics.in/womens-health/under-30-years-77"
  },
  {
    imageSrc: "https://frontend.apollodiagnostics.in/images/home/popularcategories/Age%2030-45%20years%208.png",
    alt: "Age 30-45",
    title: "Age 30-45",
    href: "https://apollodiagnostics.in/womens-health/age-3045-78"
  },
  {
    imageSrc: "https://frontend.apollodiagnostics.in/images/home/popularcategories/Age%2045-60%20years%2010.png",
    alt: "Age 45-60",
    title: "Age 45-60",
    href: "https://apollodiagnostics.in/womens-health/age-4560-79"
  },
  {
    imageSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Above%2060%20years%207-25.png?",
    alt: "Above 60 years",
    title: "Above 60 years",
    href: "https://apollodiagnostics.in/womens-health/above-60-years-80"
  }
];

const CategoryCard = ({ imageSrc, alt, title, href }) => (
  <a href={href} className="block bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
    <div className="relative h-24 w-24 mx-auto mb-4">
      <Image src={imageSrc} alt={alt} layout="fill" objectFit="contain" />
    </div>
    <p className="font-bold text-foreground text-base h-[48px] flex items-center justify-center">{title}</p>
  </a>
);

export default function HealthCheckupSection() {
  return (
    <section className="bg-secondary py-16 px-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-brand-pink font-bold text-base mb-2">PACKAGES</p>
          <h2 className="text-foreground font-black text-3xl">Personalized Health Checkup</h2>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-foreground font-black text-2xl">MEN'S HEALTH</h2>
            <a href="https://apollodiagnostics.in/mens-health" className="text-primary border border-primary rounded-full py-2 px-4 text-sm font-medium hover:bg-primary/10 transition-colors">
              View All
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mensHealthCategories.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div>
        </div>

        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-foreground font-black text-2xl">WOMEN'S HEALTH</h2>
            <a href="https://apollodiagnostics.in/womens-health" className="text-primary border border-primary rounded-full py-2 px-4 text-sm font-medium hover:bg-primary/10 transition-colors">
              View All
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {womensHealthCategories.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}