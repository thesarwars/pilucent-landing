'use client';

import { deleteRole, fetchRoles } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import DashboardBoxShape from '@/components/ui/DashboardBoxShape';
import { useState, useRef, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiEdit2 } from 'react-icons/fi';
import CarouselSkeleton from './CarouselSkeleton';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Swal from 'sweetalert2';

export default function RoleCarousel({}) {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [RoleData, setRoleData] = useState<any>([]);
  const { Company } = useAppSelector((state) => state.CompanyData);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 4,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  useEffect(() => {
    const fn = async () => {
      setIsPending(true);
      try {
        const res = await fetchRoles(Company?.uid);
        setRoleData(res);
      } catch (error) {
        //error here
      } finally {
        setIsPending(false);
      }
    };
    if (Company?.uid) fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (uid: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6A6EF6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, Delete`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await deleteRole(uid);
          if (response?.success) {
            setRoleData(RoleData.filter((role: any) => role.uid !== uid));
            return response;
          } else {
            throw new Error(response?.message);
          }
          throw new Error('Failed');
        } catch (error) {
          Swal.showValidationMessage(`${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Success!',
          text: 'Role has been deleted',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div>
      {isPending ? (
        <div className="my-10 flex space-x-3">
          <CarouselSkeleton></CarouselSkeleton>
          <CarouselSkeleton></CarouselSkeleton>
          <CarouselSkeleton></CarouselSkeleton>
          <CarouselSkeleton></CarouselSkeleton>
        </div>
      ) : (
        <Carousel
          responsive={responsive}
          itemClass="z-10 px-2 [&>*]:h-full"
          containerClass="-mx-2 carousel-container z-10 items-stretch"
          className="z-10 mb-7 mt-8"
        >
          {RoleData?.map((dash: any) => (
            <DashboardBoxShape
              onDelete={(uid) => handleDelete(dash?.uid)}
              key={dash.name}
              className="w-full"
              name={dash.name}
              users={dash.users}
              uid={dash.uid}
              permission={dash.permissions.app_label}
              isSystem={dash.is_system}
            />
          ))}
        </Carousel>
      )}
    </div>
  );
}
