
import About from "./About";
import BasicInfo from "./BasicInfo";
import Address from "./Address";
import { ToastContainer } from "react-toastify";

const Profile = ({User}:{User:any}) => {
  return (
    <>
      <About User={User}/>
      <BasicInfo User={User} />
      <Address User={User} />
    </>
  );
};

export default Profile;
