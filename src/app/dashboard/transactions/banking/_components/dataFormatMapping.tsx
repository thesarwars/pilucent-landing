"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Dropdown from "./FormatMappingDropdown";
import { toast } from "@/lib/ToastService";

export default function DataFormatMapping({
  data,
  setData,
  selectedFile,
  step,
  setStep,
  setProcessedData,
  processedData,
}: {
  data: any[];
  setData: any;
  selectedFile: any;
  step: any;
  setStep: any;
  setProcessedData: any;
  processedData: any;
}) {
  // Step 1 state
  const [amountColumns, setAmountColumns] = useState({
    title: "One column",
    value: "one",
  });
  const [dateFormat, setDateFormat] = useState({
    title: "MM/DD/YYYY",
    value: "mm_dd_yyyy",
  });

  // Step 2 state
  const [mappingFields, setMappingFields] = useState<any[]>([
    { name: "Date", required: true, value: "" },
    { name: "Description", required: true, value: "" },
    { name: "Amount", required: true, value: "", subFields: [] },
    { name: "Check number", required: false, value: "" },
  ]);
  const [columnOptions, setColumnOptions] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  // Dropdown options
  const amountColumnOptions = [
    { title: "One column", value: "one" },
    { title: "Two columns", value: "two" },
  ];

  // Updated date format options to include all formats from the image
  const dateFormatOptions = [
    { title: "MM/dd/yyyy", value: "mm_slash_dd_yyyy" },
    { title: "MM-dd-yyyy", value: "mm_dash_dd_yyyy" },
    { title: "MM.dd.yyyy", value: "mm_dot_dd_yyyy" },
    { title: "dd/MM/yyyy", value: "dd_slash_mm_yyyy" },
    { title: "dd-MM-yyyy", value: "dd_dash_mm_yyyy" },
    { title: "dd.MM.yyyy", value: "dd_dot_mm_yyyy" },
    { title: "yyyy-MM-dd", value: "yyyy_dash_mm_dd" },
  ];

  // Update Amount field based on amountColumns selection
  useEffect(() => {
    const updatedFields = [...mappingFields];
    const amountFieldIndex = updatedFields.findIndex(
      (field) => field.name === "Amount",
    );

    if (amountFieldIndex !== -1) {
      if (amountColumns.value === "one") {
        updatedFields[amountFieldIndex].subFields = [];
      } else {
        updatedFields[amountFieldIndex].subFields = [
          { name: "Money Received", required: true, value: "" },
          { name: "Money Spent", required: true, value: "" },
        ];
      }
      setMappingFields(updatedFields);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountColumns]);

  useEffect(() => {
    if (selectedFile) {
      handleFile(selectedFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  const generateColumnOptions = (headers: any) => {
    return headers.map((header: any, index: any) => ({
      title: `Column ${index + 1}: ${header}`,
      value: `column${index + 1}`,
    }));
  };

  const handleFile = (file: any) => {
    const reader = new FileReader();

    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    const isCsv = file.name.endsWith(".csv");

    reader.onload = (e) => {
      if (isExcel && e.target) {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const fileHeaders = jsonData[0] as string[];
        setHeaders(fileHeaders);
        const columnOptions = generateColumnOptions(fileHeaders);
        setColumnOptions(columnOptions);
        const parsedData = XLSX.utils.sheet_to_json(worksheet);
        setData(parsedData);
      } else if (isCsv && e.target) {
        const csvText = e.target.result as string;
        const parsedData = parseCSV(csvText);
        setData(parsedData);
      } else {
        alert("Unsupported file format. Only .csv and .xlsx are allowed.");
      }
    };

    if (isExcel) {
      reader.readAsBinaryString(file);
    } else if (isCsv) {
      reader.readAsText(file);
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split("\n");
    const fileHeaders = lines[0].split(",").map((h: string) => h.trim());
    setHeaders(fileHeaders);

    const columnOptions = generateColumnOptions(fileHeaders);
    setColumnOptions(columnOptions);

    return lines.slice(1).map((line: string) => {
      const values = line.split(",").map((v: string) => v.trim());
      return fileHeaders.reduce((obj: any, header: string, index: number) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    const updatedFields = mappingFields.map((field) => {
      if (field.name === fieldName) {
        return { ...field, value };
      }
      return field;
    });
    setMappingFields(updatedFields);
  };

  const handleSubFieldChange = (
    fieldName: string,
    subFieldName: string,
    value: any,
  ) => {
    const updatedFields = mappingFields.map((field) => {
      if (field.name === fieldName) {
        const updatedSubFields = field.subFields.map((subField: any) => {
          if (subField.name === subFieldName) {
            return { ...subField, value };
          }
          return subField;
        });
        return { ...field, subFields: updatedSubFields };
      }
      return field;
    });
    setMappingFields(updatedFields);
  };

  // Helper function to get column name from field value
  const getColumnName = (fieldValue: any) => {
    if (!fieldValue) return null;

    const valueStr =
      typeof fieldValue === "object" ? fieldValue.value : fieldValue;
    const columnIndex = Number.parseInt(valueStr.replace("column", "")) - 1;
    return headers[columnIndex];
  };

  // Enhanced helper function to parse date based on format
  const parseDate = (dateStr: string, format: string): string => {
    let day, month, year;

    // Extract the separator from the format value
    const formatParts = format.split("_");
    const separator =
      formatParts[1] === "slash"
        ? "/"
        : formatParts[1] === "dash"
          ? "-"
          : formatParts[1] === "dot"
            ? "."
            : "/";

    // Split the date string using the appropriate separator
    const parts = dateStr.split(separator);

    // Handle different formats
    if (format.startsWith("mm")) {
      [month, day, year] = parts;
    } else if (format.startsWith("dd")) {
      [day, month, year] = parts;
    } else if (format.startsWith("yyyy")) {
      [year, month, day] = parts;
    } else {
      // Default fallback
      [month, day, year] = parts;
    }

    // Ensure 4-digit year
    if (year && year.length === 2) {
      const currentYear = new Date().getFullYear().toString();
      const century = currentYear.substring(0, 2);
      year = century + year;
    }

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (!mappingFields[0]?.value || !mappingFields[1]?.value) {
      return toast.error("Select matched fields first");
    }
    if (
      (!mappingFields[2]?.subFields[0]?.value ||
        !mappingFields[2]?.subFields[1]?.value) &&
      !mappingFields[2]?.value
    ) {
      return toast.error("Select matched fields first");
    }
    // Find field mappings
    const dateField = mappingFields.find((field) => field.name === "Date");
    const descriptionField = mappingFields.find(
      (field) => field.name === "Description",
    );
    const amountField = mappingFields.find((field) => field.name === "Amount");
    const checkNumberField = mappingFields.find(
      (field) => field.name === "Check number",
    );

    // Get column names from field values
    const dateColumnName = getColumnName(dateField?.value);
    const descriptionColumnName = getColumnName(descriptionField?.value);
    const checkNumberColumnName = getColumnName(checkNumberField?.value);

    // Process data
    try {
      const formattedData = data.map((row) => {
        const newRow: any = {};

        // Process date
        if (dateColumnName && row[dateColumnName]) {
          newRow.date = parseDate(row[dateColumnName], dateFormat.value);
        }

        // Process description
        if (descriptionColumnName) {
          newRow.description = row[descriptionColumnName];
        }

        // Process check number
        if (checkNumberColumnName) {
          newRow.checkNumber = row[checkNumberColumnName];
        }

        // Process amount based on amountColumns selection
        if (amountField) {
          if (amountColumns.value === "one") {
            // Single amount column
            const amountColumnName = getColumnName(amountField.value);
            if (amountColumnName) {
              const amount = row[amountColumnName];
              //if isNAN
              if (isNaN(Number(Math.abs(amount)))) {
                newRow.received = "0.00";
                newRow.spent = "0.00";
              } else {
                if (amount < 0) {
                  // console.log('negative')
                  // Negative amount goes to spent (without the negative sign)
                  newRow.spent = Number(Math.abs(amount).toFixed(3));
                  newRow.received = "0.00";
                } else {
                  // Positive amount goes to received
                  //   console.log('positive', amount)
                  newRow.received = Number(Math.abs(amount)).toFixed(2);
                  newRow.spent = "0.00";
                }
              }
            }
          } else {
            // Two amount columns
            const receivedSubField = amountField.subFields.find(
              (sf: any) => sf.name === "Money Received",
            );
            const spentSubField = amountField.subFields.find(
              (sf: any) => sf.name === "Money Spent",
            );

            const receivedColumnName = getColumnName(receivedSubField?.value);
            const spentColumnName = getColumnName(spentSubField?.value);

            if (receivedColumnName) {
              const received = Number.parseFloat(row[receivedColumnName]);
              newRow.received = !isNaN(received) ? received.toFixed(2) : "0.00";
            } else {
              newRow.received = "0.00";
            }

            if (spentColumnName) {
              const spent = Number.parseFloat(row[spentColumnName]);
              newRow.spent = !isNaN(spent)
                ? Math.abs(spent).toFixed(2)
                : "0.00";
            } else {
              newRow.spent = "0.00";
            }
          }
        }

        // Add any custom fields
        mappingFields.slice(4).forEach((field) => {
          if (field.name && field.value) {
            const customColumnName = getColumnName(field.value);
            if (customColumnName) {
              newRow[field.name] = row[customColumnName];
            }
          }
        });

        return newRow;
      });

      // Create mapping configuration
      const mappingConfig = mappingFields.reduce((config: any, field) => {
        if (field.subFields && field.subFields.length > 0) {
          config[field.name] = field.subFields.reduce(
            (subConfig: any, subField: any) => {
              subConfig[subField.name] = subField.value;
              return subConfig;
            },
            {},
          );
        } else {
          config[field.name] = field.value;
        }
        return config;
      }, {});

      setProcessedData(formattedData);
      setStep(4);
      // Return both the formatted data and the mapping configuration
      return {
        formattedData,
        mappingConfig,
      };
    } catch (error) {
      return toast.error("Please select the date format used in your file");
    }
  };

  // Add a new custom field
  const addCustomField = () => {
    setMappingFields([
      ...mappingFields,
      { name: "", required: false, value: "" },
    ]);
  };

  // Update custom field name
  const updateFieldName = (index: number, name: string) => {
    const updatedFields = [...mappingFields];
    updatedFields[index].name = name;
    setMappingFields(updatedFields);
  };

  return (
    <div className="rounded-lg border p-6 bg-white mb-4">
      {/* Step 1 */}
      <h1 className="mb-4 text-3xl font-semibold">Set up your file</h1>
      <div className="mb-8">
        <h2 className="mb-4 border-b pb-2 text-lg font-medium text-gray-800">
          Step 1: Tell us about the format of your data
        </h2>

        <div className="space-y-6">
          <div>
            <p className="mb-2 text-gray-600">How many columns show amounts?</p>
            <div className="w-64">
              <Dropdown
                options={amountColumnOptions}
                value={amountColumns}
                setValue={setAmountColumns}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-gray-600">
              Select the date format used in your file
            </p>
            <div className="w-64">
              <Dropdown
                options={dateFormatOptions}
                value={dateFormat}
                setValue={setDateFormat}
                placeholder="Select a date format"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div>
        <h2 className="mb-4 text-lg font-medium text-gray-800">
          Step 2: Select the fields that correspond to your file
        </h2>

        <div className="rounded border border-gray-200">
          {/* Table Header */}
          <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50">
            <div className="p-4 font-medium text-gray-700">Fields</div>
            <div className="p-4 font-medium text-gray-700">
              Columns from your file
            </div>
          </div>

          {/* Mapping Rows */}
          {mappingFields.map((field, index) => (
            <div
              key={index}
              className="grid grid-cols-2 border-b border-gray-200"
            >
              <div className="flex items-center p-4 text-gray-700">
                {index >= 4 ? (
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateFieldName(index, e.target.value)}
                    className="w-full rounded border border-gray-300 p-2"
                    placeholder="Enter field name"
                  />
                ) : (
                  field.name
                )}
                {field.required && <span className="ml-1 text-red-500">*</span>}
              </div>
              <div className="p-4">
                {field.subFields && field.subFields.length > 0 ? (
                  <div className="space-y-4">
                    {field.subFields.map((subField: any, subIndex: number) => (
                      <div key={subIndex}>
                        <p className="mb-2 text-gray-600">{subField.name}</p>
                        <Dropdown
                          options={columnOptions}
                          value={subField.value}
                          setValue={(value: any) =>
                            handleSubFieldChange(
                              field.name,
                              subField.name,
                              value,
                            )
                          }
                          placeholder={`Select a column for ${subField.name}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Dropdown
                    options={columnOptions}
                    value={field.value}
                    setValue={(value: any) =>
                      handleFieldChange(field.name, value)
                    }
                    placeholder={`Select a column for ${field.name}`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Field Button */}
        <div className="my-12 flex items-center justify-between">
          <button
            onClick={() => setStep(2)}
            className="rounded-md border border-accent_soft_black px-6 py-2 font-medium text-accent_soft_black transition-colors"
          >
            Back
          </button>

          {/* Submit Button */}
          <button
            onClick={() => {
              handleSubmit();
            }}
            className="ml-2 mt-4 rounded bg-accent_soft_black px-4 py-2 text-white "
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
