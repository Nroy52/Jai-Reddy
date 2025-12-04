import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Pill, Globe, Bot, Building2, GraduationCap, Sprout, Stethoscope, Rocket, Landmark, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import jprLogo from "@/assets/jaisirlogo.png";

const COLORS = {
  bgDark: "#0B0B0D",
  bgCard: "#14161B",
  text: "#E8E8EC",
  gold: "#CDA434",
  blue: "#4169E1",
  subtext: "#B3B3B8",
  stroke: "#1F2128",
};

const Vision = () => {
  const navigate = useNavigate();
  const [activePillar, setActivePillar] = useState<string | null>(null);

  const pillarsLeft = [
    { icon: Stethoscope, title: "HealthTech & Advanced Dental Sciences", desc: "Pioneering the future of healthcare and dental precision." },
    { icon: Pill, title: "Pharmaceuticals, Ayurveda & Nutraceutical Biology", desc: "Bridging ancient wisdom with modern science." },
    { icon: Rocket, title: "Aerospace, Robotics & Defense Systems", desc: "Engineering the next frontier of defense and exploration." },
    { icon: Bot, title: "AI, Digital Platforms, Smart Devices & Cyber Infrastructure", desc: "Building intelligent ecosystems for a connected world." },
    { icon: GraduationCap, title: "Education, Leadership & VR Gurukul Systems", desc: "Revolutionizing learning through immersive technology." },
  ];

  const pillarsRight = [
    { icon: Building2, title: "Real Estate, Smart Townships & Ecological Living (VishwaGrāma)", desc: "Creating sustainable habitats for future generations." },
    { icon: Sprout, title: "AgriTech, Rural Employment & Bamboo/Hemp Eco-Products", desc: "Empowering rural economies with sustainable innovation." },
    { icon: Landmark, title: "FinTech, Wealth Management & Global Family Dynasty Trusts", desc: "Securing legacies through financial excellence." },
    { icon: Gem, title: "Luxury, Branding, Apparel & Digital Experience Commerce", desc: "Redefining elegance in the digital age." },
    { icon: Globe, title: "Media, Culture, Storytelling & Global Influence Networks", desc: "Shaping narratives that inspire global change." },
  ];

  const togglePillar = (title: string) => {
    setActivePillar((prev) => (prev === title ? null : title));
  };

  const renderPillarCard = (pillar: { icon: any; title: string; desc: string }) => {
    const isActive = activePillar === pillar.title;
    const Icon = pillar.icon;
    const cardStyle = {
      background: COLORS.bgCard,
      borderColor: isActive ? COLORS.gold : COLORS.stroke,
    };
    const baseClasses = "cursor-pointer rounded-lg border transition-transform duration-300 hover:-translate-y-1 flex items-center justify-center";
    const sizeClasses = isActive ? "min-h-[110px] px-4 py-4" : "min-h-[80px] px-3 py-2";

    return (
      <div
        key={pillar.title}
        role="button"
        tabIndex={0}
        onClick={() => togglePillar(pillar.title)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            togglePillar(pillar.title);
          }
        }}
        className={`${baseClasses} ${sizeClasses}`}
        style={cardStyle}
      >
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <Icon className="w-6 h-6" style={{ color: COLORS.gold }} />
          <h3 className="text-base font-semibold" style={{ color: COLORS.gold }}>{pillar.title}</h3>
          {isActive && (
            <p className="text-xs mt-2 leading-relaxed" style={{ color: COLORS.subtext }}>
              {pillar.desc}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: COLORS.bgDark, color: COLORS.text }}
    >
      {/* NAVBAR */}
      <nav
        className="fixed top-0 left-0 right-0 h-[70px] flex items-center justify-end px-6 border-b z-50"
        style={{ background: COLORS.bgCard, borderColor: COLORS.stroke }}
      >
        <Button
          onClick={() => navigate("/login")}
          className="px-6 py-2 font-semibold"
          style={{ background: COLORS.gold, color: COLORS.bgDark }}
        >
          Login
        </Button>
      </nav>

      {/* HERO */}
      <main className="flex-1 mt-[70px] flex flex-col justify-between items-center text-center px-4 py-6">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-40 h-40 md:w-60 md:h-60 mx-auto flex items-center justify-center">
            <img
              src={jprLogo}
              alt="JPR Logo"
              className="w-32 h-32 md:w-48 md:h-48 object-contain"
              style={{ filter: 'drop-shadow(0 0 20px hsla(45, 60%, 50% / 0.4))' }}
            />
          </div>
        </div>

        {/* Name + Taglines */}
        <div>
          <h1
            className="text-3xl md:text-5xl font-bold"
            style={{ color: COLORS.gold }}
          >
            Dr Jai Prathap Reddy
          </h1>
          <p className="text-lg md:text-xl mt-3" style={{ color: COLORS.subtext }}>
            Strategic partner to the world's visionaries
          </p>
          <p className="text-lg md:text-xl" style={{ color: COLORS.subtext }}>
            I do not chase scale. I sculpt legacy.
          </p>
        </div>

        {/* Pillars */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-5xl my-6">
          <div className="flex-1 flex flex-col gap-3">
            {pillarsLeft.map(renderPillarCard)}
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {pillarsRight.map(renderPillarCard)}
          </div>
        </div>

        {/* CTA */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/signup")}
            variant="outline"
            className="px-8 py-4 font-semibold text-lg border-2"
            style={{ borderColor: COLORS.gold, color: COLORS.gold, background: "transparent" }}
          >
            Signup
            <ArrowRight className="ml-2 inline h-5 w-5" />
          </Button>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className="min-h-[120px] flex flex-col justify-center items-center text-center text-sm py-4"
        style={{ background: COLORS.bgCard, borderTop: `1px solid ${COLORS.stroke}`, color: COLORS.subtext }}
      >
        <div className="font-semibold">
          <strong>Jai Reddy HQ</strong> | London, UK
        </div>
        <div>Email: hello@jaireddy.com | Phone: +44 123 456 789</div>
        <div className="mt-1">&copy; 2025 Dr Jai Prathap Reddy. All Rights Reserved.</div>
      </footer>
    </div>
  );
};

export default Vision;
