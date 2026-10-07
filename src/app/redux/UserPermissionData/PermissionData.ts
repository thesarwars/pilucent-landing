import { createSlice } from "@reduxjs/toolkit";

interface PermissionDataState {
  Permissions: any;
}

const initialState: PermissionDataState = {
  Permissions: [],
};

const PermissionsDataSlice = createSlice({
  name: "Permissions",
  initialState,
  reducers: {
    setPermissions: (state, action) => {
      state.Permissions = action.payload;
    },
  },
});

export const { setPermissions } = PermissionsDataSlice.actions;
export default PermissionsDataSlice.reducer;
