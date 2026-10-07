import { DesignationCreate } from './../services/company';
type TypeCreateCompany = {
    name: string;
    legal_name?: string;
    status?: null |string;
    business_id_no?: string;
    vat_number?: string;
    time_zone?: string;
    email?: string;
    phone?: string;
    website?: string;
    company_address?: string;
    customer_facing_address?: string;
    legal_address?: string;
    logo?:File|null;
  };
type TypeDesignationCreate={
  title:string;
  status:string|null;
}
type TypeDepartmentCreate={
  title:string;
  code:string;
}
type TypeSectionCreate={
  title:string;
  department:{};
}