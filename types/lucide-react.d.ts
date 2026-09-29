declare module "lucide-react" {
  import * as React from "react";

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    className?: string;
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  export const AlertCircle: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const Banknote: LucideIcon;
  export const Bike: LucideIcon;
  export const Calendar: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ChefHat: LucideIcon;
  export const ClipboardList: LucideIcon;
  export const Clock: LucideIcon;
  export const Code2: LucideIcon;
  export const CreditCard: LucideIcon;
  export const DollarSign: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const FastForward: LucideIcon;
  export const Flame: LucideIcon;
  export const Heart: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const Loader2: LucideIcon;
  export const Lock: LucideIcon;
  export const LogOut: LucideIcon;
  export const MapPin: LucideIcon;
  export const Menu: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Minus: LucideIcon;
  export const Navigation: LucideIcon;
  export const PackageCheck: LucideIcon;
  export const Phone: LucideIcon;
  export const Plus: LucideIcon;
  export const Quote: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Search: LucideIcon;
  export const Send: LucideIcon;
  export const Settings: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const ShoppingBag: LucideIcon;
  export const Sliders: LucideIcon;
  export const SlidersHorizontal: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Star: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Utensils: LucideIcon;
  export const UtensilsCrossed: LucideIcon;
  export const Wallet: LucideIcon;
  export const X: LucideIcon;
}
