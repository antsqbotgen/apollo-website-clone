import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const organTests = [
  {
    name: 'Heart',
    img: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Group%2068%20(8)-28.png?',
    href: 'https://apollodiagnostics.in/test-booking?condition=Heart',
  },
  {
    name: 'Thyroid',
    img: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Group%2068%20(10)-29.png?',
    href: 'https://apollodiagnostics.in/test-booking?condition=Thyroid',
  },
  {
    name: 'Liver',
    img: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Group%2068%20(7)-30.png?',
    href: 'https://apollodiagnostics.in/test-booking?condition=Liver',
  },
  {
    name: 'Lungs',
    img: 'https://frontend.apollodiagnostics.in/images/home/conditions/Group%2068%20(11).png',
    href: 'https://apollodiagnostics.in/test-booking?condition=Lungs',
  },
  {
    name: 'Infertility',
    img: 'https://frontend.apollodiagnostics.in/images/home/conditions/Frame%2068%20(1).png',
    href: 'https://apollodiagnostics.in/test-booking?condition=Infertility',
  },
  {
    name: 'Kidney',
    img: 'https://frontend.apollodiagnostics.in/images/home/conditions/Group%2068%20(9).png',
    href: 'https://apollodiagnostics.in/test-booking?condition=Kidney',
  },
];

const BodyOrgansTests = () => {
  return (
    <section className="bg-muted py-[60px]">
      <div className="container">
        <div className="text-center mb-8">
          <p className="text-brand-pink text-base font-bold uppercase">TEST</p>
          <h2 className="text-foreground text-3xl font-black mt-2">
            Tests by Body Organs
          </h2>
        </div>

        <div className="flex flex-col items-center">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 w-full">
            {organTests.map((test) => (
              <Link
                href={test.href}
                key={test.name}
                className="group flex flex-col items-center justify-center text-center bg-card p-4 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out hover:scale-105"
              >
                <div className="w-20 h-20 relative">
                  <Image
                    src={test.img}
                    alt={`${test.name} icon`}
                    fill
                    className="object-contain"
                  />
                </div>
                <strong className="mt-2 text-base font-bold text-foreground">
                  {test.name}
                </strong>
              </Link>
            ))}
          </div>

          <Link
            href="https://apollodiagnostics.in/test-booking"
            className="mt-8 inline-block capitalize rounded-full border border-primary text-primary px-4 py-1.5 text-sm font-medium transition-colors hover:bg-primary/10"
          >
            View all
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BodyOrgansTests;