import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-secondary shadow-md border-b-2 border-secondary-dark">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-6">
          {/* Logo */}
          <div className="flex-shrink-0 transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Marine Cargo Agencies Logo"
              width={150}
              height={150}
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>

          {/* Title and Subtitle */}
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '0.5px' }}>
              MARINE CARGO AGENCIES PRIVATE LIMITED
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-primary to-primary rounded-full"></div>
              <p className="text-xs md:text-sm text-primary font-semibold tracking-[0.3em] uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Image Render Tool
              </p>
              <div className="h-0.5 w-16 bg-gradient-to-l from-transparent via-primary to-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
