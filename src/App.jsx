import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./layout/Layout";
import ProtectedRoute from "./auth/ProtectedRoute";
// Pages ImportsFullTimeJobs
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./Authentication/Login";
import ManageUsers from "./pages/User_Management/ManageUsers";
import LocalTask from "./pages/LocalNeeds/LocalNeeds";
import PartTimeJobs from "./pages/Jobs/PartTimeJobs";
import FullTimeJobs from "./pages/Jobs/FullTimeJobs";
import AllAdmin from "./pages/All_Admin/Alladmin";
import AllUsers from "./pages/All_Users/all_users";
import BloodRequest from "./pages/Blood_Request/Blood-request";
import Marketplace from "./pages/Marketplace/Marketplace";
import Credit from "./pages/Credits-Management/Credits";
// import SosAlert from "./pages/Safety/SOS Alert";
import CategoryShop from "./pages/Categories/Shop_category";
import Item_Category from "./pages/Categories/Item_category";
import ItemSubCategory from "./pages/Categories/Item_sub_category";
import Notification from "./pages/Notifications/Notification";
import ShopManage from "./pages/ShopManagement/shopmanage";
import Moderation from "./pages/ModerationBlocking/Moderationblocking";
import Setting from "./pages/SystemSetting/Systemsetting";
// import Reports from "./pages/Report_Export/Report_export";
import Business from "./pages/Business_Varifies/business-verify";

import UserFullJobs from "./pages/Jobs/UserFullTime";
import UserMarketPlace from "./pages/Marketplace/UserMarketPlace";
import Coupon from "./pages/Credits-Management/CouponModule";
import JobCategoryModule from "./pages/Categories/Job_category";
import SubCategoryShop from "./pages/Categories/Shop_subcategory";
import BannerManagement from "./pages/BannerManagement/BannerManagement";
function App() {
  return (
    <>
      <Routes>
        {/* Redirect Root to Login initially */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (Admin Panel) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route path="/usersmanagement" element={<ManageUsers />} />
          <Route path="/needsManagement" element={<LocalTask />} />
          <Route path="/PartTimeJobs" element={<PartTimeJobs />} />
          <Route path="/FullTimeJobs" element={<FullTimeJobs />} />
          <Route path="/all-admin" element={<AllAdmin />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/blood-request" element={<BloodRequest />} />
          <Route path="/Marketplace" element={<Marketplace />} />
          <Route path="/shop-management" element={<ShopManage />} />
          {/* <Route path="/sosAlert" element={< SosAlert />} /> */}
          <Route path="/credit" element={<Credit />} />
          <Route path="/cat-shop" element={<CategoryShop />} />
          <Route path="/cat-item" element={<Item_Category />} />
          <Route path="/subcat-item" element={<ItemSubCategory />} />
          <Route path="/cat-jobs" element={<JobCategoryModule />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/moderationblocking" element={<Moderation />} />
          <Route path="/systemsetting" element={<Setting />} />
          {/* <Route path="/report" element={<Reports />} /> */}
          <Route path="/business" element={<Business />} />
       
          <Route path="/user-full" element={<UserFullJobs />} />
         
          <Route path="/user-marketplace" element={<UserMarketPlace />} />
          <Route path="/coupon" element={<Coupon />} />
          <Route path="/banner-management" element={<BannerManagement />} />
          <Route path="/subcategoryshop" element={<SubCategoryShop />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
