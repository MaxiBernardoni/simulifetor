import React from 'react';
import {
  ArrowLeft, Award, Baby, Banknote, Beer, Blocks, BookOpen,
  Brain, Briefcase, BriefcaseBusiness, Cake, Camera, Car, Check,
  ChevronDown, ChevronRight, ChevronsRight, Circle, CircleCheck, Clapperboard, Clock,
  Coins, Crown, Dices, Download, Droplet, Dumbbell, Eye,
  Flag, Flame, Flower2, Gamepad2, Gavel, Gem, Ghost,
  Gift, Globe, GraduationCap, Hammer, Handshake, Heart, HeartCrack,
  HeartHandshake, HeartPulse, Hourglass, House, IdCard, Landmark, LayoutGrid,
  Library, Lightbulb, Lock, Medal, Megaphone, Menu, MessageCircle,
  Moon, Music, Package, Palette, PartyPopper, PawPrint, PenTool,
  PiggyBank, Pill, Plane, Plus, RefreshCcw, Rocket, Scale,
  School, Scissors, ShieldPlus, ShoppingBag, Siren, Skull, Smartphone,
  Sparkles, Star, Stethoscope, Sunrise, Swords, Target, TreePalm,
  TrendingDown, TrendingUp, TriangleAlert, Trophy, Upload, Users, VenetianMask,
  Wallet, X, Zap,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

const MAP: Record<string, LucideIcon> = {
  ArrowLeft, Award, Baby, Banknote, Beer, Blocks, BookOpen,
  Brain, Briefcase, BriefcaseBusiness, Cake, Camera, Car, Check,
  ChevronDown, ChevronRight, ChevronsRight, Circle, CircleCheck, Clapperboard, Clock,
  Coins, Crown, Dices, Download, Droplet, Dumbbell, Eye,
  Flag, Flame, Flower2, Gamepad2, Gavel, Gem, Ghost,
  Gift, Globe, GraduationCap, Hammer, Handshake, Heart, HeartCrack,
  HeartHandshake, HeartPulse, Hourglass, House, IdCard, Landmark, LayoutGrid,
  Library, Lightbulb, Lock, Medal, Megaphone, Menu, MessageCircle,
  Moon, Music, Package, Palette, PartyPopper, PawPrint, PenTool,
  PiggyBank, Pill, Plane, Plus, RefreshCcw, Rocket, Scale,
  School, Scissors, ShieldPlus, ShoppingBag, Siren, Skull, Smartphone,
  Sparkles, Star, Stethoscope, Sunrise, Swords, Target, TreePalm,
  TrendingDown, TrendingUp, TriangleAlert, Trophy, Upload, Users, VenetianMask,
  Wallet, X, Zap,
};

export function Icon({ name, size = 20, color = '#fff' }: { name: string; size?: number; color?: string }) {
  const C = MAP[name] ?? Circle;
  return <C size={size} color={color} strokeWidth={1.8} />;
}
