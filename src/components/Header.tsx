import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary to-primary-dark shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="Marine Cargo Agencies Logo"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>

          {/* Title and Subtitle */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              MARINE CARGO AGENCIES PRIVATE LIMITED
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-accent"></div>
              <p className="text-lg md:text-xl text-accent font-semibold tracking-wider">
                IMAGE RENDER TOOL
              </p>
              <div className="h-px w-12 bg-accent"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
