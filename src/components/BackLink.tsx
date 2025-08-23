import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function BackLink({ href, children, className }: BackLinkProps) {
  return <Button
    asChild
    variant="ghost"
    size="sm"
    className={cn("-ml-3", className)}
  >
    <Link
      href={href}
      className='flex gap-2 items-center text-sm text-muted-foreground'
    >
      <ArrowLeftIcon />
      {children}
    </Link>
  </Button>
}
