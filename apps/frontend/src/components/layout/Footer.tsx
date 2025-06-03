// apps/frontend/src/components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t py-8 md:py-0"> {/* Adjusted padding */}
      <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row mx-auto px-4 md:px-6">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} Your Company Name Kevin Kogo. All rights reserved.
        </p>
        {/* You can add more footer links or info here if needed */}
      </div>
    </footer>
  );
}