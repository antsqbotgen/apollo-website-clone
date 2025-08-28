"use client";

import React from 'react';
import Image from 'next/image';

const topTests = [
  { name: 'Glucose-6-Phosphate Dehydrogenase (G6 PD)', href: '/products' },
  { name: 'C- Peptide Test', href: '/products' },
  { name: 'Urine Sugar', href: '/products' },
  { name: 'WIDAL Test', href: '/products' },
  { name: 'Complete Blood Count', href: '/products' },
  { name: 'HIAA Quantitative', href: '/products' },
  { name: '24 HOURS Urinary Copper', href: '/products' },
  { name: '24 Hour Urinary Catecholamines', href: '/products' },
  { name: 'Acetyl Choline Receptor (AChR) Antibody', href: '/products' },
  { name: 'Complete Urine Examination (CUE)', href: '/products' },
  { name: 'Alanine Aminotransferase (ALT/SGPT)', href: '/products' },
  { name: 'Albumin', href: '/products' },
  { name: 'Alcohol Testing', href: '/products' },
  { name: 'Creatinine', href: '/products' },
  { name: 'Aldolase', href: '/products' },
  { name: 'Aldosterone Test', href: '/products' },
  { name: 'Alkaline Phosphatase', href: '/products' },
  { name: 'Alpha Feto Protein Serum', href: '/products' },
  { name: '17-hydroxyprogesterone (17 OHPG)', href: '/products' },
  { name: 'Acetone / Ketone', href: '/products' },
  { name: 'Double Marker Screening 1st Trimester', href: '/products' },
  { name: 'Alpha-1 Antitrypsin (A1AT)', href: '/products' },
  { name: 'Acid Fast Bacilli (AFB) Culture', href: '/products' },
  { name: 'Electrolytes', href: '/products' },
  { name: 'Aluminium test', href: '/products' },
];

const healthPackages = [
    { name: 'Diabetes', href: '/products' },
    { name: 'Cardiovascular Diseases', href: '/products' },
    { name: 'Hypertension', href: '/products' },
    { name: 'Gut Health', href: '/products' },
    { name: 'Bone Health', href: '/products' },
    { name: 'Alcohol', href: '/products' },
    { name: 'Cancer', href: '/products' },
    { name: 'Depression', href: '/products' },
    { name: 'Nutrition Disorder', href: '/products' },
    { name: 'Obesity', href: '/products' },
    { name: 'Respiratory Disorders', href: '/products' },
    { name: 'Sexual Wellness', href: '/products' },
    { name: 'Sleep Disorder', href: '/products' },
    { name: 'For men: Under 30 years', href: '/products' },
    { name: 'For men: Age 30-45', href: '/products' },
    { name: 'For men: Age 45-60', href: '/products' },
    { name: 'For men: Above 60 years', href: '/products' },
    { name: 'For women: Under 30 years', href: '/products' },
    { name: 'For women: Age 30-45', href: '/products' },
    { name: 'For women: Age 45-60', href: '/products' },
    { name: 'For women: Above 60 years', href: '/products' },
];

const diagnosticCentres = [
    { name: 'Diagnostic Centre in Delhi', href: '#' },
    { name: 'Diagnostic Centre in Hyderabad', href: '#' },
    { name: 'Diagnostic Centre in Mumbai', href: '#' },
    { name: 'Diagnostic Centre in Chennai', href: '#' },
    { name: 'Diagnostic Centre in Bangalore', href: '#' },
    { name: 'Diagnostic Centre in Pune', href: '#' },
    { name: 'Diagnostic Centre in Kolkata', href: '#' },
    { name: 'Diagnostic Centre in Jaipur', href: '#' },
    { name: 'Diagnostic Centre in Ahmedabad', href: '#' },
    { name: 'Diagnostic Centre in Gurgaon', href: '#' },
    { name: 'Diagnostic Centre in Noida', href: '#' },
    { name: 'Diagnostic Centre in Lucknow', href: '#' },
    { name: 'Diagnostic Centre in Madurai', href: '#' },
    { name: 'Diagnostic Centre in Guwahati', href: '#' },
    { name: 'Diagnostic Centre in Amritsar', href: '#' },
];

const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'FAQs', href: '#' },
    { name: 'Blogs', href: '#' },
    { name: 'Testimonials', href: '#' },
    { name: 'Career', href: '#' },
    { name: 'Book Appointment', href: '/book-appointment' },
    { name: 'Terms & Conditions', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Patient Consent', href: '#' },
    { name: 'Doctors Corner', href: '#' },
    { name: 'Home Sample Collection', href: '#' },
];

const aboutUsLinks = [
    { name: 'Apollo Diagnostics', href: '#' },
    { name: 'About AHLL', href: '#' },
    { name: 'About Apollo Group', href: '#' },
    { name: 'Our Chairman Profile', href: '#' },
    { name: 'Management Team', href: '#' },
    { name: 'Contact Us', href: '#' },
];

const socialLinks = [
    { name: 'Instagram', icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/icons/instagram-8.png?', href: '#' },
    { name: 'LinkedIn', icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/icons/linkedin-9.png?', href: '#' },
    { name: 'Facebook', icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/icons/fb-10.png?', href: '#' },
    { name: 'X (Twitter)', icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/icons/twitter-11.png?', href: '#' },
    { name: 'Youtube', icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/icons/youtube-12.png?', href: '#' },
];

interface FooterLinkListProps {
  title: string;
  links: { name: string; href: string }[];
}

const FooterLinkList: React.FC<FooterLinkListProps> = ({ title, links }) => (
  <div className="mb-8">
    <h5 className="text-xl font-bold mb-4 text-foreground">{title}</h5>
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {links.map((link, index) => (
        <React.Fragment key={link.href}>
          <a href={link.href} className="text-[#0f6ca5] hover:underline">
            {link.name}
          </a>
          {index < links.length - 1 && <span className="text-muted-foreground">/</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <footer className="bg-background text-foreground text-[15px] leading-6 font-sans">
            <div className="bg-muted py-12">
                <div className="container mx-auto px-4">
                    <FooterLinkList title="Top Tests" links={topTests} />
                    <FooterLinkList title="Health Check Packages" links={healthPackages} />
                    <FooterLinkList title="Diagnostic Centre" links={diagnosticCentres} />
          
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8 border-t border-b border-border py-8">
                        <div>
                            <h5 className="text-xl font-bold mb-2 text-foreground">Partner with us</h5>
                            <p className="mb-4 text-sm text-foreground">
                                Partnering with us offers entrepreneurs valuable mentoring, marketing guidance, and administrative support, paving the way for success.
                            </p>
                            <button className="inline-block border border-[#0f6ca5] text-[#0f6ca5] py-2 px-6 rounded-md text-sm font-medium hover:bg-[#0f6ca5]/10 transition-colors">
                                Know More
                            </button>
                        </div>
                        <div className="lg:text-right">
                            <p className="font-bold text-foreground">For bulk test bookings, Reach out to us at:</p>
                            <span className="text-[#0f6ca5]">
                                customer.care@apollodiagnostics.in
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#002147] text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div>
                            <h6 className="font-bold mb-4 uppercase text-base">QUICK LINKS</h6>
                            <ul className="space-y-2">
                                {quickLinks.map(link => (
                                    <li key={link.href}><a href={link.href} className="hover:underline text-sm">{link.name}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h6 className="font-bold mb-4 uppercase text-base">ABOUT US</h6>
                            <ul className="space-y-2">
                                {aboutUsLinks.map(link => (
                                    <li key={link.href}><a href={link.href} className="hover:underline text-sm">{link.name}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h6 className="font-bold mb-4 uppercase text-base">FOLLOW US</h6>
                            <ul className="space-y-3">
                                {socialLinks.map(link => (
                                    <li key={link.name}>
                                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:underline text-sm">
                                            <Image src={link.icon} alt={link.name} width={24} height={24} />
                                            <span>{link.name}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="text-center mt-12">
                        <button onClick={scrollToTop} className="bg-transparent border-none text-white hover:underline cursor-pointer p-0 text-sm">
                            Move To Top
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-[#e9ecf2] py-4">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-foreground">
                        Copyright © 2024 Apollo Diagnostics (Apollo Health and Lifestyle Limited), All Rights Reserved
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;