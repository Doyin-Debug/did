import React from 'react';
import {
  Atom,
  Brain,
  Cpu,
  Film,
  Globe2,
  Landmark,
  Sparkles,
  HelpCircle,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  BookOpen,
  Coins,
  Telescope,
  Palette,
  Trophy,
  Lightbulb,
  Music,
  Scale,
  HeartPulse,
  Compass,
} from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Calculator':
      return <Calculator className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Atom':
      return <Atom className={className} />;
    case 'FlaskConical':
      return <FlaskConical className={className} />;
    case 'Dna':
      return <Dna className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Landmark':
      return <Landmark className={className} />;
    case 'Globe2':
      return <Globe2 className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Coins':
      return <Coins className={className} />;
    case 'Telescope':
      return <Telescope className={className} />;
    case 'Palette':
      return <Palette className={className} />;
    case 'Film':
      return <Film className={className} />;
    case 'Trophy':
      return <Trophy className={className} />;
    case 'Lightbulb':
      return <Lightbulb className={className} />;
    case 'Brain':
      return <Brain className={className} />;
    case 'Music':
      return <Music className={className} />;
    case 'Scale':
      return <Scale className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
