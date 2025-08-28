"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Testimonial = {
  quote: string;
  name: string;
  location: string;
};

const testimonialsData: Testimonial[] = [
  {
    quote: "Excellence of Apollo Diagnostics is already a recognized fact across India. Adding more strength to their reputation is their caring nature and supportive attitude. I’ll always prefer to take their services than selecting mediocre quality making any compromise with my health.",
    name: "Mr. Shahul Hameed",
    location: "Chennai",
  },
  {
    quote: "The way Apollo Diagnostics kept me at ease during the sample collection process, the way they supported me to be at my convenience and confidence is really something I’ll always remember. They were also flawless in maintaining the hygiene. Hats off to them!",
    name: "Mr. Laxmi Kantham",
    location: "Hyderabad",
  },
  {
    quote: "Awesome is probably the one word to express my views about Apollo Diagnostics. Efficiency, punctuality, compassion, sincerity…I’ll give high marks to them in all of these. Great going, Apollo!",
    name: "Shivaraj Kadam",
    location: "Pune",
  },
  {
    quote: "Thanks for the seamless service. Based on my experience I can assure that, be it quality or punctuality, Apollo Diagnostics is one name to trust and depend on.",
    name: "Mr. Thomas",
    location: "Mysuru",
  },
  {
    quote: "Excellent sense of timing! The technician arrived right on time. He was really well-trained, in terms of his skill and manner, as well. Apollo Diagnostics is doing a great job.",
    name: "Subbalakshmi",
    location: "Vizag",
  },
  {
    quote: "Appreciate the quality of service that I’ve received from Apollo Diagnostics. Their competence, caring nature, sincerity, valuing customer’s time – all these together have shaped them as the most trusted diagnostic service provider in the country. Keep up the good work!",
    name: "Mrs. Pravati Dash",
    location: "Bengaluru",
  },
  {
    quote: "The most crucial factor with Apollo Diagnostics is that they always train their Phlebotomists so well that the team consistently remains efficient and punctual and we receive a premium quality diagnostic service. Good job. Keep it up.",
    name: "Mr. Amit Kumar Patil",
    location: "Bengaluru",
  },
  {
    quote: "Whenever I need to have a blood sample collected from home, I ask for Vasu. He is punctual, courteous and so skilled I hardly feel any pain when he draws the sample. Plus, I truly appreciate how quickly the reports are delivered. Thanks, Apollo!",
    name: "Mr. Sukumar, Film director",
    location: "Sriram Nagar, Hyderabad",
  },
  {
    quote: "Their accurate understanding of customer’s needs is one thing that set them apart and ahead of all others. As a result, it becomes easier for them to deliver the right service, that with their matchless efficiency and care to ensure less pain and easily accomplished sample collection. Apollo Diagnostics is simply doing an amazing job!",
    name: "Soundarya Abhirami",
    location: "Hyderabad",
  },
  {
    quote: "I availed the service of COVID-19 RT PCR tests for my parents, from Apollo Diagnostics-Rajarhat 3 times. The home collection services provided were really excellent, and always on time. Also, the sample collection representative carried a nice professional attitude. I am happy to recommend their services to others.",
    name: "Mr. Ajit",
    location: "Kolkata",
  },
];

const Testimonials = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <style>
        {`
          .testimonial-swiper .swiper-pagination-bullet {
            background-color: #6c757d;
            opacity: 1;
          }
          .testimonial-swiper .swiper-pagination-bullet-active {
            background-color: #007bff;
          }
        `}
      </style>
      <section className="bg-secondary py-12">
        <div className="container mx-auto relative px-4">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            navigation={{
              nextEl: ".testimonial-next",
              prevEl: ".testimonial-prev",
            }}
            pagination={{ clickable: true }}
            className="testimonial-swiper"
          >
            {testimonialsData.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 max-w-[800px] mx-auto text-center my-8">
                  <h2 className="text-2xl font-medium text-foreground mb-5">
                    What People Say!
                  </h2>
                  <div className="relative w-[50px] h-12 mx-auto">
                    <Image
                      src="https://apollodiagnostics.in/images/invertedComma.png"
                      alt="Quotation mark"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-normal mt-5 mb-6">
                    {testimonial.quote}
                  </p>
                  <p className="font-bold text-base text-foreground mt-5">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {testimonial.location}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button className="testimonial-prev absolute top-1/2 left-2 md:left-8 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-6 w-6 text-primary" />
          </button>
          <button className="testimonial-next absolute top-1/2 right-2 md:right-8 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors">
            <ChevronRight className="h-6 w-6 text-primary" />
          </button>
        </div>
      </section>
    </>
  );
};

export default Testimonials;