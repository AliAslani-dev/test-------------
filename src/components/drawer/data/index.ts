import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded'
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import CollectionsIcon from '@mui/icons-material/Collections';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';

export type DrawerItemType = {
  title: {
    fa: string;
    en: string;
    tu: string;
  };
  title_en: string;
  icon: any;
  color?: string;
  bgColor?: string;
  iconColor?: string;
  iconBgColor?: string;
  link?: string;
};

export const drawerItems: DrawerItemType[] = [
  {
    title: {
      fa: 'مجموعه‌ها',
      en: 'Showrooms',
      tu: 'Showroomlar',
    },
    title_en: 'buckets',
    icon: DiamondRoundedIcon,
    link: '/dashboard/buckets',
  },
   {
    title: {
      fa: 'اورگان ها',
      en: 'organization',
      tu: 'organization',
    },
    title_en: 'organization',
    icon: BusinessCenterRoundedIcon,
    link: '/dashboard/organization',
  },
  {
    title: {
      fa: 'دسته‌بندی‌ها',
      en: 'Categories',
      tu: 'Kategoriler',
    },
    title_en: 'categories',
    icon: CategoryRoundedIcon,
    link: '/dashboard/categories',
  },
  {
    title: {
      fa: 'کاربر‌ها',
      en: 'Users',
      tu: 'Kullanıcılar',
    },
    title_en: 'users',
    icon: PeopleRoundedIcon,
    link: '/dashboard/users',
  },
  {
    title: {
      fa: 'دنبال کنندگان',
      en: 'Followers',
      tu: 'Talepler',
    },
    title_en: 'followers-provider',
    icon: PeopleAltIcon,
    link: '/dashboard/followers',
  },
  {
    title: {
      fa: 'حسابداری',
      en: 'Accounting',
      tu: 'Muhasebe',
    },
    title_en: 'accounting',
    icon: AccountBalanceRoundedIcon,
    link: '/dashboard/accounting',
  },
  {
    title: {
      fa: 'سفارش‌ها',
      en: 'Orders',
      tu: 'Siparişler',
    },
    title_en: 'orders-provider',
    icon: ShoppingBasketIcon,
    link: '/dashboard/orders',
  },
  {
    title: {
      fa: 'کالکشن‌ها',
      en: 'Collections',
      tu: 'Koleksiyonlar',
    },
    title_en: 'tags',
    icon: CollectionsIcon,
    link: '/dashboard/tags',
  },
  {
    title: {
      fa: 'پروفایل',
      en: 'Profile',
      tu: 'Profil',
    },
    title_en: 'profile',
    icon: AccountCircleIcon,
    link: '/dashboard/profile',
  },
];

export const drawerBottomItems: DrawerItemType[] = [
  {
    title: {
      fa: 'وضعیت فروشگاه',
      en: 'Store Status',
      tu: 'Mağaza Durumu',
    },
    title_en: 'closedToggle',
    icon: LockOpenIcon,
    color: '#DE0000',
    bgColor: '#FCDFDF',
    iconColor: '#000',
    iconBgColor: '#fff',
  },
  {
    title: {
      fa: 'خروج از حساب',
      en: 'Logout',
      tu: 'Çıkış Yap',
    },
    title_en: 'logout',
    icon: ExitToAppRoundedIcon,
    color: '#DE0000',
    bgColor: '#FCDFDF',
    iconColor: '#000',
    iconBgColor: '#fff',
  },
];
