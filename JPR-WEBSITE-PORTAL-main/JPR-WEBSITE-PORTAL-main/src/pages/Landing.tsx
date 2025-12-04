import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import jprLogo from "@/assets/jaisirlogo.png";
import shadowImage from "@/assets/shadow-image.jpeg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Shadow background image on the LEFT side */}
      <div className="absolute left-0 top-0 bottom-0 w-1/2 opacity-30">
        <img src={shadowImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black" />
      </div>

      {/* Gradient overlay from left */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/90 to-black" />

      {/* Content - Centered */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in">

          {/* JPR Logo with Golden Glow in Center */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              <div className="w-48 h-48 lg:w-64 lg:h-64 flex items-center justify-center">
                <img 
                  src={jprLogo} 
                  alt="JPR Logo"
                  className="w-32 h-32 lg:w-40 lg:h-40 object-contain"
                  style={{ filter: 'drop-shadow(0 0 40px rgba(205, 164, 52, 0.6))' }}
                />
              </div>
              {/* Golden glow background */}
              <div className="absolute inset-0 blur-3xl opacity-40" 
                  style={{ background: 'radial-gradient(circle, rgba(205, 164, 52, 0.8) 0%, transparent 70%)' }} 
              />
            </div>
          </div>

          {/* Name and Bio - Centered */}
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-7xl font-bold gold-glow" style={{ color: '#E8E8EC' }}>
              Jai Prathap Reddy
            </h1>

            <p className="text-xl lg:text-2xl font-semibold" style={{ color: '#CDA434' }}>
              Dentist, Army Major (retd), Visionary CEO,<br />
              Vishwa Guru in Becoming
            </p>

            {/* Awards */}
            <div className="pt-2 pb-2">
              <p className="text-base lg:text-lg" style={{ color: 'rgba(205, 164, 52, 0.8)' }}>
                Two times Global Excellence Award<br />
                by the UK Parliament
              </p>
            </div>

            {/* Quote */}
            <blockquote className="text-xl lg:text-2xl italic font-semibold pt-6 max-w-2xl mx-auto" style={{ 
              color: '#CDA434',
              borderTop: '1px solid rgba(205, 164, 52, 0.3)'
            }}>
              "Crowned by Dharma. Guided by Vision.<br />
              Rising as VishwaGuru."
            </blockquote>
          </div>

          {/* Buttons */}
          <div className="pt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => navigate("/vision")}
              size="lg"
              variant="outline"
              className="border-2 text-lg hover-lift shadow-lg px-10 py-6"
              style={{ 
                borderColor: '#CDA434',
                color: '#CDA434',
                backgroundColor: 'transparent'
              }}
            >
              Explore the Vision
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
