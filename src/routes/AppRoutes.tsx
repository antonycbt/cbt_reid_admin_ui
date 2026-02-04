import { Routes, Route } from "react-router-dom";
import Login from "../features/auth/Login";
import UserListList from "../features/users/UserListList";
import DepartmentList from "../features/departments/DepartmentList";
import SiteHierarchyList from "../features/site_hierarchies/SiteHierarchyList";
import SiteLocationList from "../features/site_locations/SiteLocationList";
import CameraList from "../features/cameras/CameraList";
import AccessGroupList from "../features/access_groups/AccessGroupList";
import MemberList from "../features/members/MemberList";
import DashboardLayout from "../layout/DashboardLayout";
import SiteLocationAccessList from "../features/site_location_access/SiteLocationAccessList";
import MemberAccessList from "../features/member_access/MemberAccessList";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="" element={<DashboardLayout />}>
        <Route path="/users" element={<UserListList />} />
        <Route path="/departments" element={<DepartmentList />} />
        <Route path="/site_hierarchy" element={<SiteHierarchyList />} />
        <Route path="/site_location" element={<SiteLocationList />} />
        <Route path="/cameras" element={<CameraList />} />
        <Route path="/access_groups" element={<AccessGroupList />} />
        <Route path="/members" element={<MemberList />} />
        <Route path="/site_location_access" element={<SiteLocationAccessList />} />
        <Route path="/member_access" element={<MemberAccessList />} />
      </Route>
    </Routes>
  );
}
