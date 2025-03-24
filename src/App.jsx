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
import ProfileUser from "./pages/settings/user/ProfileUser";
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
import Farmer from "./pages/customer/Farmers/FarmersList";
import FarmerCreate from "./pages/customer/Farmers/FarmersCreate";

import AdvanceExpense from "./pages/expenses/advance/AdvanceExpense";
import PdfAdvanceExpense from "./pages/pdf/ViewAdvanceExpense";
import ProductClaim from "./pages/expenses/product_claim/ProductClaim";
import CreateClaimRequest from "./pages/expenses/product_claim/CreateClaimRequest";
import EditClaimRequest from "./pages/expenses/product_claim/EditClaimRequest";
import Traveling from "./pages/expenses/traveling/Traveling";
import CreateTraveling from "./pages/expenses/traveling/CreateTraveling";
import EditTraveling from "./pages/expenses/traveling/EditTraveling";
import PdfTraveling from "./pages/pdf/ViewTraveling";
import ClearingExpense from "./pages/expenses/clearing/ClearingExpense";
import ViewOrder from "./pages/order/ViewOrder";
import ViewOrderWaiting from "./pages/order/ViewOrderWaiting";
import { ProtectedRoute, PublicRoute } from "./components/auth/ProtectedRoute";
import WorkPlanSaleByDealer from "./pages/sale_plan/workplan/WorkPlanSaleByDealer";
import FirstChangePassword from "./pages/auth/FirstChangePassword";

// START ------------- Activity ------------- START
import ActivityList from "./pages/activity/ActivityList";
import CreateActivity from "./pages/activity/CreateActivity";
import ActivityPlanList from "./pages/activity/activity_plan/ActivityPlanList";
import ActivityCalendar from "./pages/activity/calendar/ActivityCalendar";
import ViewTraveling from "./pages/expenses/traveling/ViewTraveling";
import ActivityMapping from "./pages/activity/mapping/ActivityMapping";
import WorkPlanSaleBySubDealer from "./pages/sale_plan/workplan/WorkPlanSaleBySubDealer";
import RollingForecastQuarter from "./pages/sale_plan/rolling_forecast/RollingForecastQuarter";
import RollingForecastMonth from "./pages/sale_plan/rolling_forecast/RollingForecastMonth";
import ActivityPlanDealer from "./pages/activity/activity_plan/ActivityPlanDealer";
import ActivityPlanSubDealer from "./pages/activity/activity_plan/ActivityPlanSubDealer";
import RollingForecastDealer from "./pages/sale_plan/rolling_forecast/RollingForecastDealer";
import WorkPlanSaleByDealerMonth from "./pages/sale_plan/workplan/WorkPlanSaleByDealerMonth";
import ReportSaleByMonth from "./pages/report/ReportSaleByMonth";
import ReportSaleByQuarter from "./pages/report/ReportSaleByQuarter";
import ReportSaleByYear from "./pages/report/ReportSaleByYear";
import ReportActivity from "./pages/report/ReportActivity";
// END ------------- Activity ------------- END

// Phase 2
import Material from "./pages/settings/material/Material";
import ActionMaterial from "./pages/settings/material/ActionMaterial";
import MaterialExpense from "./pages/expenses/material_expense/MaterialExpense";
import ActionMaterialExpense from "./pages/expenses/material_expense/ActionMaterialExpense";
import SampleExpense from "./pages/expenses/sample_expense/SampleExpense";
import ActionSampleExpense from "./pages/expenses/sample_expense/ActionSampleExpense";
import Transaction from "./pages/settings/material/transaction";
import MyAccountMobile from "./pages/mobile/user/MyAccount";
import VerifyOA from "./pages/mobile/auth/VerifyOA";
import OtpOA from "./pages/mobile/auth/OtpOA";
import UserDetail from "./pages/mobile/user/UserDetail";
import EditUserOA from "./pages/mobile/user/EditUserOA";
import RegisterOA from "./pages/mobile/register/RegisterOA";
import MainOA from "./pages/mobile/main/MainOA";
import ActivityPlanDealerMonth from "./pages/activity/activity_plan/ActivityPlanDealerMonth";
import PDFClearingExpense from "./pages/pdf/PDFClearingExpense";
import CustomerStockCreate from "./pages/stock/customer-stock/CustomerStockCreate";
import CustomerStock from "./pages/stock/customer-stock/CustomerStock";
import ScanCollectPoint from "./pages/mobile/scan_collect/ScanCollectPoint";
import RedeemPoint from "./pages/mobile/redeem_point/RedeemPoint";
import RedeemPointDetail from "./pages/mobile/redeem_point/RedeemPointDetail";
import PurchaseHistory from "./pages/mobile/purchase_history/PurchaseHistory";
import PurchaseHistoryDetail from "./pages/mobile/purchase_history/PurchasehistoryDetail";
import Promotion from "./pages/mobile/promotion/Promotion";
import PromotionDetail from "./pages/mobile/promotion/PromotionDetail";
import RedeemHistory from "./pages/mobile/redeem_history/RedeemHistory";
import RedeemHistoryDetail from "./pages/mobile/redeem_history/RedeemHistoryDetail";
import ReportStock from "./pages/report/ReportStock";
import ContactUs from "./pages/mobile/user/settings/contact_us/ContactUs";
import FaqOA from "./pages/mobile/user/settings/faq/Faq";
import PrivacyPolicy from "./pages/mobile/user/settings/privacy_policy/PrivacyPolicy";
import TermsConditions from "./pages/mobile/user/settings/terms_conditions/TermsConditions";
import CheckLogin from "./pages/mobile/auth/CheckLogin";
import { LineOARoute, LinePrivateRoute } from "./components/auth/LineOARoute";
import PromotionLineList from "./pages/settings/mobile/promotion/PromotionLineList";
import CustomerLineList from "./pages/settings/mobile/customer/CustomerLineList";
import CreateCustomerLine from "./pages/settings/mobile/customer/CreateCustomerLine";
import CreatePromotionLine from "./pages/settings/mobile/promotion/CreatePromotionLine";
import ExpirePointList from "./pages/settings/mobile/expire_point/ExpirePointList";
import ManageNewsList from "./pages/settings/mobile/manage-news/ManageNewsList";
import ManagePromotionList from "./pages/settings/mobile/manage-promotion/ManagePromotionList";
import CreateManageNews from "./pages/settings/mobile/manage-news/CreateManageNews";
import CreateManagePromotion from "./pages/settings/mobile/manage-promotion/CreateManagePromotion";
import ApprovalAdvanceExpense from "./pages/expenses/advance/ApprovalAdvanceExpense";
import ApprovalClearingExpense from "./pages/expenses/clearing/ApprovalClearingExpense";
import ContactAdmin from "./pages/mobile/contact_admin/ContactAdmin";
import TakePhoto from "./pages/mobile/take_photo/TakePhoto";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          <Route element={<PublicRoute />}>

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<Verify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/first-change-password" element={<FirstChangePassword />} />

          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>

            <Route path="/" element={<Dashboard />} />

            {/* Work Plan Route */}
            <Route path="/sale-plan/work-plan" element={<WorkPlan />} />
            <Route path="/sale-plan/work-plan-area" element={<WorkPlan />} />
            <Route path="/sale-plan/work-plan-sale" element={<WorkPlan />} />
            <Route path="/sale-plan/work-plan/create" element={<WorkPlanCreate />} />
            <Route path="/sale-plan/work-plan/create-2" element={<WorkPlanCreateStepTwo />} />
            <Route path="/sale-plan/work-plan-area/sale-area-create" element={<WorkPlanAreaCreate />} />
            <Route path="/sale-plan/work-plan-sale/sale-create" element={<WorkPlanSaleCreate />} />
            <Route path="/sale-plan/work-plan-sale/sale-by-crop" element={<WorkPlanSaleByCrop />} />
            <Route path="/sale-plan/work-plan-sale/sale-by-dealer" element={<WorkPlanSaleByDealer />} />
            <Route path="/sale-plan/work-plan-sale/sale-by-dealer-month" element={<WorkPlanSaleByDealerMonth />} />
            <Route path="/sale-plan/work-plan-sale/sale-by-subdealer" element={<WorkPlanSaleBySubDealer />} />

            {/* Rolling Rorecast Route */}
            <Route path="/sale-plan/rolling-forecast" element={<RollingForecast />} />
            <Route path="/sale-plan/rolling-forecast-area" element={<RollingForecast />} />
            <Route path="/sale-plan/rolling-forecast-sale" element={<RollingForecast />} />
            <Route path="/sale-plan/rolling-forecast/month" element={<RollingForecastMonth />} />
            <Route path="/sale-plan/rolling-forecast/dealer" element={<RollingForecastDealer />} />
            <Route path="/sale-plan/rolling-forecast/quarter" element={<RollingForecastQuarter />} />

            {/* Activity Route */}
            <Route path="/activity/plan" element={<ActivityPlanList />} />
            <Route path="/activity/plan/dealer" element={<ActivityPlanDealer />} />
            <Route path="/activity/plan/sub-dealer" element={<ActivityPlanSubDealer />} />
            <Route path="/activity/plan/dealer/month/:mode" element={<ActivityPlanDealerMonth />} />

            <Route path="/activity/list" element={<ActivityList />} />
            <Route path="/activity/:mode" element={<CreateActivity />} />
            {/* <Route path="/activity/create" element={<CreateActivityManyShop />} /> */}
 
            <Route path="/activity/calendar" element={<ActivityCalendar />} />
            <Route path="/activity/mapping" element={<ActivityMapping />} />

            {/* Order Route */}
            <Route path="/order/list" element={<OrderList />} />
            <Route path="/order/create" element={<CreateOrder />} />
            <Route path="/order/edit" element={<EditOrder />} />
            <Route path="/order/detail" element={<OrderDetail />} />
            <Route path="/order/view" element={<ViewOrder />} />
            <Route path="/order-waiting/list" element={<OrderWaitingList />} />
            <Route path="/order-waiting/view" element={<ViewOrderWaiting />} />

            {/* Customer Stock List */}
            <Route path="/customer-stock/list" element={<CustomerStock />} />
            <Route path="/customer-stock/:mode" element={<CustomerStockCreate />} />


            {/* Expenses Route */}
            <Route path="/expenses/advance" element={<AdvanceExpense />} />
            <Route path="/expenses/advance/pdf" element={<PdfAdvanceExpense />} />
            <Route path="/expenses/product-claim-list" element={<ProductClaim />} />
            <Route path="/expenses/product-claim-waiting-list" element={<ProductClaim />} />
            <Route path="/expenses/product-claim/create" element={<CreateClaimRequest />} />
            <Route path="/expenses/product-claim/edit" element={<CreateClaimRequest />} />
            <Route path="/expenses/traveling" element={<Traveling />} />
            <Route path="/expenses/traveling/create" element={<CreateTraveling />} />
            <Route path="/expenses/traveling/edit" element={<EditTraveling />} />
            <Route path="/expenses/traveling/view" element={<ViewTraveling />} />
            <Route path="/expenses/traveling/view" element={<ViewTraveling />} />
            <Route path="/expenses/traveling/pdf" element={<PdfTraveling />} />
            <Route path="/expenses/clearing" element={<ClearingExpense />} />
            <Route path="/expenses/clearing/pdf" element={<PDFClearingExpense />} />

            <Route path="/expenses/sample" element={<SampleExpense />} />
            <Route path="/expenses/sample/:mode" element={<ActionSampleExpense />} />


            <Route path="/expenses/material" element={<MaterialExpense />} />
            <Route path="/expenses/material/:mode" element={<ActionMaterialExpense />} />

            
            {/* Approval Expenses Route */}

            <Route path="/expenses/advance/approval/:role" element={<ApprovalAdvanceExpense />} />
            <Route path="/expenses/clearing/approval/:role" element={<ApprovalClearingExpense />} />

            {/* <Route path="/expenses/advance/approval/area" element={<AdvanceExpenseArea />} />
            <Route path="/expenses/advance/approval/head-of-sales" element={<AdvanceExpenseHead />} />
            <Route path="/expenses/advance/approval/accounting" element={<AdvanceExpenseAcct />} />
            <Route path="/expenses/clearing/approval/area" element={<ClearingExpenseArea />} />
            <Route path="/expenses/clearing/approval/head-of-sales" element={<ClearingExpenseHead />} />
            <Route path="/expenses/clearing/approval/accounting" element={<ClearingExpenseAcct />} /> */}

            {/* Customer Route */}
            <Route path="/customer/dealer" element={<Dealer />} />
            <Route path="/customer/dealer/edit-info" element={<EditInformation />} />
            <Route path="/customer/dealer/view-info" element={<EditInformation />} />

            <Route path="/customer/sub-dealer" element={<SubDealer />} />
            <Route path="/customer/sub-dealer/create" element={<CreateSubDealer />} />
            <Route path="/customer/sub-dealer/edit" element={<CreateSubDealer />} />
            <Route path="/customer/sub-dealer/view" element={<CreateSubDealer />} />

            {/* <Route path="/customer/sub-dealer/edit" element={<EditSubDealer />} /> */}
            {/* <Route path="/customer/sub-dealer/view" element={<EditSubDealer />} /> */}

            <Route path="/customer/farmers" element={<Farmer />} />
            <Route path="/customer/farmers/create" element={<FarmerCreate />} />

            {/* Setting Route */}
            <Route path="/setting/role" element={<SettingRole />} />
            <Route path="/setting/profile" element={<ProfileUser />} />
            <Route path="/setting/user" element={<SettingUser />} />
            <Route path="/setting/user/create" element={<CreateUser />} />
            <Route path="/setting/user/edit" element={<EditUser />} />
            <Route path="/setting/user/view" element={<EditUser />} />

            <Route path="/setting/sale" element={<SettingSale />} />
            <Route path="/setting/sale/create" element={<CreateSale />} />
            <Route path="/setting/sale/edit" element={<EditSale />} />
            <Route path="/setting/product" element={<SettingProduct />} />
            <Route path="/setting/product/edit" element={<EditProduct />} />
            <Route path="/setting/promotion" element={<SettingPromotion />} />
            <Route path="/setting/promotion/create" element={<CreatePromotion />} />
            <Route path="/setting/promotion/edit" element={<EditPromotion />} />

            <Route path="/setting/material" element={<Material />} />
            <Route path="/setting/material/transaction" element={<Transaction />} />
            <Route path="/setting/material/:mode" element={<ActionMaterial />} />

            {/* Line OA Settings */}
            <Route path="/setting/line/promotion" element={<PromotionLineList />} />
            <Route path="/setting/line/promotion/create" element={<CreatePromotionLine />} />
            {/* <Route path="/setting/line/promotion/edit" element={<EditPromotion />} /> */}

            <Route path="/setting/line/customer" element={<CustomerLineList />} />
            <Route path="/setting/line/customer/create" element={<CreateCustomerLine />} />
            {/* <Route path="/setting/line/customer/edit" element={<EditCustomerLine />} /> */}
            
            <Route path="/setting/line/expire-point" element={<ExpirePointList />} />
            <Route path="/setting/line/manage-news" element={<ManageNewsList />} />
            <Route path="/setting/line/manage-news/create" element={<CreateManageNews />} />
            <Route path="/setting/line/manage-promotion" element={<ManagePromotionList />} />
            <Route path="/setting/line/manage-promotion/create" element={<CreateManagePromotion />} />

            {/* Report Route */}
            <Route path="/report/monthly" element={<ReportSaleByMonth />} />
            <Route path="/report/quarterly" element={<ReportSaleByQuarter />} />
            <Route path="/report/yearly" element={<ReportSaleByYear />} />
            <Route path="/report/activity" element={<ReportActivity />} />



            <Route path="/report/stock-report" element={<ReportStock />} />

          </Route>

          <Route element={<LineOARoute />}>

            <Route path="/mobile/login" element={< CheckLogin />} />
            <Route path="/mobile/verify" element={<VerifyOA />} />
            <Route path="/mobile/otp" element={<OtpOA />} />
            <Route path="/mobile/contact-admin" element={< ContactAdmin />} />
            <Route path="/mobile/contact-us" element={< ContactUs />} />
            <Route path="/mobile/privacy-policy" element={< PrivacyPolicy />} />
            <Route path="/mobile/terms-conditions" element={< TermsConditions />} />
            <Route path="/mobile/faq" element={< FaqOA />} />
            <Route path="/mobile/register" element={< RegisterOA />} />

            <Route element={<LinePrivateRoute />}>
              <Route path="/mobile/promotion" element={< Promotion />} />
              <Route path="/mobile/account" element={< MyAccountMobile />} />
              <Route path="/mobile/user/detail" element={< UserDetail />} />
              <Route path="/mobile/user/edit" element={< EditUserOA />} />
              <Route path="/mobile/main" element={< MainOA />} />
              <Route path="/mobile/redeem-point" element={< RedeemPoint />} />
              <Route path="/mobile/redeem-point/detail" element={<RedeemPointDetail />} />
              <Route path="/mobile/history-purchase" element={< PurchaseHistory />} />
              <Route path="/mobile/history-purchase/detail/:id" element={<PurchaseHistoryDetail />} />
              <Route path="/mobile/redeem-history/detail" element={< RedeemHistoryDetail />} />
              <Route path="/mobile/promotion/detail/" element={<PromotionDetail />} />
              <Route path="/mobile/redeem-history" element={< RedeemHistory />} />
            </Route>

            {/* <Route path="/mobile/redeem-point/detail/:id" element={<RedeemPointDetail />} /> */}
            {/* <Route path="/mobile/promotion/detail/:id" element={<PromotionDetail />} /> */}
            {/* <Route path="/mobile/redeem-history/detail/:id" element={< RedeemHistoryDetail />} /> */}

          </Route>

          <Route path="/mobile/scan-collect" element={< ScanCollectPoint />} />
          <Route path="/mobile/take-photo" element={< TakePhoto />} />
          
          {/* Error Route */}
          <Route path="/error/403" element={<Error403 />} />
          <Route path="*" element={<Error404 />} />
          <Route path="/error/500" element={<Error500 />} />
          <Route path="/error/503" element={<Error503 />} />
          <Route path="/wiki" element={<Wiki />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
