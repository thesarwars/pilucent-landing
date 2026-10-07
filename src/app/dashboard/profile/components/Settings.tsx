import { ToastContainer } from "react-toastify";
import Password from "./Password";
import SignInInfo from "./SignInInfo";
import TwoSV from "./TwoSV";

const Settings = ({User}:{User:any}) => {
    return (
        <>
            <SignInInfo User={User}/>
            <Password User={User}/>
            <TwoSV User={User}/>
        </>
    );
};

export default Settings;