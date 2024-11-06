import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import "antd/dist/reset.css";
import Error403 from "./pages/error/Error403";
import Error404 from "./pages/error/Error404";
import Error500 from "./pages/error/Error500";
import Error503 from "./pages/error/Error503";
import Login from "./pages/auth/Login";
import Verify from "./pages/auth/Verify";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ChangePassword from "./pages/auth/ChangePassword";
import Wiki from "./pages/wiki/Wiki";
import Dashboard from "./pages/dashboard/Dashboard";
import WorkPlan from "./pages/sale_plan/workplan/WorkPlan";
import WorkPlanCreate from "./pages/sale_plan/workplan/WorkPlanCreate";
import WorkPlanCreateStepTwo from "./pages/sale_plan/workplan/WorkPlanCreateStepTwo";
import SettingRole from "./pages/settings/role/SettingRole";
import SettingUser from "./pages/settings/user/SettingUser";
import CreateUser from "./pages/settings/user/CreateUser";
import EditUser from "./pages/settings/user/EditUser";
import SettingSale from "./pages/settings/sale/SettingSale";
import CreateSale from "./pages/settings/sale/CreateSale";
import EditSale from "./pages/settings/sale/EditSale";
import SettingProduct from "./pages/settings/product/SettingProduct";
import EditProduct from "./pages/settings/product/EditProduct";
import SettingPromotion from "./pages/settings/promotion/SettingPromotion";
import CreatePromotion from "./pages/settings/promotion/CreatePromotion";
import EditPromotion from "./pages/settings/promotion/EditPromotion";
import WorkPlanAreaCreate from "./pages/sale_plan/workplan/WorkPlanAreaCreate";
import WorkPlanSaleCreate from "./pages/sale_plan/workplan/WorkPlanSaleCreate";
import WorkPlanSaleByCrop from "./pages/sale_plan/workplan/WorkPlanSaleByCrop";
import RollingForecast from "./pages/sale_plan/rolling_forecast/RollingForecast";
import OrderList from "./pages/order/OrderList";
import CreateOrder from "./pages/order/CreateOrder";
import EditOrder from "./pages/order/EditOrder";
import OrderDetail from "./pages/order/OrderDetail";
import OrderWaitingList from "./pages/order/OrderWaitingList";
import Dealer from "./pages/customer/dealer/DealerList";
import EditInformation from "./pages/customer/dealer/EditInformation";
import SubDealer from "./pages/customer/sub_dealer/SubDealerList";
import CreateSubDealer from "./pages/customer/sub_dealer/CreateSubDealer";
import EditSubDealer from "./pages/customer/sub_dealer/EditSubDealer";
import AdvanceExpense from "./pages/expenses/advance/AdvanceExpense";
import CreateAdvanceExpense from "./pages/expenses/advance/CreateAdvanceExpense";
import EditAdvanceExpense from "./pages/expenses/advance/EditAdvanceExpense";
import ViewAdvanceExpense from "./pages/expenses/advance/ViewAdvanceExpense";
import ProductClaim from "./pages/expenses/product_claim/ProductClaim";
import CreateClaimRequest from "./pages/expenses/product_claim/CreateClaimRequest";
import EditClaimRequest from "./pages/expenses/product_claim/EditClaimRequest";
import Traveling from "./pages/expenses/traveling/Traveling";
import CreateTraveling from "./pages/expenses/traveling/CreateTraveling";
import EditTraveling from "./pages/expenses/traveling/EditTraveling";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* Auth Route */}
          {/* <Route path="/" element={<Welcome />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/" element={<Dashboard />} />

          {/* Sale Plan Route */}
          <Route path="/sale-plan/work-plan" element={<WorkPlan />} />
          <Route path="/sale-plan/work-plan/create" element={<WorkPlanCreate />} />
          <Route path="/sale-plan/work-plan/create-2" element={<WorkPlanCreateStepTwo />} />

          <Route path="/sale-plan/rolling-forecast" element={<RollingForecast />} />

          {/* Order Route */}
          <Route path="/order/list" element={<OrderList />} />
          <Route path="/order/waiting-list" element={<OrderWaitingList />} />
          <Route path="/order/create" element={<CreateOrder />} />
          <Route path="/order/edit" element={<EditOrder />} />
          <Route path="/order/detail" element={<OrderDetail />} />

          {/* Order Route */}
          <Route path="/expenses/advance" element={<AdvanceExpense />} />
          <Route path="/expenses/advance/create" element={<CreateAdvanceExpense />} />
          <Route path="/expenses/advance/edit" element={<EditAdvanceExpense />} />
          <Route path="/expenses/advance/view" element={<ViewAdvanceExpense />} />
          <Route path="/expenses/product-claim" element={<ProductClaim />} />
          <Route path="/expenses/product-claim/create" element={<CreateClaimRequest />} />
          <Route path="/expenses/product-claim/edit" element={<EditClaimRequest />} />
          <Route path="/expenses/traveling" element={<Traveling />} />
          <Route path="/expenses/traveling/create" element={<CreateTraveling />} />
          <Route path="/expenses/traveling/edit" element={<EditTraveling />} />

          {/* Customer Route */}
          <Route path="/customer/dealer" element={<Dealer />} />
          <Route path="/customer/dealer/edit-info" element={<EditInformation />} />
          <Route path="/customer/sub-dealer" element={<SubDealer />} />
          <Route path="/customer/sub-dealer/create" element={<CreateSubDealer />} />
          <Route path="/customer/sub-dealer/edit" element={<EditSubDealer />} />

          {/* Setting Route */}
          <Route path="/setting/role" element={<SettingRole />} />
          <Route path="/setting/user" element={<SettingUser />} />
          <Route path="/setting/user/create" element={<CreateUser />} />
          <Route path="/setting/user/edit" element={<EditUser />} />
          <Route path="/setting/sale" element={<SettingSale />} />
          <Route path="/setting/sale/create" element={<CreateSale />} />
          <Route path="/setting/sale/edit" element={<EditSale />} />
          <Route path="/setting/product" element={<SettingProduct />} />
          <Route path="/setting/product/edit" element={<EditProduct />} />
          <Route path="/setting/promotion" element={<SettingPromotion />} />
          <Route path="/setting/promotion/create" element={<CreatePromotion />} />
          <Route path="/setting/promotion/edit" element={<EditPromotion />} />

          {/* Error Route */}
          <Route path="/error/403" element={<Error403 />} />
          <Route path="*" element={<Error404 />} />
          <Route path="/error/500" element={<Error500 />} />
          <Route path="/error/503" element={<Error503 />} />
          <Route path="/wiki" element={<Wiki />} />

          {/* SHOW USER PATH */}
          <Route path="/sale-plan/work-plan/sale-area-create" element={<WorkPlanAreaCreate />} />
          <Route path="/sale-plan/work-plan/sale-create" element={<WorkPlanSaleCreate />} />
          <Route path="/sale-plan/work-plan/sale-by-crop" element={<WorkPlanSaleByCrop />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
