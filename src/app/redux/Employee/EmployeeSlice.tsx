import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EmployeeDetails {
  name: string;
  uid:any;
  father_name: string;
  date_of_birth: string;
  blood_group: string;
  phone: string;
  join_date: string;
  email: string;
  work_location: string;
  nid_card_no: string;
  code: string;
  finger_id: string;
  department_uid: string;
  designation_uid: string;
  shift_uid: string;
  section_uid: string;
  present_address: string;
  permanent_address: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_mobile_number: string;
  introducer_name: string;
  introducer_mobile_number: string;
  introducer_address: string;
}

interface EmployeeState {
    employeeDetails: EmployeeDetails | null;
  }
  
  const initialState: any = {
    employeeDetails: null, // Change to 'employeeDetails'
    newEmployeeDetails:null,
    salaryProccess:null,
    attendee:null,
    previewpayroll:null,
    trackerOn:false,
    payrollInfo:{},
    gen_settings:null
  };
  
  const employeeSlice = createSlice({
    name: 'employee',
    initialState,
    reducers: {
      setEmployeeDetails: (state, action: PayloadAction<EmployeeDetails>) => {
        state.employeeDetails = action.payload; // Change to 'employeeDetails'
      },
      addnewEmployeDetails:(state, action: PayloadAction<EmployeeDetails>) => {
        state.newEmployeeDetails = action.payload; // Change to 'employeeDetails'
      },
      addsalaryproccess:(state, action: PayloadAction<EmployeeDetails>) => {
        state.salaryProccess = action.payload; // Change to 'employeeDetails'
      },
      addattendee:(state, action: PayloadAction<EmployeeDetails>) => {
        state.attendee = action.payload; // Change to 'employeeDetails'
      },
      addpreview:(state, action: PayloadAction<EmployeeDetails>) => {
        state.previewpayroll = action.payload; // Change to 'employeeDetails'
      },
      addsetings:(state, action: PayloadAction<EmployeeDetails>) => {
        state.gen_settings = action.payload; // Change to 'employeeDetails'
      },
      payrollInfoAdd:(state, action: PayloadAction<EmployeeDetails>) => {
        state.payrollInfo = action.payload; //for payroll pay period and paydate and type
      },
      startTracker:(state) => {
        state.trackerOn = true; // start tracker
      },
      stopTracker:(state) => {
        state.trackerOn = false; // stop tracker
      },
    },
  });
  
  export const { setEmployeeDetails,addnewEmployeDetails,addsalaryproccess,addattendee,addpreview,startTracker,stopTracker,payrollInfoAdd,addsetings } = employeeSlice.actions;
  export default employeeSlice.reducer;