import React from 'react';
import {
  Activity as ActivityIcon, Baby, Banknote, Beer, Blocks, BookOpen, Brain, Briefcase, Check, ChevronRight,
  Circle, Clock, Dices, Dumbbell, Eye, Flame, Flower2, Gem, Ghost, Gift, GraduationCap, Hammer, Heart,
  HeartCrack, HeartPulse, House, Landmark, Lightbulb, Lock, Megaphone, Menu, MessageCircle, Moon, Package,
  PartyPopper, PawPrint, PenTool, Pill, Plane, RefreshCcw, ShoppingBag, Skull, Sparkles, Stethoscope, Sun,
  Swords, TrendingUp, Users, VenetianMask, Wallet, X, Zap,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

const MAP: Record<string, LucideIcon> = {
  Activity: ActivityIcon, Baby, Banknote, Beer, Blocks, BookOpen, Brain, Briefcase, Check, ChevronRight,
  Clock, Dices, Dumbbell, Eye, Flame, Flower2, Gem, Ghost, Gift, GraduationCap, Hammer, Heart, HeartCrack,
  HeartPulse, House, Landmark, Lightbulb, Lock, Megaphone, Menu, MessageCircle, Moon, Package, PartyPopper,
  PawPrint, PenTool, Pill, Plane, RefreshCcw, ShoppingBag, Skull, Sparkles, Stethoscope, Sun, Swords,
  TrendingUp, Users, VenetianMask, Wallet, X, Zap,
};

export function Icon({ name, size = 20, color = '#fff' }: { name: string; size?: number; color?: string }) {
  const C = MAP[name] ?? Circle;
  return <C size={size} color={color} strokeWidth={1.8} />;
}
