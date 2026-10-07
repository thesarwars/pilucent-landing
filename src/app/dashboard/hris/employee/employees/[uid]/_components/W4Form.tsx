import { postI9Form, postW4Form } from "@/app/helpers/backend";
import { useAppSelector } from "@/app/redux/store";
import Button from "@/components/ui/RawButton";
import { toast } from "@/lib/ToastService";
import { buildW4Payload } from "@/lib/helpers/w4TaxConfig";
import React, { useEffect, useState } from "react";
import { RiDownload2Fill } from "react-icons/ri";
import DotSpinner from "../../_components/dot-spinner";
import { TableCell, TableRow } from "@/components/ui/Table";
import { DownloadIcon, FileSpreadsheetIcon } from "lucide-react";

const W4Form = ({ Employee }: { Employee: any }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { Company } = useAppSelector((state) => state.CompanyData);
  // The /me response (stored as UserData) carries the authoritative company
  // name (e.g. "Jumatechs 24/7") shown in the W-4 Employer name box.
  const { UserData } = useAppSelector((state) => state.userData);
  const [address, setAddress] = useState<any>({});

  useEffect(() => {
    if (Employee) {
      const homeAddress =
        Employee?.addresses?.find((a: any) => a?.is_shipping == true) ||
        Employee?.addresses?.[0];
      if (homeAddress) {
        setAddress(homeAddress);
      }
    }
  }, [Employee]);

  // Split the saved tax certificates into state vs federal records.
  const splitTaxes = () => {
    const taxes = Employee?.taxes;
    let stateTax: any = {};
    let federalTax: any = {};
    if (Array.isArray(taxes)) {
      taxes.forEach((tax: any) => {
        if (tax?.is_the_state_other_income_tax) stateTax = tax;
        else federalTax = tax;
      });
    } else if (taxes && typeof taxes === "object") {
      if (taxes.is_the_state_other_income_tax) stateTax = taxes;
      federalTax = taxes;
    }
    return { stateTax, federalTax };
  };

  // Build the Form W-4 payload from the saved tax certificates, not hard-coded
  // values. Field-id mapping lives in `@/lib/helpers/w4TaxConfig` (W4_FIELDS).
  const createW4Payload = () => {
    const { stateTax, federalTax } = splitTaxes();
    // Prefer the company carried by the /me response (UserData.company) for the
    // Employer name; fall back to the /we company in the redux store.
    const company = {
      ...Company,
      ...UserData?.company,
      name: UserData?.company?.name || Company?.name,
    };
    return buildW4Payload({
      employee: Employee,
      stateTax,
      federalTax,
      company,
      homeAddress: address,
    });
    };

  const createI9Payload = () => {
    return {
      "Last Name \\(Family Name\\)": "Hasan",
      "First Name Given Name": "Jubair",
      "Employee Middle Initial \\(if any\\)": "A",
      "Employee Other Last Names Used \\(if any\\)": "Khan",
      "Address Street Number and Name": "123 Main Street",
      "Apt Number \\(if any\\)": "5B",
      "City or Town": "Dhaka",
      State: "BD",
      "ZIP Code": "1000",
      "Date of Birth mmddyyyy": "01011990",
      "US Social Security Number": "123-45-6789",
      "Employees E-mail Address": "jubair@example.com",
      "Telephone Number": "123-456-7890",

      CB_1: true,
      CB_2: false,
      CB_3: false,
      "3 A lawful permanent resident Enter USCIS or ANumber": "",
      CB_4: false,

      "Exp Date mmddyyyy": "12312030",
      "USCIS ANumber": "A123456789",
      "Form I94 Admission Number": "I94-987654321",
      "Foreign Passport Number and Country of IssuanceRow1":
        "P1234567 - Bangladesh",
      "Signature of Employee": "Jubair Hasan",
      "Today's Date mmddyyy": "08252025",

      "Issuing Authority 1": "Govt of BD",
      "Document Number 0 \\(if any\\)": "D123456",
      "Expiration Date if any": "12312030",
      "Document Title 2 If any": "National ID",
      "Issuing Authority_2": "NID Authority",
      "Document Number If any_2": "NID-2025-001",
      " Expiration Date \\(if any\\)": "12312035",
      "  If any": "Extra Doc",
      "  Enter Issuing Authority": "Authority XYZ",
      "Document Number if any_3": "DOC-3333",

      "List B Document 1 Title": "Driver License",
      "List B Issuing Authority 1": "BD Traffic Authority",
      "List B Document Number 1": "DL-12345",
      "List B Expiration Date 1": "12312028",

      "List C Document Title 1": "Birth Certificate",
      "List C Issuing Authority 1": "Govt of BD",
      "List C Document Number 1": "BC-9999",
      "List C Expiration Date 1": "N/A",

      "Additional Information": "All good.",
      CB_Alt: true,
      "FirstDayEmployed mmddyyyy": "09012025",
      "Last Name First Name and Title of Employer or Authorized Representative":
        "Rahman Karim - HR",
      "Signature of Employer or AR": "R. Karim",
      "S2 Todays Date mmddyyyy": "08252025",
      "Employers Business or Org Name": "Tech Solutions Ltd.",
      "Employers Business or Org Address": "456 Business Ave, Dhaka",
      "Last Name Family Name from Section 1": "Hasan",
      "First Name Given Name from Section 1": "Jubair",
      "Middle initial if any from Section 1": "A",

      "Signature of Preparer or Translator 0": "Translator 0",
      "Sig Date mmddyyyy 0": "08252025",
      "Preparer or Translator Last Name \\(Family Name\\) 0": "Ahmed",
      "Preparer or Translator First Name \\(Given Name\\) 0": "Sadia",
      "PT Middle Initial 0": "T",
      "Preparer or Translator Address \\(Street Number and Name\\) 0":
        "789 Lane",
      "Preparer or Translator City or Town 0": "Dhaka",
      "Preparer State 0": "BD",
      "Zip Code 0": "1212",

      "Signature of Preparer or Translator 1": "Translator 1",
      "Sig Date mmddyyyy 1": "08252025",
      "PT Middle Initial 1": "U",
      "Preparer or Translator Address \\(Street Number and Name\\) 1":
        "1010 Road",
      "Preparer or Translator City or Town 1": "Chittagong",
      "Preparer State 1": "BD",
      "Zip Code 1": "4000",

      "Signature of Preparer or Translator 2": "Translator 2",
      "Sig Date mmddyyyy 2": "08252025",
      "Preparer or Translator Last Name \\(Family Name\\) 2": "Miah",
      "Preparer or Translator First Name \\(Given Name\\) 2": "Imran",
      "PT Middle Initial 2": "V",
      "Preparer or Translator Address \\(Street Number and Name\\) 2":
        "2020 Street",
      "Preparer or Translator City or Town 2": "Sylhet",
      "Preparer State 2": "BD",
      "Zip Code 2": "3100",

      "Signature of Preparer or Translator 3": "Translator 3",
      "Sig Date mmddyyyy 3": "08252025",
      "Preparer or Translator Last Name \\(Family Name\\) 3": "Chowdhury",
      "Preparer or Translator First Name \\(Given Name\\) 3": "Farhan",
      "PT Middle Initial 3": "W",
      "Preparer or Translator Address \\(Street Number and Name\\) 3":
        "3030 Avenue",
      "Preparer or Translator City or Town 3": "Khulna",
      "Preparer State 3": "BD",
      "Zip Code 3": "9100",

      "Last Name Family Name from Section 1-2": "Hasan",
      "First Name Given Name from Section 1-2": "Jubair",
      "Middle initial if any from Section 1-2": "A",

      "Date of Rehire 0": "01012026",
      "Last Name 0": "Hossain",
      "First Name 0": "Rafiq",
      "Middle Initial 0": "M",
      "Document Title 0": "Work Permit",
      "Document Number 0": "WP-0001",
      "Expiration Date 0": "12312027",
      "Name of Emp or Auth Rep 0": "HR Manager",
      "Signature of Emp Rep 0": "HR Sig",
      "Todays Date 0": "08252025",
      "Addtl Info 0": "Rehire verified",
      CB_Alt_0: false,

      "Date of Rehire 1": "02022027",
      "Last Name 1": "Kamal",
      "First Name 1": "Arif",
      "Middle Initial 1": "B",
      "Document Number 1": "DOC-2222",
      "Expiration Date 1": "02022030",
      "Name of Emp or Auth Rep 1": "HR Lead",
      "Signature of Emp Rep 1": "HR Sig 2",
      "Todays Date 1": "08252025",
      "Addtl Info 1": "Extension granted",
      CB_Alt_1: true,

      "Date of Rehire 2": "03032028",
      "Last Name 2": "Rahman",
      "First Name 2": "Shakil",
      "Middle Initial 2": "C",
      "Document Title 2": "Resident Card",
      "Document Number 2": "RC-5555",
      "Expiration Date 2": "03032033",
      "Name of Emp or Auth Rep 2": "CEO",
      "Signature of Emp Rep 2": "CEO Sig",
      "Todays Date 2": "08252025",
      "Addtl Info 2": "Approved",
      CB_Alt_2: false,
    };
  };

  // Function to handle W4 form generation
  const handleGenerateW4 = async () => {
    try {
      setIsGenerating(true);
      const w4Payload = createW4Payload();

      const response = await postW4Form(w4Payload);

      if (response) {
        const url = window.URL.createObjectURL(response);

        // Create a temporary anchor element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = "W-4_Form_2025.pdf"; // Set the desired filename here
        document.body.appendChild(a); // Append the element to the body

        a.click(); // Programmatically click the element to start the download

        a.remove(); // Remove the element after clicking
        window.URL.revokeObjectURL(url); // Free up memory by revoking the object URL

        toast.success("W4 form downloaded!");
      }
    } catch (error) {
      toast.error("An error occurred while generating the W4 form.");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleGenerateI9 = async () => {
    try {
      setIsGenerating(true);
      const w4Payload = createI9Payload();

      const response = await postI9Form(w4Payload);

      if (response) {
        const url = window.URL.createObjectURL(response);

        // Create a temporary anchor element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = "W-4_Form_2025.pdf"; // Set the desired filename here
        document.body.appendChild(a); // Append the element to the body

        a.click(); // Programmatically click the element to start the download

        a.remove(); // Remove the element after clicking
        window.URL.revokeObjectURL(url); // Free up memory by revoking the object URL

        toast.success("W4 form downloaded!");
      }
    } catch (error) {
      toast.error("An error occurred while generating the W4 form.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {isGenerating && (
        <div className="absolute bottom-0 left-0 right-0 top-0 flex h-screen w-full flex-col items-center justify-center bg-white bg-opacity-50">
          <DotSpinner />
        </div>
      )}
      <TableRow className="hover:bg-gray-50">
        <TableCell className="flex items-center gap-1 text-nowrap border-r px-4">
          {" "}
          <FileSpreadsheetIcon className="size-4 opacity-60" />
          W-4 Form
        </TableCell>

        <TableCell
          className={`text-nowrap border-r px-4 font-light last:border-r-0`}
        >
          Form
        </TableCell>
        <TableCell
          className={`text-nowrap border-r px-4 font-light last:border-r-0`}
        >
          -
        </TableCell>

        <TableCell className="text-nowrap">
          <div className="flex items-center justify-center gap-2 text-nowrap">
            <Button
              onClick={handleGenerateW4}
              size="icon"
              variant="ghost"
              className="size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
            >
              <DownloadIcon className="size-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      <TableRow className="hover:bg-gray-50">
        <TableCell className="flex items-center gap-1 text-nowrap border-r px-4">
          {" "}
          <FileSpreadsheetIcon className="size-4 opacity-60" />
          I-9 Form
        </TableCell>

        <TableCell
          className={`text-nowrap border-r px-4 font-light last:border-r-0`}
        >
          Form
        </TableCell>
        <TableCell
          className={`text-nowrap border-r px-4 font-light last:border-r-0`}
        >
          -
        </TableCell>

        <TableCell className="text-nowrap">
          <div className="flex items-center justify-center gap-2 text-nowrap">
            <Button
              onClick={handleGenerateI9}
              size="icon"
              variant="ghost"
              className="size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
            >
              <DownloadIcon className="size-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
};

export default W4Form;
