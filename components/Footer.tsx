import React from 'react';

interface FooterProps {
  t: {
    privacy: string;
    terms: string;
    twitter: string;
    discord: string;
  }
}

const Footer: React.FC<FooterProps> = ({ t }) => {
  return (
    <footer className="border-t border-border bg-background py-12 text-sm text-muted transition-colors duration-300">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
           <div className="h-6 w-6 rounded bg-surface text-foreground border border-border flex items-center justify-center text-xs font-bold">OR</div>
           <span className="font-semibold text-foreground">Nebula Lab</span>
           <span>© 2025</span>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-foreground transition-colors">{t.privacy}</a>
          <a href="#" className="hover:text-foreground transition-colors">{t.terms}</a>
          <a href="#" className="hover:text-foreground transition-colors">{t.twitter}</a>
          <a href="#" className="hover:text-foreground transition-colors">{t.discord}</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
