import React from 'react';
import { CheckIcon } from './icons/CheckIcon';
import { CheckSquareIcon } from './icons/CheckSquareIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CodeIcon } from './icons/CodeIcon';
import { CopyIcon } from './icons/CopyIcon';
import { EditIcon } from './icons/EditIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { FileIcon } from './icons/FileIcon';
import { HeartIcon } from './icons/HeartIcon';
import { HomeIcon } from './icons/HomeIcon';
import { ImageIcon } from './icons/ImageIcon';
import { MoreHorizontalIcon } from './icons/MoreHorizontalIcon';
import { PinIcon } from './icons/PinIcon';
import { TagIcon } from './icons/TagIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ZapIcon } from './icons/ZapIcon';
import { SettingsIcon } from './SettingsIcon';

export type IconName = 
  | 'check'
  | 'check-square'
  | 'clock'
  | 'code'
  | 'copy'
  | 'edit'
  | 'external-link'
  | 'file'
  | 'heart'
  | 'home'
  | 'image'
  | 'more-horizontal'
  | 'pin'
  | 'settings'
  | 'tag'
  | 'trash'
  | 'zap';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  className?: string;
}

const iconMap: Record<IconName, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'check': CheckIcon,
  'check-square': CheckSquareIcon,
  'clock': ClockIcon,
  'code': CodeIcon,
  'copy': CopyIcon,
  'edit': EditIcon,
  'external-link': ExternalLinkIcon,
  'file': FileIcon,
  'heart': HeartIcon,
  'home': HomeIcon,
  'image': ImageIcon,
  'more-horizontal': MoreHorizontalIcon,
  'pin': PinIcon,
  'settings': SettingsIcon,
  'tag': TagIcon,
  'trash': TrashIcon,
  'zap': ZapIcon,
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  className = '', 
  ...props 
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
};

// Export individual icons for direct usage
export {
    CheckIcon,
    CheckSquareIcon,
    ClockIcon,
    CodeIcon,
    CopyIcon,
    EditIcon,
    ExternalLinkIcon,
    FileIcon,
    HeartIcon,
    HomeIcon,
    ImageIcon,
    MoreHorizontalIcon,
    PinIcon,
    SettingsIcon,
    TagIcon,
    TrashIcon,
    ZapIcon
};

