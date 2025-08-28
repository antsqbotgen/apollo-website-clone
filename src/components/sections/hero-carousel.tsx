"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    imgSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Fever%20Advance-11-2.jpg?",
    href: "https://apollodiagnostics.in/package-details/hyderabad/fever-assessment-advance",
    alt: "Home page carousel banner for Fever Assessment Advance package"
  },
  {
    imgSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/comp11-5.jpg?",
    href: "https://apollodiagnostics.in/package-details/hyderabad/xpert-health-comprehensive",
    alt: "Home page carousel banner for Xpert Health Comprehensive package"
  },
  {
    imgSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/CRL%20Launch%20Banner%20-New%206-4.jpg?",
    href: "https://lp.apollodiagnostics.in/lp/central-reference-laboratory/",
    alt: "Home page carousel banner for Central Reference Laboratory launch"
  },
  {
    imgSrc: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/Web%20Banner%20FID%20(1)-6.jpg?",
    href: "https://apollodiagnostics.in/test-details/new%20delhi/food-intolerance-test",
    alt: "Home page carousel banner for Food Intolerance Test"
  },
];

const HeroCarousel = () => {
  return (
    <section className="relative w-full hero-carousel">
      <style>{`
        .hero-carousel .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background-color: #9ca3af;
          opacity: 1;
        }
        .hero-carousel .swiper-pagination-bullet-active {
          background-color: #374151;
        }
        .hero-carousel .swiper-button-prev,
        .hero-carousel .swiper-button-next {
          color: black;
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 9999px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          transition: background-color 0.3s;
        }
        .hero-carousel .swiper-button-prev:hover,
        .hero-carousel .swiper-button-next:hover {
          background-color: white;
        }
        .hero-carousel .swiper-button-prev::after,
        .hero-carousel .swiper-button-next::after {
          display: none;
        }
      `}</style>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{ clickable: true }}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        className="h-[240px] sm:h-[350px] md:h-[400px] lg:h-[450px]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <a href={slide.href} target="_blank" rel="noopener noreferrer">
              <div className="relative w-full h-full">
                <Image
                  src={slide.imgSrc}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </a>
          </SwiperSlide>
        ))}
        
        <div className="swiper-button-prev !left-4">
          <ChevronLeft size={24} />
        </div>
        <div className="swiper-button-next !right-4">
          <ChevronRight size={24} />
        </div>
      </Swiper>
    </section>
  );
};

export default HeroCarousel;