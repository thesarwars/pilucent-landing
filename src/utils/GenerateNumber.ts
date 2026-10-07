export const generateBillNumber = (name:string, pre?:string) => {
    const timestampPart = Date.now().toString().slice(-3); // last 3 digits of timestamp
    const randomPart = Math.floor(Math.random() * 900) + 100; // random 3-digit number (100-999)
    return `${pre? pre : "BILL"}-${name?.trim()?.slice(0, 1).toUpperCase()}${timestampPart}${randomPart}`;
  };