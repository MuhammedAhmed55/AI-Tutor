'use client'
import Dashboard from "@/components/dashboard/root";
import { useAuth } from "@/context/AuthContext";
import { UserRoles } from "@/types/types";
import { User } from "lucide-react";
import UserDashboard from "@/components/User/user-dashboard";

const DashboardPage = () => {
  const {userProfile} = useAuth();
  if(userProfile?.roles?.name === UserRoles.USER){
    return <UserDashboard />;
  }else{
    return <Dashboard />;
  }
};

export default DashboardPage;
