import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Trash2, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, Chip, avatarGradient } from '@/components/violet';

type TDashboardBoxShape = {
  className?: string;
  name: string;
  users: any[];
  uid: string;
  onDelete: (uid: string) => void;
  permission?: any;
  editHandler?: () => {};
  isAdmin?: boolean;
  isSystem?: boolean;
};

const DashboardBoxShape = ({
  users,
  name,
  uid,
  className,
  onDelete,
  isSystem,
}: TDashboardBoxShape) => {
  const count = users?.length || 0;
  const shown = count > 4 ? users.slice(0, 4) : users || [];
  const extra = count - shown.length;

  return (
    <div
      className={cn(
        'group flex h-full w-full flex-col justify-between gap-4 rounded-v-card border border-[rgba(22,23,42,0.08)] bg-white p-5 font-jakarta shadow-v-card transition-shadow hover:shadow-v-tile-hover',
        className
      )}
    >
      {/* top: role icon + actions */}
      <div className="flex items-start justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-[12px] text-white"
          style={{ backgroundImage: avatarGradient(name) }}
        >
          <Shield className="h-[18px] w-[18px]" />
        </span>
        <div className="flex items-center gap-1">
          {!isSystem && (
            <button
              type="button"
              onClick={() => onDelete(uid)}
              aria-label="Delete role"
              className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <Link
            href={`roles/${uid}`}
            aria-label="Edit role"
            className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* role name */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-[17px] font-extrabold tracking-[-0.01em] text-v-ink900" title={name}>
            {name}
          </h4>
          {isSystem && <Chip tone="neutral">System</Chip>}
        </div>
      </div>

      {/* footer: user count + avatar stack */}
      <div className="flex items-center justify-between border-t border-[rgba(22,23,42,0.06)] pt-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-v-ink500">
          <Users className="h-3.5 w-3.5 text-v-ink400" />
          {count} {count === 1 ? 'User' : 'Users'}
        </span>

        {count > 0 && (
          <div className="flex items-center">
            {shown.map((user: any, idx: number) => (
              <span
                key={idx}
                className="rounded-full border-2 border-white"
                style={{ marginLeft: idx === 0 ? 0 : -8 }}
              >
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user?.name || 'user'}
                    height={52}
                    width={52}
                    className="h-[26px] w-[26px] rounded-full object-cover object-top"
                  />
                ) : (
                  <Avatar name={user?.name || '?'} seed={user?.uid ?? idx} size={26} />
                )}
              </span>
            ))}
            {extra > 0 && (
              <span className="-ml-2 flex h-[26px] min-w-[26px] items-center justify-center rounded-full border-2 border-white bg-v-tint100 px-1 text-[10px] font-extrabold text-v-primary">
                +{extra}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardBoxShape;
