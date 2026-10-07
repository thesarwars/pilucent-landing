import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserDataState {
  UserData: any;
}

const initialState: UserDataState = {
  UserData: null,
};

const UserDataSlice = createSlice({
  name: "UserData",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction) => {
      state.UserData = action.payload;
    },
  },
});

export const { setUser } = UserDataSlice.actions;
export default UserDataSlice.reducer;
