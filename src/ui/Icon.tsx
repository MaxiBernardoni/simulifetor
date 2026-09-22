import React from 'react';
import {
  ArrowLeft, Award, Baby, Ban, Banknote, Beer, Blocks,
  BookOpen, Bot, Brain, Briefcase, BriefcaseBusiness, Cake, Camera,
  Car, Check, ChevronRight, ChevronsRight, Circle, CircleCheck, Clapperboard,
  Clock, Coins, Crown, Dices, Dog, Download, Drama,
  Droplet, Dumbbell, Eye, FileText, Film, Flag, Flame,
  Flower2, Footprints, Gamepad2, Gavel, Gem, Ghost, Gift,
  Globe, GraduationCap, Hammer, Hand, HandHeart, Handshake, Heart,
  HeartCrack, HeartHandshake, HeartPulse, Hourglass, House, IdCard, KeyRound,
  Landmark, LayoutGrid, Library, Lightbulb, Link, Lock, Mail,
  Medal, Megaphone, Menu, MessageCircle, Mic, Moon, Music,
  Package, Palette, PartyPopper, PawPrint, PenTool, Phone, PhoneOff,
  PiggyBank, Pill, Plane, Plus, Receipt, RefreshCcw, Rocket,
  Scale, School, Scissors, Shield, ShieldAlert, ShieldCheck, ShieldPlus,
  ShoppingBag, Siren, Skull, Smartphone, Snowflake, Sparkles, Star,
  Stethoscope, Store, Sunrise, Sunset, Swords, Tag, Target,
  TreePalm, TrendingDown, TrendingUp, TriangleAlert, Trophy, Upload, User,
  Users, UtensilsCrossed, VenetianMask, Wallet, Wine, X, Zap,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

const MAP: Record<string, LucideIcon> = {
  ArrowLeft, Award, Baby, Ban, Banknote, Beer, Blocks,
  BookOpen, Bot, Brain, Briefcase, BriefcaseBusiness, Cake, Camera,
  Car, Check, ChevronRight, ChevronsRight, Circle, CircleCheck, Clapperboard,
  Clock, Coins, Crown, Dices, Dog, Download, Drama,
  Droplet, Dumbbell, Eye, FileText, Film, Flag, Flame,
  Flower2, Footprints, Gamepad2, Gavel, Gem, Ghost, Gift,
  Globe, GraduationCap, Hammer, Hand, HandHeart, Handshake, Heart,
  HeartCrack, HeartHandshake, HeartPulse, Hourglass, House, IdCard, KeyRound,
  Landmark, LayoutGrid, Library, Lightbulb, Link, Lock, Mail,
  Medal, Megaphone, Menu, MessageCircle, Mic, Moon, Music,
  Package, Palette, PartyPopper, PawPrint, PenTool, Phone, PhoneOff,
  PiggyBank, Pill, Plane, Plus, Receipt, RefreshCcw, Rocket,
  Scale, School, Scissors, Shield, ShieldAlert, ShieldCheck, ShieldPlus,
  ShoppingBag, Siren, Skull, Smartphone, Snowflake, Sparkles, Star,
  Stethoscope, Store, Sunrise, Sunset, Swords, Tag, Target,
  TreePalm, TrendingDown, TrendingUp, TriangleAlert, Trophy, Upload, User,
  Users, UtensilsCrossed, VenetianMask, Wallet, Wine, X, Zap,
};

export function Icon({ name, size = 20, color = '#fff' }: { name: string; size?: number; color?: string }) {
  const C = MAP[name] ?? Circle;
  return <C size={size} color={color} strokeWidth={1.8} />;
}
